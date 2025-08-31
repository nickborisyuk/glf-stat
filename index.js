const http = require('http');

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (req.url === '/api/version') {
    res.writeHead(200);
    res.end(JSON.stringify({
      version: '0.31.160959',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>GLF Stat API</title>
      </head>
      <body>
          <h1>🏌️ GLF Stat API</h1>
          <p>API server is running!</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Version: 0.31.160959</p>
      </body>
      </html>
    `);
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
