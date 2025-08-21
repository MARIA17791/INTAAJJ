console.log("🔥 server.js started...");

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const mongoUrl = 'mongodb://localhost:27017/';
const dbName = 'intaj-users';

let db, usersCollection;

// 🔗 Connect to MongoDB
MongoClient.connect(mongoUrl)
  .then(client => {
    console.log("✅ MongoDB connected (native driver)");
    db = client.db(dbName);
    usersCollection = db.collection('users');
  })
  .catch(err => console.log("❌ MongoDB error:", err));

// 🛠 Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'intaj-secret',
  resave: false,
  saveUninitialized: true
}));

// 📁 Serve Static Folders
app.use('/MAIN', express.static(path.join(__dirname, '../MAIN')));
app.use('/DUAT', express.static(path.join(__dirname, '../DUAT')));
app.use('/HUDOOD', express.static(path.join(__dirname, '../HUDOOD')));
app.use(express.static(path.join(__dirname))); // For ullu.html and assets in LOGIN

// 🏠 Serve Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ullu.html'));
});

// 🔐 Handle Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await usersCollection.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect('/MAIN/HTML/index.html');
    } else {
      res.send('<h2>❌ Invalid username or password</h2>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Internal Server Error');
  }
});
// 🧪 Dummy user registration
app.get('/register', async (req, res) => {
  const dummyUsers = [
    { username: '30327452', password: '7452' },
    { username: 'john', password: 'doe123' },
    { username: 'fatima', password: 'mypassword' }
  ];

  try {
    const hashedUsers = await Promise.all(
      dummyUsers.map(async user => ({
        username: user.username,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    await usersCollection.insertMany(hashedUsers);
    res.send('✅ Dummy users created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error creating users');
  }
});


// 🚀 Start Server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
