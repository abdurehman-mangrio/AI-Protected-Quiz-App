const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'silent', // Reduce console noise
      onError: (err, req, res) => {
        console.log('Backend connection error. Please make sure the backend server is running on port 5000.');
        if (!res.headersSent) {
          res.status(503).json({ 
            error: 'Backend server is not running. Please start the backend server.' 
          });
        }
      }
    })
  );
};