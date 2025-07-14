require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const userSchema = new mongoose.Schema({
  telegram_id: Number,
  first_name: String,
  points: Number,
  click_count: Number
});

const User = mongoose.model('User', userSchema);

// Puan Kaydı
app.post('/click', async (req, res) => {
  const { telegram_id, first_name } = req.body;

  const reward = Math.floor(Math.random() * 21) + 10; // 10–30 arası puan
  let user = await User.findOne({ telegram_id });

  if (!user) {
    user = new User({ telegram_id, first_name, points: reward, click_count: 1 });
  } else {
    user.points += reward;
    user.click_count += 1;
  }

  await user.save();
  res.json({ message: '✅ Puan eklendi', reward, total: user.points });
});

// Sıralama
app.get('/leaderboard', async (req, res) => {
  const topUsers = await User.find().sort({ points: -1 }).limit(10);
  res.json(topUsers);
});

app.listen(3001, () => {
  console.log('🟢 API listening on http://localhost:3001');
});
