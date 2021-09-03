
module.exports = {
    test: function () {
        const fs = require('fs')
        var path = require('path');

        first_letter = "ab"
        second_letter = "abcdefghijklmnopqrstuvwxyz"

        fileNum = Math.floor(Math.random() * 29);
        ending = first_letter[parseInt(fileNum/26, 10)] + second_letter[fileNum%26]

        var filePath = path.join(__dirname, '..', 'song_database','songs' + ending + '.txt');

        fs.readFile( filePath, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            data = data.split(/\r?\n/)
            row = Math.floor(Math.random() * data.length);
            console.log(data[row])
        })
    },
};