// Lista dos jogos. Os require são estáticos para a Vercel incluir os arquivos no pacote.
// Jogo novo: crie games/<id>.js + public/games/<id>.js e adicione uma linha aqui.
const JOGOS = [
  require('../games/lig4'),
  require('../games/tapete'),
  require('../games/historias'),
  require('../games/ludo'),
  require('../games/damas'),
  require('../games/reversi'),
  require('../games/pontinhos'),
];

// Jogos com informação escondida (cartas na mão): no mesmo aparelho, mostra a tela "passe o aparelho".
const SECRETOS = new Set(['historias']);
for (const j of JOGOS) if (SECRETOS.has(j.id)) j.secreto = true;

const porId = Object.fromEntries(JOGOS.map(j => [j.id, j]));
const carregarJogos = () => porId;

module.exports = { carregarJogos };
