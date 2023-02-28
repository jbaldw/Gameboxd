require('dotenv').config();

const igdb = require('igdb-api-node').default;

const endpoint = 'https://api.igdb.com/v4/games';
const rawQueryString = 'fields *;';

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports = new Promise((resolve, reject) => {
    const query = client.query(rawQueryString)
        .request(endpoint)
        .then((response) => {
            const games = [];

            for (let data of response.data) {
                games.push(data);
            }

            resolve(games);
        })
        .catch((err) => {
            console.log(err);
        });
});




