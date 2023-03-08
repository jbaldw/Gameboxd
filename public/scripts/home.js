axios.get('/recentTen')
    .then((response) => {
        const gallery = $("#gallery-home");

        let galleryRow = $('<div class="gallery-row"></div>');

        for(let i = 0; i < response.data.length; i++) {
            let galleryItem;

            if(i % 4 == 0) {
                galleryRow = $('<div class="gallery-row"></div>');
                gallery.append(galleryRow);
            }

            galleryItem = $('<div class="gallery-item"></div>');

            galleryItem.css({'background-image': 'url(https://' + response.data[i] + ')',
                             'background-repeat': 'no-repeat'});

            galleryRow.append(galleryItem);
        }
    });

