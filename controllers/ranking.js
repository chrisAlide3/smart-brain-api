
const handleRanking = (req, res, db) => {
    const {id} = req.params;
     db.raw('select *, rank() over (order by entries desc) as rank from users')
     .then(ranks => {
        const filteredArr = ranks.rows.filter(users => users.id == id );
        res.json(filteredArr[0]);
    })
    .catch(err => {
        res.json('invalid user');
    })
}

module.exports = {
    handleRanking: handleRanking
};