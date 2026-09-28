// Ludo — role o dado, dê a volta no tabuleiro e leve as 4 peças até o centro!
//
// Progresso de cada peça (relativo ao dono):
//   -1      = na base
//   0..50   = na trilha (0 = casa de saída do jogador)
//   51..55  = na reta final colorida
//   56      = no centro (chegou!)
// Casa absoluta na trilha (0..51) = (13 * quadrante + progresso) % 52.

const TRILHA = 52, CENTRO = 56, ULTIMA_TRILHA = 50;
const SEGURAS = [0, 8, 13, 21, 26, 34, 39, 47]; // saídas + estrelas

const quadrantesPara = n => (n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3]);
const absoluta = (q, p) => (13 * q + p) % TRILHA;
const naTrilha = p => p >= 0 && p <= ULTIMA_TRILHA;
const ehSegura = abs => SEGURAS.includes(abs);

function jogadasLegais(e, j, d) {
  const lista = [];
  e.pecas[j].forEach((p, i) => {
    if (p === -1) { if (d === 6) lista.push({ peca: i, destino: 0 }); }
    else if (p < CENTRO && p + d <= CENTRO) lista.push({ peca: i, destino: p + d });
  });
  return lista;
}

// Peças adversárias que estão na casa absoluta `abs` (fora da reta final).
function inimigosEm(e, j, abs) {
  const r = [];
  e.pecas.forEach((ps, k) => {
    if (k === j) return;
    ps.forEach((p, i) => { if (naTrilha(p) && absoluta(e.quads[k], p) === abs) r.push({ jogador: k, peca: i }); });
  });
  return r;
}

// Uma peça em `abs` (casa comum) pode ser capturada na próxima rodada?
function emPerigo(e, j, abs) {
  if (ehSegura(abs)) return false;
  for (let k = 0; k < e.n; k++) {
    if (k === j) continue;
    for (const p of e.pecas[k]) {
      if (!naTrilha(p)) continue;
      const dist = (abs - absoluta(e.quads[k], p) + TRILHA) % TRILHA;
      if (dist >= 1 && dist <= 6 && p + dist <= ULTIMA_TRILHA) return true;
    }
  }
  return false;
}

const nome = (e, j) => e.nomes[j] || `Jogador ${j + 1}`;

function passarVez(e) {
  e.vez = (e.vez + 1) % e.n;
  e.seises = 0;
  e.fase = 'rolar';
}

module.exports = {
  id: 'ludo',
  nome: 'Ludo',
  emoji: '🎲',
  descricao: 'Role o dado, fuja dos adversários e leve suas 4 peças até o centro!',
  min: 2, max: 4, ordem: 40,

  iniciar(n, { nomes } = {}) {
    return {
      n,
      nomes: (nomes || []).slice(0, n),
      quads: quadrantesPara(n),
      pecas: Array.from({ length: n }, () => [-1, -1, -1, -1]),
      vez: 0,
      fase: 'rolar',
      dado: null,          // último valor rolado
      quemRolou: null,
      rolagem: 0,          // conta as rolagens (para animar o dado)
      seises: 0,
      mensagem: null,
      ultimoMov: null,     // { seq, jogador, peca, caminho: [progressos], captura }
      seq: 0,
      vencedor: null,
      acoes: 0,
    };
  },

  visao(e, eu) {
    const jogadas = e.fase === 'mover' && e.vencedor === null ? jogadasLegais(e, e.vez, e.dado) : [];
    let mensagem = e.mensagem;
    if (mensagem && e.vencedor === null && eu === e.vez && e.fase === 'rolar') mensagem += ' Sua vez! 👉';
    return {
      n: e.n, quads: e.quads, pecas: e.pecas, vez: e.vez, fase: e.fase,
      dado: e.dado, quemRolou: e.quemRolou, rolagem: e.rolagem, seises: e.seises,
      jogadas, ultimoMov: e.ultimoMov, vencedor: e.vencedor,
      seguras: SEGURAS,
      mensagem: mensagem || undefined,
      placar: e.pecas.map(ps => ps.filter(p => p === CENTRO).length),
    };
  },

  pendentes(e) { return e.vencedor !== null ? [] : [e.vez]; },

  agir(e, eu, acao) {
    if (e.vencedor !== null) return 'O jogo já acabou!';
    if (eu !== e.vez) return 'Não é a sua vez!';
    if (!acao || typeof acao !== 'object') return 'Jogada inválida';
    const quem = nome(e, eu);

    if (acao.tipo === 'rolar') {
      if (e.fase !== 'rolar') return 'Agora escolha uma peça para mexer!';
      const d = 1 + Math.floor(Math.random() * 6);
      e.acoes++;
      e.dado = d; e.quemRolou = eu; e.rolagem++;
      if (d === 6) {
        e.seises++;
        if (e.seises >= 3) {
          e.mensagem = `${quem} tirou três 6 seguidos e perdeu a vez! 😬`;
          passarVez(e);
          return null;
        }
      }
      const legais = jogadasLegais(e, eu, d);
      if (!legais.length) {
        if (d === 6) { e.mensagem = `${quem} tirou 6, mas não tem jogada. Joga de novo! 🎲`; e.fase = 'rolar'; }
        else {
          const todasNaBase = e.pecas[eu].every(p => p === -1 || p === CENTRO);
          e.mensagem = todasNaBase
            ? `${quem} tirou ${d}... precisa de um 6 para sair da base! 😅`
            : `${quem} tirou ${d} e não tem jogada. Passou a vez 😅`;
          passarVez(e);
        }
        return null;
      }
      e.fase = 'mover';
      e.mensagem = `${quem} tirou ${d}! ${d === 6 ? '🎉 ' : ''}Escolha uma peça.`;
      return null;
    }

    if (acao.tipo === 'mover') {
      if (e.fase !== 'mover') return 'Role o dado primeiro! 🎲';
      const i = Number(acao.peca);
      const mov = jogadasLegais(e, eu, e.dado).find(m => m.peca === i);
      if (!mov) return 'Essa peça não pode andar agora!';
      e.acoes++;
      const de = e.pecas[eu][i];
      const caminho = [de];
      if (de === -1) caminho.push(0);
      else for (let p = de + 1; p <= mov.destino; p++) caminho.push(p);
      e.pecas[eu][i] = mov.destino;

      let captura = null;
      if (naTrilha(mov.destino)) {
        const abs = absoluta(e.quads[eu], mov.destino);
        if (!ehSegura(abs)) {
          const alvos = inimigosEm(e, eu, abs);
          for (const a of alvos) e.pecas[a.jogador][a.peca] = -1;
          if (alvos.length) captura = alvos;
        }
      }
      e.ultimoMov = { seq: ++e.seq, jogador: eu, peca: i, caminho, captura };

      if (e.pecas[eu].every(p => p === CENTRO)) {
        e.vencedor = eu;
        e.mensagem = `${quem} levou todas as peças para o centro! 🏆`;
        return null;
      }
      const chegou = mov.destino === CENTRO;
      if (captura) {
        const vitimas = [...new Set(captura.map(a => nome(e, a.jogador)))].join(' e ');
        e.mensagem = `${quem} capturou ${captura.length > 1 ? 'peças' : 'uma peça'} de ${vitimas}! 😱 Joga de novo!`;
      } else if (chegou) e.mensagem = `${quem} levou uma peça até o centro! 🏠 Joga de novo!`;
      else if (e.dado === 6) e.mensagem = `${quem} tirou 6! Joga de novo 🎉`;
      else e.mensagem = null;

      if (captura || chegou || e.dado === 6) e.fase = 'rolar';
      else passarVez(e);
      return null;
    }
    return 'Jogada inválida';
  },

  fim(e) {
    if (e.vencedor === null) return null;
    return { vencedores: [e.vencedor], texto: `${nome(e, e.vencedor)} levou as 4 peças até o centro primeiro! 🎲` };
  },

  bot(e, eu) {
    if (e.fase === 'rolar') return { tipo: 'rolar' };
    const legais = jogadasLegais(e, eu, e.dado);
    const q = e.quads[eu];
    const pontos = legais.map(m => {
      const de = e.pecas[eu][m.peca];
      const absDest = naTrilha(m.destino) ? absoluta(q, m.destino) : null;
      const captura = absDest !== null && !ehSegura(absDest) && inimigosEm(e, eu, absDest).length > 0;
      const chega = m.destino === CENTRO;
      const sai = de === -1;
      const perigoAgora = naTrilha(de) && emPerigo(e, eu, absoluta(q, de));
      const perigoDepois = absDest !== null && emPerigo(e, eu, absDest);
      const foge = perigoAgora && !perigoDepois;
      const segura = absDest === null || ehSegura(absDest);
      // prioridade: capturar > chegar > sair da base > fugir > casa segura > peça mais adiantada
      let s = 0;
      if (captura) s += 1e6;
      if (chega) s += 1e5;
      if (sai) s += 1e4;
      if (foge) s += 1e3;
      if (segura) s += 100;
      if (perigoDepois) s -= 50;
      s += Math.max(de, 0) * 0.5 + Math.random() * 3; // um pouco de sorte para não ser previsível
      return { m, s };
    });
    pontos.sort((a, b) => b.s - a.s);
    return { tipo: 'mover', peca: pontos[0].m.peca };
  },
};
