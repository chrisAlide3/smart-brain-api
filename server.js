const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register.js');
const signin = require('./controllers/signin.js');

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
app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users')
    .where('id', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => {
        res.status(400).json('User not found');
    })
})

//Ranking
app.get('/userRank/:id', (req, res) => {
    const {id} = req.params;
     db.raw('select *, rank() over (order by entries desc) as rank from users')
     .then(ranks => {
        const filteredArr = ranks.rows.filter(users => users.id == id );
        res.json(filteredArr[0]);
    })
    .catch(err => {
        res.json('invalid user');
    })
})

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