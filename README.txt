SKYLAND PRIVATE — V11
Cloudflare Pages + D1

WHAT THIS VERSION FIXES
- Uses the supplied Skyland Private logo.
- Desktop navigation is intentionally simplified: Charter, Fleet, Services, Experience, Contact.
- Mobile: logo stays left; language and hamburger controls stay at the upper-right.
- Mobile uses a dedicated portrait-friendly hero image (hero-mobile.jpg).
- Flight planner clearly supports Round trip / Gidiş-Dönüş and One way / Tek Yön.
- Round trip requires a return date; one way hides and clears the return date.
- Worldwide airport autocomplete remains enabled.
- Membership registration/login uses Cloudflare D1 through /api/auth/*.
- Flight requests are stored in Cloudflare D1 through /api/flight-requests.
- No fake email fallback: requests stay inside the secure API/database flow.
- Bottom WhatsApp bar uses the official WhatsApp green (#25D366).

DATABASE SETUP — REQUIRED ONCE
1. Cloudflare Dashboard → Workers & Pages → D1 SQL Databases → Create database.
2. Database name: skyland-private-db
3. Open the database → Console → paste and run schema.sql.
4. Copy the D1 database ID.
5. In wrangler.toml replace:
   database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
   with your real D1 ID.
6. In your Cloudflare Pages project, go to Settings → Functions → D1 database bindings.
7. Add binding name: DB
8. Select database: skyland-private-db
9. Redeploy the project.

After this, Member registration/login and flight requests are persisted in D1.
The users table stores member accounts; sessions stores login sessions; flight_requests stores enquiries.

IMPORTANT
- Never publish the D1 database ID as a secret; the ID itself is not a password, but keep account credentials private.
- Passwords are never stored as plain text; the API stores PBKDF2-SHA-256 password hashes with per-user salts.
- For production, add rate limiting / bot protection and an admin-only dashboard before exposing customer data to staff.


EMAIL DELIVERY
- Flight requests are sent by AJAX to FormSubmit and forwarded to skylandaviationinfo@gmail.com.
- The first submission may trigger a FormSubmit activation/confirmation email. Confirm it once; subsequent requests are forwarded automatically.
- This version does not require a Cloudflare Worker, D1, or wrangler.toml.

V20: Mobile home rebuilt as cinematic banner + visible planner card; subtle back-to-top; same-page success state preserved.
