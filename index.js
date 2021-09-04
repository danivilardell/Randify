const express = require('express')
var bodyParser = require('body-parser')
const tools = require('./scripts/random_playlist')
const expressLayouts = require('express-ejs-layouts')

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false})

const app = express()
const port = process.env.PORT || 5000


app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

var client_id = '6b4b40e32fe44ea8a52b024888b838dc'; // Your client id
var client_secret = '718340c1a27848338ace4c8a38e85e72'; // Your secret
var redirect_uri = 'http://localhost:5000/create_playlist'; // Your redirect uri
//var redirect_uri = 'https://www.randify.app/create_playlist'; // Your redirect uri

var stateKey = 'spotify_auth_state';

global.playlistName = ""
global.numberOfTracks = ""

app.use(express.static('public'))

app.use(expressLayouts)
app.set('layout', './layout/full-width')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
    res.render('index', { title: 'Randify'})
})

app.get('/playlist_created', (req, res) => {
    res.render('pages/playlist_created', { title: 'Randify'})
})

app.listen(port, () => console.info(`App listening on port http://localhost:${port}`))

app.post('/login', urlencodedParser, function(req, res) {
    console.log("hola1")
    playlistName = req.body["playlistName"]
    numberOfTracks = parseInt(req.body["numberOfTracks"]) + 5

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/create_playlist', function(req, res) {
    console.log("hola2")
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
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

                var access_token = body.access_token;
                tools.createPlaylist(playlistName, numberOfTracks, access_token)

            }
        });

        res.redirect('/playlist_created');

    }
});

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};