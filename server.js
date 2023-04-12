const express = require('express');
const path = require('path');
const query = require('./server_scripts/retrieve-games.js');
const retrieveIndivdualModule = require('./server_scripts/retrieve-individual.js');
const retrieveSpecificModule = require('./server_scripts/retrieve-specific-data.js');
const bodyParser = require('body-parser');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

initializeApp({
    credential: applicationDefault()
});

getAuth().verifyIdToken("eyJhbGciOiJSUzI1NiIsImtpZCI6ImM4MjNkMWE0MTg5ZjI3NThjYWI4NDQ4ZmQ0MTIwN2ViZGZhMjVlMzkiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9zaHVhIEJhbGR3aW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUdObXl4WUVwYVR0eDJWSkR6T25PY0tVSE5DNXM4bVRwYlhHVDhSNU5UellKZz1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9nYW1lYm94ZC0zNzY1MTkiLCJhdWQiOiJnYW1lYm94ZC0zNzY1MTkiLCJhdXRoX3RpbWUiOjE2ODEzMjIyOTYsInVzZXJfaWQiOiJuTVFTWWRpMmd2VmllbjRDSmNzQlQ4UkVaVUsyIiwic3ViIjoibk1RU1lkaTJndlZpZW40Q0pjc0JUOFJFWlVLMiIsImlhdCI6MTY4MTMyMjI5NiwiZXhwIjoxNjgxMzI1ODk2LCJlbWFpbCI6ImJhbGR3aW5qZDJAYXBwc3RhdGUuZWR1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDY0MjI5ODc2MzE5OTczNDQ0ODkiXSwiZW1haWwiOlsiYmFsZHdpbmpkMkBhcHBzdGF0ZS5lZHUiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.ALgyWZvMv5B0OdCnwiz2N447CtSp5v7NIYrE8Tup3-DExc0_1QYiTqCzBgMd6nzqIPBVwjSae1UjLKM6uAM6JctwY1HHX7tzkHXm7BYtIiZsFebn4j2GkWlwuVKowzrr3C02QzLrJtXjnvQ7bRqjf5KMCA0d6v2SFlsRunpkCJKGsUDKT2FV5SLy57DBa3Vd06WoS7fqaiqywxCAnJ57aGL9e6qlIIHThfIHN7wcaQd5zuzUTsRnFHeM0Tly17Dqu_gUEtxTp5anYk6I2EGkIOW8dh2PsXzoKBYlpdhBu6ypg9dGu6fteSWEuxyh6m6F5By3V0Flum3keIOlSD9QUw").then((decodedToken) => {console.log(decodedToken.uid)});

const db = getFirestore();

const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render('pages/index.ejs');
});

app.get('/about', (req, res) => {
    res.render('pages/about.ejs');
});

app.get('/signin', (req, res) => {
    res.render('pages/signin.ejs');
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

app.post('/addUser', (req, res) => {
    const username = req.body.params.username;

    console.log(username);

    const collectionRef = db.collection('users');

    collectionRef.count().get().then((snapshot) => {
        let id = snapshot.data().count;
        const docRef = collectionRef.doc(username);

        docRef.set({
            username: username,
            id: ++id
        });
    });
})

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});