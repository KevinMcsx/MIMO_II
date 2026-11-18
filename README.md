# LoopyBrain

Install with pnpm install and start with pnpm dev. Build with pnpm build.
The Sites Worker bundles the built frontend and handles score synchronization.

Scores, profiles and daily challenges are stored in the current browser.
New completed game scores are also queued for delivery to Google Sheets.
Set SHEETS_WEBAPP_URL and SHEETS_WRITE_TOKEN as server-only runtime variables.

Robot Mission offers a fixed 90-second run and an untimed practice mode.
Classroom sessions use player codes and keep results separately in the current
browser. They do not send classroom results to the public Google Sheet.

The optional RGB console uses the [WebHID report protocol](docs/console-webhid.md).
