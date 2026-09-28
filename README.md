# Mesa de Jogos

Board games to play with the family (Portuguese UI): on the same device, online with a room code, or against the computer.

Run: `npm start` (or `node server.js`), then open http://localhost:8765. Set `PORT` to change the port. It needs Node ≥ 20 and has no dependencies. The server prints the local IPs so other devices on the same network can join.

Games:

- 🔴 **Lig 4** (2 players): drop pieces and line up 4
- 🧶 **Tapete Mágico** (2–4): move the merchant around the bazaar, lay rugs and collect coins
- 🎨 **Contadores de Histórias** (3–6): give a clue for a magic card and guess the others' cards
- 🎲 **Ludo** (2–4)
- ⚪ **Damas** (2): checkers
- ⚫ **Reversi** (2)
- 🟦 **Pontinhos** (2–4): dots and boxes

## Deploy (Vercel)

`api/index.js` serves the API and `public/` is the static output (see `vercel.json`). Locally, rooms live in memory. On Vercel they're stored in Upstash Redis over its REST API, which requires `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`).

## Structure

- `lib/nucleo.js`: shared room and turn engine (used by both `server.js` and `api/index.js`)
- `lib/armazem.js`: storage (in memory, or Redis)
- `games/<id>.js`: game rules (run on the server)
- `public/games/<id>.js`: game rendering (run in the browser)
- `public/mesa.js`, `public/style.css`, `public/index.html`: the shared table UI

To add a new game, see [COMO-CRIAR-UM-JOGO.md](COMO-CRIAR-UM-JOGO.md).
