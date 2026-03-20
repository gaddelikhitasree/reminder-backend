const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { Resend } = require('resend');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ✅ RESEND SETUP
const resend = new Resend("re_b96P3dLT_BMNudZZEaVykQsgjoNMQoMcW");

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

    console.log("📌 Reminder saved:", message, "for", dateTime);

    res.send("Reminder stored!");
  } catch (err) {
    console.log("❌ Error saving reminder:", err);
    res.status(500).send("Server error");
  }
});

// ✅ FIXED CRON JOB (CORRECT TIMING)
cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    const reminders = await Reminder.find({ sent: false });

    for (let r of reminders) {
      const reminderTime = new Date(r.dateTime);

      // ⏰ Match exact minute (IGNORE seconds)
      const isSameMinute =
        reminderTime.getFullYear() === now.getFullYear() &&
        reminderTime.getMonth() === now.getMonth() &&
        reminderTime.getDate() === now.getDate() &&
        reminderTime.getHours() === now.getHours() &&
        reminderTime.getMinutes() === now.getMinutes();

      if (isSameMinute) {
        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: r.email,
            subject: 'Reminder 🔔',
            html: `<p>${r.message}</p>`
          });

          console.log("✅ Email sent:", r.message);

          r.sent = true;
          await r.save();

        } catch (err) {
          console.log("❌ Email error:", err);
        }
      }
    }
  } catch (err) {
    console.log("❌ Cron error:", err);
  }
});

          console.log("✅ Email sent:", r.message);

          r.sent = true;
          await r.save();

        } catch (err) {
          console.log("❌ Email error:", err);
        }
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