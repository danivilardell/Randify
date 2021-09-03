const express = require('express')
var bodyParser = require('body-parser')
const tools = require('./scripts/random_playlist')
const test = require('./scripts/try_function')
const expressLayouts = require('express-ejs-layouts')

const app = express()
const port = 5002

var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.use(express.static('public'))

app.use(expressLayouts)
app.set('layout', './layout/full-width')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
    res.render('index', { title: 'Home Page'})
})

app.listen(port, () => console.info(`App listening on port http://localhost:${port}`))

app.post('', urlencodedParser, function(req, res){
    tools.createPlaylist(req.body["playlistName"])
});