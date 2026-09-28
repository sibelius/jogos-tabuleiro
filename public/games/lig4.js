// Desenho do Lig 4
(() => {
  const css = `
    .l4 { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .l4-tab { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; background: #3a5bff; padding: 12px; border-radius: 20px;
      box-shadow: 0 8px 0 #2139c4; width: min(560px, 100%); }
    .l4-col { display: grid; grid-template-rows: repeat(6, 1fr); gap: 8px; border-radius: 12px; padding: 2px; }
    .l4-col.pode { cursor: pointer; }
    .l4-col.pode:hover { background: rgba(255,255,255,.18); }
    .l4-cel { aspect-ratio: 1; border-radius: 50%; background: #fff8ee; box-shadow: inset 0 4px 0 rgba(0,0,0,.15); }
    .l4-cel.peca { box-shadow: inset 0 -5px 0 rgba(0,0,0,.2); }
    .l4-cel.cai { animation: l4-cai .35s cubic-bezier(.5,0,.8,.5); }
    .l4-cel.ganha { animation: l4-pisca .6s ease-in-out infinite alternate; }
    @keyframes l4-cai { from { transform: translateY(calc(var(--l) * -115%)); } }
    @keyframes l4-pisca { to { transform: scale(.8); filter: brightness(1.3); } }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  window.JOGOS.lig4 = {
    render(el, v, ctx) {
      const ganha = new Set((v.vitoria?.linha || []).map(([l, c]) => l + ',' + c));
      const novo = v.ultimo && JSON.stringify(v.ultimo) !== JSON.stringify(ctx.anterior?.ultimo);
      let html = '<div class="l4"><div class="l4-tab">';
      for (let c = 0; c < 7; c++) {
        const pode = ctx.minhaVez && v.livres.includes(c);
        html += `<div class="l4-col ${pode ? 'pode' : ''}" data-c="${c}">`;
        for (let l = 0; l < 6; l++) {
          const p = v.tab[l][c];
          const cls = ['l4-cel'];
          if (p >= 0) cls.push('peca');
          if (novo && v.ultimo[0] === l && v.ultimo[1] === c) cls.push('cai');
          if (ganha.has(l + ',' + c)) cls.push('ganha');
          html += `<div class="${cls.join(' ')}" style="--l:${l + 1};${p >= 0 ? `background:${ctx.cores[p]}` : ''}"></div>`;
        }
        html += '</div>';
      }
      html += '</div></div>';
      el.innerHTML = html;
      el.querySelectorAll('.l4-col.pode').forEach(col => col.onclick = () => ctx.enviar({ coluna: Number(col.dataset.c) }));
    },
  };
})();
