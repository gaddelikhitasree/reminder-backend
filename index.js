const express = require('express');
const cron = require('node-cron');
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
    pass: 'jzsa syfh oknn nfnj'
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// API to add reminder
app.post('/add-reminder', (req, res) => {
  const { email, message, dateTime } = req.body;

  const reminderTime = new Date(dateTime);
  const now = new Date();

  const delay = reminderTime - now;

  if (delay <= 0) {
    return res.send("Time must be in future");
  }

  setTimeout(() => {
    transporter.sendMail({
      from: 'gaddelikhitasree@gmail.com',
      to: email,
      subject: 'Reminder 🔔',
      text: message
    }, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }, delay);

  res.send("Reminder scheduled!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});