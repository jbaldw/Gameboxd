require('dotenv').config();

const igdb = require('igdb-api-node').default;

const gameEndpoint = 'https://api.igdb.com/v4/';

function generateIds(ids) {
    return "id = (" + ids + ")";
}

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports.getGameData = function(ids, fields, endpoint, limit = 10, search = "") {
    if(search == "") {
        return new Promise((resolve, reject) => {
            client
                .fields(fields)
                .where(generateIds(ids))
                .limit(limit)
                .request(gameEndpoint + endpoint)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        })
    }
    else {
        return new Promise((resolve, reject) => {
            client
                .fields(fields)
                .search(search)
                .limit(limit)
                .search(search)
                .request(gameEndpoint + endpoint)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        })
    }
}