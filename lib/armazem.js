// Onde as salas ficam guardadas.
// - Local (node server.js): na memória.
// - Vercel: no Redis (Upstash), usando a API REST — sem dependências.

function armazemMemoria() {
  const dados = new Map();
  const filas = new Map();
  return {
    async ler(k) {
      const d = dados.get(k);
      if (!d || d.expira < Date.now()) return null;
      return JSON.parse(d.json);
    },
    async gravar(k, v, ttlS) { dados.set(k, { json: JSON.stringify(v), expira: Date.now() + ttlS * 1000 }); },
    // uma operação por sala de cada vez
    comTrava(k, fn) {
      const antes = filas.get(k) || Promise.resolve();
      const agora = antes.then(fn, fn);
      filas.set(k, agora.catch(() => {}));
      return agora;
    },
  };
}

function armazemRedis(url, token) {
  async function cmd(...args) {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(args) });
    const j = await r.json();
    if (j.error) throw new Error('Redis: ' + j.error);
    return j.result;
  }
  const esperar = ms => new Promise(ok => setTimeout(ok, ms));
  return {
    async ler(k) {
      const v = await cmd('GET', 'sala:' + k);
      return v ? JSON.parse(v) : null;
    },
    async gravar(k, v, ttlS) { await cmd('SET', 'sala:' + k, JSON.stringify(v), 'EX', String(ttlS)); },
    async comTrava(k, fn) {
      const chave = 'trava:' + k, eu = Math.random().toString(36).slice(2);
      for (let t = 0; t < 40; t++) {
        if (await cmd('SET', chave, eu, 'NX', 'PX', '5000')) {
          try { return await fn(); }
          finally { if ((await cmd('GET', chave)) === eu) await cmd('DEL', chave); }
        }
        await esperar(75);
      }
      return null; // não conseguiu a trava
    },
  };
}

function criarArmazem() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return armazemRedis(url, token);
  if (process.env.VERCEL) console.warn('⚠️ Sem Redis configurado — salas não vão funcionar direito na Vercel.');
  return armazemMemoria();
}

module.exports = { criarArmazem };
