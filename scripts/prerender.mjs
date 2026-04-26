import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createServer } from 'node:http';

// Import the SSR server handler built by TanStack Start
const { default: serverEntry } = await import(resolve('dist/server/server.js'));

const PORT = 3999;
const BASE = '/locasystem-preview';

// All known routes to prerender (improves SEO + initial load on GitHub Pages)
const ROUTES = [
  '/',
  '/admin',
  '/admin/equipamentos',
  '/admin/lojistas',
  '/admin/relatorios',
  '/lojista',
  '/lojista/clientes',
  '/lojista/equipamentos',
  '/lojista/funcionarios',
  '/lojista/locacoes',
  '/lojista/painel',
  '/lojista/relatorios',
];

// Start a minimal HTTP server to bridge native http → web fetch API
const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  const request = new Request(url.toString(), { method: req.method, headers });
  const response = await serverEntry.fetch(request);
  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
});

await new Promise((resolve) => httpServer.listen(PORT, '127.0.0.1', resolve));
console.log(`SSR server listening on port ${PORT}`);

async function fetchHtml(path) {
  const url = `http://127.0.0.1:${PORT}${BASE}${path}`;
  const res = await fetch(url, { headers: { accept: 'text/html' } });
  console.log(`  → GET ${url}  [${res.status}]`);
  if (!res.ok) return null;
  return await res.text();
}

const outDir = resolve('dist/client');
let rootHtml = null;

// Prerender all known routes
for (const route of ROUTES) {
  const html = await fetchHtml(route);
  if (!html) {
    console.warn(`⚠ Skipping route ${route} (fetch failed)`);
    continue;
  }

  // Determine output file path
  // "/" → dist/client/index.html
  // "/admin" → dist/client/admin/index.html
  // "/admin/equipamentos" → dist/client/admin/equipamentos/index.html
  const relativeDir = route === '/' ? '' : route;
  const targetDir = join(outDir, relativeDir);
  mkdirSync(targetDir, { recursive: true });
  const targetFile = join(targetDir, 'index.html');

  writeFileSync(targetFile, html, 'utf-8');
  console.log(`✔ Wrote ${targetFile}`);

  if (route === '/') {
    rootHtml = html;
  }
}

if (!rootHtml) {
  console.error('✖ Failed to fetch root HTML — index.html was NOT created');
  process.exit(1);
}

// 404.html = same shell so SPA client-side routing works for any unprerendered route
copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
console.log('✔ Wrote dist/client/404.html (SPA fallback)');

// Disable Jekyll so GitHub Pages serves files starting with _
writeFileSync(join(outDir, '.nojekyll'), '', 'utf-8');
console.log('✔ Wrote dist/client/.nojekyll');

httpServer.close();
console.log('Done!');
process.exit(0);
