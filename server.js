const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send('<img src="https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/02/4cbe8d_f1ed2800a49649848102c68fc5a66e53mv2.gif?resize=476%2C280&ssl=1"></img>');
});

app.get('/jupyter', (req, res) => {
    res.sendFile(__dirname + '/Jupyter.html');
});

app.listen(port, () => {
    console.log(`Application listening on Port ${port}`);
});