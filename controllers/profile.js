//Reading profile
const handleProfileGet = (req, res, db) => {
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
};

//Update profile
const handleProfilePut = (req, res, db) => {
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
};

//Delete profile
const handleProfileDelete = (req, res, db) => {
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
}

module.exports = {
    handleProfileGet: handleProfileGet,
    handleProfilePut: handleProfilePut,
    handleProfileDelete: handleProfileDelete
};