const express = require('express');
const path = require('path');
const home = require('./routes/home-route.js');
const createTcpPool =  require('./database.js')
const app = express();
const port = 8080;

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', home);

app.get('/dbtest', (req, res) => {
    let pool = createTcpPool();
    console.log(pool);
})

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});