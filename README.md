# Asset Checkout System

A full-stack web app for tracking equipment checkout and check-in — built as a portfolio project targeting junior full-stack developer roles in the Northern Virginia / govcon market.

**Live demo:** https://johnernestfreeman-prog.github.io/asset-checkout-system/

---

## What it does

- Users register and sign in with a JWT-authenticated account
- View a live ledger of equipment/assets
- Check assets out and back in, with status reflected in real time

## Tech stack

**Frontend**
- Vanilla HTML/CSS/JavaScript (no framework — kept static for GitHub Pages hosting)
- Hosted on GitHub Pages

**Backend**
- Node.js + Express + TypeScript
- JWT authentication, bcrypt password hashing
- Deployed on AWS Elastic Beanstalk

**Database**
- PostgreSQL, hosted on AWS RDS

**Infrastructure**
- AWS CloudFront — provides HTTPS in front of the Elastic Beanstalk backend (GitHub Pages serves the frontend over HTTPS, so the API needs to as well)
- GitHub Actions — CI pipeline runs the full Jest test suite on every push
- Jest + Supertest — backend test coverage

## Architecture

```
Browser
  │
  ├── GitHub Pages (static frontend, HTTPS)
  │
  └── CloudFront (HTTPS) → Elastic Beanstalk (Node/Express API) → RDS (PostgreSQL)
```

The frontend and backend are hosted on different domains, so the API is configured with CORS to explicitly allow requests from the GitHub Pages origin, and CloudFront sits in front of the backend so the whole chain stays on HTTPS end to end.

## Running locally

**Backend**
```bash
cd backend
npm install
npm run build
npm start
```

Create a `.env` file in `backend/` with:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_NAME=asset_checkout
DB_SSL=false
JWT_SECRET=your_local_secret
```

**Frontend**

The frontend is static — open `index.html` directly in a browser, or serve the repo root with any static file server. Update `API_BASE` in `js/api.js` if pointing at a local backend instead of the deployed one.

**Tests**
```bash
cd backend
npm test
```

## Project structure

```
asset-checkout-system/
├── index.html          # Sign in / register page
├── assets.html          # Equipment ledger
├── css/style.css
├── js/
│   ├── api.js            # API base URL + fetch helper
│   ├── auth.js            # Login/register form logic
│   └── assets.js          # Ledger rendering + checkout/check-in
└── backend/
    ├── src/
    │   ├── app.ts
    │   ├── server.ts
    │   ├── config/schema.sql
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   └── routes/
    └── tests/
```

## Notes

This project was built and deployed manually end-to-end (AWS account setup, IAM, Elastic Beanstalk, RDS, CloudFront, GitHub Pages) as a hands-on way to learn the deployment side of full-stack development, not just the code.