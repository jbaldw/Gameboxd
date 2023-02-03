const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send('Welcome to Gameboxd');
});

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});