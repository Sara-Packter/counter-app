const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = {};  // { username: { passwordHash, highscore } }
const JWT_SECRET = 'secret123'; // לשימוש דוגמה בלבד

// ✅ מוסיפים מסלול ל־/ כדי ש-Render יזהה שהשרת פעיל
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// הרשמה
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).send('User exists');
  const passwordHash = await bcrypt.hash(password, 8);
  users[username] = { passwordHash, highscore: 0 };
  res.send('Registered');
});

// התחברות
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).send('Invalid credentials');
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// עדכון שיא
app.post('/score', (req, res) => {
  const { token, score } = req.body;
  try {
    const { username } = jwt.verify(token, JWT_SECRET);
    users[username].highscore = Math.max(users[username].highscore, score);
    res.send('Score updated');
  } catch {
    res.status(401).send('Invalid token');
  }
});

// קבלת שיא
app.get('/highscore/:username', (req, res) => {
  const user = users[req.params.username];
  if (!user) return res.status(404).send('User not found');
  res.json({ highscore: user.highscore });
});

// מאזינים על פורט 3000 (Render מפנה אוטומטית את זה ל-URL שלך)
app.listen(3000, () => console.log('Server running on port 3000'));
