const app = require('http')
    .createServer((req,res) => res.send('hi there'));

// declaring enviroment variables
// these are injected from the Bash on call as:
// PORT='3050' node testserver.js
const PORT = process.env.PORT;

// or for database url
// bash call = DATABASE_URL= 'whatever the path'
 const DATABASE_URL = process.env.DATABASE_URL;

app.listen(PORT, () => {
    console.log('server is listening on port: ', PORT);
})

console.log(DATABASE_URL);
