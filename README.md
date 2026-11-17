# MAKERS

A single-owner store for practical digital resources — guides, templates, courses and project files — where every product comes with clear, step-by-step help. **MAKERS is a working name.**

> **Where things stand:** Phase 0 (the foundation) is built. The site runs and looks like a store, but there is **no database, no products, no payments and no downloads yet**. Those arrive in Phases 1–4. See `BUILD_PLAN.md`.

---

## 1. What you need on your computer

| Tool                   | Why                         | Check it's installed |
| ---------------------- | --------------------------- | -------------------- |
| Node.js 22.12 or newer | Runs the website code       | `node -v`            |
| npm (comes with Node)  | Installs the code libraries | `npm -v`             |
| Git                    | Saves versions of your work | `git --version`      |

If `node -v` shows nothing or a number below 22, install the current LTS version from [nodejs.org](https://nodejs.org).

## 2. Run the site on your computer

Open the Terminal, then copy and paste these commands one at a time.

```bash
# 1. Go to the project folder
cd ~/Documents/MAKERS

# 2. Install the code libraries (only needed the first time, or after an update)
npm install

# 3. Create your private settings file from the example (only the first time)
cp -n .env.example .env.local

# 4. Start the website
npm run dev
```

Then open **http://localhost:3000** in your browser. To stop the website, click in the Terminal and press **Control + C**.

Useful pages to look at:

- **http://localhost:3000** — home page
- **http://localhost:3000/design-preview** — every colour, text size and core component (a page for building the site, hidden from search engines and from the live store)

## 3. Commands

| Command             | What it does                                                                     |
| ------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`       | Starts the site for local development at http://localhost:3000                   |
| `npm run check`     | **Runs every quality check in order.** Use this before saving (committing) work. |
| `npm run lint`      | Looks for common code mistakes                                                   |
| `npm run typecheck` | Checks the code's types (catches many bugs before they happen)                   |
| `npm test`          | Runs the automated tests                                                         |
| `npm run build`     | Builds the production version (what Vercel runs)                                 |
| `npm run format`    | Tidies code formatting automatically                                             |
| `npm start`         | Runs the production build locally (after `npm run build`)                        |

If `npm run check` fails, the first error it prints is usually the one to fix. Copy it into Claude Code and ask for a plain-English explanation.

## 4. Settings and secrets (`.env.local`)

- `.env.example` lists every setting **by name only**. It is safe to share.
- `.env.local` is your private copy with real values. It is **never** saved to Git (the `.gitignore` file blocks it).
- Phase 1 needs `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `SEED_SAMPLE_PRODUCTS` (see section 6). Later phases will tell you exactly which values to add and where to find them.
- Never put a secret in a variable that starts with `NEXT_PUBLIC_` — those are visible to everyone.

## 5. Deploying: GitHub → Vercel

You only need to do this when you want the site online. Nothing here is set up yet.

1. **Create an empty GitHub repository** (no README, no .gitignore) at [github.com/new](https://github.com/new). Make it private.
2. **Connect this folder to it** (replace `YOUR-NAME` and `YOUR-REPO`):
   ```bash
   cd ~/Documents/MAKERS
   git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
   git push -u origin main
   git push -u origin phase-0-foundation
   ```
3. **Import into Vercel:** go to [vercel.com/new](https://vercel.com/new), choose the GitHub repository and click **Deploy**. Vercel detects Next.js automatically — no settings needed for Phase 0.
4. From then on:
   - The **`main`** branch is the live (production) site.
   - Every other branch or pull request gets its own **preview** link, so you can check work before it goes live.
5. Add environment variables in **Vercel → your project → Settings → Environment Variables**. Keep **Preview** and **Production** values separate (test keys for Preview).

## 6. Database (Neon Postgres)

### Pooled vs direct — two connection strings

| Variable                | What it is                                          | Used by                        |
| ----------------------- | --------------------------------------------------- | ------------------------------ |
| `DATABASE_URL`          | **Pooled** connection (host contains `-pooler`)     | The running website            |
| `DATABASE_URL_UNPOOLED` | **Direct** connection (same host without `-pooler`) | Migrations only (`db:migrate`) |

The pooled one shares a small set of connections between many short website requests. Migrations hold one connection open and change table structure, which a pooler can interrupt — so they use the direct one. **Both must come from the same Neon branch**; the scripts refuse to run if they don't.

### Use the `development` branch locally — never production

In the Neon console, the `main` branch holds live data. Create a branch called `development` and copy **its** two connection strings into `.env.local`. Every database command first prints `Database target: Neon endpoint ep-…`. Compare that ID with **Neon → Branches → development → Computes** before continuing.

### Commands

```bash
npm run db:migrate     # create/update tables (shows the target first)
npm run db:seed        # categories always; 6 sample DRAFT products only if SEED_SAMPLE_PRODUCTS=true
npm run db:seed        # safe to run again: nothing is duplicated, existing products are never overwritten
npm run db:studio      # browse the data in your web browser
npm run db:generate    # only after changing db/schema.ts: writes a new migration file
```

### Publishing a product (until the admin dashboard exists)

```bash
npm run db:publish -- freelance-project-tracker               # make it public (checks required fields first)
npm run db:publish -- freelance-project-tracker --unpublish   # back to draft
npm run db:publish -- freelance-project-tracker --archive     # hide it permanently, keep its history
```

Sample products say “Sample content” on their page until you replace them. Their files are placeholders: nothing is uploaded until Phase 2.

## 7. Where things live

| Folder / file                             | What's in it                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `app/`                                    | The website's pages. `app/(site)/` holds the public store pages.               |
| `app/globals.css`                         | **All design tokens** — colours, text sizes, spacing, corners, shadows, motion |
| `lib/brand.ts`                            | **Store name, tagline and navigation** — change the brand here                 |
| `components/ui/`                          | Core building blocks: Button, Card, Dialog, Input, Badge, Label, Checkbox      |
| `components/layout/`                      | Header, footer, mobile menu, page container                                    |
| `content/products/`                       | Product guides written in MDX (template: `_template.mdx`)                      |
| `db/`, `lib/payments/`, `lib/storage/`, … | Empty for now; each has a README saying which phase fills it                   |
| `docs/`                                   | Handoff notes, decisions log, acceptance tests, tools guide                    |

## 8. Phase 2 services: files, email, rate limits and owner login

The site runs locally without these: sign-in links are printed in the terminal, rate limits are kept in memory, and uploads/downloads say "not set up yet". A deployed site **refuses** those requests until the services are set up. It never pretends they worked.

Never paste a key into chat or a committed file. Put values in `.env.local` (local) and in Vercel → Project → Settings → Environment Variables (Preview and Production).

**Owner login (`/admin`)**

1. `openssl rand -base64 48`: run it twice, for `SESSION_SECRET` and `MAGIC_LINK_SECRET` (use different values).
2. `npm run admin:hash`: type your admin password (hidden, 12+ characters) and copy the printed line into `ADMIN_PASSWORD_HASH`.
3. Set `ADMIN_EMAIL` to your email.

**Cloudflare R2 (private product files).** Turning on R2 asks you to add an "R2 subscription", which is free within 10 GB a month but billed to a payment method above that. That is your decision.

1. R2 → Create bucket → name e.g. `makers-files`. Keep **public access off**.
2. Bucket → Settings → CORS policy: allow `PUT` and `GET` from `http://localhost:3000` and `https://makers-alpha.vercel.app`, header `Content-Type`.
3. R2 → Manage API tokens → Create token → **Object Read & Write**, only this bucket.
4. Fill `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET_PRIVATE`.

**Resend (email)**

1. Sign up on the free plan and create an API key with "Sending access" → `RESEND_API_KEY`.
2. Until you verify a domain, use `EMAIL_FROM="MAKERS <onboarding@resend.dev>"`. It only delivers to your own Resend email.
3. To email real buyers: Domains → add your domain → add the DNS records it shows → use an address on that domain.

**Upstash Redis (rate limits).** Vercel → Storage → Create → Upstash for Redis → Free plan → connect to the `makers` project. It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically; the code reads either name.

## 9. Project documents

- `PROJECT_SPEC.md` — what the store must do (the source of truth)
- `BUILD_PLAN.md` — the phases, in order
- `CLAUDE.md` — rules for Claude Code, with the current project state at the top
- `docs/ACCEPTANCE_TESTS.md` — the checklist the finished store must pass
- `docs/HANDOFF.md` — technical map for whoever builds the next phase
- `docs/DECISIONS.md` — every owner decision and every change from the spec
- `docs/SKILLS_AND_TOOLS.md` — which Claude Code skills and tools to use in each phase
- `docs/STARTER_KIT.md` — the original starter-kit README
