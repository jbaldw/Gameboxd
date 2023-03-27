function getGameData(gameId) {
    axios.get('/gameData', {params: {gameId: gameId}}) 
    .then((response) => {
        console.log(response);
    })
    .catch((err) => {
        console.log(err);
    });
}
