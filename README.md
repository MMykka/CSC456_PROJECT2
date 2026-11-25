# Inventory Management – CSC456 Project 2

A full-stack web app for managing an inventory of **Products**, **Categories** and **Suppliers**.

**Stack:** Node.js · Express · MongoDB Atlas · Mongoose · EJS · bcrypt · JWT · Render · GitHub Actions

---

## 1. Architecture (MVC)

```
csc456p2/
├── server.js              # Entry point: loads .env, connects DB, starts server
├── app.js                 # Express setup: middleware, view engine, routes
├── config/db.js           # MongoDB connection
├── models/                # M - Mongoose schemas (data + validation)
│   ├── User.js
│   ├── Category.js
│   ├── Supplier.js
│   └── Product.js
├── views/                 # V - EJS templates (what the user sees)
│   ├── partials/          #     reusable header, footer, error list
│   ├── auth/              #     login, register
│   ├── products/          #     index, show, new, edit, delete, suppliers
│   ├── categories/        #     index, show, new, edit, delete
│   ├── suppliers/         #     index, show, new, edit, delete
│   └── users/             #     user management (admin)
├── controllers/           # C - business logic for each request
├── routes/                # URL -> controller mapping + role protection
├── middleware/auth.js     # JWT check + role check
├── utils/getErrors.js     # turns Mongoose errors into readable messages
├── public/css/style.css   # styling
├── seed.js                # sample data + first admin account
├── test/app.test.js       # tests run by CI
└── .github/workflows/deploy.yml   # CI/CD pipeline
```

**How a request flows:**
`Browser → Route → Middleware (is logged in? right role?) → Controller → Model (MongoDB) → View (EJS) → HTML back to browser`

---

## 2. Data Model & Relationships

| Entity   | Fields |
|----------|--------|
| Category | name (required, unique), description |
| Supplier | name (required, unique), email (required, valid), phone, address |
| Product  | name, sku (unique), price (≥ 0), quantity (whole number ≥ 0), **category**, **suppliers[]** |
| User     | name, email (unique), password (bcrypt hash), role (`admin` / `employee`) |

- **One-to-many:** Category → Products. Each product stores one `category` id.
  The category page lists all its products.
- **Many-to-many:** Products ↔ Suppliers. Each product stores an array of supplier ids.
  The product page lists its suppliers, the supplier page lists its products.
  The relationship is managed on its own page: **Product → "Manage Suppliers"** (`/products/:id/suppliers`).

Validation is done in the Mongoose schemas (`required`, `unique`, `min`, `maxlength`, `match`, `enum`, custom integer check).
Errors are shown back on the form.

---

## 3. Authentication & Authorization

- **Register** (`/register`): password is hashed with **bcrypt** (10 salt rounds) in a `pre('save')` hook in `models/User.js`. The plain password is never stored.
- **Login** (`/login`): `bcrypt.compare` checks the password. If it matches, a **JWT** is created (`jsonwebtoken`), signed with `JWT_SECRET`, and stored in an **httpOnly cookie** (JavaScript can't read it → protects against XSS).
- **Logout** (`POST /logout`): the cookie is cleared.
- **Every request:** `checkUser` middleware verifies the JWT and loads the user. Invalid or expired tokens are rejected.
- **Protected routes:** `requireAuth` redirects to `/login` if not logged in.
- **Roles:** `requireRole('admin')` blocks users without the right role (403 page).

| Action | admin | employee |
|--------|:-----:|:--------:|
| View lists & details | ✅ | ✅ |
| Create records | ✅ | ✅ |
| Update records | ✅ | ✅ |
| Manage product ↔ supplier links | ✅ | ✅ |
| **Delete records** | ✅ | ❌ |
| **Manage users / roles** | ✅ | ❌ |

New registrations are always `employee`. Only an admin can promote a user to admin.

---

## 4. Run Locally

```bash
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run seed              # optional: sample data + admin account (deletes existing data!)
npm run dev               # http://localhost:3000
```

Demo accounts after seeding:
- Admin: `admin@inventory.com` / `Admin123!`
- Employee: `employee@inventory.com` / `Employee123!`

Run tests: `npm test`

---

## 5. Deployment

### MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → allow `0.0.0.0/0` (so Render can connect).
4. **Connect → Drivers** → copy the connection string, put the database name `inventory` before the `?`.

### Render
1. Push the project to a **public GitHub repo**.
2. Render → **New → Web Service** → connect the repo.
3. Build command: `npm install` · Start command: `npm start`
4. **Environment** → add: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, `NODE_ENV=production`
5. **Settings → Auto-Deploy → set to "No"** (GitHub Actions will trigger deploys instead).
6. **Settings → Deploy Hook** → copy the URL.
7. Seed the Atlas database once from your computer: put the Atlas URI in your local `.env`, run `npm run seed`.

### CI/CD with GitHub Actions
1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `RENDER_DEPLOY_HOOK_URL` · Value: the Render deploy hook URL.
2. The workflow `.github/workflows/deploy.yml` runs on every push to `main`:
   1. **CI:** installs packages and runs `npm test`
   2. **CD:** if the tests pass, calls the Render deploy hook → Render redeploys.

**Demo for the instructor:**
```bash
# 1. edit something in VS Code (e.g. the footer text in views/partials/footer.ejs)
git add .
git commit -m "Update footer"          # 2. commit locally
git push origin main                   # 3. push to GitHub
# 4. GitHub → Actions tab: watch "test" then "deploy" run → Render redeploys → refresh the live site
```

---

## 6. Security Summary
- Passwords hashed with **bcrypt**; the password field is `select: false` so it's never loaded by accident.
- JWT in an **httpOnly**, **sameSite**, **secure (in production)** cookie, with an expiry.
- Secrets live in **.env** (git-ignored) locally and in Render's environment settings in production.
- Role checks happen on the **server** (routes), not only by hiding buttons.
- Controllers only accept expected form fields (no mass assignment, e.g. a user can't set their own role).
- Mongoose validation on create **and** update (`runValidators: true`).
