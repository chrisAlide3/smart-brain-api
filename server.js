const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register.js');
const signin = require('./controllers/signin.js');
const profile = require('./controllers/profile.js');
const image = require('./controllers/image.js');
const ranking = require('./controllers/ranking.js');

// for local connection. Just add username and password
// const db = knex({
//     client: 'pg',
//     connection: {
//       host : '127.0.0.1',
//       user : '',
//       password : '',
//       database : 'smart-brain'
//     }
//   });

//For heroku connection
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});


const app = express();
app.use(bodyParser.json());
app.use(cors());

//Defining routes
app.get('/', (req, res) => {res.send('it is working!')})

//Register (we pass db and bcrypt. called dependency injection)
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

//Signin
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) })

//Profile
app.put('/profile', (req, res) => { profile.handleProfilePut(req, res, db) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })
app.delete('/profile/:id', (req, res) => { profile.handleProfileDelete(req, res, db) })

//Image
app.put('/image', (req, res) => { image.handleImage(req, res, db) })

//Ranking
app.get('/userRank/:id', (req, res) => { ranking.handleRanking(req, res, db) })

app.listen(process.env.PORT || 3000, ()=> {
  if (process.env.PORT) {
    console.log(`App is running on port ${process.env.PORT}`);
  } else {
    console.log(`App is running on port 3000`);
  }
});

/*
HTTP methodes:
GET = Read data
POST= Write data
PUT = update data
DELETE= delete data

/signin     --> POST    = success/failure
/register   --> POST    = user
/profile    --> GET     = user
/image       --> PUT     = user
*/