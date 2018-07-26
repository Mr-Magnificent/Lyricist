let artist;
let songName;

$(document).ready(function () {
    (function(){
        let url = new URL(window.location.href);
        let access = url.searchParams.get('access');
        document.cookie = `access=${access}`;
        $('#beforeGetSuggestion').show();
        $('#afterGetSuggestion').hide();
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
                artist = data.item.artists[0].name;
                songName = (data.item.name).split(/[(\-\[]/);
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
            $('#lyricsDiv').text(data.lyrics);
        },
        dataType: 'json'
    });
}

function getSimilarSongs() {
    $.ajax ({
        url: '/suggest',
        method: 'get',
        data: {artistName: artist, song: songName},
        success: function (data) {
            /*return the list of similar songs
            * get the xtemplate for similar song and fill the data
            * show/hide*/
            console.log(data);
            data = JSON.parse(data);
            $('#beforeGetSuggestion').hide();
            $('#afterGetSuggestion').show(function () {
                let suggestSong = document.getElementById('suggest-songs-inner').innerHTML;
                console.log(suggestSong);
                let template = Handlebars.compile(suggestSong),
                    songSuggestion = document.getElementById('afterGetSuggestion');
                songSuggestion.innerHTML = template(data);
            });

        }
    })
}

let delete_cookie = function(name) {

};

function logout() {
    document.cookie = `access=noval`;
    window.location.href = "/";
}

function changeTheme() {
    let lyricSection = $('#lyricSection');
    let currentTheme = lyricSection.css("background-color");
    console.log(currentTheme);
    if (currentTheme === 'rgb(25, 20, 20)') {
        lyricSection.css("background-color", 'white');
        $('#lyricsDiv').css('color', 'black');
    }
    else {
        lyricSection.css("background-color", '#191414');
        $('#lyricsDiv').css('color', 'white');
    }
}