const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gaddelikhitasree@gmail.com',
    pass: 'ttya bngg vhds emjh'
  }
});

// 🔥 VERIFY EMAIL CONFIG (IMPORTANT)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email config error:", error);
  } else {
    console.log("✅ Email server ready");
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ Add reminder API
app.post('/add-reminder', (req, res) => {
  const { email, message, dateTime } = req.body;

  if (!email || !message || !dateTime) {
    return res.status(400).send("Missing fields");
  }

  const reminderTime = new Date(dateTime);
  const now = new Date();

  const delay = reminderTime - now;

  if (delay <= 0) {
    return res.send("Time must be in future");
  }

  console.log("⏰ Reminder set for:", reminderTime);

  // 🔥 SEND EMAIL AFTER DELAY
  setTimeout(() => {
    transporter.sendMail(
      {
        from: 'gaddelikhitasree@gmail.com',
        to: email,
        subject: 'Reminder 🔔',
        text: message
      },
      (err, info) => {
        if (err) {
          console.log("❌ Email error:", err);
        } else {
          console.log("✅ Email sent:", info.response);
        }
      }
    );
  }, delay);

  res.send("Reminder scheduled!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});