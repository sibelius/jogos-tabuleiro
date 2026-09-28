// Servidor LOCAL da Mesa de Jogos — sem dependências, só Node.
// Rodar: node server.js   (porta 8765, ou PORT=xxxx)
// Na Vercel quem responde é api/[...rota].js — os dois usam o mesmo lib/nucleo.js.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { criarNucleo } = require('./lib/nucleo');
const { criarArmazem } = require('./lib/armazem');

const PORT = Number(process.env.PORT) || 8765;
const PUB = path.join(__dirname, 'public');

const ipsLocais = () => Object.values(os.networkInterfaces()).flat()
  .filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);

const nucleo = criarNucleo(criarArmazem(), { info: () => ({ ips: ipsLocais(), porta: PORT }) });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon' };

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function lerCorpo(req) {
  return new Promise((ok, falha) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); });
    req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { falha(e); } });
  });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) {
      const corpo = req.method === 'POST' ? await lerCorpo(req) : {};
      const { status, json: resp } = await nucleo.tratar({ metodo: req.method, partes: url.pathname.split('/').filter(Boolean), query: url.searchParams, corpo });
      return json(res, status, resp);
    }
    let arq = path.normalize(path.join(PUB, decodeURIComponent(url.pathname)));
    if (!arq.startsWith(PUB)) return json(res, 403, { erro: 'Proibido' });
    if (fs.existsSync(arq) && fs.statSync(arq).isDirectory()) arq = path.join(arq, 'index.html');
    if (!fs.existsSync(arq)) return json(res, 404, { erro: 'Não encontrado' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(arq).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) json(res, 500, { erro: 'Erro no servidor' });
  }
});

servidor.listen(PORT, '0.0.0.0', () => {
  console.log('🎲 Mesa de Jogos rodando!');
  console.log(`   Neste computador: http://localhost:${PORT}`);
  for (const ip of ipsLocais()) console.log(`   Na mesma rede Wi-Fi: http://${ip}:${PORT}`);
});
