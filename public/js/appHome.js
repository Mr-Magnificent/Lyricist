let artist;
let songName;
let reloadCount = 0;

$(document).ready(function () {
    (function () {
        let url = new URL(window.location.href);
        let access = url.searchParams.get('access');
        document.cookie = `access=${access}`;
        // $('#lyricsFetchError').hide();
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
                songName = (data.item.name).split(/[\-\[]/);
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
            $('#lyricsFetchError').hide();
            $('#lyricsDiv').text(data.lyrics);
            reloadCount = 0;
        },
        error: function () {
            $('#lyricsDiv').text('');
            $('#lyricsFetchError').show();
            reloadCount += 1;
        },
        dataType: 'json'
    });
}

function getSimilarSongs() {
    $.ajax({
        url: '/suggest',
        method: 'get',
        data: {
            artistName: artist,
            song: songName
        },
        success: function (data) {
            /*return the list of similar songs
             * get the xtemplate for similar song and fill the data
             * show/hide*/
            console.log(data);
            data = JSON.parse(data);
            let suggestSong = document.getElementById('suggest-songs-inner').innerHTML;
            let template = Handlebars.compile(suggestSong);
            let songSuggestion = document.getElementById('afterGetSuggestion');
            setTimeout(function () {
                $('#beforeGetSuggestion').hide();
                songSuggestion.innerHTML = template(data);
                $('#afterGetSuggestion').show(function () {});
            }, 500);

        }
    })
}

let delete_cookie = function (name) {

};

function logout() {
    document.cookie = `access=noval`;
    window.location.href = "/";
}

function changeTheme() {
    let lyricSection = $('#lyricSection');
    let lyricFetchError = $('#lyricsFetchError');
    let currentTheme = lyricSection.css("background-color");
    console.log(currentTheme);
    if (currentTheme === 'rgb(25, 20, 20)') {
        lyricSection.css("background-color", 'white');
        $('#lyricsDiv').css('color', 'black');
        lyricFetchError.css('color', 'black');
    } else {
        lyricSection.css("background-color", '#191414');
        $('#lyricsDiv').css('color', 'white');
        lyricFetchError.css('color', 'white');
    }
}

function increaseFont() {
    let lyricsDiv = $('#lyricsDiv');
    let currentFontSize = lyricsDiv.css('font-size');
    currentFontSize = parseInt(currentFontSize) + 2;
    if (currentFontSize < 28) {
        lyricsDiv.css('font-size', `${currentFontSize}px`);
    }
}

function decreaseFont() {
    let lyricsDiv = $('#lyricsDiv');
    let currentFontSize = lyricsDiv.css('font-size');
    currentFontSize = parseInt(currentFontSize) - 2;
    if (currentFontSize > 14) {
        lyricsDiv.css('font-size', `${currentFontSize}px`);
    }
}

function reloadLyrics() {
    $('#beforeGetSuggestion').show();
    $("#lyricsFetchError").hide();
    $('#afterGetSuggestion').hide();
    if (reloadCount < 2) {
        retriveSongMeta();
    } else {
        /*show the option to search google
         * hide the option otherwise*/
        $('#lyricsDiv').text(" ");
        $('#lyricsFetchError').show();
        retriveSongMeta();
    }
}

function googleSongLyrics() {
    let tempSongName = songName.replace(/ /g, "+");
    let tempArtist = artist.replace(/ /g, "+");
    window.open(`http://www.google.com/search?q=${tempSongName}+${tempArtist}+lyrics`, "_blank");
}