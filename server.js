let express = require('express');
let request = require('request');
const bodyParser = require('body-parser');
let querystring = require('querystring');
let cookieParser = require('cookie-parser');


let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let PORT = process.env.PORT || 8888;

let client_id = 'cf9e84bb332e4eb0b1de14191844a9c9'; // Your client id
let client_secret = 'e63cc432563b46148801f9608f981277'; // Your secret
let redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri


let lastfm_client_id = '9ad53d8a277ac7f394e209944c6fc2fc',


let generateRandomString = function(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.use('/', express.static('./public'));

app.use(cookieParser());

let stateKey = 'spotifyState';

app.get('/login', function (req, res) {

    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    let scope = "user-read-currently-playing";
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state,
            show_dialog: true
        }));
});

app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/disconnect' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                let accessToken = body.access_token,
                    refreshToken = body.refresh_token;

                let options = {
                    url: 'https://api.spotify.com/v1/me/player/currently-playing',
                    headers: { 'Authorization': 'Bearer ' + accessToken },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    console.log(body);
                    res.redirect('http://localhost:8888/home.html?' +
                        querystring.stringify({
                            access: refreshToken
                        })
                    );
                });


            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.post('/reload', function(req, res) {

    // requesting access token from refresh token
    let refresh_token = req.cookies ? req.cookies['access'] : null;
    console.log(refresh_token);
    if (!refresh_token) {
        res.redirect('/');
    }
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            let accessToken = body.access_token;

            let options = {
                url: 'https://api.spotify.com/v1/me/player/currently-playing',
                headers: { 'Authorization': 'Bearer ' + accessToken },
                json: true
            };

            request.get(options, function(error, response, body) {
                res.send(body);
            });
        }
    });
});


app.get('/suggest', function (req, res) {
    let songName = req.query.song.trim();
    let artistName = req.query.artistName.trim();
    console.log(artistName, songName);
    let url = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&' +
        querystring.stringify({
            artist: artistName,
            track: songName,
            autocorrect: 1,
            limit: 3,
            api_key: lastfm_client_id,
            format: 'json'
        });
    console.log(url);
    request.get(url, function (error, response, body) {
        console.log(body);
        res.send(body);
    });
});

app.listen(PORT, function () {
    console.log("server is listening at port" + PORT);
});