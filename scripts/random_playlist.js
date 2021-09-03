const path = require("path");
const fs = require("fs");

module.exports = {
    createPlaylist: function (playlistName) {
        //Should get token
        token = "BQAHi8p5XsHe1B45T-bD5YaSOVTshiH9BSND9W9Y5ly1VLoWWJtwtqrWiNwUIx7dvWrUA5Q3J_ujZYptEbHSRs3QxLuUlUmjSO_wlb-IkUt2LKl7KJv3dPQLTi0tabIlkeKI19gbhN8X3xsXqk2dn6DzlhbZLfBxHQsxmtm7v86U02X2lahDbt7am9lSUVqwRbF2dmpCPGWwnnjbqKA2oOSek9sd-gXtHPxUDpqPLmnsICFZ_gJA4LxlGnxqtgIlXuECi_qcIqevVw"

        APIController.createPlaylist(token, playlistName).then(function(playlistId) {
            playlistId = "4zhP7jRX8sTOX3RC7yugJC"
            APIController.getRandomSongs(token).then(function(random_songs) {
                fillSongsReply = APIController.addSongs(token, playlistId, random_songs);
            });
        });
    },
};

const APIController = (function() {

    var request = require('request');
    const clientId = '79c44a0da28d4910b83ef6d90be9d165';
    const clientSecret = 'a936aff9b2a54837bae8eac4385cabad';
    //const scope = 'playlist-modify-private playlist-read-public playlist-modify-public playlist-read-collaborative';

    //Todo: not yet implemented
    const _getToken = async () => {

        redirect_uri = "https://danivilardell.media"
        scopes = 'playlist-modify-public playlist-modify-private'

        url = 'https://accounts.spotify.com/authorize' + '?response_type=code' + '&client_id=' + clientId + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') + '&redirect_uri=' + encodeURIComponent(redirect_uri);

        const result = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            }
        });

        const data = await result.json();
        return data.access_token;
    }


    const _createPlaylist = async (token, playlistName) => {

        return new Promise(function (resolve, reject) {
            request.post({
                headers: {'Authorization': 'Bearer ' + token},
                url: 'https://api.spotify.com/v1/users/6y4mnpemg8j0m4u99b8uf0j0o/playlists',
                body: JSON.stringify({"name": playlistName, "description": "Aixo es una proba", "public": false}),
            }, function (error, response, body) {
                resolve(JSON.parse(body)["id"]);
            });
        });

    }

    const _getRandomSongs = async (token) => {

        song_list = []
        numberOfSongs = 100
        for(let i = 0; i < numberOfSongs; i++) {
            song = await getRandomSongName()

            url = `https://api.spotify.com/v1/search?q=${song}&type=track`
            //url = `https://api.spotify.com/v1/search?q=Muse&type=track`
            console.log("Progres: " + (100*i/numberOfSongs).toString() + "%")
            song_id = await getSong(url, token)
            if(song_id != null) {
                song_list.push(song_id)
            } else {
                i = i - 1
            }
        }

        return song_list
    }

    const _addSongs = async (token, playlistId, randomSongs) => {

        url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`

        snapshot_id = await postAddSongs(url, token, randomSongs)

        return snapshot_id

    }

    function getSong(url, token) {
        return new Promise(function (resolve, reject) {
            request.get({
                headers: { 'Authorization' : 'Bearer ' + token},
                url: url,
            }, function (error, response, body) {
                try {
                    song_uri = JSON.parse(body).tracks.items[0].uri
                    resolve(song_uri);
                } catch {

                    resolve(null);
                }
            });
        });
    }

    function postAddSongs(url, token, randomSongs) {
        return new Promise(function (resolve, reject) {
            request.post({
                headers: {'Authorization': 'Bearer ' + token},
                url: url,
                body: JSON.stringify({"uris": randomSongs}),
            }, function (error, response, body) {
                resolve(JSON.parse(body)["snapshot_id"]);
            });
        });
    }

    function getRandomSongName() {
        var path = require('path');

        first_letter = "ab"
        second_letter = "abcdefghijklmnopqrstuvwxyz"

        fileNum = Math.floor(Math.random() * 29);
        ending = first_letter[parseInt(fileNum/26, 10)] + second_letter[fileNum%26]

        var filePath = path.join(__dirname, '..', 'song_database','songs' + ending + '.txt');

        return readFile(filePath)
    }

    function readFile(filePath) {
        return new Promise(function (resolve, reject) {
            const fs = require('fs')
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                data = data.split(/\r?\n/)
                row = Math.floor(Math.random() * data.length);
                resolve(data[row])
            })
        })
    }

    return {
        getToken() {
            return _getToken();
        },
        createPlaylist(token, playlistName) {
            return _createPlaylist(token, playlistName);
        },
        addSongs(token, playlistId, randomSongs) {
            return _addSongs(token, playlistId, randomSongs);
        },
        getRandomSongs(token, playlistId) {
            return _getRandomSongs(token);
        }
    }
})();
