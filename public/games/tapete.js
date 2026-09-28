// Desenho do Tapete Mágico
(() => {
  const N = 7, M = 0.62, T = N + 2 * M; // margem (em casas) para desenhar as voltas da borda
  const pct = x => (x / T * 100).toFixed(3) + '%';
  const css = `
    .tp { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
    .tp-topo { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; width: min(560px, 100%); }
    .tp-mesa { position: relative; width: min(560px, 100%); aspect-ratio: 1; border-radius: 22px;
      background: radial-gradient(circle at 30% 25%, #f8dfae, #e9b977 70%, #d99a55);
      box-shadow: 0 8px 0 #a8612d, inset 0 0 0 4px #c47a3c; touch-action: manipulation; user-select: none; }
    .tp-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    .tp-cel { position: absolute; box-sizing: border-box; border: 3px solid transparent; }
    .tp-chao { background: #f6e3bd; box-shadow: inset 0 0 0 1px rgba(150,90,40,.28); }
    .tp-chao.esc { background: #efd5a4; }
    .tp-tap { box-shadow: inset 0 -3px 0 rgba(0,0,0,.12); }
    .tp-tap.bt { border-top-color: rgba(70,35,10,.6); } .tp-tap.bb { border-bottom-color: rgba(70,35,10,.6); }
    .tp-tap.bl { border-left-color: rgba(70,35,10,.6); } .tp-tap.br { border-right-color: rgba(70,35,10,.6); }
    .tp-tap.novo { animation: tp-cai .45s cubic-bezier(.3,1.6,.5,1); }
    .tp-tap.paga { animation: tp-pisca .5s ease-in-out 4 alternate; }
    .tp-alvo { position: absolute; box-sizing: border-box; border-radius: 8px; cursor: pointer; z-index: 3; }
    .tp-alvo.ok { box-shadow: inset 0 0 0 3px rgba(255,255,255,.95), 0 0 10px 2px rgba(255,255,255,.7); animation: tp-brilha 1s ease-in-out infinite alternate; }
    .tp-alvo.sel { box-shadow: inset 0 0 0 4px #fff, 0 0 0 3px #3d2310; background: rgba(255,255,255,.35); }
    .tp-alvo.fantasma { border-radius: 4px; opacity: .8; box-shadow: inset 0 0 0 3px #fff; }
    .tp-assam { position: absolute; z-index: 5; pointer-events: none; display: flex; align-items: center; justify-content: center;
      transition: left .2s ease-in-out, top .2s ease-in-out; }
    .tp-assam .corpo { width: 78%; height: 78%; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff5d6, #ffcf5c);
      box-shadow: 0 3px 0 #b07a12, 0 0 0 3px #7a3e12; display: flex; align-items: center; justify-content: center;
      font-size: clamp(16px, 5.2vw, 30px); line-height: 1; }
    .tp-assam .seta { position: absolute; inset: 0; transition: transform .2s; }
    .tp-assam .seta::before { content: ''; position: absolute; left: 50%; top: -14%; transform: translateX(-50%);
      border-left: 9px solid transparent; border-right: 9px solid transparent; border-bottom: 14px solid #7a3e12;
      filter: drop-shadow(0 0 2px #fff); }
    .tp-assam.anda .corpo { animation: tp-pulo .2s ease-in-out infinite alternate; }
    .tp-dado { width: 64px; height: 64px; border-radius: 14px; background: #fffdf6; box-shadow: 0 5px 0 #c9a36c, inset 0 0 0 2px #e6c89a;
      display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr); padding: 9px; box-sizing: border-box; }
    .tp-dado.rola { animation: tp-rola .6s ease-out; }
    .tp-dado i { width: 12px; height: 12px; border-radius: 50%; background: #7a3e12; align-self: center; justify-self: center; }
    .tp-dado.vazio { opacity: .45; }
    .tp-botoes { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .tp-botoes .btn { font-size: 17px; padding: 10px 14px; }
    @media (max-width: 480px) { .tp-botoes { flex-wrap: nowrap; gap: 6px; } .tp-botoes .btn { font-size: 15px; padding: 9px 10px; white-space: nowrap; } .tp-dado { width: 54px; height: 54px; padding: 7px; } .tp-dado i { width: 10px; height: 10px; } .tp-topo { gap: 8px; } }
    .tp-dica { font-size: 15px; color: #7a4a22; text-align: center; max-width: 520px; }
    .tp-jogs { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; width: min(560px, 100%); }
    .tp-jog { background: #fff8ec; border-radius: 14px; padding: 8px 10px; display: flex; align-items: center; gap: 8px;
      box-shadow: 0 3px 0 rgba(0,0,0,.08); border: 3px solid transparent; font-size: 15px; }
    .tp-jog.vez { border-color: #ffb703; }
    .tp-jog.fora { opacity: .5; }
    .tp-jog .amostra { width: 26px; height: 34px; border-radius: 5px; flex: none; box-shadow: inset 0 0 0 2px rgba(0,0,0,.15); }
    .tp-jog .info { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
    .tp-jog .nm { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @keyframes tp-cai { from { transform: scale(1.5) rotate(-8deg); opacity: 0; } }
    @keyframes tp-pisca { to { filter: brightness(1.45) saturate(1.3); } }
    @keyframes tp-brilha { to { box-shadow: inset 0 0 0 3px rgba(255,255,255,.5), 0 0 4px 1px rgba(255,255,255,.4); } }
    @keyframes tp-pulo { to { transform: translateY(-12%); } }
    @keyframes tp-rola { 0% { transform: rotate(0) scale(.6); } 60% { transform: rotate(400deg) scale(1.15); } 100% { transform: rotate(360deg) scale(1); } }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8] };
  const clarear = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = x => Math.round(x + (255 - x) * f);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  };
  const padrao = (cor, vertical) => {
    const claro = clarear(cor, .45), ang = vertical ? 0 : 90;
    return `background-color:${cor};background-image:repeating-linear-gradient(${ang}deg, transparent 0 7px, ${claro} 7px 10px, transparent 10px 13px, rgba(255,255,255,.55) 13px 14px, transparent 14px 20px), radial-gradient(circle, rgba(255,255,255,.35) 18%, transparent 20%);background-size:auto, 50% 50%;`;
  };
  const box = (l, c, h = 1, w = 1) => `left:${pct(M + c)};top:${pct(M + l)};width:${pct(w)};height:${pct(h)};`;

  function svgVoltas() {
    const x = c => M + c + .5, s = [];
    const arco = (x1, y1, x2, y2, grande = 0, sw = 1) => `<path d="M${x1} ${y1} A .5 .5 0 ${grande} ${sw} ${x2} ${y2}"/>`;
    for (const [a] of [[0], [2], [4]]) s.push(arco(x(a), M, x(a + 1), M, 0, 1));              // cima 0-1,2-3,4-5
    for (const a of [1, 3, 5]) s.push(arco(M + N, x(a), M + N, x(a + 1), 0, 1));               // direita 1-2,3-4,5-6
    for (const a of [1, 3, 5]) s.push(arco(x(a + 1), M + N, x(a), M + N, 0, 1));               // baixo 1-2,3-4,5-6
    for (const a of [0, 2, 4]) s.push(arco(M, x(a + 1), M, x(a), 0, 1));                       // esquerda 0-1,2-3,4-5
    s.push(arco(x(6), M, M + N, x(0), 1, 1));   // canto superior direito
    s.push(arco(x(0), M + N, M, x(6), 1, 1));   // canto inferior esquerdo
    return `<svg class="tp-svg" viewBox="0 0 ${T} ${T}"><rect x="${M}" y="${M}" width="${N}" height="${N}" rx=".12" fill="#8a4b20"/>
      <g fill="none" stroke="#a8612d" stroke-width=".16" stroke-linecap="round">${s.join('')}</g>
      <g fill="none" stroke="#f6e3bd" stroke-width=".05" stroke-dasharray=".12 .1">${s.join('')}</g></svg>`;
  }

  let sel = null, segundo = null, chaveSel = null;
  let anim = { chave: null, inicio: 0, caminho: [] }, timer = null, elAtual = null;
  const PASSO_MS = 230;

  function posAssam(v) {
    if (anim.chave === v.jogada && anim.caminho.length) {
      const i = Math.floor((Date.now() - anim.inicio) / PASSO_MS);
      if (i < anim.caminho.length - 1) return { p: anim.caminho[Math.max(0, i)], andando: true };
    }
    return { p: [v.assam.l, v.assam.c, v.assam.d], andando: false };
  }
  function ajustarAssam(v) {
    const a = elAtual && elAtual.querySelector('.tp-assam');
    if (!a) return false;
    const { p, andando } = posAssam(v);
    a.style.left = pct(M + p[1]); a.style.top = pct(M + p[0]);
    a.querySelector('.seta').style.transform = `rotate(${p[2] * 90}deg)`;
    a.classList.toggle('anda', andando);
    return andando;
  }

  window.JOGOS.tapete = {
    render(el, v, ctx) {
      elAtual = el;
      const ant = ctx.anterior;
      const chave = `${v.jogada}-${v.fase}-${v.vez}`;
      if (chave !== chaveSel) { sel = null; segundo = null; chaveSel = chave; }
      // novo passeio do mercador?
      const novoPasseio = v.dado && v.caminho?.length && ant && ant.jogada !== v.jogada && ant.fase === 'girar' && anim.chave !== v.jogada;
      if (novoPasseio) anim = { chave: v.jogada, inicio: Date.now(), caminho: v.caminho };
      const rolou = novoPasseio;

      const nome = i => ctx.esc(ctx.jogadores[i]?.nome ?? '?');
      const cor = i => ctx.cores[i];
      const eu = ctx.eu, minha = ctx.minhaVez;
      const pagas = new Set((v.pagamento && rolou ? v.pagamento.casas : []).map(([l, c]) => l * N + c));
      const novos = new Set(v.ultimoTapete && ant && ant.jogada !== v.jogada ? v.ultimoTapete.map(([l, c]) => l * N + c) : []);

      let h = `<div class="tp">`;
      // topo: dado + botões/dica
      h += `<div class="tp-topo"><div class="tp-dado ${v.dado ? '' : 'vazio'} ${rolou ? 'rola' : ''}" title="Dado">`;
      const pips = PIPS[v.dado] || [];
      for (let k = 0; k < 9; k++) h += pips.includes(k) ? `<i style="grid-area:${Math.floor(k / 3) + 1}/${k % 3 + 1}"></i>` : '';
      h += `</div>`;
      if (minha && v.fase === 'girar') {
        h += `<div class="tp-botoes">
          <button class="btn rosa" data-lado="esq">↶ Esquerda</button>
          <button class="btn verde" data-lado="reto">⬆ Reto</button>
          <button class="btn rosa" data-lado="dir">Direita ↷</button></div>`;
      } else if (minha && v.fase === 'tapete') {
        h += `<div class="tp-dica">${segundo ? 'Gostou? Toque de novo na casa ou no botão para colocar!' : sel ? 'Agora toque numa casa vizinha que brilha ✨' : 'Toque numa casa que brilha para começar seu tapete 🧶'}</div>`;
        if (segundo) h += `<div class="tp-botoes"><button class="btn verde" id="tp-ok">✅ Colocar tapete</button><button class="btn branco" id="tp-cancela">✖</button></div>`;
      } else if (v.fase !== 'fim') {
        h += `<div class="tp-dica">${v.fase === 'girar' ? `${nome(v.vez)} está escolhendo para onde o mercador vai...` : `${nome(v.vez)} está escolhendo onde colocar o tapete...`}</div>`;
      }
      h += `</div>`;

      // tabuleiro
      h += `<div class="tp-mesa">${svgVoltas()}`;
      for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
        const d = v.dono[l][c], t = v.tid[l][c];
        if (d < 0) { h += `<div class="tp-cel tp-chao ${(l + c) % 2 ? 'esc' : ''}" style="${box(l, c)}"></div>`; continue; }
        const mesmo = (x, y) => x >= 0 && x < N && y >= 0 && y < N && v.tid[x][y] === t;
        const vertical = mesmo(l - 1, c) || mesmo(l + 1, c);
        const cls = ['tp-cel', 'tp-tap'];
        if (!mesmo(l - 1, c)) cls.push('bt'); if (!mesmo(l + 1, c)) cls.push('bb');
        if (!mesmo(l, c - 1)) cls.push('bl'); if (!mesmo(l, c + 1)) cls.push('br');
        if (novos.has(l * N + c)) cls.push('novo');
        if (pagas.has(l * N + c)) cls.push('paga');
        const r = [mesmo(l - 1, c) || mesmo(l, c - 1) ? 0 : 6, mesmo(l - 1, c) || mesmo(l, c + 1) ? 0 : 6,
          mesmo(l + 1, c) || mesmo(l, c + 1) ? 0 : 6, mesmo(l + 1, c) || mesmo(l, c - 1) ? 0 : 6];
        h += `<div class="${cls.join(' ')}" style="${box(l, c)}${padrao(cor(d), vertical)}border-radius:${r.map(x => x + 'px').join(' ')}"></div>`;
      }
      // escolhas do tapete
      if (minha && v.fase === 'tapete') {
        const k = (p) => p[0] * N + p[1];
        if (segundo) {
          const l = Math.min(sel[0], segundo[0]), c = Math.min(sel[1], segundo[1]);
          const hh = sel[0] === segundo[0] ? 1 : 2, ww = sel[0] === segundo[0] ? 2 : 1;
          h += `<div class="tp-alvo fantasma" style="${box(l, c, hh, ww)}${padrao(cor(eu), hh === 2)}"></div>`;
        }
        const alvos = new Map();
        if (!sel) for (const [a, b] of v.validas) { alvos.set(k(a), a); alvos.set(k(b), b); }
        else for (const [a, b] of v.validas) {
          if (k(a) === k(sel)) alvos.set(k(b), b);
          if (k(b) === k(sel)) alvos.set(k(a), a);
        }
        if (sel) h += `<div class="tp-alvo sel" data-l="${sel[0]}" data-c="${sel[1]}" style="${box(sel[0], sel[1])}"></div>`;
        for (const [, p] of alvos) {
          const eSeg = segundo && k(segundo) === k(p);
          h += `<div class="tp-alvo ${eSeg ? 'sel' : 'ok'}" data-l="${p[0]}" data-c="${p[1]}" style="${box(p[0], p[1])}"></div>`;
        }
      }
      h += `<div class="tp-assam" style="${box(v.assam.l, v.assam.c)}"><div class="seta"></div><div class="corpo">🧞</div></div>`;
      h += `</div>`;

      // jogadores
      h += `<div class="tp-jogs">`;
      v.moedas.forEach((m, i) => {
        h += `<div title="${v.visiveis[i]} casas de tapete à mostra + ${m} moedas" class="tp-jog ${i === v.vez && v.fase !== 'fim' ? 'vez' : ''} ${v.fora[i] ? 'fora' : ''}">
          <div class="amostra" style="${padrao(cor(i), true)}"></div>
          <div class="info"><span class="nm">${nome(i)}${i === eu ? ' (você)' : ''}</span>
          <span>🪙 ${m} · 🧶 ${v.tapetes[i]}</span>
          <span style="font-size:13px;color:#8a5a30">${v.fora[i] ? 'saiu do jogo 😢' : `⭐ ${v.pontos[i]} pontos`}</span></div></div>`;
      });
      h += `</div>`;
      if (v.fase === 'girar' && minha) h += `<div class="tp-dica">Gire o mercador 🧞 (nunca para trás!) e ele anda o que sair no dado (1, 2, 2, 3, 3 ou 4). Cuidado com os tapetes dos outros!</div>`;
      h += `</div>`;
      el.innerHTML = h;

      // animação do mercador
      if (timer) { clearInterval(timer); timer = null; }
      const andando = ajustarAssam(v);
      if (andando) {
        const a = el.querySelector('.tp-assam'); a.style.transition = 'none';
        ajustarAssam(v); void a.offsetWidth; a.style.transition = '';
        timer = setInterval(() => { if (!ajustarAssam(v)) { clearInterval(timer); timer = null; } }, 60);
      }

      // eventos
      el.querySelectorAll('[data-lado]').forEach(b => b.onclick = () => { ctx.som('clique'); ctx.enviar({ tipo: 'girar', lado: b.dataset.lado }); });
      const colocar = () => { const a = sel, b = segundo; sel = segundo = null; ctx.som('clique'); ctx.enviar({ tipo: 'tapete', a, b }); };
      el.querySelector('#tp-ok')?.addEventListener('click', colocar);
      el.querySelector('#tp-cancela')?.addEventListener('click', () => { sel = segundo = null; this.render(el, v, ctx); });
      el.querySelectorAll('.tp-alvo[data-l]').forEach(a => a.onclick = () => {
        const p = [Number(a.dataset.l), Number(a.dataset.c)];
        const igual = q => q && q[0] === p[0] && q[1] === p[1];
        if (igual(sel)) { sel = segundo = null; }
        else if (igual(segundo)) return colocar();
        else if (!sel) sel = p;
        else {
          const par = v.validas.some(([x, y]) => (igual(x) && y[0] === sel[0] && y[1] === sel[1]) || (igual(y) && x[0] === sel[0] && x[1] === sel[1]));
          if (par) segundo = p; else { sel = p; segundo = null; }
        }
        ctx.som('clique');
        this.render(el, v, ctx);
      });
    },
  };
})();
