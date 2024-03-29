const express = require('express');
const path = require('path');
const query = require('./server_scripts/retrieve-games.js');
const retrieveIndivdualModule = require('./server_scripts/retrieve-individual.js');
const retrieveSpecificModule = require('./server_scripts/retrieve-specific-data.js');
const retrieveProfileGamesModule = require('./server_scripts/retrieve-profile-games.js');
const searchGamesModule = require('./server_scripts/search-games.js');
const bodyParser = require('body-parser');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

initializeApp({
    credential: applicationDefault()
});

const db = getFirestore();

const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())

// Endpoint for the home page
app.get('/', (req, res) => {
    const token = req.query.token;

    let uid = -1;

    query.then((data) => {
        if(typeof token !== 'undefined') {
            getAuth().verifyIdToken(token).then((decodedToken, invalidId) => {
                if(invalidId) {
                    return res.render('pages/index.ejs', {uid: uid, token: token, games: data});
                }
                else {    
                    uid = decodedToken.uid
    
                    return res.render('pages/index.ejs', {uid: uid, token: token, games: data});
                }
            })
            .catch((err) => {
                console.log("ERROR: " + err);
    
                return res.render('pages/index.ejs', {uid: uid, token: token, games: data});
            });
        } 
        else {
            res.render('pages/index.ejs', {uid: uid, token: token, games: data});
        }
    });
});

// Endpoint for serving favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Endpoint for the about page
app.get('/about', (req, res) => {
    const token = req.query.token;

    let uid = -1;

    if(typeof token !== 'undefined') {
        getAuth().verifyIdToken(token).then((decodedToken, invalidId) => {
            if(invalidId) {
                return res.render('pages/about.ejs', {uid: uid, token: token});
            }
            else {
                uid = decodedToken.uid

                return res.render('pages/about.ejs', {uid: uid, token: token});
            }
        })
        .catch((err) => {
            console.log("ERROR: " + err);

            return res.render('pages/about.ejs', {uid: uid, token: token});
        });
    } 
    else {
        res.render('pages/about.ejs', {uid: uid, token: token});
    }
});

// Endpoint for retrieving user profile data and user reviews
app.get('/profile', (req, res) => {
    const token = req.query.token;

    let uid = -1;

    if(typeof token !== 'undefined') {
        getAuth().verifyIdToken(token).then((decodedToken, invalidId) => {
            if(invalidId) {
                return "Invalid Profile ID";
            }
            else {
                uid = decodedToken.uid
            }

            const collectionRef = db.collection('reviews');

            console.log("UID IS: " + uid);

            collectionRef.where('uid', '==', uid).get().then((snapshot) => {
                console.log(snapshot);
                
                let gameIds = [];

                snapshot.forEach((doc) => {
                    gameIds.push(doc.data().gameId);
                });

                retrieveProfileGamesModule.getGameData(gameIds).then((data) => {
                    return res.render('pages/profile.ejs', {uid: uid, token: token, games: data});
                })
            })
            .catch((err) => {
                console.log(err);
            });
            })
            .catch((err) => {
                console.log("ERROR: " + err);
            });
        }
});

// Endpoint for the signin page
app.get('/signin', (req, res) => {
    res.render('pages/signin.ejs');
});

// Endpoint for retrieving individual game data
app.get('/game', (req, res) => {
    const ids = req.query.ids;
    const token = req.query.token;

    let uid = -1;

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
        let ratings = "No Value Given";
        let releaseDate = "No Value Given";
        let genres = "No Value Given";
        let platforms = "No Value Given";
        let summary = "No Value Given";
        let cover = "No Value Given";

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
            values['ratings'] = values[0] !== "No Value Given" ? values[0] : ["No Value Given"];
            delete values[0];

            values['genres'] = values[1] !== "No Value Given" ? values[1] : ["No Value Given"];
            delete values[1];

            values['platforms'] = values[2] !== "No Value Given" ? values[2] : ["No Value Given"];
            delete values[2];

            values['cover'] = values[3] !== "No Value Given" ? values[3] : "No Value Given";
            delete values[3];

            if (values['cover'] !== "No Value Given") {
                values['cover'][0].url = values['cover'][0].url.substring(2).replace("t_thumb", "t_cover_big");
            }

            values['name'] = data[0].name !== "No Value Given" ? data[0].name : "No Value Given";
            values['release_date'] = releaseDate !== "No Value Given" ? releaseDate : "No Value Given";
            values['summary'] = summary !== "No Value Given" ? summary : "No Value Given";

            if(typeof token !== 'undefined') {
                getAuth().verifyIdToken(token).then((decodedToken, invalidId) => {
                    if(invalidId) {
                        return res.render('pages/game.ejs', {data: values, uid: uid, token: token, gameId: ids});
                    }
                    else {
                        uid = decodedToken.uid;
        
                        return res.render('pages/game.ejs', {data: values, uid: uid, token: token, gameId: ids});
                    }
                })
                .catch((err) => {
                    console.log("ERROR: " + err);
        
                    return res.render('pages/game.ejs', {data: values, uid: uid, token: token, gameId: ids});
                });
            } 
            else {
                res.render('pages/game.ejs', {data: values, uid: uid, token: token, gameId: ids});
            }
        })
    })
})

// Endpoint for retrieving recently added games
app.get('/recentlyAdded', (req, res) => {
    query.then((data) => {
        res.send(data);
    })
    .catch((err) => {
        console.log(err);
    });
});

// Endpoint for searching for games
app.get('/search', (req, res) => {
    const search = req.query.search;
    const token = req.query.token;

    let uid = -1;
    
    searchGamesModule.getGameData(search).then((data) => {
        if(typeof token !== 'undefined') {
            getAuth().verifyIdToken(token).then((decodedToken, invalidId) => {
                if(invalidId) {
                    return res.render('pages/search.ejs', {games: data, uid: uid, token: token});
                }
                else {
                    uid = decodedToken.uid;
    
                    return res.render('pages/search.ejs', {games: data, uid: uid, token: token});
                }
            })
            .catch((err) => {
                console.log("ERROR: " + err);
    
                return res.render('pages/search.ejs', {games: data, uid: uid, token: token});
            });
        } 
        else {
            res.render('pages/search.ejs', {games: data, uid: uid, token: token});
        }
    })
    .catch((err) => {
        console.log(err);
    });
});

// Endpoint for retrieving raw individual game data
app.get('/gameData', (req, res) => {
    const gameId = req.query.gameId;
    
    retrieveIndivdualModule.getGameData(gameId).then((data) => {
        res.send(data);
    })
    .catch((err) => {
        console.log(err);
    });
});

// Endpoint for retrieving reviews from Firestore
app.get('/getReviews', (req, res) => {
    const gameId = req.query.gameId;

    const collectionRef = db.collection('reviews');

    collectionRef.where('gameId', '==', gameId).get().then((snapshot) => {
        let reviews = [];

        snapshot.forEach((doc) => {
            reviews.push(doc.data());
        });

        res.send(reviews);
    })
    .catch((err) => {
        console.log(err);
    });
});

// Endpoint for storing reviews in Firestore
app.post('/addReview', (req, res) => {
    const review = req.body.review;
    const gameId = req.body.gameId;
    const token = req.body.token;
    const uid = req.body.uid;
    //const username = req.body.params.username;

    if(uid != -1) {
        const collectionRef = db.collection('reviews');

        collectionRef.add({
            review: review,
            gameId: gameId,
            uid: uid
            //username: username
        });
    }

    query.then((data) => {
        if(typeof token !== 'undefined') {
            getAuth().verifyIdToken(token).then((decodedToken, invalidId) => {
                if(invalidId) {
                    return res.render('pages/index.ejs', {uid: uid, token: token, games: data});
                }
                else {    
                    uid = decodedToken.uid
    
                    return res.render('pages/index.ejs', {uid: uid, token: token, games: data});
                }
            })
            .catch((err) => {
                console.log("ERROR: " + err);
    
                return res.render('pages/index.ejs', {uid: uid, token: token, games: data});
            });
        } 
        else {
            res.render('pages/index.ejs', {uid: uid, token: token, games: data});
        }
    });
});

// Endpoint for adding a user to Firestore
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