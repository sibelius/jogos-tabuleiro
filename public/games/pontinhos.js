// Desenho do Pontinhos
(() => {
  const css = `
    .pt { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .pt-tab { width: min(520px, 100%); background: #fff; border-radius: 22px; box-shadow: 0 6px 0 rgba(43,33,64,.15);
      padding: 6px; box-sizing: border-box; touch-action: manipulation; }
    .pt-tab svg { display: block; width: 100%; height: auto; user-select: none; -webkit-user-select: none; }
    .pt-alvo { cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .pt-alvo polygon { fill: transparent; }
    .pt-previa { opacity: 0; transition: opacity .12s; pointer-events: none; }
    @media (hover: hover) { .pt-alvo:hover .pt-previa { opacity: .45; } }
    .pt-alvo:active .pt-previa { opacity: .6; }
    .pt-linha { stroke-linecap: round; }
    .pt-linha.nova { stroke-dasharray: 60; stroke-dashoffset: 60; animation: pt-risca .35s ease-out forwards; }
    @keyframes pt-risca { to { stroke-dashoffset: 0; } }
    .pt-caixa.nova { animation: pt-pop .45s cubic-bezier(.3,1.6,.6,1) both; transform-box: fill-box; transform-origin: center; }
    @keyframes pt-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .pt-letra { font-family: Fredoka, sans-serif; font-weight: 700; font-size: 24px; pointer-events: none; }
    .pt-ponto { fill: #2b2140; pointer-events: none; }
    .pt-dica { font-size: 14px; opacity: .75; text-align: center; }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  const S = 60, M = 16; // distância entre pontos e margem (unidades do SVG)

  window.JOGOS.pontinhos = {
    render(el, v, ctx) {
      const { L, C } = v;
      const W = C * S + 2 * M, H = L * S + 2 * M;
      const X = c => M + c * S, Y = l => M + l * S;
      const ant = ctx.anterior;
      const mudou = ant && ant.jogadas !== v.jogadas;
      const u = v.ultimo;
      const corEu = ctx.eu >= 0 ? ctx.cores[ctx.eu] : '#999';
      const inicial = i => {
        const nome = (ctx.jogadores[i] && ctx.jogadores[i].nome) || '';
        const robo = nome.match(/Rob[oô]\s*(\d+)/i);
        if (robo) return 'R' + robo[1];
        const letra = nome.match(/\p{L}|\p{N}/u);
        return ctx.esc(letra ? letra[0].toUpperCase() : String(i + 1));
      };
      const novaCaixa = new Set(mudou ? (v.fechadas || []).map(([a, b]) => a + ',' + b) : []);

      let caixas = '', linhas = '', alvos = '', pontos = '';
      // quadradinhos
      for (let l = 0; l < L; l++) for (let c = 0; c < C; c++) {
        const p = v.caixas[l][c];
        if (p < 0) continue;
        const cls = 'pt-caixa' + (novaCaixa.has(l + ',' + c) ? ' nova' : '');
        caixas += `<g class="${cls}"><rect x="${X(c) + 5}" y="${Y(l) + 5}" width="${S - 10}" height="${S - 10}" rx="8"
          fill="${ctx.cores[p]}" fill-opacity=".3"/>
          <text class="pt-letra" x="${X(c) + S / 2}" y="${Y(l) + S / 2 + 9}" text-anchor="middle" fill="${ctx.cores[p]}">${inicial(p)}</text></g>`;
      }
      const seg = (t, l, c) => t === 'h' ? [X(c), Y(l), X(c + 1), Y(l)] : [X(c), Y(l), X(c), Y(l + 1)];
      const desenhar = (t, l, c, dono) => {
        const [x1, y1, x2, y2] = seg(t, l, c);
        if (dono >= 0) {
          const nova = mudou && u && u.linha === t && u.l === l && u.c === c;
          linhas += `<line class="pt-linha${nova ? ' nova' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ctx.cores[dono]}" stroke-width="8"/>`;
        } else {
          // linha pontilhada de guia
          linhas += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e7e0f5" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`;
          if (!ctx.minhaVez) return;
          // área de toque em losango: vai dos dois pontos até o centro dos quadradinhos vizinhos
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          const poly = t === 'h'
            ? `${x1},${y1} ${mx},${my - S / 2} ${x2},${y2} ${mx},${my + S / 2}`
            : `${x1},${y1} ${mx - S / 2},${my} ${x2},${y2} ${mx + S / 2},${my}`;
          alvos += `<g class="pt-alvo" data-t="${t}" data-l="${l}" data-c="${c}"><polygon points="${poly}"/>
            <line class="pt-previa pt-linha" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${corEu}" stroke-width="8"/></g>`;
        }
      };
      for (let l = 0; l <= L; l++) for (let c = 0; c < C; c++) desenhar('h', l, c, v.h[l][c]);
      for (let l = 0; l < L; l++) for (let c = 0; c <= C; c++) desenhar('v', l, c, v.v[l][c]);
      for (let l = 0; l <= L; l++) for (let c = 0; c <= C; c++) pontos += `<circle class="pt-ponto" cx="${X(c)}" cy="${Y(l)}" r="6"/>`;

      let html = `<div class="pt"><div class="pt-tab"><svg viewBox="0 0 ${W} ${H}">${caixas}${linhas}${alvos}${pontos}</svg></div>`;
      if (ctx.minhaVez && v.jogadas < 3) html += '<div class="pt-dica">Toque entre dois pontinhos para fazer um risco. Fechou um quadrado? Joga de novo! ✏️</div>';
      html += '</div>';
      el.innerHTML = html;
      if (mudou && novaCaixa.size) ctx.som('clique');
      let enviando = false;
      el.querySelectorAll('.pt-alvo').forEach(g => g.addEventListener('click', () => {
        if (enviando) return;
        enviando = true;
        ctx.enviar({ linha: g.dataset.t, l: Number(g.dataset.l), c: Number(g.dataset.c) }).finally(() => { enviando = false; });
      }));
    },
  };
})();
