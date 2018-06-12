// We need to pass the db(from knex) and bcrypt as arguments from the endpoint. It's called dependency injection
// We also could define the knex and bcrypt here instead


const handleRegister = (req, res, db, bcrypt) => {
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
}

module.exports = {
    handleRegister: handleRegister
};