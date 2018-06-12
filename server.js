const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register.js');
const signin = require('./controllers/signin.js');
const image = require('./controllers/image.js');
const ranking = require('./controllers/ranking.js');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'chris',
      password : 'phils33',
      database : 'smart-brain'
    }
  });

const app = express();
app.use(bodyParser.json());
app.use(cors());

//Defining routes
app.get('/', (req, res) => {
    res.send('App server runing');
})

//Register (we pass db and bcrypt. called dependency injection)
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt))

//Signin
app.post('/signin', (req, res) => signin.handleSignin(req, res, db, bcrypt))

//Profile
app.put('/profile', (req, res) => {
    const {id, name, email} = req.body;

    db('users')
        .where('id', id)
        .returning('*')
        .update({
        name: name,
        email: email
    })
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            res.json('Database error');
        })
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    
    db('users').where('id', id)
        .then(user => {
            if (user.length > 0) {
                res.json(user[0]);
            } else {
                res.status(400).json('User not found');
            }
        })
        .catch(err => {
            console.log('Failed: ',id);
            
            res.status(400).json('Database error')
        })
})

app.delete('/profile/:id', (req, res) => {
    const { id } = req.params;
    db('users')
    .where('id', id)
    .del()
    .then(message => {
        res.json('deleted');
    })
    .catch(err => {
        res.status(400).json('Database error');
    })
})

//Image
app.put('/image', (req, res) =>image.handleImage(req, res, db))

//Ranking
app.get('/userRank/:id', (req, res) => ranking.handleRanking(req, res, db))

app.listen(3000, ()=> {
    console.log('App is running');
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