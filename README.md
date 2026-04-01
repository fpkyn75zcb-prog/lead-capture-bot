# Lead Capture Bot
© 2025 By Fogle Unlimited | v1.0

A production-ready lead capture chatbot that saves submissions directly to **Google Sheets** via the Google Sheets API using a free Service Account — no email credentials needed.

---

## 📁 Folder Structure

```
lead-capture-bot/
├── server.js            ← Express server + Google Sheets API
├── package.json
├── .env.example         ← Copy to .env and fill in your values
├── .gitignore
├── credentials.json     ← (You create this — see Step 2 below)
└── public/
    ├── index.html
    ├── styles.css
    └── script.js
```

---

## ⚙️ Tech Stack

| Layer     | Tool                     |
|-----------|--------------------------|
| Runtime   | Node.js                  |
| Server    | Express.js               |
| Sheets    | Google Sheets API v4     |
| Auth      | Google Service Account   |
| Frontend  | Vanilla HTML/CSS/JS      |

---

## 🚀 Step-by-Step Setup

### Step 1 — Install Node.js (if not already installed)
Download from https://nodejs.org (LTS version recommended).

---

### Step 2 — Create a Google Cloud Project & Service Account

1. Go to https://console.cloud.google.com
2. Click **"New Project"** → name it `lead-capture-bot` → click **Create**
3. In the left menu go to **APIs & Services → Library**
4. Search for **"Google Sheets API"** → click it → click **Enable**
5. Go to **APIs & Services → Credentials**
6. Click **"Create Credentials"** → choose **"Service Account"**
7. Give it a name like `lead-bot-service` → click **Create and Continue**
8. Skip role assignment → click **Done**
9. Click your new service account in the list
10. Go to the **Keys** tab → **Add Key → Create New Key → JSON**
11. A `credentials.json` file will download — **move it into your project folder**

> ⚠️ Never commit `credentials.json` to Git. It's already in `.gitignore`.

---

### Step 3 — Create Your Google Sheet

1. Go to https://sheets.google.com
2. Create a new sheet — name it anything (e.g. "My Leads")
3. Rename the first tab (bottom) to **`Leads`** (must match `SHEET_NAME` in `.env`)
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
   ```

---

### Step 4 — Share the Sheet with Your Service Account

1. Open your `credentials.json` — find the `client_email` field (looks like `name@project.iam.gserviceaccount.com`)
2. In Google Sheets, click **Share** (top right)
3. Paste that service account email
4. Set permission to **Editor**
5. Click **Send** (ignore the warning about sharing with a non-Google account)

---

### Step 5 — Configure Your `.env` File

```bash
cp .env.example .env
```

Open `.env` and fill in:
```env
PORT=3000
GOOGLE_KEY_FILE=credentials.json
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Leads
```

---

### Step 6 — Install Dependencies

```bash
cd lead-capture-bot
npm install
```

---

### Step 7 — Run the Server

```bash
node server.js
```

You should see:
```
🚀 Lead Capture Bot running → http://localhost:3000
📊 Google Sheet ID: your_spreadsheet_id_here
✅ Header row created in Google Sheet.
```

---

### Step 8 — Test It

1. Open http://localhost:3000 in your browser
2. Fill out the form and submit
3. Check your Google Sheet — a new row should appear within seconds!

---

## 📋 Google Sheet Output Format

| Timestamp           | Name       | Email               | Phone        | Message          |
|---------------------|------------|---------------------|--------------|------------------|
| 4/1/2025, 10:30 AM  | Jane Smith | jane@company.com    | 555-000-0000 | Interested in... |

---

## 🔒 Security Notes

- `credentials.json` and `.env` are in `.gitignore` — keep them out of version control
- For production deployment, use environment variables instead of files (Render, Railway, Heroku all support this)
- Restrict your Service Account to only the Sheets API scope (already done in `server.js`)

---

## 🌐 Deploy to Production (Optional)

### Option A: Railway (free tier)
1. Push code to GitHub (without `credentials.json`)
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Upload `credentials.json` content as a `GOOGLE_KEY_JSON` env var and update `server.js` to parse it

### Option B: Render (free tier)
Same process — connect GitHub repo, set env vars in Render dashboard.

---

## 📞 Support

For questions or customizations, contact Fogle Unlimited.

---

*Lead Capture Bot v1.0 — © 2025 By Fogle Unlimited*
