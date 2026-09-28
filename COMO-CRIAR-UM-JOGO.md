# Como criar um jogo na Mesa de Jogos

Cada jogo tem **dois arquivos** com o mesmo `id`:

1. `games/<id>.js` — as **regras** (roda no servidor, CommonJS, sem dependências).
2. `public/games/<id>.js` — o **desenho** (roda no navegador, script comum, sem build).

O servidor (`server.js`) relê a pasta `games/` a cada pedido, então um jogo novo aparece
na tela inicial assim que os dois arquivos existem — **não precisa reiniciar o servidor**.
Não mexa em `server.js`, `public/mesa.js`, `public/style.css` nem `public/index.html`.

Exemplo completo e pequeno: `games/lig4.js` + `public/games/lig4.js`.

## Regras (`games/<id>.js`)

```js
module.exports = {
  id: 'meujogo',            // igual ao nome do arquivo
  nome: 'Meu Jogo',
  emoji: '🎲',
  descricao: 'Uma frase curta e divertida.',
  min: 2, max: 4,           // quantidade de jogadores
  ordem: 20,                // posição na tela inicial

  iniciar(n, { nomes }) { return estado },   // n jogadores, assentos 0..n-1
  visao(estado, eu) { return objeto },       // o que o jogador `eu` pode ver (eu = -1 → espectador)
  pendentes(estado) { return [assentos] },   // quem pode agir AGORA (vários = jogada simultânea); [] no fim
  agir(estado, eu, acao) { return null | 'mensagem de erro' },  // valida e MUTA o estado
  fim(estado) { return null | { vencedores: [assentos], texto: '...' } },  // vencedores [] = empate
  bot(estado, eu) { return acao },           // jogada do computador; SEMPRE válida
};
```

- O estado precisa ser JSON puro (sem classes, Map, Set) — ele é copiado para a tela.
- **Informação secreta** (cartas na mão dos outros, baralho): esconda em `visao`.
- Coloque em `visao` tudo que facilita a tela: jogadas válidas do jogador `eu`
  (para destacar onde pode clicar), a última jogada (para animar), etc.
- `visao.mensagem` (opcional, string): aparece em destaque acima do tabuleiro
  (ex.: "Maria rolou 5 🎲"). Se não tiver, a tela mostra "Sua vez!" / "Vez de ...".
- `visao.placar` (opcional, array com um número por jogador): aparece ao lado dos nomes.
- Jogadas em várias etapas (rolar dado → escolher peça) são ações separadas; `pendentes`
  continua com o mesmo jogador entre elas.
- O servidor executa um bot a cada ~0,9 s, então as jogadas do computador dão para acompanhar.
- O `bot` pode ser simples, mas precisa ser divertido (nem burro demais, nem imbatível para uma criança de 10 anos).
- Toda mensagem de texto é em **português do Brasil**, tom amigável para crianças.

## Desenho (`public/games/<id>.js`)

```js
(() => {
  const estilo = document.createElement('style');
  estilo.textContent = `/* CSS com prefixo do jogo, ex .mj-... */`;
  document.head.appendChild(estilo);

  window.JOGOS.meujogo = {
    render(el, visao, ctx) { /* desenha dentro de el */ },
  };
})();
```

`render` é chamado a cada mudança (pode redesenhar tudo com `innerHTML`). O `ctx` tem:

| campo | o que é |
|---|---|
| `ctx.eu` | meu assento (-1 = espectador) |
| `ctx.minhaVez` | `true` se eu estou em `pendentes` |
| `ctx.jogadores` | `[{ nome, tipo: 'humano'|'bot', cor, nomeCor }]` |
| `ctx.cores` | cores dos assentos (`ctx.cores[i]`) |
| `ctx.anterior` | a `visao` anterior (ou null) — para animar o que mudou |
| `ctx.enviar(acao)` | manda a ação para o servidor (Promise<boolean>); erros viram toast |
| `ctx.toast(msg)`, `ctx.som('clique'|'vez'|'vitoria'|'erro')`, `ctx.esc(texto)` | utilidades |

- A tela de fim (vencedor, "jogar de novo") é feita pelo app — o jogo não precisa fazer.
- Estado local da tela (ex.: carta selecionada antes de confirmar) pode ficar numa variável
  do módulo; lembre que `render` roda de novo a cada atualização.
- Deve funcionar bem no celular (touch, largura ~380px) e no computador.
- Visual colorido e fofo (fonte Fredoka já carregada). Use SVG/CSS/emoji — sem imagens externas.

## Testando

Servidor em `http://localhost:8765` (já rodando; se não, `node server.js`).

```bash
B=http://127.0.0.1:8765
R=$(curl -s -XPOST $B/api/salas -H 'content-type: application/json' \
  -d '{"jogo":"meujogo","nome":"Teste","assentos":["humano","bot","bot"]}')
# → {"codigo":"ABCD","token":"...","assento":0}
curl -s -XPOST $B/api/salas/ABCD/acao -H 'content-type: application/json' -d '{"token":"...","acao":{...}}'
curl -s -N --max-time 1 "$B/api/salas/ABCD/stream?token=..."   # estado atual (SSE)
```

Também vale um teste direto em Node: carregar `games/<id>.js` e jogar centenas de partidas
só com bots (`iniciar` → loop `pendentes`/`bot`/`agir` até `fim`), conferindo que o bot
nunca faz jogada inválida e que toda partida termina.
