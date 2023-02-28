const express = require('express');
const path = require('path');
const home = require('./routes/home-route.js');
const createTcpPool = require('./database.js');
const query = require('./server_scripts/retrieve-games.js');
const app = express();
const port = 8080;

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', home);

app.get('/dbtest', (req, res) => {
    let tcpPool = createTcpPool();
    tcpPool.then((pool) => {
        pool.query('select * from Users', (err, data) => {
            if(err) {
                console.log(err);
                res.send('<h1>Connection Failed</h1>');
            }
            else {
                console.log(data);
                res.send('<h1>Connection Successful</h1>');
            }
        });
    });
});

app.get('/recentTen', (req, res) => {
    console.log('Hostname: ' + req.hostname);

    query.then((data) => {
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});