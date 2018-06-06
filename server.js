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
      password : '',
      database : 'smart-brain'
    }
  });


const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '1',
            name: 'Chris',
            email: 'a@b.com',
            password: '1234',
            entries: 0,
            joined: new Date(),
        },

        {
            id: '2',
            name: 'Herbert',
            email: 'c@d.com',
            password: '1234',
            entries: 0,
            joined: new Date(),
        },
    ]
};

//Defining routes
app.get('/', (req, res) => {
    res.send(database.users);
})

//Signin
app.post('/signin', (req, res) => {
    const {email, password} = req.body;

    db('login')
    .where('email', email)
    .then(response => {
        if (bcrypt.compareSync(password, response[0].hash)) {
            db('users')
            .where('email', response[0].email)
            .then(user => {
                res.json(user);
            })
            .catch(err => {
                res.status(400).json('Email not valid');
            })
        } else {
            res.status(400).json('Invalid password');
        }
    })
    .catch(err => {
        res.status(400).json('Invalid email');
    })
})

//Register
app.post('/register', (req, res) => {
    const { name, email, password} = req.body;
    const hashPwd = bcrypt.hashSync(password);
                // Write login and users table
                db.transaction(trx => {
                    trx.insert({
                        email: email,
                        hash: hashPwd
                    })
                    .into('login')
                    .returning('email')
                    .then(loginEmail => {
                        //Insert Users
                        return trx('users')
                        .returning('*')
                        .insert({
                            name: name, 
                            email: loginEmail[0], 
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
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



