/**
 * Automated Multi-Service Health Prober
 * Verifies the health status of all My Academia microservices
 */
const http = require('http');

const ENDPOINTS = [
  { name: 'API Gateway Root', host: 'localhost', port: 8080, path: '/' },
  { name: 'Backend API via Gateway', host: 'localhost', port: 8080, path: '/ma-api/v1/health' },
  { name: 'AI Service via Gateway', host: 'localhost', port: 8080, path: '/ma-ai/v1/health' },
  { name: 'Direct Backend API (if standalone)', host: 'localhost', port: 5001, path: '/api/health', optional: true },
  { name: 'Direct AI Service (if standalone)', host: 'localhost', port: 8000, path: '/health', optional: true },
];

function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: endpoint.host,
      port: endpoint.port,
      path: endpoint.path,
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ ...endpoint, status: 'PASS', code: res.statusCode, body: data });
        } else {
          resolve({ ...endpoint, status: 'FAIL', code: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ ...endpoint, status: 'ERROR', error: err.message || err.code || 'Connection failed' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ...endpoint, status: 'TIMEOUT' });
    });

    req.end();
  });
}

async function runHealthChecks() {
  console.log('🩺 Running My Academia Microservices Health Checks...\n');
  let failures = 0;

  for (const endpoint of ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    if (result.status === 'PASS') {
      console.log(`  ✅ [PASS] ${result.name} (HTTP ${result.code}) -> http://${result.host}:${result.port}${result.path}`);
    } else if (endpoint.optional) {
      console.log(`  ⚪ [SKIP/STANDALONE] ${result.name} (${result.status}: ${result.error || result.code})`);
    } else {
      console.log(`  ❌ [FAIL] ${result.name} (${result.status}: ${result.error || result.code})`);
      failures++;
    }
  }

  console.log('\n=============================================');
  if (failures === 0) {
    console.log('✨ All required services are ONLINE and HEALTHY!');
    process.exit(0);
  } else {
    console.log(`⚠️ ${failures} required health check(s) FAILED.`);
    process.exit(1);
  }
}

runHealthChecks();
