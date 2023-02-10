const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendfile(__dirname + '../views/home.html');
});

module.exports = router;