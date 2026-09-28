// Tapete Mágico — versão digital inspirada em Marrakech.
// Mercado 7x7. O mercador (Assam) anda conforme o dado; quem para no tapete de outra pessoa
// paga 1 moeda por casa da mancha de tapetes daquela cor. Depois, coloca um tapete (2 casas) ao lado dele.
//
// Coordenadas: [linha, coluna], linha 0 em cima. Direções: 0=cima, 1=direita, 2=baixo, 3=esquerda.
//
// Voltas na borda (como as curvas desenhadas no tabuleiro de verdade). Quando o mercador sairia do
// mercado, o passo "dá a volta" e ele entra na linha/coluna vizinha, andando no sentido contrário.
// Os pares são escolhidos para que tudo seja reversível e sobrem só dois cantos com curva de 90°:
//   - borda de CIMA   (saindo para cima):     colunas 0-1, 2-3, 4-5; a coluna 6 sobra (canto sup. direito)
//   - borda da DIREITA (saindo p/ direita):   linhas 1-2, 3-4, 5-6; a linha 0 sobra (canto sup. direito)
//   - borda de BAIXO  (saindo para baixo):    colunas 1-2, 3-4, 5-6; a coluna 0 sobra (canto inf. esquerdo)
//   - borda da ESQUERDA (saindo p/ esquerda): linhas 0-1, 2-3, 4-5; a linha 6 sobra (canto inf. esquerdo)
// No canto, a curva de 90° liga a coluna que sobrou com a linha que sobrou: por exemplo, subindo na
// casa [0,6] ele contorna o canto e volta para a mesma casa [0,6], agora andando para a esquerda.
// Cada volta (em U ou de canto) conta como 1 passo.
const N = 7;
const DL = [-1, 0, 1, 0], DC = [0, 1, 0, -1];
const DADO = [1, 2, 2, 3, 3, 4];

function passo(l, c, d) {
  const nl = l + DL[d], nc = c + DC[d];
  if (nl >= 0 && nl < N && nc >= 0 && nc < N) return [nl, nc, d];
  if (d === 0) return c === 6 ? [0, 6, 3] : [0, c ^ 1, 2];
  if (d === 1) return l === 0 ? [0, 6, 2] : [l % 2 ? l + 1 : l - 1, 6, 3];
  if (d === 2) return c === 0 ? [6, 0, 1] : [6, c % 2 ? c + 1 : c - 1, 0];
  return l === 6 ? [6, 0, 0] : [l ^ 1, 0, 1];
}

function andar(l, c, d, n) {
  const caminho = [];
  for (let i = 0; i < n; i++) { [l, c, d] = passo(l, c, d); caminho.push([l, c, d]); }
  return caminho;
}

const dentro = (l, c) => l >= 0 && l < N && c >= 0 && c < N;

// Mancha: casas conectadas (ortogonalmente) com a mesma cor, começando em [l,c].
function mancha(dono, l, c) {
  const cor = dono[l][c];
  if (cor < 0) return [];
  const visto = new Set([l * N + c]), fila = [[l, c]];
  for (let i = 0; i < fila.length; i++) {
    const [a, b] = fila[i];
    for (let k = 0; k < 4; k++) {
      const x = a + DL[k], y = b + DC[k];
      if (dentro(x, y) && !visto.has(x * N + y) && dono[x][y] === cor) { visto.add(x * N + y); fila.push([x, y]); }
    }
  }
  return fila;
}

function colocacoesValidas(e) {
  const { l: al, c: ac } = e.assam;
  const perto = (l, c) => Math.abs(l - al) + Math.abs(c - ac) === 1;
  const lista = [];
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
    for (const [dl, dc] of [[0, 1], [1, 0]]) {
      const l2 = l + dl, c2 = c + dc;
      if (!dentro(l2, c2)) continue;
      if ((l === al && c === ac) || (l2 === al && c2 === ac)) continue;
      if (!perto(l, c) && !perto(l2, c2)) continue;
      const t1 = e.tid[l][c], t2 = e.tid[l2][c2];
      if (t1 >= 0 && t1 === t2) continue; // cobriria exatamente um tapete inteiro
      lista.push([[l, c], [l2, c2]]);
    }
  }
  return lista;
}

const ativos = e => e.moedas.map((_, i) => i).filter(i => !e.fora[i]);
const visiveis = (e, p) => e.dono.reduce((s, lin) => s + lin.filter(x => x === p).length, 0);
const pontos = (e, p) => (e.fora[p] ? 0 : e.moedas[p] + visiveis(e, p));

function acabou(e) {
  const a = ativos(e);
  return a.length <= 1 || a.every(i => e.tapetes[i] === 0);
}

function proximo(e) {
  e.fase = 'girar';
  if (acabou(e)) { e.fase = 'fim'; return; }
  const n = e.moedas.length;
  for (let k = 1; k <= n; k++) {
    const p = (e.vez + k) % n;
    if (!e.fora[p] && e.tapetes[p] > 0) { e.vez = p; return; }
  }
  e.fase = 'fim';
}

// Quanto `eu` pagaria (e para quem) se o mercador parasse em [l,c].
function custoEm(e, eu, l, c) {
  const d = e.dono[l][c];
  if (d < 0 || d === eu || e.fora[d]) return { para: -1, valor: 0, casas: [] };
  const casas = mancha(e.dono, l, c);
  return { para: d, valor: casas.length, casas };
}

module.exports = {
  id: 'tapete',
  nome: 'Tapete Mágico',
  emoji: '🧶',
  descricao: 'Guie o mercador pelo bazar, espalhe seus tapetes e cobre moedas de quem pisar neles!',
  min: 2, max: 4, ordem: 20,

  iniciar(n, { nomes } = {}) {
    const cada = n === 4 ? 12 : 15;
    return {
      nomes: (nomes || []).slice(0, n).map((x, i) => x || `Jogador ${i + 1}`),
      dono: Array.from({ length: N }, () => Array(N).fill(-1)),
      tid: Array.from({ length: N }, () => Array(N).fill(-1)),
      proxId: 0,
      assam: { l: 3, c: 3, d: 0 },
      moedas: Array(n).fill(30),
      tapetes: Array(n).fill(cada),
      fora: Array(n).fill(false),
      vez: 0,
      fase: 'girar',
      dado: null,
      caminho: [],
      pagamento: null,
      ultimoTapete: null,
      jogada: 0,
      mensagem: '',
    };
  },

  visao(e) {
    const nome = i => e.nomes[i] || `Jogador ${i + 1}`;
    let mensagem = e.mensagem;
    if (e.fase === 'girar') mensagem = (mensagem ? mensagem + ' · ' : '') + `${nome(e.vez)}: gire o mercador e role o dado 🎲`;
    else if (e.fase === 'tapete') mensagem = (mensagem ? mensagem + ' · ' : '') + `${nome(e.vez)}: coloque um tapete 🧶`;
    return {
      dono: e.dono, tid: e.tid, assam: e.assam, dado: e.dado, caminho: e.caminho,
      pagamento: e.pagamento, ultimoTapete: e.ultimoTapete, jogada: e.jogada,
      moedas: e.moedas, tapetes: e.tapetes, fora: e.fora, vez: e.vez, fase: e.fase,
      visiveis: e.moedas.map((_, i) => visiveis(e, i)),
      pontos: e.moedas.map((_, i) => pontos(e, i)),
      placar: e.moedas.slice(),
      mensagem,
      validas: e.fase === 'tapete' ? colocacoesValidas(e) : [],
    };
  },

  pendentes(e) { return e.fase === 'fim' ? [] : [e.vez]; },

  agir(e, eu, acao) {
    if (e.fase === 'fim') return 'O jogo já acabou!';
    if (eu !== e.vez) return 'Não é a sua vez!';
    const nome = i => e.nomes[i] || `Jogador ${i + 1}`;
    acao = acao || {};

    if (e.fase === 'girar') {
      if (acao.tipo !== 'girar') return 'Primeiro gire o mercador!';
      const lado = acao.lado;
      if (!['esq', 'dir', 'reto'].includes(lado)) return 'Escolha esquerda, reto ou direita.';
      let d = e.assam.d;
      if (lado === 'esq') d = (d + 3) % 4;
      if (lado === 'dir') d = (d + 1) % 4;
      const n = DADO[Math.floor(Math.random() * DADO.length)];
      const caminho = andar(e.assam.l, e.assam.c, d, n);
      const [l, c, nd] = caminho[caminho.length - 1];
      e.caminho = [[e.assam.l, e.assam.c, d], ...caminho];
      e.assam = { l, c, d: nd };
      e.dado = n;
      e.jogada++;
      e.ultimoTapete = null;
      e.pagamento = null;
      e.mensagem = `${nome(eu)} tirou ${n} no dado`;
      const custo = custoEm(e, eu, l, c);
      if (custo.valor > 0) {
        const pago = Math.min(custo.valor, e.moedas[eu]);
        e.moedas[eu] -= pago;
        e.moedas[custo.para] += pago;
        e.pagamento = { de: eu, para: custo.para, valor: pago, casas: custo.casas };
        e.mensagem = `${nome(eu)} pagou ${pago} 🪙 para ${nome(custo.para)}`;
        if (pago < custo.valor) {
          e.fora[eu] = true;
          e.mensagem += ` e ficou sem moedas... saiu do jogo 😢`;
          proximo(e);
          return null;
        }
      } else if (e.dono[l][c] === eu) {
        e.mensagem = `${nome(eu)} tirou ${n} e parou no próprio tapete 😌`;
      }
      e.fase = 'tapete';
      return null;
    }

    // fase 'tapete'
    if (acao.tipo !== 'tapete') return 'Agora coloque um tapete!';
    const a = acao.a, b = acao.b;
    if (!Array.isArray(a) || !Array.isArray(b)) return 'Escolha duas casas.';
    const [l1, c1, l2, c2] = [a[0], a[1], b[0], b[1]].map(Number);
    const ok = colocacoesValidas(e).some(([p, q]) =>
      (p[0] === l1 && p[1] === c1 && q[0] === l2 && q[1] === c2) || (p[0] === l2 && p[1] === c2 && q[0] === l1 && q[1] === c1));
    if (!ok) return 'O tapete não pode ir aí! Ele precisa encostar no mercador.';
    const id = e.proxId++;
    e.dono[l1][c1] = e.dono[l2][c2] = eu;
    e.tid[l1][c1] = e.tid[l2][c2] = id;
    e.tapetes[eu]--;
    e.ultimoTapete = [[l1, c1], [l2, c2]];
    e.jogada++;
    if (!e.pagamento) e.mensagem = `${nome(eu)} colocou um tapete 🧶`;
    proximo(e);
    return null;
  },

  fim(e) {
    if (e.fase !== 'fim') return null;
    const a = ativos(e);
    if (!a.length) return { vencedores: [], texto: 'Todo mundo ficou sem moedas!' };
    const melhor = Math.max(...a.map(i => pontos(e, i)));
    const vencedores = a.filter(i => pontos(e, i) === melhor);
    const texto = a.length === 1 && e.fora.some(x => x)
      ? 'Só sobrou um mercador no bazar!'
      : `Moedas + casas de tapete à mostra: ${melhor} pontos${vencedores.length > 1 ? ' (empate!)' : ''}`;
    return { vencedores, texto };
  },

  bot(e, eu) {
    if (e.fase === 'girar') {
      let melhor = -Infinity, escolha = 'reto';
      for (const lado of ['reto', 'esq', 'dir']) {
        let d = e.assam.d;
        if (lado === 'esq') d = (d + 3) % 4;
        if (lado === 'dir') d = (d + 1) % 4;
        let ev = 0;
        for (const n of DADO) {
          const cam = andar(e.assam.l, e.assam.c, d, n);
          const [l, c] = cam[cam.length - 1];
          const custo = custoEm(e, eu, l, c);
          let v = -custo.valor;
          if (custo.valor >= e.moedas[eu]) v -= 50; // perigo de sair do jogo
          if (e.dono[l][c] === eu) v += 0.5;      // perto dos meus tapetes é bom
          ev += v / DADO.length;
        }
        ev += Math.random() * 0.4;
        if (ev > melhor) { melhor = ev; escolha = lado; }
      }
      return { tipo: 'girar', lado: escolha };
    }

    const validas = colocacoesValidas(e);
    let melhor = -Infinity, escolha = validas[0];
    for (const par of validas) {
      let s = 0;
      const vistos = new Set();
      for (const [l, c] of par) {
        const d = e.dono[l][c];
        if (d === eu) s -= 1.2;                // cobrir o próprio tapete é desperdício
        else if (d >= 0 && !e.fora[d]) {       // cobrir a mancha grande de alguém
          const m = mancha(e.dono, l, c);
          const k = m[0][0] * N + m[0][1];
          if (!vistos.has(k)) { vistos.add(k); s += 0.8 + m.length * 0.35; }
          else s += 0.8;
        } else s += 0.3;
      }
      // simula para ver o tamanho da minha mancha
      const dono = e.dono.map(x => x.slice());
      for (const [l, c] of par) dono[l][c] = eu;
      s += mancha(dono, par[0][0], par[0][1]).length * 0.6;
      s += Math.random() * 1.2;
      if (s > melhor) { melhor = s; escolha = par; }
    }
    return { tipo: 'tapete', a: escolha[0], b: escolha[1] };
  },
};
