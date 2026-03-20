const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

// 🔥 Store reminders
let reminders = [];

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gaddelikhitasree@gmail.com',
    pass: 'jzsa syfh oknn nfnj' // ⚠️ later move to .env
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

  reminders.push({
    email,
    message,
    dateTime,
    sent: false
  });

  console.log("Reminder added:", message);

  res.send("Reminder scheduled!");
});

// 🔥 CRON JOB (runs every minute)
cron.schedule('* * * * *', () => {
  const now = new Date();

  reminders.forEach((r, index) => {
    const reminderTime = new Date(r.dateTime);

    if (now >= reminderTime && !r.sent) {
      transporter.sendMail(
        {
          from: 'gaddelikhitasree@gmail.com',
          to: r.email,
          subject: 'Reminder 🔔',
          text: r.message
        },
        (err, info) => {
          if (err) {
            console.log("Error:", err);
          } else {
            console.log("Email sent:", info.response);
          }
        }
      );

      // mark as sent
      reminders[index].sent = true;
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});