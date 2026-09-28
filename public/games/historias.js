// Desenho do Contadores de Histórias
(() => {
  const css = `
    .hs { display: flex; flex-direction: column; gap: 14px; align-items: center; width: 100%; min-width: 0; }
    .hs * { box-sizing: border-box; }
    .hs-topo { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; width: 100%; }
    .hs-dica { background: linear-gradient(135deg, #fff3c4, #ffe0f0); border: 3px dashed #f4a6c8; border-radius: 18px; padding: 8px 16px;
      font-size: 1.25rem; font-weight: 700; color: #6a3d9a; text-align: center; max-width: 100%; overflow-wrap: anywhere; }
    .hs-dica small { display: block; font-size: .75rem; font-weight: 500; color: #9a7bb8; }
    .hs-info { font-size: .85rem; color: #8a7ca8; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    .hs-quem { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .hs-quem span { display: inline-flex; align-items: center; gap: 4px; background: #f5f0ff; border-radius: 99px; padding: 3px 9px 3px 4px; font-size: .8rem; }
    .hs-quem i { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
    .hs-quem .ok { background: #dff7ea; }
    .hs-carta { position: relative; min-width: 0; aspect-ratio: 5 / 7; border-radius: 12px; overflow: hidden; background: #ddd; border: 3px solid white;
      box-shadow: 0 4px 10px rgba(60, 30, 110, .25); cursor: default; transition: transform .15s, box-shadow .15s; }
    .hs-carta .hc-arte { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .hs-carta.pode { cursor: pointer; }
    .hs-carta.pode:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(60, 30, 110, .35); }
    .hs-carta.sel { border-color: #ffb703; box-shadow: 0 0 0 3px #ffb703, 0 8px 16px rgba(60, 30, 110, .35); transform: translateY(-6px); }
    .hs-carta.apagada { opacity: .55; filter: grayscale(.4); }
    .hs-verso { background: radial-gradient(circle at 30% 20%, #b392ea, #6a4c93 60%, #3b2a7a); display: flex; align-items: center; justify-content: center; font-size: 2rem; }
    .hs-verso::after { content: ''; position: absolute; inset: 6px; border: 2px dotted rgba(255,255,255,.5); border-radius: 8px; }
    .hs-mao-box { width: 100%; max-width: 640px; }
    .hs-rot { font-size: .85rem; font-weight: 600; color: #8a7ca8; margin: 0 0 6px 4px; }
    .hs-mao { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
    .hs-mao .hs-carta { border-width: 2px; border-radius: 9px; }
    .hs-palco { width: 100%; max-width: 640px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
    .hs-pensa { font-size: 3.4rem; animation: hs-flutua 1.6s ease-in-out infinite alternate; }
    @keyframes hs-flutua { to { transform: translateY(-8px) rotate(6deg); } }
    .hs-dicas-ajuda { font-size: .85rem; color: #8a7ca8; max-width: 360px; }
    .hs-pilha { display: flex; justify-content: center; gap: 0; min-height: 110px; }
    .hs-pilha .hs-carta { width: 70px; margin: 0 -14px; }
    .hs-pilha .hs-carta:nth-child(odd) { transform: rotate(-6deg); } .hs-pilha .hs-carta:nth-child(even) { transform: rotate(5deg); }
    .hs-pilha .hs-carta.chega { animation: hs-chega .4s ease-out; }
    @keyframes hs-chega { from { transform: translateY(-40px) scale(.6); opacity: 0; } }
    .hs-mini { width: 64px; display: inline-block; vertical-align: middle; }
    .hs-grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px; width: 100%; }
    .hs-grade.n3 { grid-template-columns: repeat(3, minmax(0, 150px)); justify-content: center; }
    .hs-grade.n4 { grid-template-columns: repeat(4, minmax(0, 140px)); justify-content: center; }
    @media (max-width: 520px) { .hs-grade.n4 { grid-template-columns: repeat(2, minmax(0, 140px)); } }
    .hs-item { min-width: 0; display: flex; flex-direction: column; gap: 4px; align-items: stretch; }
    .hs-num { position: absolute; top: 5px; left: 5px; background: white; color: #6a3d9a; font-weight: 700; border-radius: 50%; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center; font-size: .9rem; box-shadow: 0 2px 4px rgba(0,0,0,.25); }
    .hs-selo { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,.92); border-radius: 99px;
      padding: 1px 8px; font-size: .72rem; font-weight: 700; color: #6a3d9a; white-space: nowrap; }
    .hs-dono { border-radius: 99px; color: white; font-weight: 700; font-size: .78rem; padding: 2px 8px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hs-estrela { position: absolute; top: 4px; right: 4px; font-size: 1.3rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,.4)); }
    .hs-carta.alvo { border-color: #ffd23f; box-shadow: 0 0 0 3px #ffd23f, 0 0 18px #ffd23f; }
    .hs-votos { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; min-height: 18px; }
    .hs-votos b { width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,.3); font-size: .6rem; color: white;
      display: flex; align-items: center; justify-content: center; }
    .hs-anim .hs-votos b { animation: hs-pop .4s backwards; }
    .hs-ganhos { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .hs-ganho { display: flex; align-items: center; gap: 6px; background: #f5f0ff; border-radius: 14px; padding: 6px 10px; font-weight: 600; }
    .hs-ganho i { width: 14px; height: 14px; border-radius: 50%; }
    .hs-ganho .mais { color: #22b573; font-size: 1.1rem; }
    .hs-ganho .zero { color: #b0a6c6; }
    .hs-anim .hs-ganho .mais { display: inline-block; animation: hs-sobe .9s cubic-bezier(.2,1.6,.4,1) backwards; }
    @keyframes hs-pop { from { transform: scale(0); } }
    @keyframes hs-sobe { from { transform: translateY(14px) scale(.3); opacity: 0; } }
    .hs-ver { position: fixed; inset: 0; background: rgba(40, 16, 80, .7); z-index: 50; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; padding: 16px; animation: hs-aparece .2s; }
    @keyframes hs-aparece { from { opacity: 0; } }
    .hs-ver .hs-carta { width: min(300px, 80vw, calc((100vh - 230px) * 5 / 7)); border-width: 5px; border-radius: 18px; animation: hs-zoom .25s; cursor: default; }
    @keyframes hs-zoom { from { transform: scale(.6); } }
    .hs-ver-acoes { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; width: min(360px, 100%); }
    .hs-ver-acoes input { flex: 1 1 100%; font: inherit; font-size: 1.1rem; padding: 10px 14px; border-radius: 14px; border: 3px solid #b392ea; outline: none; min-width: 0; }
    .hs-ver-acoes input:focus { border-color: #ffb703; }
    .hs-ver-titulo { color: white; font-weight: 700; font-size: 1.1rem; text-align: center; }
    .hs-conta { font-size: .75rem; color: #e8dcff; width: 100%; text-align: right; margin-top: -6px; }
  `;
  const estilo = document.createElement('style'); estilo.textContent = css; document.head.appendChild(estilo);

  // carrega as cartas (arquivo separado, compartilhado com o servidor)
  let ultimoPedido = null, carregando = false;
  function cartasProntas() {
    if (window.HISTORIAS_CARTAS) return true;
    if (!carregando) {
      carregando = true;
      const s = document.createElement('script');
      s.src = '/games/historias-cartas.js';
      s.onload = () => { if (ultimoPedido) window.JOGOS.historias.render(...ultimoPedido); };
      document.head.appendChild(s);
    }
    return false;
  }

  // estado local da tela
  let sel = null, aberto = false, dicaTexto = '', chaveRodada = '', assinatura = '';

  const carta = (id, cls = '', extra = '') => `<div class="hs-carta ${cls}" data-c="${id}">${window.HISTORIAS_CARTAS.svg(id)}${extra}</div>`;
  const verso = (cls = '') => `<div class="hs-carta hs-verso ${cls}">🎨</div>`;

  window.JOGOS.historias = {
    render(el, v, ctx) {
      ultimoPedido = [el, v, ctx];
      if (!cartasProntas()) { el.innerHTML = '<p style="text-align:center">Embaralhando as cartas... 🎨</p>'; return; }
      const chave = v.rodada + ':' + v.fase;
      if (chave !== chaveRodada) { chaveRodada = chave; sel = null; aberto = false; if (v.fase !== 'contar') dicaTexto = ''; }

      const sig = JSON.stringify([v, ctx.eu, ctx.minhaVez, sel, aberto, ctx.jogadores.map(j => j.nome)]);
      if (sig === assinatura && el.querySelector('.hs')) return;
      assinatura = sig;

      const esc = ctx.esc, J = ctx.jogadores, cor = i => ctx.cores[i];
      const nome = i => i === ctx.eu ? 'Você' : (J[i]?.nome ?? '?');
      const souNarr = ctx.eu === v.narrador;
      const anim = ctx.anterior && ctx.anterior.fase === 'votar' && (v.fase === 'resultado' || v.fase === 'fim');

      // modo da mão: 'contar' | 'escolher' | null (só olhar)
      let modo = null;
      if (ctx.minhaVez && v.fase === 'contar') modo = 'contar';
      if (ctx.minhaVez && v.fase === 'escolher') modo = 'escolher';
      const votando = ctx.minhaVez && v.fase === 'votar';

      let h = '<div class="hs">';
      // ---- topo ----
      h += '<div class="hs-topo">';
      if (v.dica) h += `<div class="hs-dica"><small>A dica de ${esc(nome(v.narrador))} ${souNarr ? '(você)' : ''}</small>“${esc(v.dica)}”</div>`;
      h += '</div>';
      if (v.fase === 'escolher' || v.fase === 'votar' || v.fase === 'resultado') {
        const lista = J.map((j, i) => i).filter(i => v.fase === 'resultado' || i !== v.narrador);
        h += `<div class="hs-quem">${lista.map(i => `<span class="${v.jaAgiu[i] ? 'ok' : ''}"><i style="background:${cor(i)}"></i>${esc(nome(i))} ${v.jaAgiu[i] ? '✅' : '⏳'}</span>`).join('')}</div>`;
      }

      // ---- palco ----
      h += '<div class="hs-palco">';
      if (v.fase === 'contar') {
        if (souNarr) {
          h += `<div class="hs-pensa">📜</div><b>Você é quem conta a história!</b>
            <div class="hs-dicas-ajuda">Escolha uma carta da sua mão 👇 e invente uma dica: uma palavra, um som, um filme, um sentimento...
            Dica boa não é fácil demais nem difícil demais: se todo mundo acertar, ou ninguém acertar, você não ganha pontos!</div>`;
        } else {
          h += `<div class="hs-pensa">💭</div><div><b style="color:${cor(v.narrador)}">${esc(nome(v.narrador))}</b> está escolhendo uma carta e pensando numa dica...</div>
            <div class="hs-dicas-ajuda">Enquanto isso, olhe suas cartas e imagine histórias para elas ✨</div>`;
        }
      } else if (v.fase === 'escolher') {
        const total = J.length;
        h += `<div class="hs-pilha">${Array.from({ length: v.jogadasFeitas }, (_, k) => verso(ctx.anterior && ctx.anterior.fase === 'escolher' && k >= ctx.anterior.jogadasFeitas ? 'chega' : '')).join('')}</div>`;
        h += `<div class="hs-info">${v.jogadasFeitas} de ${total} cartas na mesa</div>`;
        if (modo === 'escolher') h += `<div class="hs-dicas-ajuda">Escolha a carta da sua mão que mais combina com a dica. Assim os outros podem votar nela sem querer! 😉</div>`;
        else if (v.minhaCarta !== null) h += `<div class="hs-info">Sua carta: ${carta(v.minhaCarta, 'hs-mini')}</div>`;
      } else if (v.fase === 'votar') {
        h += `<div class="hs-grade n${v.mesa.length}">`;
        v.mesa.forEach((c, k) => {
          const minha = c === v.minhaCarta;
          const cls = [minha && !souNarr ? 'apagada' : '', votando && !minha ? 'pode' : '', v.meuVoto === c ? 'sel' : ''].join(' ');
          const selo = minha ? `<span class="hs-selo">${souNarr ? '⭐ sua história' : 'sua carta'}</span>` : v.meuVoto === c ? '<span class="hs-selo">🗳️ seu voto</span>' : '';
          h += `<div class="hs-item">${carta(c, cls, `<span class="hs-num">${k + 1}</span>${selo}`)}</div>`;
        });
        h += '</div>';
        if (votando) h += `<div class="hs-dicas-ajuda">Toque na carta que você acha que é de ${esc(nome(v.narrador))}.</div>`;
      } else if (v.res) {
        const r = v.res;
        h += `<div class="hs-grade n${r.mesa.length} ${anim ? 'hs-anim' : ''}">`;
        r.mesa.forEach((c, k) => {
          const d = r.dono[c];
          const eh = c === r.alvo;
          const quem = J.map((_, i) => i).filter(i => r.votos[i] === c);
          h += `<div class="hs-item">
            ${carta(c, eh ? 'alvo' : '', `<span class="hs-num">${k + 1}</span>${eh ? '<span class="hs-estrela">⭐</span>' : ''}`)}
            <div class="hs-dono" style="background:${cor(d)}">${eh ? '⭐ ' : ''}${esc(nome(d))}</div>
            <div class="hs-votos">${quem.map((i, q) => `<b title="${esc(nome(i))}" style="background:${cor(i)};animation-delay:${.3 + q * .15}s">${esc((J[i]?.nome || '?').replace(/^\W+\s*/u, '').slice(0, 1).toUpperCase())}</b>`).join('')}</div>
          </div>`;
        });
        h += '</div>';
        h += `<div class="hs-ganhos ${anim ? 'hs-anim' : ''}">${J.map((j, i) => `<div class="hs-ganho"><i style="background:${cor(i)}"></i>${esc(nome(i))}
          ${r.ganhos[i] ? `<span class="mais" style="animation-delay:${.6 + i * .12}s">+${r.ganhos[i]}</span>` : '<span class="zero">+0</span>'}
          <small style="color:#8a7ca8">(${v.placar[i]})</small></div>`).join('')}</div>`;
        if (v.fase === 'resultado') {
          if (ctx.minhaVez) h += '<button class="btn verde grande" id="hs-prox">Próxima rodada ▶</button>';
          else if (ctx.eu >= 0) h += '<div class="hs-info">Esperando todo mundo ficar pronto... ⏳</div>';
        }
      }
      h += `<div class="hs-info"><span>🔄 Rodada ${v.rodada}</span><span>🃏 ${v.baralho} no monte</span><span>🏁 Quem chegar a ${v.meta} pontos vence</span></div>`;
      h += '</div>';

      // ---- mão ----
      if (ctx.eu >= 0 && v.mao.length && v.fase !== 'fim') {
        h += `<div class="hs-mao-box"><div class="hs-rot">${modo ? 'Suas cartas — toque para escolher 👇' : 'Suas cartas'}</div><div class="hs-mao">`;
        h += v.mao.map(c => carta(c, [modo || v.fase === 'contar' || v.fase === 'escolher' ? 'pode' : '', sel === c ? 'sel' : ''].join(' '))).join('');
        h += '</div></div>';
      }

      // ---- carta ampliada ----
      if (aberto && sel !== null) {
        h += '<div class="hs-ver" id="hs-ver">';
        if (modo === 'contar') {
          h += `<div class="hs-ver-titulo">Qual é a sua dica para esta carta?</div>${carta(sel)}
            <div class="hs-ver-acoes">
              <input id="hs-dica" maxlength="40" placeholder="Ex.: sonho de voar" value="${esc(dicaTexto)}" autocomplete="off">
              <div class="hs-conta" id="hs-conta">${dicaTexto.length}/40</div>
              <button class="btn branco" id="hs-fechar">Voltar</button>
              <button class="btn verde" id="hs-ok">Contar história ✨</button>
            </div>`;
        } else if (modo === 'escolher') {
          h += `<div class="hs-ver-titulo">Esta carta combina com “${esc(v.dica)}”?</div>${carta(sel)}
            <div class="hs-ver-acoes"><button class="btn branco" id="hs-fechar">Voltar</button><button class="btn verde" id="hs-ok">Jogar esta carta 🃏</button></div>`;
        } else if (votando && v.mesa.includes(sel)) {
          h += `<div class="hs-ver-titulo">Carta ${v.mesa.indexOf(sel) + 1}: é a carta de ${esc(nome(v.narrador))}?</div>${carta(sel)}
            <div class="hs-ver-acoes"><button class="btn branco" id="hs-fechar">Voltar</button><button class="btn verde" id="hs-ok">Votar nesta carta 🗳️</button></div>`;
        } else {
          h += `${carta(sel)}<div class="hs-ver-acoes"><button class="btn branco" id="hs-fechar">Fechar</button></div>`;
        }
        h += '</div>';
      }
      h += '</div>';

      el.innerHTML = h;
      const rerender = () => { assinatura = ''; window.JOGOS.historias.render(...ultimoPedido); };

      // abrir cartas
      el.querySelectorAll('.hs-mao .hs-carta.pode, .hs-grade .hs-carta').forEach(d => d.onclick = () => {
        const c = Number(d.dataset.c);
        if (v.fase === 'votar' && votando && c === v.minhaCarta) { ctx.toast('Essa é a sua carta! Vote em outra 😉'); return; }
        sel = c; aberto = true; ctx.som('clique'); rerender();
      });
      const ver = el.querySelector('#hs-ver');
      if (ver) {
        ver.onclick = ev => { if (ev.target === ver) { aberto = false; rerender(); } };
        el.querySelector('#hs-fechar').onclick = () => { aberto = false; rerender(); };
        const inp = el.querySelector('#hs-dica');
        const ok = el.querySelector('#hs-ok');
        const enviar = async () => {
          let acao;
          if (modo === 'contar') {
            const d = (inp.value || '').trim();
            if (!d) { ctx.toast('Escreva uma dica! ✏️'); inp.focus(); return; }
            acao = { tipo: 'contar', carta: sel, dica: d };
          } else if (modo === 'escolher') acao = { tipo: 'escolher', carta: sel };
          else acao = { tipo: 'votar', carta: sel };
          ok.disabled = true;
          const deu = await ctx.enviar(acao);
          if (deu) { aberto = false; if (modo === 'contar') dicaTexto = ''; rerender(); }
          else ok.disabled = false;
        };
        if (ok) ok.onclick = enviar;
        if (inp) {
          inp.oninput = () => { dicaTexto = inp.value; el.querySelector('#hs-conta').textContent = `${inp.value.length}/40`; };
          inp.onkeydown = ev => { if (ev.key === 'Enter') enviar(); };
          setTimeout(() => { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }, 30);
        }
      }
      const prox = el.querySelector('#hs-prox');
      if (prox) prox.onclick = () => { prox.disabled = true; ctx.enviar({ tipo: 'continuar' }).then(ok => { if (!ok) prox.disabled = false; }); };
    },
  };
})();
