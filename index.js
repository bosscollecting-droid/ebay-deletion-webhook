import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(bodyParser.json());

// 🔹 Change this to your own verification token
const VERIFICATION_TOKEN = "mySecretToken123";

// 🔹 Change this to your public endpoint URL (your Render or Replit URL)
const ENDPOINT = "https://YOUR-WEBHOOK-URL/api/webhook/ebay-deletion";

// ✅ GET route for eBay verification handshake
app.get("/api/webhook/ebay-deletion", (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) return res.status(400).send("Missing challenge_code");

  // SHA256 hash of challenge_code + token + endpoint
  const hash = crypto
    .createHash("sha256")
    .update(challengeCode + VERIFICATION_TOKEN + ENDPOINT)
    .digest("hex");

  // Respond with exactly the JSON eBay expects
  res.json({ challengeResponse: hash });
});

// ✅ POST route to receive notifications from eBay
app.post("/api/webhook/ebay-deletion", (req, res) => {
  console.log("✅ eBay Notification Received:");
  console.log(JSON.stringify(req.body, null, 2));

  // Detect Marketplace Account Deletion events
  if (req.body.metadata?.topic === "MARKETPLACE_ACCOUNT_DELETION") {
    const userId = req.body.notification.data.subject.userId;
    console.log("🚨 User requested deletion:", userId);
    // TODO: Delete or anonymize user data here
  }

  res.sendStatus(200);
});

// 🔹 Listen on port provided by hosting platform
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
