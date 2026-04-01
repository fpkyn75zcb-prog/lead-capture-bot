/**
 * Lead Capture Bot — Server
 * © 2025 By Fogle Unlimited
 * Version: v1.0
 * Created: 2025
 *
 * Stack: Node.js, Express.js, Google Sheets API (googleapis)
 */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ─── Google Sheets Auth ────────────────────────────────────────────────────────
/**
 * AUTH SETUP:
 * This uses a Google Service Account (JSON key file).
 * See README.md for full setup instructions.
 */
const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS) 
    : require("./credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // From your Google Sheet URL
const SHEET_NAME = process.env.SHEET_NAME || "Leads"; // Tab name inside the sheet

// ─── Helper: Append Row to Google Sheet ───────────────────────────────────────
async function appendLeadToSheet(lead) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago", // Dallas, TX timezone
    dateStyle: "short",
    timeStyle: "short",
  });

  const values = [[timestamp, lead.name, lead.email, lead.phone || "", lead.message || ""]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

// ─── Helper: Ensure Header Row Exists ─────────────────────────────────────────
async function ensureHeaders() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:E1`,
    });

    const existingHeaders = res.data.values?.[0];
    if (!existingHeaders || existingHeaders.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:E1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Timestamp", "Name", "Email", "Phone", "Message"]],
        },
      });
      console.log("✅ Header row created in Google Sheet.");
    }
  } catch (err) {
    console.warn("⚠️  Could not verify headers:", err.message);
  }
}

// ─── Route: Submit Lead ────────────────────────────────────────────────────────
app.post("/submit-lead", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Name and email are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: "Invalid email address." });
  }

  try {
    await appendLeadToSheet({ name, email, phone, message });
    console.log(`📋 Lead captured: ${name} <${email}>`);
    res.json({ success: true, message: "Lead submitted successfully!" });
  } catch (err) {
    console.error("❌ Google Sheets error:", err.message);
    res.status(500).json({ success: false, error: "Failed to save lead. Please try again." });
  }
});

// ─── Route: Health Check ───────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0", timestamp: new Date().toISOString() });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Lead Capture Bot running → http://localhost:${PORT}`);
  console.log(`📊 Google Sheet ID: ${SPREADSHEET_ID || "⚠️  NOT SET — check .env"}`);
  await ensureHeaders();
});
