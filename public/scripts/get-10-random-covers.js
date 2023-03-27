axios.get('/randomTen')
    .then((response) => {
        const gallery = $("#gallery-home");

        let galleryRow = $('<div class="gallery-row"></div>');

        for(let i = 0; i < response.data.length; i++) {
            let galleryItem;

            if(i % 4 == 0) {
                galleryRow = $('<div class="gallery-row"></div>');
                gallery.append(galleryRow);
            }

            galleryItem = $('<div class="gallery-item" id=' + response.data[i].gameId 
                            + '><a href="/game?gameId=' + response.data[i].gameId + '" style="display:block; width:100%; height:100%;"></a></div>');

            galleryItem.css({'background-image': 'url(https://' + response.data[i].url + ')',
                             'background-repeat': 'no-repeat'});

            galleryRow.append(galleryItem);
        }
    })
    .catch((err) => {
        console.log(err);
    });

