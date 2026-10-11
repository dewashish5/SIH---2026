import { createProxyMiddleware } from 'http-proxy-middleware';

export const createApiProxy = (targetUrl: string) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '' // strip /api prefix when forwarding to FastAPI
    },
    on: {
      error: (err, _req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = res as any;
        if (!response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'application/json' });
          response.end(
            JSON.stringify({
              error: {
                code: 'UPSTREAM_API_UNAVAILABLE',
                message: 'FastAPI backend service is currently unreachable',
                details: err.message
              }
            })
          );
        }
      }
    }
  });
};
