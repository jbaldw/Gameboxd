const express = require('express');
const home = require('./routes/home-route');
const app = express();
const port = 8080;

app.use('/', home);

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});