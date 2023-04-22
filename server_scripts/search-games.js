require('dotenv').config();

const igdb = require('igdb-api-node').default;

const gameEndpoint = 'https://api.igdb.com/v4/games';

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports.getGameData = function(search) {
    return new Promise((resolve, reject) => {
        client
            .fields("*")
            .search(search)
            .request(gameEndpoint)
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    })
}