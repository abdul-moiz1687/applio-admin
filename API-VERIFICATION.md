# API verification

Status of every backend integration in the Admin app. **None of this has been verified against the live backend from
this development environment**: the sandbox could not reach the backend host, so only lint and production builds were run.
The endpoint paths below are the contract the project owner reported as working against the running backend. Each one still
needs a manual check with an admin account before the Admin app is relied on.

## Endpoints

| # | Method and path | Used by | Status | What to test |
| --- | --- | --- | --- | --- |
| 1 | `POST /auth/login` | Sign-in | Reported working | Admin account returns `token` and `user.role === "admin"`. Non-admin account is refused. Bad password returns 401. |
| 2 | `GET /admin/users` | Dashboard, Users | Reported working | Returns a list; admin token only (non-admin gets 403). Confirm the shape: bare array or under `users`/`data`/`items`; `_id` vs `id`. |
| 3 | `DELETE /admin/users/:id` | Users | Reported working | Deletes the user. Confirm whether admins or the last admin can be deleted. Non-admin gets 403. |
| 4 | `GET /admin/appliances` | Dashboard, Appliances, Service records | Reported working | Returns a list of appliances with `name`, `brand`, `model`, `serialNumber`, `purchaseDate`, `warrantyDuration`, `owner`. |
| 5 | `GET /appliances/:id` | Appliance details dialog | Reported working | Returns one appliance. Confirm whether it is wrapped as `{ "appliance": {...} }`; the app accepts both. |
| 6 | `GET /appliances/:id/qr` | Appliance details dialog | Reported working | Returns `publicUrl` and `qrCode` (a `data:image/png;base64,...` URI). |
| 7 | `GET /admin/services` | Dashboard count, Service records | Reported working; the Dashboard count was 5 in the owner's local testing | Returns the global service-record list. Confirm the shape and key name (`services`, `serviceRecords`, or a bare array). |

## Response shapes to confirm

- **Users:** `name`, `email`, `role`, `createdAt`, and `_id` or `id`.
- **Appliances:** `name`, `brand`, `model`, `serialNumber`, `purchaseDate`, `warrantyDuration`, and `owner` (a string, or an object with `name`/`email`).
- **Service records:** `serviceDate` (or `date`), `description`, `technician` (a string or an object), `cost`, and an appliance reference. The reference may be a populated object (name, brand, model, `_id`) or a bare id; bare ids are resolved against the appliance list.
- **Key names:** the service-record array key is read from `services`, `serviceRecords`, `data`, or `items`, or a bare array. Confirm the real key in `normalizeList` calls in `src/services/resources.js`.

## Behaviour to confirm

- **Dashboard counts** come from the three list endpoints. If one endpoint fails, its card shows "—" with the error, and the other cards still load.
- **Client-side pagination:** all records are loaded and paged in the browser. Test with a large dataset to decide whether server pagination is needed.
- **Currency and warranty:** costs are displayed as plain numbers, and warranty duration as returned. Confirm the currency and the unit.
- **Token expiry:** the JWT `exp` claim is read in the browser to clear stale sessions. Confirm the token contains `exp`.
- **Reload behaviour:** after a delete or refresh, the previously loaded table stays visible while the new data loads.

## Not implemented (no documented route)

- Create, update, and delete for appliances.
- Create, update, and delete for service records.
- Admin account management beyond listing and deleting users.

## Backend changes required before deployment

- CORS: allow `http://localhost:5174` and the deployed Admin domain, in addition to the existing customer origin. No wildcard origins.
- This project makes no changes to the backend.

## Manual test checklist

1. Sign in with an admin account. Refresh the page; the session should survive.
2. Sign in with a non-admin account. Access should be refused and no session stored.
3. Dashboard: the three counts match the backend data. Refresh shows a success toast.
4. Users: search, role filter, view details, delete (confirm the dialog; the list refreshes; a success toast appears). Your own row's delete button is disabled.
5. Appliances: search, brand filter, view details, generate a QR code (success toast).
6. Service records: records show with appliance names, search and appliance filter work, and pagination works.
7. Expire or clear the token; the app should redirect to login with a message.
8. Check the sidebar collapse and the mobile drawer, keyboard navigation (Tab, Enter, Escape), and reduced-motion behaviour (enable it in the OS settings and confirm there is no animation).
9. Check each page at phone and desktop widths.
