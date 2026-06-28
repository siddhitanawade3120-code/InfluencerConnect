# InfluConnect

Hyperlocal influencer matching for cloud kitchens and small restaurants — starting in **Vasai-Virar, Mumbai**.

## Quick start

```bash
npm install
npx prisma migrate dev   # creates SQLite DB
npm run db:seed          # optional sample creators
npm run dev
```

- **Public app:** [http://localhost:3000](http://localhost:3000)
- **Admin panel:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (password: `admin123` from `.env`)

## Admin panel — add creators

Go to `/admin/login` → sign in → **+ Add creator**.

The form captures all MVP fields:

**Must-have:** Instagram handle, full name, city, area, niche tags, follower count, engagement rate, rate band (min/max), contact method & value, last verified date, profile pic URL, account type, active flag.

**Good-to-have:** posts checked, avg likes/comments, content style, past collabs, language, source channel, internal notes.

Creators saved here appear instantly on the public search/results pages (if marked active).

## Database

**MongoDB Atlas** via Prisma. Set your connection string in `.env`:

```
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster0.ps0qux7.mongodb.net/influconnect?retryWrites=true&w=majority"
```

```bash
npm run db:push   # sync schema to MongoDB
npm run db:seed   # seed sample creators
npm run db:studio # visual DB browser
```

Change admin password in `.env`:

```
ADMIN_PASSWORD=your-secure-password
```

## Tech stack

Next.js 15 · React 19 · Tailwind CSS 4 · Prisma · SQLite
