# ComicCrate

ComicCrate is my capstone project—a place for comic fans to keep their reading life organized. It’s a Next.js app router build with custom API routes, MongoDB for persistence, and a blend of client/server components. The big idea: let people browse comics, save them to personal shelves (favorites, read later, already read), and keep a small profile that feels like a comic fan calling card.

---

## Features
- **Authentication & Profiles** – Login/signup flows backed by JWT cookies. Each user gets a profile with bio, favorites, and a configurable avatar picker.
- **Comic Shelves** – From any comic detail page you can add/remove volumes to Favorites, Read Later, or Already Read. Shelves sync instantly across the profile and detail views.
- **Comments & Likes** – Every comic detail page has its own comment thread with like counts for extra community flavor.
- **Search & Browse** – Server-side filtering plus a client search bar that calls into API routes. Pagination keeps lists manageable.
- **Responsive Design** – CSS modules use `clamp()` sizing and mobile-first media queries so the app feels like a stylized comic UI on both phones and desktops.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, server components, route handlers)
- **Language**: TypeScript throughout components, API handlers, and models
- **UI**: CSS Modules + Tailwind utilities where needed, `next/image` for remote assets
- **State & Auth**: React hooks + custom `AuthContext` backed by JWT cookies
- **Database**: MongoDB with Mongoose models (users, comments)
- **HTTP**: Route handlers under `app/api/*` using `NextRequest/NextResponse`
- **Utilities**: Axios for client-side requests, `react-hot-toast` for inline messaging

---

## Project Structure
```
app/
  api/
    comics/[id]/comments/route.ts   # REST-ish endpoints for comments + likes
    users/                          # Auth, profile, shelves route handlers
  browse/                           # Browse page + CSS module
  comics/[id]/                      # Comic detail page + styling
  profile/                          # Profile page + avatar picker styles
  login/, signup/, verifyemail/     # Standalone auth pages (work with modal)
components/
  AuthModal, ComicCard, Loader, SearchBar, etc.
contexts/
  AuthContext.tsx                   # Global user state + refresh helper
models/
  userModel.ts, commentModel.ts     # Mongoose schemas
db/
  dbConfig.ts                       # Connection helper
helpers/
  getDataFromToken.ts, auth utils
```

---

## Architecture Notes
- **App Router APIs** – Instead of a separate Express server, everything lives in `/app/api`. That keeps data fetching colocated with UI and makes deployment simpler.
- **Context-driven Auth** – `AuthProvider` loads `/api/users/me` once, exposes `refreshUser` so shelves/comments can keep the profile in sync. No third-party auth, just JWT cookies from our login route.
- **Modular CSS** – Each page/component keeps its own `*.module.css`. The responsive polish uses CSS functions (`clamp`, `minmax`) instead of utility classes, which made it easier to give the app a comic-book feel.
- **Optimistic UX** – Shelf toggles flip local state immediately, then call the API. On success we refresh the global user to keep shelves accurate everywhere.

---

## Data Models
### User (`models/userModel.ts`)
- `username`, `email`, `password`
- `bio`, `favoriteHero`, `favoriteComic`, `avatarKey`
- `favorites`, `readLater`, `alreadyRead`: arrays of `{ volumeId, title, coverUrl, publisher, year, addedAt }`
- Standard auth flags (`isVerified`, tokens, timestamps)

### Comment (`models/commentModel.ts`)
- `comicId`, `user` (ObjectId ref), `username`
- `text`, `likes` (array of user ids), timestamps

---

## API Overview
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/signup` | POST | Create a new user, issue verify email token |
| `/api/users/login` | POST | Validate credentials, set JWT cookie |
| `/api/users/logout` | GET | Clear auth cookie |
| `/api/users/me` | GET | Return current user sans password |
| `/api/users/profile` | GET/PATCH | Fetch or update profile fields (bio, favorites, avatar) |
| `/api/users/shelves` | POST/DELETE | Add/remove a comic from favorites/readLater/alreadyRead |
| `/api/comics/[id]/comments` | GET/POST | List or add comments for a comic |
| `/api/comments/[id]` | DELETE | Remove a comment (owner/admin) |
| `/api/comments/[id]/like` | POST/DELETE | Toggle likes |
| `/api/cv/volume/[id]` | GET | Proxy to ComicVine (mock + remote) |

All handlers use standard JSON responses and rely on `getDataFromToken` for auth.

---

## How to Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` based on `.env.example` with MongoDB URI, JWT secret, etc.
3. Seed (optional): the mock data in `mockData/` is used automatically when browsing.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000`. Use the header modal or `/signup` to create an account.

---

## Testing
Jest + Testing Library are in devDependencies. Run:
```bash
npm run test
```
The suite now exercises the auth/shelf/comment API handlers plus key UI flows (Header, Comic Detail, Browse) using React Testing Library. API tests run against in-memory model mocks, so you don’t need a separate test database—no extra `MONGO_URL_TEST` is required unless you prefer end-to-end DB tests.

---

## Deployment Info
- **Target**: Vercel (Next.js app router friendly)
- **Environment Vars**: `MONGO_URL`, optional `MONGO_DB_NAME`, `TOKEN_SECRET`, `SMTP_*` creds, `EMAIL_FROM`, ComicVine API URL/key
- **Images**: `next.config.ts` whitelists `upload.wikimedia.org`, `gameSpot`, etc. Update `images.remotePatterns` if you add other avatar domains.
- **Build**: `npm run build` → `next build`. Remember to set all required vars in the hosting dashboard.

---

## Acknowledgments
- Thanks to the ComicVine community and all the wiki angels whose cover scans appear via `next/image`.
- The mock comic list is inspired by my own pull list and too much late-night Wikipedia browsing.
- AI assistance: ChatGPT (via the Codex CLI) helped with brainstorming, responsive CSS polish, and catching edge cases—but every change was reviewed and tuned manually.

Feel free to open issues or drop me a line if you dig the project or want to collaborate on the next iteration of ComicCrate. Excelsior!
