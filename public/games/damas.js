// Desenho das Damas
(() => {
  const css = `
    .dm { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .dm-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; font-weight: 600; font-size: .95rem; }
    .dm-chip { display: inline-flex; align-items: center; gap: 6px; background: #f6f1ff; border-radius: 999px; padding: 4px 12px; }
    .dm-chip i { display: inline-block; width: 16px; height: 16px; border-radius: 50%; box-shadow: inset 0 -2px 0 rgba(0,0,0,.25); }
    .dm-dica { background: #ffe7a3; color: #7a4b00; border-radius: 12px; padding: 6px 14px; font-weight: 700; animation: dm-balanca .8s ease-in-out infinite alternate; }
    @keyframes dm-balanca { from { transform: scale(1); } to { transform: scale(1.05); } }
    .dm-moldura { width: min(560px, 100%, max(300px, 100vh - 280px)); padding: 10px; border-radius: 18px;
      background: linear-gradient(135deg, #8a4b22, #5e2f12 60%, #7a4019);
      box-shadow: 0 8px 0 #3f1f0b, inset 0 2px 0 rgba(255,255,255,.25); box-sizing: border-box; }
    .dm-tab { position: relative; width: 100%; aspect-ratio: 1; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr);
      border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 0 2px rgba(0,0,0,.35); touch-action: manipulation; user-select: none; -webkit-user-select: none; }
    .dm-cel { position: relative; }
    .dm-cel.clara { background: linear-gradient(135deg, #f7dfb5, #eccb94); }
    .dm-cel.escura { background: linear-gradient(135deg, #a8683a, #8b5129);
      background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 3px, rgba(0,0,0,.03) 3px 7px), linear-gradient(135deg, #a8683a, #8b5129); }
    .dm-cel.ult::before { content: ''; position: absolute; inset: 0; background: rgba(255, 230, 90, .32); }
    .dm-cel.alvo { cursor: pointer; }
    .dm-cel.alvo::after { content: ''; position: absolute; left: 33%; top: 33%; width: 34%; height: 34%; border-radius: 50%;
      background: rgba(120, 255, 170, .85); box-shadow: 0 0 0 3px rgba(255,255,255,.6), 0 0 12px rgba(120,255,170,.9); animation: dm-ponto 1s ease-in-out infinite alternate; }
    @keyframes dm-ponto { to { transform: scale(1.25); } }
    .dm-cel.pode { cursor: pointer; }
    .dm-p { position: absolute; width: 12.5%; height: 12.5%; pointer-events: none; z-index: 2; }
    .dm-p.anda { z-index: 5; }
    .dm-disco { position: absolute; inset: 9%; border-radius: 50%; background: var(--cor);
      background-image: radial-gradient(circle at 35% 28%, rgba(255,255,255,.75) 0 8%, rgba(255,255,255,.18) 30%, rgba(255,255,255,0) 55%),
        radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,.18) 54%, rgba(0,0,0,0) 60%);
      box-shadow: 0 4px 0 rgba(0,0,0,.35), 0 6px 8px rgba(0,0,0,.35), inset 0 -3px 0 rgba(0,0,0,.2);
      display: flex; align-items: center; justify-content: center; transition: transform .15s; }
    .dm-disco .coroa { font-size: clamp(14px, 5vw, 30px); line-height: 1; filter: drop-shadow(0 2px 0 rgba(0,0,0,.35)); }
    .dm-p.pode .dm-disco { box-shadow: 0 0 0 3px #fff, 0 0 14px 4px rgba(255,255,160,.95), 0 4px 0 rgba(0,0,0,.35); animation: dm-brilho 1s ease-in-out infinite alternate; }
    @keyframes dm-brilho { to { box-shadow: 0 0 0 3px #fff, 0 0 4px 1px rgba(255,255,160,.5), 0 4px 0 rgba(0,0,0,.35); } }
    .dm-p.sel .dm-disco { transform: translateY(-8%) scale(1.1); box-shadow: 0 0 0 4px #7dffb0, 0 0 18px 6px rgba(125,255,176,.9), 0 8px 10px rgba(0,0,0,.4); animation: none; }
    .dm-p.fantasma .dm-disco { opacity: .35; filter: grayscale(.6); }
    .dm-p.some { z-index: 3; }
    .dm-p.promove .coroa { animation: dm-coroa .7s cubic-bezier(.3,1.6,.5,1) both; animation-delay: var(--atraso, 0s); }
    @keyframes dm-coroa { from { transform: scale(0) rotate(-40deg); } }
    .dm-legenda { font-size: .85rem; opacity: .7; text-align: center; }
    @media (max-width: 420px) { .dm-moldura { padding: 6px; border-radius: 12px; } .dm-info { font-size: .85rem; } }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  // estado local da tela
  let chave = null;      // identifica a jogada atual (partida + número do lance)
  let sel = null;        // [l, c] peça escolhida
  let passos = [];       // casas já tocadas para a peça escolhida
  let animado = null;    // último lance já animado

  const dono = p => (p === 1 || p === 2 ? 0 : p === 3 || p === 4 ? 1 : -1);
  const ehDama = p => p === 2 || p === 4;
  const mesmo = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];

  function render(el, v, ctx) {
    const k = v.partida + ':' + v.num + ':' + ctx.minhaVez;
    if (k !== chave) { chave = k; sel = null; passos = []; }

    const vira = ctx.eu === 1;
    const vl = l => (vira ? 7 - l : l), vc = c => (vira ? 7 - c : c);
    const lances = ctx.minhaVez ? (v.lances || []) : [];
    const podeMexer = new Set(lances.map(m => m.de.join(',')));

    // lances que combinam com a seleção atual
    const cand = sel ? lances.filter(m => mesmo(m.de, sel) && passos.every((q, i) => mesmo(m.caminho[i], q))) : [];
    const alvos = new Set(cand.map(m => m.caminho[passos.length]).filter(Boolean).map(q => q.join(',')));
    const jaPegas = new Set(cand.length ? cand[0].capturas.slice(0, passos.length).map(q => q.join(',')) : []);
    const posSel = sel ? (passos.length ? passos[passos.length - 1] : sel) : null;

    // último lance: animar?
    const u = v.ultimo;
    const idLance = u ? v.partida + ':' + u.num : null;
    const animar = u && ctx.anterior && ctx.anterior.num !== v.num && idLance !== animado && !sel;
    if (animar) animado = idLance;
    const ultCasas = new Set(u ? [u.de, ...u.caminho].map(q => q.join(',')) : []);

    let html = '<div class="dm">';
    // quem sou eu
    const minhaCor = ctx.eu >= 0 ? ctx.cores[ctx.eu] : null;
    html += '<div class="dm-info">';
    if (ctx.eu >= 0) html += `<span class="dm-chip"><i style="background:${minhaCor}"></i>Suas peças: ${contar(v.tab, ctx.eu)}</span>`;
    const outro = ctx.eu >= 0 ? 1 - ctx.eu : 1;
    html += `<span class="dm-chip"><i style="background:${ctx.cores[outro]}"></i>${ctx.eu >= 0 ? 'Adversário' : ctx.esc(ctx.jogadores[1]?.nome || '')}: ${contar(v.tab, outro)}</span>`;
    if (ctx.eu < 0) html += `<span class="dm-chip"><i style="background:${ctx.cores[0]}"></i>${ctx.esc(ctx.jogadores[0]?.nome || '')}: ${contar(v.tab, 0)}</span>`;
    html += '</div>';
    if (ctx.minhaVez && v.obrigatoria) {
      html += `<div class="dm-dica">💥 ${sel && passos.length ? 'Continue pulando!' : 'Captura obrigatória! Pule a peça do adversário'}</div>`;
    }

    html += '<div class="dm-moldura"><div class="dm-tab">';
    for (let r = 0; r < 8; r++) for (let s = 0; s < 8; s++) {
      const l = vira ? 7 - r : r, c = vira ? 7 - s : s;
      const escura = (l + c) % 2 === 1;
      const cls = ['dm-cel', escura ? 'escura' : 'clara'];
      const kk = l + ',' + c;
      if (ultCasas.has(kk) && !sel) cls.push('ult');
      if (alvos.has(kk)) cls.push('alvo');
      if (podeMexer.has(kk)) cls.push('pode');
      html += `<div class="${cls.join(' ')}" data-l="${l}" data-c="${c}"></div>`;
    }

    // peças
    const pos = (l, c) => `left:${vc(c) * 12.5}%;top:${vl(l) * 12.5}%`;
    for (let l = 0; l < 8; l++) for (let c = 0; c < 8; c++) {
      let p = v.tab[l][c];
      if (!p) continue;
      const kk = l + ',' + c;
      const cls = ['dm-p'];
      let [pl, pc] = [l, c];
      if (sel && mesmo(sel, [l, c])) { cls.push('sel'); [pl, pc] = posSel; }
      else if (!sel && podeMexer.has(kk)) cls.push('pode');
      if (jaPegas.has(kk)) cls.push('fantasma');
      const ehUlt = animar && mesmo(u.caminho[u.caminho.length - 1], [l, c]);
      if (ehUlt) cls.push('anda');
      if (ehUlt && u.promoveu) cls.push('promove');
      const atraso = ehUlt ? (u.caminho.length * 0.28) + 's' : '0s';
      html += `<div class="${cls.join(' ')}" data-p="${kk}" style="${pos(pl, pc)};--atraso:${atraso}">${disco(p, ctx)}</div>`;
    }
    // peças capturadas no último lance (somem devagar)
    if (animar) for (const [l, c, p] of u.capturadas || []) {
      html += `<div class="dm-p some" data-some="${l},${c}" style="${pos(l, c)}">${disco(p, ctx)}</div>`;
    }
    html += '</div></div>';
    if (ctx.eu >= 0) {
      const dica = !ctx.minhaVez ? '' : sel ? 'Toque numa bolinha verde para mover 🟢' : 'Toque numa peça que está brilhando ✨';
      html += `<div class="dm-legenda">${dica || '&nbsp;'}</div>`;
    }
    html += '</div>';
    el.innerHTML = html;

    // animação do último lance
    if (animar) {
      const fim = u.caminho[u.caminho.length - 1];
      const peca = el.querySelector(`[data-p="${fim.join(',')}"]`);
      const seg = 280;
      if (peca && peca.animate) {
        const pontos = [u.de, ...u.caminho];
        const quadros = pontos.map(([l, c], i) => ({
          transform: `translate(${(vc(c) - vc(fim[1])) * 100}%, ${(vl(l) - vl(fim[0])) * 100}%)${i > 0 && i < pontos.length - 1 ? ' scale(1.08)' : ''}`,
        }));
        peca.animate(quadros, { duration: seg * u.caminho.length, easing: 'ease-in-out', fill: 'backwards' });
      }
      (u.capturadas || []).forEach(([l, c], i) => {
        const g = el.querySelector(`[data-some="${l},${c}"]`);
        if (!g) return;
        // some quando a peça passa por cima
        const quando = seg * (i + 0.6);
        if (g.animate) {
          const a = g.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1)', offset: 0.01 }, { opacity: 0, transform: 'scale(.3) rotate(25deg)' }],
            { duration: 450, delay: quando, easing: 'ease-in', fill: 'forwards' });
          a.onfinish = () => g.remove();
        } else g.remove();
      });
      if (u.capturadas?.length) setTimeout(() => ctx.som('clique'), seg * 0.6);
    }

    // toques
    el.querySelector('.dm-tab').onclick = ev => {
      const cel = ev.target.closest('.dm-cel');
      if (!cel || !ctx.minhaVez) return;
      const l = Number(cel.dataset.l), c = Number(cel.dataset.c), kk = l + ',' + c;
      if (sel && alvos.has(kk)) {
        passos.push([l, c]);
        const resto = cand.filter(m => mesmo(m.caminho[passos.length - 1], [l, c]));
        const completos = resto.filter(m => m.caminho.length === passos.length);
        if (resto.length === 1 || (completos.length && completos.length === resto.length)) {
          const m = resto[0];
          ctx.som('clique');
          sel = null; passos = [];
          ctx.enviar({ de: m.de, caminho: m.caminho });
          return;
        }
        ctx.som('clique');
        render(el, v, ctx);
        return;
      }
      if (podeMexer.has(kk)) {
        if (sel && mesmo(sel, [l, c]) && !passos.length) sel = null;
        else { sel = [l, c]; passos = []; }
        ctx.som('clique');
        render(el, v, ctx);
        return;
      }
      const p = v.tab[l][c];
      if (p && dono(p) === ctx.eu && !(sel && mesmo(sel, [l, c]))) {
        ctx.toast(v.obrigatoria ? 'Captura obrigatória! Escolha uma peça que pode pular 💥' : 'Essa peça não tem para onde ir 🙈');
        ctx.som('erro');
        return;
      }
      if (sel) { sel = null; passos = []; render(el, v, ctx); }
    };
  }

  function disco(p, ctx) {
    return `<div class="dm-disco" style="--cor:${ctx.cores[dono(p)]}">${ehDama(p) ? '<span class="coroa">👑</span>' : ''}</div>`;
  }
  function contar(tab, j) { return tab.flat().filter(p => dono(p) === j).length; }

  window.JOGOS.damas = { render };
})();
