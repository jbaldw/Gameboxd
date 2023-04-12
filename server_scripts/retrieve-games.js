require('dotenv').config();

const igdb = require('igdb-api-node').default;

const gameEndpoint = 'https://api.igdb.com/v4/games';
const coverEndpoint = 'https://api.igdb.com/v4/covers'
const rawQueryString = 'fields *;';
const gameIds = Array(10).fill().map(() => Math.trunc(9999 * Math.random()));

function generateIds(ids) {
    return "id = (" + ids + ");";
}

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports = new Promise((resolve, reject) => {
    client
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
                .fields(['url', 'game'])
                .where(generateIds(coverIds))
                .request(coverEndpoint)
                .then((response) => {
                    const urls = [];
                    const games = []

                    for (let data of response.data) {
                        urls.push(data.url.substring(2).replace("t_thumb", "t_cover_big"));
                        games.push(data.game)
                    }

                    const coversAndUrls = []

                    for (let i = 0; i < coverIds.length; i++) {
                        coversAndUrls.push({"gameId" : games[i], "url" : urls[i]});
                    }

                    resolve(coversAndUrls);
                });
        })
        .catch((err) => {
            console.log(err);
        });
});




