require('dotenv').config();

const igdb = require('igdb-api-node').default;

const gameEndpoint = 'https://api.igdb.com/v4/games';
const rawQueryString = 'fields *;';

function generateIds(ids) {
    return "id = (" + ids + ");";
}

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports.getGameData = function(gameId) {
    return new Promise((resolve, reject) => {
        client
            .fields("*")
            .where("id = " + gameId)
            .request(gameEndpoint)
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    })
}