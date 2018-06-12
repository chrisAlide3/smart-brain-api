const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

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

//Signin
app.post('/signin', (req, res) => {
    const {email, password} = req.body;

    db('users')
    .where('email', email)
    .innerJoin('login', 'users.id', 'login.user_id')

    .then(response => {
        if (bcrypt.compareSync(password, response[0].hash)) {
            //Knex join returns only the id of login not users, so we need to rest in on user
            response[0].id = response[0].user_id;
            res.json(response[0]);
        } else {
            res.json('Password invalid');
        }
    })
    .catch(err => {
        res.json('Invalid email');
    })
})

//Register
app.post('/register', (req, res) => {
    const { name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('All fields are required');
    }
    const hashPwd = bcrypt.hashSync(password);
        // Write login and users table
        db.transaction(trx => {
            trx('users')
            .returning('id')
            .insert({
                name: name, 
                email: email, 
                joined: new Date()
            })
            .then(userId => {
                return trx('login')
                .returning('user_id')
                .insert({
                    user_id: userId[0],
                    hash: hashPwd
                })
                .then(userId => {
                    res.json(userId[0])
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => {
            res.status(400).json('Email already registered. Please Signin');
        })
})

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