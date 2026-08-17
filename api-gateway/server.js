const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.url}`);
  next();
});

// Proxy /ma-api/v1 -> Backend (Port 8294)
app.use('/ma-api/v1', createProxyMiddleware({
  target: 'http://127.0.0.1:8294',
  changeOrigin: true,
  pathRewrite: {
    '^/ma-api/v1': '/api', // Rewrite the path before forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY -> Backend] ${req.method} ${req.url} -> http://127.0.0.1:8294${proxyReq.path}`);
  }
}));

// Proxy /ma-ai/v1 -> AI Service (Port 9142)
app.use('/ma-ai/v1', createProxyMiddleware({
  target: 'http://127.0.0.1:9142',
  changeOrigin: true,
  pathRewrite: {
    '^/ma-ai/v1': '/api/v1',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY -> AI Service] ${req.method} ${req.url} -> http://127.0.0.1:9142${proxyReq.path}`);
  }
}));

// Proxy everything else (/) -> Frontend (Port 4721)
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:4721',
  changeOrigin: true,
  ws: true, // Proxy websockets for React hot-reloading
  onProxyReq: (proxyReq, req, res) => {
    if (!req.url.startsWith('/sockjs-node')) {
      console.log(`[PROXY -> Frontend] ${req.method} ${req.url} -> http://127.0.0.1:4721${proxyReq.path}`);
    }
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
  console.log(`🔒 Architectural Security Enabled. Internal ports are hidden.`);
});
