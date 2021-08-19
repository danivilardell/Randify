const APIController = (function() {
    
    const clientId = '79c44a0da28d4910b83ef6d90be9d165';
    const clientSecret = 'a936aff9b2a54837bae8eac4385cabad';
    const redirectUri = 'redirect_uri=https%3A%2F%2Fdanivilardell.media';
    const scope = 'playlist-modify-private playlist-read-public playlist-modify-public playlist-read-collaborative';
    const countries = ["AF", "AX", "AL", "DZ", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "KH", "CM", "CA", "CV", "KY", "CF", "TD", "CL", "CN", "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "ET", "FK", "FO", "FJ", "FI", "FR", "PF", "TF", "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MK", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "ES", "LK", "SD", "SR", "SZ", "SE", "CH", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VE", "VN", "WF", "EH", "YE", "ZM", "ZW"]

    function getRandomSearch() {
      // A list of all characters that can be chosen.
      const characters = 'abcdefghijklmnopqrstuvwxyz';
      
      // Gets a random character from the characters string.
      const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
      let randomSearch = '';

      // Places the wildcard character at the beginning, or both beginning and end, randomly.
      switch (Math.round(Math.random())) {
        case 0:
          randomSearch = randomCharacter + '%25';
          break;
        case 1:
          randomSearch = '%25' + randomCharacter + '%25';
          break;
      }

      return randomSearch;
    }

    function getRandomMarket() {
        return countries[Math.floor(Math.random() * countries.length)]
    }

    const _getRandomSongs = async (token) => {

        

        song_list = []

        for(let i = 0; i < 20; i++) {
            try {
                randomSearch = getRandomSearch()
                randomOffset = Math.floor(Math.random() * 990);
                console.log(randomSearch)

                url = `https://api.spotify.com/v1/search?q=${randomSearch}&type=track&offset=${randomOffset}&market=${getRandomMarket()}`

                const result = await fetch(url, {
                    method: 'GET',
                    headers: { 'Authorization' : 'Bearer ' + token},
                });

                const data = await result.json();
                song_id = data.tracks.items[Math.floor(Math.random() * 19)].uri
                console.log(song_id)
                song_list.push(song_id)
            } catch(error) {
                i = i - 1
            }
        }  

        console.log(song_list)

        return song_list
    }

    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _createPlaylist = async (token, playlistName) => {

        bearerCreate = token

        const result = await fetch(`https://api.spotify.com/v1/users/6y4mnpemg8j0m4u99b8uf0j0o/playlists`, {
            method: 'POST',
            headers: { 'Authorization' : 'Bearer ' + bearerCreate},
            body: JSON.stringify({"name": playlistName, "description": "Aixo es una proba", "public": false}),
            json: true
        });

        const data = await result.json();
        console.log(data)
        return data.id;

    }

    const _addSongs = async (token, playlistId, randomSongs) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: { 'Authorization' : 'Bearer ' + token, 'Content-Type' : 'application/json'},
            path: {'playlist_id' : playlistId},
            body: JSON.stringify({"uris": randomSongs}),
            json: true
        });

        const data = await result.json();
        console.log(data)
        return data.snapshot_id;

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


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        buttonSubmit: '#btn_submit',
        hfToken: '#hidden_token'
    }

    //public methods
    return {

        //method to get input fields
        inputField() {
            return {
                submit: document.querySelector(DOMElements.buttonSubmit)
            }
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();
     

    // create submit button click event listener
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();

        token = "BQAeOFx8sdoHzx9pxHlgD3CDCUYCtKNupx6e07RJhSFfsCqQNX2AsOtqm92EpTOdo5h0fckVt4BZbx8c5zYd4zbDGmCoCLBjtn2CQwPxuZC1gdljhmj1He5ryLjoJ-npF_cf8mC7dDtwP11AQzWm2Ny-3bSG3iRjzVFwkL736CtybFubs6AkiZbXLf4EqcmOABz_emAUuuryV8nDABKebS9OSb6bHMsV1Yl14pgPjJyuvgcINeQbCDWsNvmDEv96QUGEvairPzzR8Q"

        APICtrl.createPlaylist(token, document.getElementById("playlistName").value).then(function(playlistId) {
            APICtrl.getRandomSongs(token).then(function(random_songs) {
                console.log(random_songs)
                fillSongsReply = APICtrl.addSongs(token, playlistId, random_songs);
            });
        });
        
    });

    return {
        init() {
            console.log('App is starting');
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();

