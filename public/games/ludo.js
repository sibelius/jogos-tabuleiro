// Desenho do Ludo
(() => {
  const css = `
    .ld { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 14px; width: 100%; }
    .ld-caixa { width: min(600px, 100%); aspect-ratio: 1; position: relative; box-sizing: border-box; border: 4px solid #5b4b8a; border-radius: 18px;
      background: #fff; box-shadow: 0 8px 0 #3f3366, 0 14px 24px rgba(0,0,0,.18); }
    .ld-tab { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(15, 1fr); grid-template-rows: repeat(15, 1fr);
      border-radius: 13px; overflow: hidden; transition: transform .6s ease; }
    .ld-cel { border: 1px solid rgba(60,50,100,.18); background: #fffdf7; position: relative; display: flex; align-items: center; justify-content: center;
      font-size: clamp(8px, 2.6vw, 18px); line-height: 1; }
    .ld-cel.cor { background: var(--c); }
    .ld-cel.saida { background: var(--c); box-shadow: inset 0 0 0 3px rgba(255,255,255,.55); }
    .ld-cel .ld-ico { transform: rotate(calc(-1 * var(--rot, 0deg))); filter: drop-shadow(0 1px 0 rgba(0,0,0,.2)); }
    .ld-cel.saida .ld-ico { color: #fff; font-weight: 700; }
    .ld-base { background: var(--c); display: flex; align-items: center; justify-content: center; border: 0; }
    .ld-base-in { width: 72%; height: 72%; background: #fff; border-radius: 22%; box-shadow: inset 0 -5px 0 rgba(0,0,0,.08), 0 3px 0 rgba(0,0,0,.15);
      display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; padding: 8%; gap: 8%; }
    .ld-slot { border-radius: 50%; background: var(--c); opacity: .25; margin: 6%; box-shadow: inset 0 3px 0 rgba(0,0,0,.25); }
    .ld-base.vazia { background: #d9d6e4; }
    .ld-base.vazia .ld-base-in { opacity: .6; }
    .ld-centro { position: relative; border: 0; overflow: hidden; }
    .ld-centro svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .ld-camada { position: absolute; inset: 0; pointer-events: none; transition: transform .6s ease; }
    .ld-p { position: absolute; width: calc(100% / 15 * .86); height: calc(100% / 15 * .86); transform: translate(-50%, -50%);
      transition: left .16s ease-out, top .16s ease-out, width .2s, height .2s; pointer-events: none; z-index: 2; }
    .ld-p .ld-bola { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at 32% 28%, rgba(255,255,255,.95) 0 10%, rgba(255,255,255,.35) 22%, transparent 45%), var(--c);
      border: 2px solid #fff; box-shadow: 0 3px 0 rgba(0,0,0,.28), 0 5px 8px rgba(0,0,0,.25);
      color: #fff; font-weight: 700; font-size: clamp(8px, 2.3vw, 15px); text-shadow: 0 1px 2px rgba(0,0,0,.45); }
    .ld-p .ld-num { transform: rotate(calc(-1 * var(--rot, 0deg))); }
    .ld-p.pula .ld-bola { animation: ld-pula .16s ease-out; }
    .ld-p.pode { pointer-events: auto; cursor: pointer; z-index: 5; }
    .ld-p.pode .ld-bola { animation: ld-brilho 0.9s ease-in-out infinite; }
    .ld-p.pode::after { content: ''; position: absolute; inset: -16%; border-radius: 50%; border: 2px dashed #2d2356;
      animation: ld-gira 3s linear infinite; pointer-events: none; }
    .ld-p.sel .ld-bola { outline: 3px solid #fff; outline-offset: 2px; }
    .ld-p.vitima .ld-bola { animation: ld-treme .3s ease-in-out 2; }
    .ld-p.base { width: calc(100% / 15 * 1.12); height: calc(100% / 15 * 1.12); }
    .ld-p.base .ld-bola { border-width: 3px; font-size: clamp(10px, 3vw, 20px); }
    .ld-p.centro { width: calc(100% / 15 * .5); height: calc(100% / 15 * .5); }
    .ld-p.centro .ld-bola { font-size: clamp(6px, 1.5vw, 10px); border-width: 1px; }
    .ld-alvo { position: absolute; width: calc(100% / 15 * .86); height: calc(100% / 15 * .86); transform: translate(-50%, -50%);
      border-radius: 50%; border: 3px dashed var(--c); background: rgba(255,255,255,.55); z-index: 4; pointer-events: auto; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: clamp(9px, 2.4vw, 16px); animation: ld-pulso .7s ease-in-out infinite; }
    .ld-alvo span { transform: rotate(calc(-1 * var(--rot, 0deg))); }
    @keyframes ld-pula { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-38%) scale(1.15); } 100% { transform: translateY(0) scale(1); } }
    @keyframes ld-brilho { 50% { transform: scale(1.15); box-shadow: 0 0 0 3px #fff, 0 0 14px 6px #fff27a, 0 5px 8px rgba(0,0,0,.25); } }
    @keyframes ld-pulso { 50% { transform: scale(1.14); filter: brightness(1.15); } }
    @keyframes ld-gira { to { transform: rotate(360deg); } }
    @keyframes ld-treme { 25% { transform: translateX(-20%) rotate(-10deg); } 75% { transform: translateX(20%) rotate(10deg); } }

    .ld-painel { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 150px; }
    .ld-dado-area { perspective: 500px; }
    .ld-dado { width: 86px; height: 86px; border-radius: 20px; border: 0; padding: 12px; cursor: default;
      background: linear-gradient(145deg, #ffffff 0%, #f1eefb 60%, #ddd7f0 100%);
      box-shadow: inset 0 -6px 0 rgba(0,0,0,.08), inset 0 3px 0 #fff, 0 6px 0 var(--c, #9b8fc7), 0 12px 18px rgba(0,0,0,.2);
      display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3px;
      transition: transform .15s; font: inherit; }
    .ld-dado.pode { cursor: pointer; animation: ld-chama 1.1s ease-in-out infinite; }
    .ld-dado.pode:hover { transform: translateY(-3px) rotate(-4deg); }
    .ld-dado.pode:active { transform: translateY(3px); }
    .ld-dado.rolando { animation: ld-rola .7s cubic-bezier(.3,.7,.4,1); }
    .ld-pip { border-radius: 50%; background: #2d2356; margin: 14%; box-shadow: inset 0 2px 0 rgba(0,0,0,.35); visibility: hidden; }
    .ld-pip.on { visibility: visible; }
    .ld-dado.seis .ld-pip.on { background: #e63964; }
    .ld-dado.vazio .ld-pip { visibility: hidden; }
    .ld-dado-txt { font-size: 38px; grid-area: 1 / 1 / 4 / 4; display: flex; align-items: center; justify-content: center; }
    .ld-dica { font-weight: 700; color: #5b4b8a; text-align: center; font-size: 15px; min-height: 1.3em; }
    .ld-legenda { font-size: 12px; color: #7a6fa3; text-align: center; max-width: 180px; }
    @keyframes ld-chama { 50% { transform: translateY(-5px) rotate(3deg); box-shadow: inset 0 -6px 0 rgba(0,0,0,.08), inset 0 3px 0 #fff, 0 10px 0 var(--c, #9b8fc7), 0 18px 22px rgba(0,0,0,.2); } }
    @keyframes ld-rola { 0% { transform: rotateX(0) rotateZ(0) translateY(0); } 30% { transform: rotateX(360deg) rotateZ(90deg) translateY(-26px); }
      60% { transform: rotateX(620deg) rotateZ(200deg) translateY(-6px); } 100% { transform: rotateX(720deg) rotateZ(360deg) translateY(0); } }
    @media (max-width: 700px) {
      .ld-painel { flex-direction: row; min-width: 0; width: 100%; justify-content: center; gap: 14px; }
      .ld-dado { width: 70px; height: 70px; padding: 10px; border-radius: 16px; }
      .ld-legenda { display: none; }
    }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  // ---------- geometria (igual ao servidor) ----------
  const TRILHA = [];
  const add = (r, c) => TRILHA.push([r, c]);
  for (let c = 1; c <= 5; c++) add(6, c);
  for (let r = 5; r >= 0; r--) add(r, 6);
  add(0, 7);
  for (let r = 0; r <= 5; r++) add(r, 8);
  for (let c = 9; c <= 14; c++) add(6, c);
  add(7, 14);
  for (let c = 14; c >= 9; c--) add(8, c);
  for (let r = 9; r <= 14; r++) add(r, 8);
  add(14, 7);
  for (let r = 14; r >= 9; r--) add(r, 6);
  for (let c = 5; c >= 0; c--) add(8, c);
  add(7, 0);
  add(6, 0);
  // reta final de cada quadrante (progresso 51..55)
  const RETA = [
    [1, 2, 3, 4, 5].map(c => [7, c]),
    [1, 2, 3, 4, 5].map(r => [r, 7]),
    [13, 12, 11, 10, 9].map(c => [7, c]),
    [13, 12, 11, 10, 9].map(r => [r, 7]),
  ];
  // ponto no centro (coordenadas em "casas", centro do tabuleiro = 7.5,7.5)
  const CENTRO_PT = [[7.5, 6.55], [6.55, 7.5], [7.5, 8.45], [8.45, 7.5]];
  const BASE_ORIG = [[0, 0], [0, 9], [9, 9], [9, 0]];
  const SLOTS = [[2.05, 2.05], [2.05, 3.95], [3.95, 2.05], [3.95, 3.95]];
  const SEGURAS = [0, 8, 13, 21, 26, 34, 39, 47];

  // ponto [linha, coluna] (em casas, centro) de uma peça
  function ponto(q, p, i) {
    if (p === -1) { const [r0, c0] = BASE_ORIG[q]; return [r0 + SLOTS[i][0], c0 + SLOTS[i][1]]; }
    if (p <= 50) { const [r, c] = TRILHA[(13 * q + p) % 52]; return [r + .5, c + .5]; }
    if (p <= 55) { const [r, c] = RETA[q][p - 51]; return [r + .5, c + .5]; }
    const [r, c] = CENTRO_PT[q];
    const off = [[-.28, -.28], [-.28, .28], [.28, -.28], [.28, .28]][i];
    return q % 2 === 0 ? [r + off[0], c + off[1] * .6] : [r + off[0] * .6, c + off[1]];
  }
  const chaveCasa = (q, p) => (p === -1 ? null : p <= 50 ? 't' + ((13 * q + p) % 52) : p <= 55 ? 'r' + q + '-' + p : null);

  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const PASSO = 170;

  // ---------- estado da tela (persistente entre renders) ----------
  let tela = null; // { chave, root, tab, camada, pecas: {}, dado, ... }
  let ultimaSeq = null, ultimaRolagem = null, selecionada = null;
  const temHover = () => window.matchMedia && matchMedia('(hover: hover)').matches;

  function montar(el, v, ctx) {
    const quadJog = [null, null, null, null];
    v.quads.forEach((q, j) => { quadJog[q] = j; });
    const corQ = q => (quadJog[q] === null ? '#cfcbdc' : ctx.cores[quadJog[q]]);
    const meuQ = ctx.eu >= 0 && ctx.eu < v.n ? v.quads[ctx.eu] : 3;
    const rot = ((3 - meuQ + 4) % 4) * 90;

    const celulas = [];
    const mapa = {}; // "r,c" -> info
    TRILHA.forEach(([r, c], k) => {
      const saidaQ = [0, 13, 26, 39].indexOf(k);
      mapa[r + ',' + c] = { tipo: saidaQ >= 0 ? 'saida' : 'trilha', q: saidaQ, estrela: SEGURAS.includes(k) && saidaQ < 0 };
    });
    RETA.forEach((lista, q) => lista.forEach(([r, c]) => { mapa[r + ',' + c] = { tipo: 'reta', q }; }));

    let html = '';
    for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
      const bq = r < 6 && c < 6 ? 0 : r < 6 && c > 8 ? 1 : r > 8 && c > 8 ? 2 : r > 8 && c < 6 ? 3 : -1;
      if (bq >= 0) {
        const [r0, c0] = BASE_ORIG[bq];
        if (r === r0 && c === c0) {
          html += `<div class="ld-cel ld-base ${quadJog[bq] === null ? 'vazia' : ''}" style="grid-area:${r0 + 1}/${c0 + 1}/span 6/span 6;--c:${corQ(bq)}">
            <div class="ld-base-in">${'<div class="ld-slot"></div>'.repeat(4)}</div></div>`;
        }
        continue;
      }
      if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
        if (r === 6 && c === 6) {
          html += `<div class="ld-cel ld-centro" style="grid-area:7/7/span 3/span 3">
            <svg viewBox="0 0 30 30" preserveAspectRatio="none">
              <polygon points="0,0 15,15 0,30" fill="${corQ(0)}"/><polygon points="0,0 30,0 15,15" fill="${corQ(1)}"/>
              <polygon points="30,0 30,30 15,15" fill="${corQ(2)}"/><polygon points="0,30 15,15 30,30" fill="${corQ(3)}"/>
              <circle cx="15" cy="15" r="4" fill="#fff" opacity=".85"/>
              <text x="15" y="16.9" font-size="5.5" text-anchor="middle" transform="rotate(${-rot} 15 15)">🏠</text>
            </svg></div>`;
        }
        continue;
      }
      const info = mapa[r + ',' + c];
      if (!info) { html += '<div class="ld-cel"></div>'; continue; }
      if (info.tipo === 'saida') html += `<div class="ld-cel saida" style="--c:${corQ(info.q)}"><span class="ld-ico">★</span></div>`;
      else if (info.tipo === 'reta') html += `<div class="ld-cel cor" style="--c:${corQ(info.q)}"></div>`;
      else html += `<div class="ld-cel">${info.estrela ? '<span class="ld-ico">⭐</span>' : ''}</div>`;
    }

    el.innerHTML = `<div class="ld">
      <div class="ld-caixa" style="--rot:${rot}deg">
        <div class="ld-tab" style="transform:rotate(${rot}deg)">${html}</div>
        <div class="ld-camada" style="transform:rotate(${rot}deg)"></div>
      </div>
      <div class="ld-painel">
        <div class="ld-dado-area"><button class="ld-dado vazio" aria-label="Rolar o dado"></button></div>
        <div>
          <div class="ld-dica"></div>
          <div class="ld-legenda">⭐ e ★ são casas seguras: ninguém é capturado nelas!</div>
        </div>
      </div>
    </div>`;
    const t = {
      chave: '', root: el.querySelector('.ld'), camada: el.querySelector('.ld-camada'),
      dado: el.querySelector('.ld-dado'), dica: el.querySelector('.ld-dica'), pecas: {}, timers: {}, rot,
    };
    v.pecas.forEach((ps, j) => ps.forEach((p, i) => {
      const d = document.createElement('div');
      d.className = 'ld-p';
      d.style.setProperty('--c', ctx.cores[j]);
      d.innerHTML = `<div class="ld-bola"><span class="ld-num">${i + 1}</span></div>`;
      t.camada.appendChild(d);
      t.pecas[j + '-' + i] = d;
    }));
    return t;
  }

  function por(d, [r, c]) { d.style.left = (c / 15 * 100) + '%'; d.style.top = (r / 15 * 100) + '%'; }

  function pararAnim(t, k) { (t.timers[k] || []).forEach(clearTimeout); delete t.timers[k]; }

  function desenharDado(t, v, ctx, novaRolagem) {
    const d = t.dado;
    const cor = v.quemRolou !== null && v.quemRolou !== undefined ? ctx.cores[v.quemRolou] : ctx.cores[v.vez];
    d.style.setProperty('--c', cor);
    const faces = n => [...Array(9).keys()].map(k => `<div class="ld-pip ${PIPS[n]?.includes(k) ? 'on' : ''}"></div>`).join('');
    const podeRolar = ctx.minhaVez && v.fase === 'rolar';
    d.classList.toggle('pode', podeRolar && !novaRolagem);
    d.disabled = !podeRolar;
    if (!v.dado) { d.innerHTML = '<div class="ld-dado-txt">🎲</div>'; d.classList.remove('seis'); }
    else if (novaRolagem) {
      d.classList.remove('rolando'); void d.offsetWidth; d.classList.add('rolando');
      let k = 0;
      clearInterval(t.giro);
      t.giro = setInterval(() => {
        d.innerHTML = faces(1 + Math.floor(Math.random() * 6));
        if (++k >= 6) {
          clearInterval(t.giro); t.giro = null;
          d.innerHTML = faces(v.dado); d.classList.toggle('seis', v.dado === 6);
          d.classList.toggle('pode', ctx.minhaVez && v.fase === 'rolar');
        }
      }, 110);
    } else if (!t.giro) {
      d.innerHTML = faces(v.dado); d.classList.toggle('seis', v.dado === 6);
    }
    d.classList.remove('vazio');
    d.onclick = podeRolar ? async () => {
      d.disabled = true; d.classList.remove('pode');
      if (!(await ctx.enviar({ tipo: 'rolar' }))) d.disabled = false;
    } : null;
  }

  window.JOGOS.ludo = {
    render(el, v, ctx) {
      const chave = JSON.stringify([v.quads, ctx.eu, ctx.cores.slice(0, v.n)]);
      if (!tela || tela.chave !== chave || !el.contains(tela.root)) {
        if (tela) { Object.keys(tela.timers).forEach(k => pararAnim(tela, k)); clearInterval(tela.giro); }
        tela = montar(el, v, ctx); tela.chave = chave;
        ultimaSeq = ctx.anterior?.ultimoMov?.seq ?? (v.ultimoMov ? v.ultimoMov.seq : null);
        ultimaRolagem = v.rolagem; selecionada = null;
      }
      const t = tela;
      const mov = v.ultimoMov;
      const novoMov = mov && mov.seq !== ultimaSeq;
      ultimaSeq = mov ? mov.seq : null;
      const novaRolagem = v.rolagem !== ultimaRolagem && v.rolagem > 0;
      ultimaRolagem = v.rolagem;

      // agrupa peças na mesma casa para dar um jeitinho de ficarem lado a lado
      const grupos = {};
      v.pecas.forEach((ps, j) => ps.forEach((p, i) => {
        const k = chaveCasa(v.quads[j], p);
        if (k) (grupos[k] ||= []).push(j + '-' + i);
      }));
      const alvoDe = (j, i, p) => {
        let pt = ponto(v.quads[j], p, i);
        const k = chaveCasa(v.quads[j], p);
        const g = k && grupos[k];
        if (g && g.length > 1) {
          const idx = g.indexOf(j + '-' + i), ang = (idx / g.length) * Math.PI * 2;
          pt = [pt[0] + Math.sin(ang) * .2, pt[1] + Math.cos(ang) * .2];
        }
        return pt;
      };

      const podeMover = ctx.minhaVez && v.fase === 'mover';
      const movs = podeMover ? v.jogadas : [];
      if (!podeMover) selecionada = null;
      const vitimas = new Set((novoMov && mov.captura || []).map(a => a.jogador + '-' + a.peca));
      const tempoCaminho = novoMov ? (mov.caminho.length - 1) * PASSO : 0;

      v.pecas.forEach((ps, j) => ps.forEach((p, i) => {
        const k = j + '-' + i, d = t.pecas[k];
        if (!d) return;
        const destino = alvoDe(j, i, p);
        d.style.zIndex = j === v.vez ? 3 : 2;
        if (novoMov && mov.jogador === j && mov.peca === i) {
          pararAnim(t, k);
          const pts = mov.caminho.map(pp => ponto(v.quads[j], pp, i));
          d.classList.remove('centro');
          d.classList.toggle('base', mov.caminho[0] === -1);
          por(d, pts[0]);
          d.style.zIndex = 6;
          t.timers[k] = pts.slice(1).map((pt, s) => setTimeout(() => {
            const ult = s === pts.length - 2;
            por(d, ult ? destino : pt);
            d.classList.remove('pula'); void d.offsetWidth; d.classList.add('pula');
            d.classList.remove('base');
            if (ult) { d.classList.toggle('centro', p === 56); d.classList.toggle('base', p === -1); delete t.timers[k]; }
          }, (s + 1) * PASSO));
        } else if (vitimas.has(k)) {
          pararAnim(t, k);
          t.timers[k] = [
            setTimeout(() => d.classList.add('vitima'), tempoCaminho),
            setTimeout(() => { d.classList.remove('vitima'); d.classList.add('base'); por(d, destino); delete t.timers[k]; }, tempoCaminho + 600),
          ];
        } else if (!t.timers[k]) {
          d.classList.toggle('centro', p === 56);
          d.classList.toggle('base', p === -1);
          por(d, destino);
        }

        const m = movs.find(x => x.peca === i);
        const pode = !!m && j === ctx.eu;
        d.classList.toggle('pode', pode);
        d.classList.toggle('sel', pode && selecionada === i);
        d.onmouseenter = pode ? () => mostrarAlvo(i) : null;
        d.onmouseleave = pode ? () => { if (selecionada === null) mostrarAlvo(null); else mostrarAlvo(selecionada); } : null;
        d.onclick = pode ? () => {
          if (temHover() || selecionada === i || movs.length === 1) enviarMover(i);
          else { selecionada = i; mostrarAlvo(i); t.camada.querySelectorAll('.ld-p').forEach(x => x.classList.remove('sel')); d.classList.add('sel'); }
        } : null;
      }));

      async function enviarMover(i) {
        mostrarAlvo(null); selecionada = null;
        t.camada.querySelectorAll('.ld-p.pode').forEach(x => x.classList.remove('pode'));
        await ctx.enviar({ tipo: 'mover', peca: i });
      }
      function mostrarAlvo(i) {
        t.camada.querySelectorAll('.ld-alvo').forEach(x => x.remove());
        if (i === null || i === undefined) return;
        const m = movs.find(x => x.peca === i);
        if (!m) return;
        const a = document.createElement('div');
        a.className = 'ld-alvo';
        a.style.setProperty('--c', ctx.cores[ctx.eu]);
        a.innerHTML = `<span>${m.destino === 56 ? '🏠' : '👣'}</span>`;
        por(a, ponto(v.quads[ctx.eu], m.destino, i));
        a.onclick = () => enviarMover(i);
        t.camada.appendChild(a);
      }
      mostrarAlvo(selecionada);

      desenharDado(t, v, ctx, novaRolagem);
      let dica = '';
      if (v.vencedor !== null && v.vencedor !== undefined) dica = '🏆 Fim de jogo!';
      else if (ctx.minhaVez && v.fase === 'rolar') dica = 'Toque no dado! 👆';
      else if (ctx.minhaVez) dica = movs.length === 1 ? 'Toque na peça que pisca ✨' : 'Escolha uma peça que pisca ✨';
      else dica = `Vez de ${ctx.esc(ctx.jogadores[v.vez]?.nome || '')}`;
      t.dica.innerHTML = dica;
    },
  };
})();
