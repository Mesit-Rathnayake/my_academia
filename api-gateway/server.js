const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
try {
  require('dotenv').config();
} catch (e) {
  // Ignore in production containers
}

const app = express();
const PORT = process.env.PORT || 8080;

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8294';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:9142';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:4721';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || 'my-academia-internal-secret';

// Security headers (disable strict CSP to allow React frontend proxying & fonts)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway' });
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.url}`);
  next();
});

// Proxy /ma-api/v1 -> Backend
app.use('/ma-api/v1', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/ma-api/v1/api': '/api', // Handles /ma-api/v1/api/...
    '^/ma-api/v1': '/api',     // Handles /ma-api/v1/...
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('x-internal-token', INTERNAL_SERVICE_KEY);
    console.log(`[PROXY -> Backend] ${req.method} ${req.url} -> ${BACKEND_URL}${proxyReq.path}`);
  }
}));

// Proxy /ma-ai/v1 -> AI Service
app.use('/ma-ai/v1', createProxyMiddleware({
  target: AI_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/ma-ai/v1/api/v1': '/api/v1', // Handles /ma-ai/v1/api/v1/...
    '^/ma-ai/v1': '/api/v1',        // Handles /ma-ai/v1/...
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('x-internal-token', INTERNAL_SERVICE_KEY);
    console.log(`[PROXY -> AI Service] ${req.method} ${req.url} -> ${AI_SERVICE_URL}${proxyReq.path}`);
  }
}));

// Proxy everything else (/) -> Frontend
app.use('/', createProxyMiddleware({
  target: FRONTEND_URL,
  changeOrigin: true,
  ws: true, // Proxy websockets for React hot-reloading
  onProxyReq: (proxyReq, req, res) => {
    if (!req.url.startsWith('/sockjs-node')) {
      console.log(`[PROXY -> Frontend] ${req.method} ${req.url} -> ${FRONTEND_URL}${proxyReq.path}`);
    }
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
  console.log(`🔒 Architectural Security Enabled. Internal ports are hidden.`);
});

