require('dotenv').config();

const igdb = require('igdb-api-node').default;

const gameEndpoint = 'https://api.igdb.com/v4/games';
const coverEndpoint = 'https://api.igdb.com/v4/covers';

function generateIds(ids) {
    return "id = (" + ids + ");";
}

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports.getGameData = function(search) {
    return new Promise((resolve, reject) => {
        client
            .fields("cover")
            .search(search)
            .limit(25)
            .request(gameEndpoint)
            .then((response) => {
                const coverIds = [];

                for (let data of response.data) {
                    if("cover" in data) {
                        coverIds.push(data.cover);
                    }
                }

                return coverIds;
            })
            .then((coverIds) => {
                client
                    .fields(['url', 'game'])
                    .where(generateIds(coverIds))
                    .limit(25)
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
}