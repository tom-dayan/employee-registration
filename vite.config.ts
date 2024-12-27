import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs/promises'

export default defineConfig({
  base: '/employee-registration/',
  plugins: [
    react(),
    {
      name: 'handle-json',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/employee-registration/data/owners.json') {
            try {
              if (req.method === 'POST') {
                const chunks: Buffer[] = [];
                req.on('data', (chunk: Buffer) => chunks.push(chunk));
                req.on('end', async () => {
                  const data = Buffer.concat(chunks).toString();
                  await fs.writeFile(
                    './public/data/owners.json',
                    JSON.stringify({ owners: JSON.parse(data) }, null, 2)
                  );
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                });
                return;
              }
              
              if (req.method === 'GET') {
                const content = await fs.readFile('./public/data/owners.json', 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(content);
                return;
              }
            } catch (error) {
              console.error('File operation error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Server error' }));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})