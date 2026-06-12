# Community Calendar

A static website hosted on GitHub Pages that displays events from a Google Sheet and lets visitors sign up via Google Forms.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | All styling |
| `app.js` | Calendar logic + Google Sheets data fetching |
| `config.js` | **Your settings** — Sheet ID, API key, column mapping |

---

## Setup Guide

### Step 1 — Set up your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Rename the first tab to **Events** (or whatever you set in `config.js`).
3. Add these column headers in row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Date | Event Name | Description | Location | Spots Available | Sign-up Form URL |

4. Add your events starting in row 2. Dates must be in `YYYY-MM-DD` format (e.g. `2025-07-04`).
5. **Share the sheet publicly**: Click **Share → Change to anyone with the link → Viewer**.

---

### Step 2 — Create a Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (or use an existing one).
3. Navigate to **APIs & Services → Library**.
4. Search for **Google Sheets API** and click **Enable**.
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**.
6. Copy the API key.
7. (Optional but recommended) Click **Edit API Key** → Under "API restrictions", restrict it to **Google Sheets API** only.

---

### Step 3 — Create a Google Form for sign-ups

1. Go to [Google Forms](https://forms.google.com).
2. Create a form with fields like: Name, Email, Which event, Number of attendees.
3. **Link it to your sheet**: In the form, go to **Responses → Link to Sheets** → choose your Events spreadsheet.
4. To have per-event forms, create one form and copy the URL for each event's row into column F of your sheet. Or use one shared sign-up form for all events.
5. Copy the form's shareable link (the `/viewform?...` URL, not the edit URL).

---

### Step 4 — Configure `config.js`

Open `config.js` and fill in:

```js
SHEET_ID: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
//          ↑ found in your sheet's URL

API_KEY: "AIzaSyAbc123...",
//         ↑ from Google Cloud Console

SHEET_NAME: "Events",
//           ↑ must match your tab name exactly

SITE_NAME: "Riverside Community Calendar",
//          ↑ shown in the header
```

---

### Step 5 — Deploy to GitHub Pages

1. Create a new repository on [GitHub](https://github.com) (can be private or public).
2. Upload all 4 files: `index.html`, `style.css`, `app.js`, `config.js`.
3. Go to **Settings → Pages**.
4. Under **Source**, select **Deploy from a branch → main → / (root)**.
5. Click **Save**. Your site will be live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

It may take 1–2 minutes for the first deploy.

---

## Adding & Editing Events

Just edit your Google Sheet directly. The website re-fetches data every 5 minutes automatically (configurable in `config.js` with `REFRESH_INTERVAL`).

- **Add an event**: Add a new row with date in `YYYY-MM-DD` format.
- **Edit an event**: Change any cell in the row.
- **Remove an event**: Delete the row or clear the Date cell.
- **Add sign-up link**: Paste your Google Form URL in column F.

---

## Sign-up Responses

All sign-ups go into your Google Sheet automatically (if you linked the form). You can see who's signed up directly in the spreadsheet alongside your events.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Could not load events" | Check your Sheet ID and API key in `config.js`. Make sure the sheet is shared publicly. |
| Events not showing | Check that dates are in `YYYY-MM-DD` format and the sheet tab name matches `SHEET_NAME`. |
| API key errors | Make sure the Google Sheets API is enabled in your Google Cloud project. |
| Changes not appearing | Wait up to 5 minutes, or hard-refresh the page (Ctrl+Shift+R). |

---

## Customization

- **Colors**: Edit the CSS variables at the top of `style.css` (the `:root` block).
- **Site name**: Change `SITE_NAME` in `config.js`.
- **Refresh rate**: Change `REFRESH_INTERVAL` in `config.js` (in milliseconds).
- **Column order**: If you rearrange columns, update the `COLUMNS` mapping in `config.js`.
