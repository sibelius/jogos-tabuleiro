// Núcleo da Mesa de Jogos: salas, jogadas e robôs.
// Não guarda nada em memória própria — tudo passa pelo "armazém" (memória local ou Redis na Vercel),
// para funcionar tanto no servidor local quanto em funções serverless.
const crypto = require('crypto');
const { carregarJogos } = require('./jogos');

const ATRASO_BOT = 900;        // ms entre jogadas do computador
const ONLINE_MS = 8000;        // quem não pergunta pelo estado há 8s aparece como desconectado
const VIDA_SALA_S = 12 * 3600; // salas somem depois de 12h paradas

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const novoToken = () => crypto.randomBytes(12).toString('hex');
const nomeLimpo = n => String(n || '').trim().slice(0, 20) || 'Jogador';

function criarNucleo(armazem, { info = () => ({}) } = {}) {
  const jogos = () => carregarJogos();
  const modDe = sala => jogos()[sala.jogoId];

  async function novoCodigo() {
    for (;;) {
      const c = Array.from({ length: 4 }, () => LETRAS[crypto.randomInt(LETRAS.length)]).join('');
      if (!(await armazem.ler(c))) return c;
    }
  }

  // Um aparelho pode controlar vários assentos (jogadores no mesmo computador/tablet).
  const assentosDoToken = (sala, token) => (token ? sala.assentos.map((a, i) => (a.token === token ? i : -1)).filter(i => i >= 0) : []);
  // Qual assento este aparelho está "vendo" agora: o pedido, se for dele; senão o primeiro que precisa jogar.
  function escolherEu(sala, meus, pedido) {
    if (!meus.length) return -1;
    if (meus.includes(pedido)) return pedido;
    const pend = sala.estado ? modDe(sala).pendentes(sala.estado) : [];
    return meus.find(i => pend.includes(i)) ?? meus[0];
  }

  function mudou(sala) { sala.versao++; sala.mudouEm = Date.now(); }

  function comecar(sala) {
    const mod = modDe(sala);
    sala.estado = mod.iniciar(sala.assentos.length, { nomes: sala.assentos.map(a => a.nome) });
    sala.status = 'jogando';
    sala.partida++;
    mudou(sala);
  }

  function talvezComecar(sala) {
    if (sala.status === 'aguardando' && sala.assentos.every(a => a.tipo === 'bot' || a.token)) comecar(sala);
  }

  function verificarFim(sala, mod) {
    if (sala.estado && mod.fim(sala.estado)) sala.status = 'fim';
  }

  // Faz UMA jogada de robô se já passou o tempo. Retorna true se mudou algo.
  function talvezBot(sala) {
    if (sala.status !== 'jogando') return false;
    if (Date.now() - sala.mudouEm < ATRASO_BOT) return false;
    const mod = modDe(sala);
    const i = mod.pendentes(sala.estado).find(i => sala.assentos[i].tipo === 'bot');
    if (i === undefined) return false;
    try {
      const acao = mod.bot(sala.estado, i);
      const erro = mod.agir(sala.estado, i, acao);
      if (erro) { console.error(`Bot ${i} (${mod.id}) fez jogada inválida:`, erro, acao); return false; }
    } catch (e) { console.error('Erro no bot', mod.id, e); return false; }
    verificarFim(sala, mod);
    mudou(sala);
    return true;
  }

  const botPendente = sala => {
    if (sala.status !== 'jogando') return false;
    return modDe(sala).pendentes(sala.estado).some(i => sala.assentos[i].tipo === 'bot');
  };

  function fotografia(sala, eu, meus) {
    const mod = modDe(sala);
    let visao = null, pendentes = [], fim = null;
    if (sala.estado) {
      try {
        visao = mod.visao(sala.estado, eu);
        pendentes = mod.pendentes(sala.estado);
        fim = mod.fim(sala.estado);
      } catch (e) { console.error('Erro no jogo', mod.id, e); }
    }
    const agora = Date.now();
    return {
      codigo: sala.codigo,
      versao: sala.versao,
      jogo: { id: mod.id, nome: mod.nome, emoji: mod.emoji },
      assentos: sala.assentos.map(a => ({
        nome: a.nome, tipo: a.tipo,
        ocupado: !!a.token || a.tipo === 'bot',
        conectado: a.tipo === 'bot' || agora - (a.visto || 0) < ONLINE_MS,
      })),
      status: sala.status, eu, meus, secreto: !!mod.secreto, visao, pendentes, fim, partida: sala.partida,
    };
  }

  const r = (status, json) => ({ status, json });

  // Pedido genérico: { metodo, partes: ['api', ...], query: URLSearchParams, corpo }
  async function tratar({ metodo, partes, query, corpo = {} }) {
    const rota = partes[1];

    if (metodo === 'GET' && rota === 'info') return r(200, info());

    if (metodo === 'GET' && rota === 'jogos') {
      const lista = Object.values(jogos())
        .map(j => ({ id: j.id, nome: j.nome, emoji: j.emoji, descricao: j.descricao, min: j.min, max: j.max, ordem: j.ordem ?? 99 }))
        .sort((a, b) => a.ordem - b.ordem);
      return r(200, lista);
    }

    if (rota !== 'salas') return r(404, { erro: 'Não encontrado' });

    // criar sala
    if (metodo === 'POST' && partes.length === 2) {
      const mod = jogos()[corpo.jogo];
      if (!mod) return r(404, { erro: 'Jogo não encontrado' });
      const tipos = Array.isArray(corpo.assentos) ? corpo.assentos : ['humano', 'bot'];
      if (tipos.length < mod.min || tipos.length > mod.max) return r(400, { erro: `Esse jogo é de ${mod.min} a ${mod.max} jogadores` });
      const token = novoToken();
      const nomes = Array.isArray(corpo.nomes) ? corpo.nomes : [];
      let nBot = 0;
      // tipos: 'humano' (eu, assento 0), 'local' (outra pessoa neste aparelho), 'remoto' (entra pelo link), 'bot'
      const assentos = tipos.map((t, i) => i === 0 ? { tipo: 'humano', nome: nomeLimpo(corpo.nome), token, visto: Date.now() }
        : t === 'bot' ? { tipo: 'bot', nome: `🤖 Robô ${++nBot}` }
        : t === 'local' ? { tipo: 'local', nome: nomeLimpo(nomes[i] || `Jogador ${i + 1}`), token, visto: Date.now() }
        : { tipo: 'humano', nome: 'Esperando...', token: null });
      const sala = { codigo: await novoCodigo(), jogoId: mod.id, assentos, estado: null, status: 'aguardando', partida: 0, versao: 0, mudouEm: Date.now() };
      talvezComecar(sala);
      await armazem.gravar(sala.codigo, sala, VIDA_SALA_S);
      return r(200, { codigo: sala.codigo, token, assento: 0 });
    }

    const codigo = String(partes[2] || '').toUpperCase();
    const acao = partes[3];

    // estado (o navegador pergunta a cada ~1s); aproveita para rodar os robôs
    if (metodo === 'GET' && acao === 'estado') {
      let sala = await armazem.ler(codigo);
      if (!sala || !modDe(sala)) return r(404, { erro: 'Sala não encontrada 😕' });
      const token = query.get('token');
      const meus = assentosDoToken(sala, token);
      const precisaVisto = meus.length > 0 && Date.now() - (sala.assentos[meus[0]].visto || 0) > ONLINE_MS / 3;
      if (precisaVisto || (botPendente(sala) && Date.now() - sala.mudouEm >= ATRASO_BOT)) {
        const s = await armazem.comTrava(codigo, async () => {
          const s = await armazem.ler(codigo);
          if (!s) return null;
          for (const i of assentosDoToken(s, token)) s.assentos[i].visto = Date.now();
          talvezBot(s);
          await armazem.gravar(codigo, s, VIDA_SALA_S);
          return s;
        });
        if (s) sala = s;
      }
      const eu = escolherEu(sala, meus, Number(query.get('como') ?? -1));
      if (query.get('v') === String(sala.versao) && query.get('e') === String(eu) && !precisaVisto) return r(200, { mesmo: true, versao: sala.versao });
      return r(200, fotografia(sala, eu, meus));
    }

    if (metodo !== 'POST') return r(404, { erro: 'Não encontrado' });

    const resultado = await armazem.comTrava(codigo, async () => {
      const sala = await armazem.ler(codigo);
      if (!sala || !modDe(sala)) return r(404, { erro: 'Sala não encontrada 😕' });
      const mod = modDe(sala);

      if (acao === 'entrar') {
        const i = sala.assentos.findIndex(a => a.tipo === 'humano' && !a.token);
        if (i < 0) return r(400, { erro: 'A sala está cheia!' });
        const token = novoToken();
        Object.assign(sala.assentos[i], { token, nome: nomeLimpo(corpo.nome), visto: Date.now() });
        mudou(sala);
        talvezComecar(sala);
        await armazem.gravar(codigo, sala, VIDA_SALA_S);
        return r(200, { codigo, token, assento: i });
      }

      const meus = assentosDoToken(sala, corpo.token);
      if (!meus.length) return r(403, { erro: 'Você não está nessa sala' });
      const pend = sala.estado ? mod.pendentes(sala.estado) : [];
      const eu = meus.includes(corpo.assento) ? corpo.assento : (meus.find(i => pend.includes(i)) ?? meus[0]);

      if (acao === 'acao') {
        if (sala.status !== 'jogando') return r(400, { erro: 'O jogo não está rolando' });
        if (!mod.pendentes(sala.estado).includes(eu)) return r(400, { erro: 'Espere a sua vez! ⏳' });
        let erro;
        try { erro = mod.agir(sala.estado, eu, corpo.acao || {}); }
        catch (e) { console.error(e); erro = 'Ops, deu um erro no jogo'; }
        if (erro) return r(400, { erro });
        verificarFim(sala, mod);
        mudou(sala);
        await armazem.gravar(codigo, sala, VIDA_SALA_S);
        return r(200, { ok: true });
      }

      if (acao === 'reiniciar') {
        if (sala.status === 'aguardando') return r(400, { erro: 'Ainda esperando jogadores' });
        comecar(sala);
        await armazem.gravar(codigo, sala, VIDA_SALA_S);
        return r(200, { ok: true });
      }

      return r(404, { erro: 'Não encontrado' });
    });
    return resultado || r(503, { erro: 'Servidor ocupado, tente de novo' });
  }

  return { tratar };
}

module.exports = { criarNucleo };
