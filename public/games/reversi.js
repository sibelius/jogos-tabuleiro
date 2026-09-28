// Desenho do Reversi
(() => {
  const css = `
    .rv { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .rv-tab { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; width: min(520px, 100%);
      padding: 10px; border-radius: 18px; box-sizing: border-box;
      background: #1f7a45; box-shadow: 0 8px 0 #145331, inset 0 0 0 4px #2b9458; }
    .rv-cel { position: relative; aspect-ratio: 1; border-radius: 6px; perspective: 400px;
      background: radial-gradient(circle at 30% 30%, #2fa362, #23874f); box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); }
    .rv-cel.pode { cursor: pointer; }
    .rv-cel.pode:hover { background: radial-gradient(circle at 30% 30%, #3dbb74, #2b9b5c); }
    .rv-ponto { position: absolute; inset: 36%; border-radius: 50%; opacity: .55;
      animation: rv-pulsa 1.2s ease-in-out infinite alternate; pointer-events: none; }
    @keyframes rv-pulsa { from { transform: scale(.75); } to { transform: scale(1.05); } }
    .rv-peca { position: absolute; inset: 9%; transform-style: preserve-3d; pointer-events: none; }
    .rv-face { position: absolute; inset: 0; border-radius: 50%; backface-visibility: hidden; -webkit-backface-visibility: hidden;
      box-shadow: inset 0 -4px 0 rgba(0,0,0,.25), inset 0 3px 0 rgba(255,255,255,.35), 0 2px 3px rgba(0,0,0,.35); }
    .rv-face.tras { transform: rotateY(180deg); }
    .rv-peca.vira { animation: rv-vira .55s ease-in-out both; animation-delay: var(--d, 0s); }
    @keyframes rv-vira {
      0% { transform: rotateY(180deg) translateZ(0); }
      50% { transform: rotateY(90deg) scale(1.15); }
      100% { transform: rotateY(0deg); }
    }
    .rv-peca.nova { animation: rv-poe .3s cubic-bezier(.3,1.6,.6,1) both; }
    @keyframes rv-poe { from { transform: scale(0); } to { transform: scale(1); } }
    .rv-cel.ultima::after { content: ''; position: absolute; left: 50%; top: 50%; width: 16%; height: 16%;
      transform: translate(-50%, -50%); border-radius: 50%; background: #fff; opacity: .85; pointer-events: none; }
    .rv-dica { font-size: 14px; opacity: .75; text-align: center; }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  window.JOGOS.reversi = {
    render(el, v, ctx) {
      const ant = ctx.anterior;
      const animar = ant && ant.jogadas !== v.jogadas && v.ultimo;
      const viradas = new Map();
      if (animar) for (const [l, c] of v.viradas || []) {
        const dist = Math.max(Math.abs(l - v.ultimo[0]), Math.abs(c - v.ultimo[1]));
        viradas.set(l * 8 + c, dist);
      }
      const validas = new Set(ctx.minhaVez ? (v.validas || []).map(([l, c]) => l * 8 + c) : []);
      const corEu = ctx.eu >= 0 ? ctx.cores[ctx.eu] : '#fff';
      let html = '<div class="rv"><div class="rv-tab">';
      for (let l = 0; l < 8; l++) for (let c = 0; c < 8; c++) {
        const k = l * 8 + c, p = v.tab[l][c];
        const ultima = v.ultimo && v.ultimo[0] === l && v.ultimo[1] === c;
        const cls = ['rv-cel'];
        if (validas.has(k)) cls.push('pode');
        if (ultima) cls.push('ultima');
        html += `<div class="${cls.join(' ')}" data-l="${l}" data-c="${c}">`;
        if (p >= 0) {
          let pc = 'rv-peca', estiloP = '';
          if (viradas.has(k)) { pc += ' vira'; estiloP = `--d:${0.12 + viradas.get(k) * 0.08}s`; }
          else if (animar && ultima) pc += ' nova';
          html += `<div class="${pc}" style="${estiloP}">
            <div class="rv-face" style="background:${ctx.cores[p]}"></div>
            <div class="rv-face tras" style="background:${ctx.cores[1 - p]}"></div></div>`;
        } else if (validas.has(k)) {
          html += `<div class="rv-ponto" style="background:${corEu}"></div>`;
        }
        html += '</div>';
      }
      html += '</div>';
      if (ctx.minhaVez && v.jogadas < 2) html += '<div class="rv-dica">Toque numa bolinha para prender as peças do outro no meio e virá-las! 🔄</div>';
      html += '</div>';
      el.innerHTML = html;
      if (animar && viradas.size) ctx.som('clique');
      el.querySelectorAll('.rv-cel.pode').forEach(cel => cel.onclick = () => {
        ctx.enviar({ pos: [Number(cel.dataset.l), Number(cel.dataset.c)] });
      });
    },
  };
})();
