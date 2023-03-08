require('dotenv').config();

const igdb = require('igdb-api-node').default;

const gameEndpoint = 'https://api.igdb.com/v4/games';
const coverEndpoint = 'https://api.igdb.com/v4/covers'
const rawQueryString = 'fields *;';
const gameIds = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009];


function generateIds(ids) {
    return "id = (" + ids + ");";
}

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports = new Promise((resolve, reject) => {
    const query = client
        .fields("cover")
        .where(generateIds(gameIds))
        .request(gameEndpoint)
        .then((response) => {
            const coverIds = [];

            for (let data of response.data) {
                coverIds.push(data.cover);
            }

            return coverIds;
        })
        .then((coverIds) => {
            client
                .fields("url")
                .where(generateIds(coverIds))
                .request(coverEndpoint)
                .then((response) => {
                    const urls = [];

                    for (let data of response.data) {
                        urls.push(data.url.substring(2).replace("t_thumb", "t_cover_big"));
                    }

                    resolve(urls);
                });
        })
        .catch((err) => {
            console.log(err);
        });
});




