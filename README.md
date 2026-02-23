# QBlog

A simple blog app with an **admin panel** that lets you create/edit posts from anywhere (as long as you’re logged in as an admin).

## What you can do

- Read posts on the public site
- Sign in as an admin
- Create, edit, and delete posts from the admin area
- Manage content remotely (no redeploy needed for content updates)

## Repository structure

- `frontend/` — Client app (UI)
- `backend/` — Server/API (admin + content management)

## Getting started (local development)

> Update the commands below to match your project if you use different scripts/ports.

### Prerequisites
- Node.js (LTS recommended)
- npm (or yarn/pnpm)

### 1) Clone
```bash
git clone https://github.com/Hadar01/QBlog.git
cd QBlog
```

### 2) Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3) Configure environment variables

Create `.env` files (or whatever your project uses) for both apps.

**Backend (`backend/.env`)** (example keys — adjust to your actual code):
- `PORT=...`
- `DATABASE_URL=...`
- `JWT_SECRET=...` (or session secret)
- `ADMIN_EMAIL=...` (if applicable)
- `ADMIN_PASSWORD=...` (if applicable)

**Frontend (`frontend/.env`)** (example keys — adjust as needed):
- `VITE_API_URL=...` (or `NEXT_PUBLIC_API_URL=...`, etc.)

### 4) Run the apps

In one terminal:
```bash
cd backend
npm run dev
```

In another terminal:
```bash
cd frontend
npm run dev
```

Open the frontend in your browser (usually `http://localhost:5173` or `http://localhost:3000` depending on the framework).

## Admin access

The admin area is protected. Once you sign in as an admin, you can update blog content from anywhere.

> If you want, add details here about:
> - the admin route (e.g. `/admin`)
> - how admins are created (seed user, env vars, DB record, etc.)
> - roles/permissions (if any)

## Deployment

Typical approach:
- Deploy `backend/` as an API service
- Deploy `frontend/` as a static site or web app
- Point the frontend to the backend API URL via environment variables

## Roadmap ideas (optional)

- Post drafts & scheduled publishing
- Image uploads (S3/Cloudinary)
- Tags/categories & search
- Markdown editor for posts
- Comments (with moderation)

## License

Add a license (MIT/Apache-2.0/etc.) or remove this section if not applicable.
