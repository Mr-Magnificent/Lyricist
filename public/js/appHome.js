$(document).ready(function () {
    (function(){
        let url = new URL(window.location.href);
        let access = url.searchParams.get('access');
        document.cookie = `access=${access}`;
        retriveSongMeta();
    })();
});



function retriveSongMeta(callback) {
    $.ajax({
        url: '/reload',
        method: 'POST',
        success: function (data) {
            /*call the lyrics api*/
            if (!data) {
                /*if (data => undefined : call please play a song*/
                console.log("no song playing");
            } else {
                let artist = data.item.artists[0].name;
                let songName = (data.item.name).split(/[(\-\[]/);
                songName = songName[0];
                let songMeta = document.getElementById("current-song-playing").innerHTML;
                let template = Handlebars.compile(songMeta),
                currentSongMeta = document.getElementById('metadataSection');
                currentSongMeta.innerHTML = template(data);
                bringLyrics(artist, songName);
            }
        }
    });
}

function bringLyrics(artist, songName, callback) {
    $.ajax({
        url: `https://api.lyrics.ovh/v1/${artist}/${songName}`,
        method: 'get',
        success: function (data) {
            $('#lyricSection').text(data.lyrics);
        },
        dataType: 'json'
    });
}
