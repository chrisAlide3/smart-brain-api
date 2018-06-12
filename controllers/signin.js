
const handleSignin = (req, res, db, bcrypt) => {
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
}

module.exports = {
    handleSignin: handleSignin
};