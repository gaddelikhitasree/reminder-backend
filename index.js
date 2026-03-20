const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ✅ CONNECT MONGODB
mongoose.connect("mongodb+srv://gaddelikhitasree_db_user:CYnjIhWBiOFhckj0@cluster0.5r1ownf.mongodb.net/reminderDB?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Mongo error:", err));

// ✅ SCHEMA
const reminderSchema = new mongoose.Schema({
  email: String,
  message: String,
  dateTime: Date,
  sent: { type: Boolean, default: false }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

// ✅ EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gaddelikhitasree@gmail.com',
    pass: 'ttya bngg vhds emjh'
  }
});

// ✅ VERIFY EMAIL (important)
transporter.verify()
  .then(() => console.log("✅ Email server ready"))
  .catch(err => console.log("❌ Email config error:", err));

// ✅ HOME ROUTE
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ ADD REMINDER
app.post('/add-reminder', async (req, res) => {
  try {
    const { email, message, dateTime } = req.body;

    if (!email || !message || !dateTime) {
      return res.status(400).send("Missing fields");
    }

    const reminder = new Reminder({
      email,
      message,
      dateTime: new Date(dateTime),
      sent: false
    });

    await reminder.save();

    console.log("📌 Reminder saved:", message);

    res.send("Reminder stored!");
  } catch (err) {
    console.log("❌ Error saving reminder:", err);
    res.status(500).send("Server error");
  }
});

// ✅ CRON JOB (RUNS EVERY MINUTE)
cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    const reminders = await Reminder.find({
      dateTime: { $lte: now },
      sent: false
    });

    for (let r of reminders) {
      try {
        await transporter.sendMail({
          from: 'gaddelikhitasree@gmail.com',
          to: r.email,
          subject: 'Reminder 🔔',
          text: r.message
        });

        console.log("✅ Email sent:", r.message);

        r.sent = true;
        await r.save();

      } catch (err) {
        console.log("❌ Email error:", err);
      }
    }
  } catch (err) {
    console.log("❌ Cron error:", err);
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});