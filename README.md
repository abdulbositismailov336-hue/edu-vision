# School AI — Vercel

Vercel-ready version of School AI.

## Deploy
1. Upload this project to GitHub.
2. In Vercel, import the repository.
3. Root Directory: leave as project root.
4. Build Command: `npm run build`
5. Output Directory: `frontend/dist`
6. Add Environment Variables:
   - `JWT_SECRET` — long random secret
   - `OPENAI_API_KEY` — optional, for OpenAI answers
   - `OPENAI_MODEL` — optional; default `gpt-5.6-luna`
7. Deploy.

The main site opens at `/`.
Admin panel opens at `/admin/admin.html`.

## Demo accounts
- `admin` / `admin123`
- `director12` / `123456`
- `teacher12` / `123456`
- `student12` / `123456`
- `parent12` / `123456`

## Important
This Vercel version removes `better-sqlite3` because Vercel Functions do not provide a persistent local SQLite disk. The included data store is memory-based and is intended for demo/testing. For real production use, connect the API to a hosted database such as Neon or Supabase so schools, users, news and events persist between deployments/function instances.
