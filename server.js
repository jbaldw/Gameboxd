const express = require('express');
const path = require('path');
const home = require('./routes/home-route.js');
const createTcpPool = require('./database.js');
const query = require('./server_scripts/retrieve-games.js');
const retrieveIndivdualModule = require('./server_scripts/retrieve-individual.js');
const retrieveSpecificModule = require('./server_scripts/retrieve-specific-data.js');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const app = express();
const port = 8080;

initializeApp({
    credential: applicationDefault()
  });
  
const db = getFirestore();

const docRef = db.collection('users').doc('alovelace');

await docRef.set({
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
});

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.get('/about', (req, res) => {
    res.render('pages/about.ejs');
});

app.get('/game', (req, res) => {
    const ids = req.query.ids;

    let fields;

    let endpoint;

    if(req.query.fields == undefined) {
        fields = "*";
    }
    else {
        fields = req.query.fields;
    }

    if(req.query.endpoint == undefined) {
       endpoint = "games";
    }
    else {
        endpoint = req.query.endpoint;
    }

    const gameData = {};

    retrieveSpecificModule.getGameData(ids, fields, endpoint).then((data) => {
        let ratings = "No Ratings Given";
        let releaseDate = "No Release Date Given";
        let genres = "No Genre's Given";
        let platforms = "No Platforms Given";
        let summary = "No Summary Given";
        let cover = "No Cover Given";

        if(data[0].hasOwnProperty('age_ratings')) {
            ratings = retrieveSpecificModule.getGameData(data[0].age_ratings, "*", "age_ratings");
        }

        if(data[0].hasOwnProperty('first_release_date')) {
            dateMilliseconds = data[0].first_release_date * 1000
            releaseDate = new Date(dateMilliseconds).toLocaleDateString();
        }

        if(data[0].hasOwnProperty('genres')) {
            genres = retrieveSpecificModule.getGameData(data[0].genres, "*", "genres");
        }

        if(data[0].hasOwnProperty('platforms')) {
            platforms = retrieveSpecificModule.getGameData(data[0].platforms, "*", "platforms");
        }

        if(data[0].hasOwnProperty('summary')) {
            summary = data[0].summary;
        }

        if(data[0].hasOwnProperty('cover')) {
            cover = retrieveSpecificModule.getGameData(data[0].cover, "*", "covers");
        }

        Promise.all([ratings, genres, platforms, cover]).then((values) => {
            values['ratings'] = values[0];
            delete values[0];

            values['genres'] = values[1];
            delete values[1];

            values['platforms'] = values[2];
            delete values[2];

            values['cover'] = values[3];
            delete values[3];

            values['cover'][0].url = values['cover'][0].url.substring(2).replace("t_thumb", "t_cover_big")
            
            values['name'] = data[0].name;
            values['release_date'] = releaseDate;
            values['summary'] = summary;
            
            res.render('pages/game.ejs', {data: values});
        })
    })
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