const path = require("path");
const fs = require("fs");

module.exports = {
    createPlaylist: function (playlistName, numberOfTracks) {
        //Should get token
        token = "BQCOkhQGeFABbJg5UGzSdSj_VkbUY3z-1FbFnH6pQMxg---rAFrKqyfjGy94bkgm99kF37Y8w8POhpUk29XeWgjk-R1G-fTUDqbX9WoHJr7ni-13IYYWIo7J4J3xRi1MHxgLh1i7kv_0_DiTjrdlADO4V7MUJFjLMAHkHiAUhmQdyjOtN7Nav2L34HTkzTfmDOab_9mtofrmLdBI5O9K5FsVlL9UWqPETJquiXV-GL0aL1qpUrvl-vKKlBKt086TOzbglekujsmRpg"

        APIController.createPlaylist(token, playlistName).then(function(playlistId) {
            APIController.getRandomSongs(token, numberOfTracks).then(function(random_songs) {
                console.log("hola")
                fillSongsReply = APIController.addSongs(token, playlistId, random_songs);
            });
        });
        return true
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

    const _getRandomSongs = async (token, numberOfTracks) => {

        song_list = []

        for(let i = 0; i < numberOfTracks; i++) {
            song = await getRandomSongName()

            url = `https://api.spotify.com/v1/search?q=${song}&type=track`
            console.log("Progres: " + (100*i/numberOfTracks).toString() + "%")
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
        getRandomSongs(token, numberOfTracks) {
            return _getRandomSongs(token, numberOfTracks);
        }
    }
})();
