// Mesa de Jogos — lobby, salas e conexão com o servidor.
// Cada jogo registra um desenhista em window.JOGOS[id] = { render(el, visao, ctx) }.
window.JOGOS = window.JOGOS || {};
const CORES = ['#ff4d6d', '#3a86ff', '#22b573', '#ffb703', '#9b5de5', '#fb8500'];
const NOMES_CORES = ['Vermelho', 'Azul', 'Verde', 'Amarelo', 'Roxo', 'Laranja'];

const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function ler(k) { try { return localStorage.getItem(k); } catch { return null; } }
function gravar(k, v) { try { localStorage.setItem(k, v); } catch {} }

async function api(url, corpo) {
  const r = await fetch(url, corpo ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) } : undefined);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Erro');
  return j;
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function confete() {
  const coisas = ['🎉', '⭐', '🎊', '✨', '🏆', '💖'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confete';
    c.textContent = coisas[i % coisas.length];
    c.style.left = Math.random() * 100 + 'vw';
    c.style.animationDuration = 2 + Math.random() * 2 + 's';
    c.style.animationDelay = Math.random() * .6 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 5000);
  }
}

let audio;
function som(tipo) {
  const notas = { clique: [[600, 0, .06]], vez: [[660, 0, .1], [880, .1, .15]], vitoria: [[523, 0, .15], [659, .12, .15], [784, .24, .15], [1046, .36, .3]], erro: [[220, 0, .2]] }[tipo];
  if (!notas) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    for (const [f, t, d] of notas) {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.12, audio.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + t + d);
      o.connect(g).connect(audio.destination);
      o.start(audio.currentTime + t); o.stop(audio.currentTime + t + d);
    }
  } catch {}
}

function meuNome() { return ler('mesa-nome') || ''; }

function carregarScript(src) {
  return new Promise((ok, falha) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = falha;
    document.head.appendChild(s);
  });
}

// ============================================================
//  HOME
// ============================================================
async function home() {
  document.title = 'Mesa de Jogos';
  app.innerHTML = `
    <div class="boas-vindas">
      <h1>Vamos jogar? 🎲</h1>
      <div>Jogue com amigos (na mesma rede Wi-Fi) ou contra o computador 🤖</div>
      <div class="nome">Seu nome: <input id="nome" maxlength="20" placeholder="Digite seu nome" value="${esc(meuNome())}"></div>
    </div>
    <div class="lista-jogos" id="lista-jogos">Carregando jogos...</div>
    <p class="em-breve">Mais jogos chegando... 🛠️</p>`;
  $('#nome').oninput = e => gravar('mesa-nome', e.target.value.trim());

  const jogos = await api('/api/jogos');
  $('#lista-jogos').innerHTML = '';
  for (const j of jogos) {
    const el = document.createElement('div');
    el.className = 'card-jogo';
    el.innerHTML = `<div class="emoji">${j.emoji}</div><h3>${esc(j.nome)}</h3><p>${esc(j.descricao)}</p>
      <span class="tag">👥 ${j.min === j.max ? j.min : `${j.min} a ${j.max}`} jogadores</span>`;
    el.onclick = () => configurar(j);
    $('#lista-jogos').appendChild(el);
  }
}

function pedirNome() {
  const n = ($('#nome')?.value || meuNome()).trim();
  if (n) { gravar('mesa-nome', n); return n; }
  const p = prompt('Qual é o seu nome?');
  if (p && p.trim()) { gravar('mesa-nome', p.trim()); return p.trim(); }
  return null;
}

function abrirModal(html) { $('#modal-caixa').innerHTML = html; $('#modal').classList.remove('hidden'); }
function fecharModal() { $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') fecharModal(); });

function configurar(jogo) {
  const nome = pedirNome();
  if (!nome) return;
  const opcoes = [];
  for (let n = jogo.min; n <= jogo.max; n++) opcoes.push(n);
  let total = opcoes.includes(2) ? 2 : jogo.min;
  let tipos = [];
  const nomesLocais = [];

  const desenhar = () => {
    tipos = Array.from({ length: total }, (_, i) => i === 0 ? 'humano' : (tipos[i] || 'bot'));
    abrirModal(`
      <h2>${jogo.emoji} ${esc(jogo.nome)}</h2>
      <b>Quantos jogadores?</b>
      <div class="opcoes">${opcoes.map(n => `<button class="btn branco ${n === total ? 'ativo' : ''}" data-n="${n}">${n}</button>`).join('')}</div>
      <b>Quem vai jogar?</b>
      <div style="margin-top:8px">
        ${tipos.map((t, i) => `
          <div class="assento-linha">
            <span class="bolinha" style="background:${CORES[i]}"></span>
            ${i === 0 ? `<b>${esc(nome)} (você)</b>` : `
              <div class="assento-config">
                <div class="opcoes modos" style="margin:0">
                  <button class="btn branco ${t === 'bot' ? 'ativo' : ''}" data-i="${i}" data-t="bot">🤖 Computador</button>
                  <button class="btn branco ${t === 'local' ? 'ativo' : ''}" data-i="${i}" data-t="local">👥 Neste aparelho</button>
                  <button class="btn branco ${t === 'remoto' ? 'ativo' : ''}" data-i="${i}" data-t="remoto">🌐 Pelo link</button>
                </div>
                ${t === 'local' ? `<input class="nome-local" data-i="${i}" maxlength="20" placeholder="Nome do jogador ${i + 1}" value="${esc(nomesLocais[i] || '')}">` : ''}
              </div>`}
          </div>`).join('')}
      </div>
      <p class="dica-modos">🤖 joga sozinho · 👥 revezam no mesmo computador/tablet · 🌐 outra pessoa entra pelo link</p>
      <div class="acoes-modal">
        <button class="btn branco" id="cancelar">Cancelar</button>
        <button class="btn verde grande" id="criar">Criar sala ✨</button>
      </div>`);
    document.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { total = Number(b.dataset.n); desenhar(); });
    document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tipos[b.dataset.i] = b.dataset.t; desenhar(); });
    document.querySelectorAll('.nome-local').forEach(inp => inp.oninput = () => { nomesLocais[inp.dataset.i] = inp.value.trim(); });
    $('#cancelar').onclick = fecharModal;
    $('#criar').onclick = async () => {
      try {
        const r = await api('/api/salas', { jogo: jogo.id, nome, assentos: tipos, nomes: tipos.map((t, i) => nomesLocais[i] || '') });
        gravar('mesa-token-' + r.codigo, r.token);
        fecharModal();
        irPara(r.codigo);
      } catch (e) { toast(e.message); }
    };
  };
  desenhar();
}

// ============================================================
//  SALA
// ============================================================
let conexao = null, ultimo = null, ipInfo = null;
let como = -1;          // qual assento deste aparelho está na tela
let liberado = -1;      // em jogos com cartas escondidas: assento que já disse "sou eu!"

// Pergunta o estado ao servidor a cada ~1s (funciona igual no servidor local e na Vercel).
function conectar(codigo, token) {
  let parado = false, versao = null, eVisto = null, timer = null, falhas = 0;
  const perguntar = async () => {
    clearTimeout(timer);
    if (parado) return;
    try {
      const q = new URLSearchParams({ como: String(como) });
      if (token) q.set('token', token);
      if (versao !== null) { q.set('v', versao); q.set('e', eVisto); }
      const r = await fetch(`/api/salas/${codigo}/estado?${q}`, { cache: 'no-store' });
      const f = await r.json();
      if (parado) return;
      if (r.status === 404) return conexao.onerro?.();
      falhas = 0;
      if (!f.mesmo) { versao = f.versao; eVisto = f.eu; await conexao.onmsg?.(f); }
    } catch { falhas++; }
    if (!parado) timer = setTimeout(perguntar, document.hidden ? 4000 : falhas ? 2500 : 900);
  };
  const c = { close() { parado = true; clearTimeout(timer); }, agora() { perguntar(); }, esquecer() { versao = null; perguntar(); } };
  setTimeout(perguntar, 0);
  return c;
}

function irPara(codigo) {
  history.pushState({}, '', codigo ? `/?sala=${codigo}` : '/');
  rota();
}

async function sala(codigo) {
  app.innerHTML = '<p>Conectando...</p>';
  ipInfo = ipInfo || await api('/api/info').catch(() => null);
  const token = ler('mesa-token-' + codigo);
  if (conexao) conexao.close();
  ultimo = null; como = -1; liberado = -1;
  conexao = conectar(codigo, token);
  conexao.onmsg = async f => {
    await carregarScript(`/games/${f.jogo.id}.js`).catch(() => toast('Não consegui carregar o jogo'));
    desenharSala(f);
  };
  conexao.onerro = () => {
    app.innerHTML = '<div class="espera"><div class="grande-emoji">😕</div><h2>Sala não encontrada</h2><p>Ela pode ter expirado.</p><button class="btn" onclick="irPara()">Voltar</button></div>';
    conexao.close();
  };
}

function linkSala(codigo) {
  const host = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? (ipInfo?.ips?.[0] ? `${ipInfo.ips[0]}:${ipInfo.porta}` : location.host) : location.host;
  return `http://${host}/?sala=${codigo}`;
}

function desenharSala(f) {
  const meus = f.meus || [];
  // no mesmo aparelho: se o assento na tela já jogou, troca para o próximo daqui que precisa jogar
  const precisa = meus.filter(i => f.pendentes.includes(i));
  if (f.status === 'jogando' && precisa.length && !precisa.includes(f.eu)) {
    como = precisa[0];
    conexao.esquecer();
    return;
  }
  como = f.eu;
  const antes = ultimo && ultimo.eu === f.eu ? ultimo : null;
  ultimo = f;
  document.title = `${f.jogo.emoji} ${f.jogo.nome} · ${f.codigo}`;
  const minhaVez = f.eu >= 0 && f.pendentes.includes(f.eu) && f.status === 'jogando';
  const variosAqui = meus.length > 1;
  if (minhaVez && !(antes && antes.pendentes.includes(antes.eu))) som('vez');

  // estrutura fixa, para o jogo não perder o que está na tela
  if (!$('#sala-raiz') || $('#sala-raiz').dataset.codigo !== f.codigo) {
    app.innerHTML = `
      <div id="sala-raiz" data-codigo="${f.codigo}">
        <div class="sala-topo">
          <h2>${f.jogo.emoji} ${esc(f.jogo.nome)}</h2>
          <span class="codigo-sala" title="Código da sala">${f.codigo}</span>
          <div class="espaco"></div>
          <button class="btn branco" id="btn-link">🔗 Convidar</button>
          <button class="btn branco" id="btn-sair">🏠 Sair</button>
        </div>
        <div class="jogadores" id="jogadores"></div>
        <div class="status" id="status"></div>
        <div class="area-jogo" id="area-jogo"></div>
        <div id="fim"></div>
      </div>`;
    $('#btn-sair').onclick = () => { conexao?.close(); irPara(); };
    $('#btn-link').onclick = () => {
      const l = linkSala(f.codigo);
      navigator.clipboard?.writeText(l).then(() => toast('Link copiado! 📋'), () => prompt('Copie o link:', l));
    };
  }

  const placar = f.visao?.placar;
  $('#jogadores').innerHTML = f.assentos.map((a, i) => `
    <div class="jogador ${f.pendentes.includes(i) && f.status === 'jogando' ? 'vez' : ''} ${i === f.eu && !variosAqui ? 'eu' : ''} ${a.conectado ? '' : 'off'}">
      <span class="bolinha" style="background:${CORES[i]}"></span>${a.tipo === 'local' ? '👥 ' : ''}${esc(a.nome)}
      ${placar ? `<span class="pts">${placar[i]}</span>` : ''}
    </div>`).join('');

  if (f.status === 'aguardando') return desenharEspera(f);

  const nomeDe = i => f.assentos[i]?.nome ?? '?';
  let status = f.visao?.mensagem || '';
  if (!status && f.status === 'jogando') {
    status = minhaVez ? (variosAqui ? `Vez de ${nomeDe(f.eu)}! 👉` : 'Sua vez! 👉') : `Vez de ${f.pendentes.map(nomeDe).join(', ')}...`;
  } else if (minhaVez && variosAqui) {
    status = `${nomeDe(f.eu)}: ${status}`;
  }
  $('#status').textContent = status;
  $('#status').className = 'status' + (minhaVez ? ' minha-vez' : '');

  // jogo com cartas escondidas e várias pessoas no mesmo aparelho: tela de "passe o aparelho"
  if (f.secreto && variosAqui && f.status === 'jogando' && minhaVez && liberado !== f.eu) {
    $('#area-jogo').innerHTML = `
      <div class="espera passe">
        <div class="grande-emoji">🙈</div>
        <h2>Passe o aparelho para <span style="color:${CORES[f.eu]}">${esc(nomeDe(f.eu))}</span></h2>
        <p>Os outros não podem espiar as cartas!</p>
        <button class="btn verde grande" id="sou-eu">Sou eu, ${esc(nomeDe(f.eu))}! 👀</button>
      </div>`;
    $('#sou-eu').onclick = () => { liberado = f.eu; desenharSala(f); };
    desenharFim(f, antes);
    return;
  }

  const desenhista = window.JOGOS[f.jogo.id];
  const ctx = {
    eu: f.eu,
    minhaVez,
    jogadores: f.assentos.map((a, i) => ({ nome: a.nome, tipo: a.tipo, cor: CORES[i], nomeCor: NOMES_CORES[i] })),
    cores: CORES,
    pendentes: f.pendentes,
    anterior: antes?.visao ?? null,
    enviar: acao => enviarAcao(f.codigo, acao, f.eu),
    toast, som, esc,
  };
  if (desenhista) {
    try { desenhista.render($('#area-jogo'), f.visao, ctx); }
    catch (e) { console.error(e); $('#area-jogo').textContent = 'Erro ao desenhar o jogo: ' + e.message; }
  }

  desenharFim(f, antes);
}

function desenharEspera(f) {
  $('#status').textContent = '';
  const livres = f.assentos.filter(a => a.tipo === 'humano' && !a.ocupado).length;
  const link = linkSala(f.codigo);
  $('#area-jogo').innerHTML = `
    <div class="espera">
      <div class="grande-emoji">⏳</div>
      <h2>Esperando ${livres} ${livres === 1 ? 'pessoa' : 'pessoas'}...</h2>
      ${meus.length ? `
        <p>Mande este link para quem vai jogar (precisa estar na mesma rede Wi-Fi):</p>
        <div class="link-compartilhar">${esc(link)}</div>
        <p>ou digite o código <b class="codigo-sala">${f.codigo}</b> lá em cima</p>` : `
        <p>Tem lugar para você!</p>
        <div class="nome" style="display:flex;gap:8px;justify-content:center">
          <input id="nome-entrar" maxlength="20" placeholder="Seu nome" value="${esc(meuNome())}">
          <button class="btn verde" id="btn-entrar">Entrar 🎉</button>
        </div>`}
      <div class="lista-espera">
        ${f.assentos.map((a, i) => `<div class="assento-linha"><span class="bolinha" style="background:${CORES[i]}"></span>${a.ocupado ? esc(a.nome) : '<i style="opacity:.5">lugar livre</i>'}</div>`).join('')}
      </div>
    </div>`;
  const b = $('#btn-entrar');
  if (b) b.onclick = async () => {
    const nome = $('#nome-entrar').value.trim();
    if (!nome) return toast('Digite seu nome!');
    gravar('mesa-nome', nome);
    try {
      const r = await api(`/api/salas/${f.codigo}/entrar`, { nome });
      gravar('mesa-token-' + r.codigo, r.token);
      sala(r.codigo);
    } catch (e) { toast(e.message); }
  };
}

function desenharFim(f, antes) {
  const box = $('#fim');
  if (!f.fim) { box.innerHTML = ''; return; }
  if (box.dataset.partida === String(f.partida) && box.innerHTML) return;
  box.dataset.partida = f.partida;
  const meus = f.meus || [];
  const venci = (f.fim.vencedores || []).some(i => meus.includes(i));
  const nomes = (f.fim.vencedores || []).map(i => f.assentos[i]?.nome);
  const titulo = !nomes.length ? 'Empate! 🤝' : venci && meus.length === 1 ? 'Você venceu! 🎉' : `${nomes.join(' e ')} venceu! 🎉`;
  box.innerHTML = `
    <div class="fim-jogo"><div class="caixa">
      <div class="trofeu">${!nomes.length ? '🤝' : venci ? '🏆' : '🎖️'}</div>
      <h2>${esc(titulo)}</h2>
      <p>${esc(f.fim.texto || '')}</p>
      <div class="acoes-modal" style="justify-content:center">
        <button class="btn branco" id="ver-tabuleiro">👀 Ver tabuleiro</button>
        ${meus.length ? '<button class="btn verde" id="de-novo">🔁 Jogar de novo</button>' : ''}
      </div>
    </div></div>`;
  if (venci) { som('vitoria'); confete(); }
  $('#ver-tabuleiro').onclick = () => { box.innerHTML = ''; };
  const dn = $('#de-novo');
  if (dn) dn.onclick = () => api(`/api/salas/${f.codigo}/reiniciar`, { token: ler('mesa-token-' + f.codigo) }).catch(e => toast(e.message));
}

async function enviarAcao(codigo, acao, assento) {
  try {
    await api(`/api/salas/${codigo}/acao`, { token: ler('mesa-token-' + codigo), acao, assento });
    som('clique');
    conexao?.agora();
    return true;
  } catch (e) {
    toast(e.message); som('erro');
    return false;
  }
}

// ============================================================
//  ROTAS
// ============================================================
function rota() {
  const codigo = new URLSearchParams(location.search).get('sala');
  if (codigo) sala(codigo.toUpperCase());
  else { conexao?.close(); conexao = null; home(); }
}
window.addEventListener('popstate', rota);
$('#form-codigo').onsubmit = e => {
  e.preventDefault();
  const c = $('#input-codigo').value.trim().toUpperCase();
  if (c.length === 4) { $('#input-codigo').value = ''; irPara(c); }
};
rota();
