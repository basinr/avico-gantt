# Avico Health — Feature Launch Schedule

Interactive Gantt chart for tracking feature launches across customers.

## Features
- Drag bars to reschedule dates
- Click rows to edit or delete milestones
- Add new milestones via the + button
- Changes persist in browser localStorage

## Deploy

Push to GitHub, then import in [Vercel](https://vercel.com/new):

1. `git init && git add . && git commit -m "initial"`
2. Create repo on GitHub and push
3. Go to vercel.com/new → Import your repo → Deploy

That's it. Vercel auto-detects Vite and builds it.

## Local Development

```bash
npm install
npm run dev
```
