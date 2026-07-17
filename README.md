# [🔗 atulgoel.me](https://atulgoel.me) — Atul Goel's Pixel Room

My personal portfolio, redesigned as an interactive 2D pixel-art room — a cozy dusk studio
where every object is clickable. No commands to learn: just point, hover, and click.

## 🕯 The room

The scene is hand-drawn in code on a 480×270 canvas and scaled up with nearest-neighbor
for crisp pixels. It's alive: rain on the window, steam rising from the coffee, a cat
dreaming in Z's, twinkling string lights — and a real Game of Life running on the arcade screen.

| Click… | To find… |
| --- | --- |
| 🖥 The monitor | Work history — 8 years across games & fintech |
| 🕹 The arcade cabinet | Playable demos (fluid sim, flocking, WFC…) |
| 📚 The bookshelf | Skills |
| 📜 The framed diplomas | Education (CMU, VIT) |
| ☎️ The red rotary phone | Contact |
| 🗄 The file cabinet | Résumé (PDF) |
| 🌆 The synthwave poster | About me |
| 💾 The dusty old CRT | The original terminal site, kept as an easter egg |
| 🐈 The cat | The cat |
| 💡 The lamp | Lights out |

Sections can be deep-linked: `/?p=work`, `/?p=demos`, `/?p=contact`, …

The previous terminal-style site (based on [LiveTerm](https://github.com/Cveinnt/LiveTerm))
still lives at [/terminal](https://atulgoel.me/terminal).

## 🛠 Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # static export to ./out
```

Built with Next.js (static export), TypeScript, and a single `<canvas>`.
Content lives in `src/data/resume.ts`; the scene is drawn in `src/components/room/scene.ts`.

## 🚀 Deployment

Every push to `main` triggers a GitHub Actions workflow that builds the static export
and deploys it to GitHub Pages at [atulgoel.me](https://atulgoel.me).
