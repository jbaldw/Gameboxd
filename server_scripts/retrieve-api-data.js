require('dotenv').config();

const igdb = require('igdb-api-node').default;

const endpoint = 'https://api.igdb.com/v4/';
const rawQueryString = 'fields *;';

function generateIds(ids) {
    return "id = (" + ids + ");";
}

const client = igdb(process.env.CLIENT_ID, process.env.AUTHORIZATION);

module.exports.getApiData = function(ids, fields, dynamicEndpoint) {
    return new Promise((resolve, reject) => {
        client
            .fields(fields)
            .where(generateIds(ids))
            .request(endpoint + dynamicEndpoint)
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    })
}