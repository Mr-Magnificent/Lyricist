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
            /*if (data => undefined : call please play a song*/
            /*call the lyrics api*/
            let artist = data.item.artists[0].name;
            let songName = (data.item.name).split(/[(\-\[]/);
            songName = songName[0];
            bringLyrics(artist, songName);
        }
    });
}

function bringLyrics(artist, songName, callback) {
    $.ajax({
        url: `https://api.lyrics.ovh/v1/${artist}/${songName}`,
        method: 'get',
        success: function (data) {
            console.log(data.lyrics);
        },
        dataType: 'json'
    });
}
