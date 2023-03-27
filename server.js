const express = require('express');
const path = require('path');
const home = require('./routes/home-route.js');
const createTcpPool = require('./database.js');
const query = require('./server_scripts/retrieve-games.js');
const retrieveIndivdualModule = require('./server_scripts/retrieve-individual.js');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.get('/about', (req, res) => {
    res.render('pages/about.ejs');
});

app.get('/game', (req, res) => {
    const gameId = req.query.gameId;

    retrieveIndivdualModule.getGameData(gameId).then((data) => {
        res.render('pages/game.ejs', {data: data});
    });
})

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

app.get('/randomTen', (req, res) => {
    const hostname = req.hostname;

    if(hostname != 'localhost' && hostname != 'gameboxd.com') {
        res.send("You do not have access to this page");
    }
    else {
        query.then((data) => {
            res.send(data);
        });
    }
});

app.get('/gameData', (req, res) => {
    const gameId = req.query.gameId;
    
    retrieveIndivdualModule.getGameData(gameId).then((data) => {
        res.send(data);
    })
    .catch((err) => {
        console.log(err);
    });
});

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});