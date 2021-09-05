const path = require("path");
const fs = require("fs");

module.exports = {
    createPlaylist: function (playlistName, numberOfTracks, token, userId) {

        APIController.createPlaylist(token, playlistName, userId).then(function(playlistId) {
            APIController.getRandomSongs(token, numberOfTracks).then(function(random_songs) {
                fillSongsReply = APIController.addSongs(token, playlistId, random_songs);
            });
        });
        return true
    },
};

const APIController = (function() {

    var request = require('request');

    const _createPlaylist = async (token, playlistName, userId) => {
        return new Promise(function (resolve, reject) {
            request.post({
                headers: {'Authorization': 'Bearer ' + token},
                url: "https://api.spotify.com/v1/users/" + userId + "/playlists",
                body: JSON.stringify({"name": playlistName, "description": "Generated by Randify.app", "public": false}),
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
        createPlaylist(token, playlistName, userId) {
            return _createPlaylist(token, playlistName, userId);
        },
        addSongs(token, playlistId, randomSongs) {
            return _addSongs(token, playlistId, randomSongs);
        },
        getRandomSongs(token, numberOfTracks) {
            return _getRandomSongs(token, numberOfTracks);
        }
    }
})();
