// Função da Vercel: responde todos os /api/*. As salas ficam no Redis (Upstash).
const { criarNucleo } = require('../lib/nucleo');
const { criarArmazem } = require('../lib/armazem');

const nucleo = criarNucleo(criarArmazem(), { info: () => ({ ips: [] }) });

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    // o vercel.json reescreve /api/qualquer/coisa → /api/index?__rota=qualquer/coisa
    const rota = url.searchParams.get('__rota');
    url.searchParams.delete('__rota');
    const caminho = rota != null ? '/api/' + rota : url.pathname;
    const corpo = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) : {};
    const { status, json } = await nucleo.tratar({ metodo: req.method, partes: caminho.split('/').filter(Boolean), query: url.searchParams, corpo });
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
};
