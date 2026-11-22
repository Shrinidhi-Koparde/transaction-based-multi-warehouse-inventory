# Engine E4 RBAC Demo

## Run
1. Extract this folder and open a terminal inside it.
2. Run `npm install`
3. Optional: copy `.env.example` to `.env`.
4. Run `npm run dev`
5. Open http://localhost:5173

Keep Flask running at http://127.0.0.1:5000.

Use the actual credentials already registered in your database. Known usernames: `admin`, `operations_manager`, `warehouse_lead`. Create a Logistics Staff account from Admin > User Management if needed.

Live APIs used: POST /api/auth/login, GET /api/auth/profile, GET/POST /api/users/, PATCH /api/users/<id>, PATCH /api/users/<id>/deactivate, PATCH /api/users/<id>/reactivate.

Transfer and logistics screens use labelled sample data until their backend APIs are ready. Frontend role restrictions are for UX; Flask backend authorization remains authoritative. JWT is held in sessionStorage and cleared on logout.
