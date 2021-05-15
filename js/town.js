// Delcare global variables
var townInfoContainer = document.getElementById('town-info-container')
var recentTownsList = [];
var recentTownsContainer = document.getElementById('recent-towns-container');
var searchTownBtn = document.getElementById('search_town_btn');
var townInput = document.getElementById('town-input');

// Search for a town event listener
searchTownBtn.addEventListener('click', function() {
    searchTown(townInput.value);
});

//
// Search for a town
// params: name of town (townString)
//
function searchTown(townString) {
    url = './php/getTowns.php?townString=' + townString;
    fetch(url)
        .then(response => response.json()) // Search for the town
        .then(json => createTown(json)); // Create town object
}

//
// Isolate one of the returned towns and create town object
// params: data returned from town search (geodata)
//
function createTown(geoData) {
    results = geoData.results[0].locations; // Get locations found from search
    var nzCities = [];
    for (var i = 0; i < results.length; i++) {
        if (results[i].adminArea1 == 'NZ' && results[i].geocodeQuality == 'CITY') {
            nzCities.push(results[i]); // Get all CITIES that are in NZ from the search
        }
    }
    if (nzCities.length >= 1) {
        var otherCities = "";
        if (nzCities.length > 1) { // Let user know of really similarly named cities that were found during the search
            for (var i = 1; i < nzCities.length; i++) otherCities += '\n' + nzCities[i].adminArea5;
            alert("Found " + nzCities.length + " results and showing first one\nOther cities:\n" + otherCities);
        }
        var lat = nzCities[0].latLng.lat;
        var lon = nzCities[0].latLng.lng;
        var name = nzCities[0].adminArea5;
        for (var i = 0; i < recentTownsList.length; i++) {
            // If this town is already saved as a recent search, then just use the existing object instead.
            if (recentTownsList[i].equals(lat, lon, name)) {
                recentTownsList[i].recentSearch();
                return;
            }
        }
        // Otherwise, create new town object
        recentTownsList.push(new Town(lat, lon, name, recentTownsContainer, townInfoContainer));
    }
    // Tell user that no nz towns were found from the search
    else {
        alert("Found no results, please expand search!");
    }
}

//
// Town constructor function
// params: lat, lon and name of town (lat, lon, name) and containers for the ui (recentContainer, infoContainer)
//
function Town(lat, lon, name, recentContainer, infoContainer) {
    var _this = this;
    var _lat = lat;
    var _lon = lon;
    var _name = name;

    var _ui = {};
    // Info ui
    _ui.infoContainer = document.createElement('div');
    // Recent town ui
    _ui.recentContainer = document.createElement('div');
    _ui.recentContainer.classList.add('recent-town');
    _ui.selectBtn = document.createElement('p');
    _ui.recentContainer.appendChild(_ui.selectBtn);
    _ui.selectBtn.textContent = _name;
    _ui.selectBtn.addEventListener('click', function() {_this.recentSearch();}); // Event listener to bring up a saved recent search
    _ui.removeBtn = document.createElement('button');
    _ui.recentContainer.appendChild(_ui.removeBtn);
    _ui.removeBtn.textContent = 'delete';
    _ui.removeBtn.addEventListener('click', function() {
        _this.remove();
    })

    //
    // Bring up a saved recent search
    //
    this.recentSearch = function() {
        _this.mapView();
        _this.unDraw();
        _this.drawRecent(); // Move town back to top of recent searches
        _this.getAndDrawInfo();
    }

    //
    // Draw the recent search ui
    //
    this.drawRecent = function() {
        recentContainer.insertBefore(_ui.recentContainer, recentContainer.firstChild);
    }

    //
    // Remove the town from recent searches
    //
    this.remove = function() {
        for (var i = 0; i < recentTownsList.length; i++) {
            if (recentTownsList[i].equals(_lat, _lon, _name)) { // Check if this is the town to remove
                recentTownsList.splice(i, 1); // remove this town
                break;
            }
        }
        _this.unDraw();
    }

    //
    // Simply remove the recent search ui, not the object
    //
    this.unDraw = function() {
        recentContainer.removeChild(_ui.recentContainer);
    }
    
    //
    // Locate this town on the leaflet map
    //
    this.mapView = function() {
        map.setView([_lat, _lon], 10);
    }

    //
    // Check if this town object has equal lat, lon and name to a different one
    // params: latitude, longitude and name of the town to compare to (lat, lon, name)
    //
    this.equals = function(lat, lon, name) {
        if (_lat <= lat + 50 && _lat >= lat - 50 && _lon <= lon + 50 && _lon >= lon - 50 && _name == name) {
            return true; // Found match
        } else return false; // No match
    }

    //
    // Get weather and sunrise/sunset info and draw it
    //
    this.getAndDrawInfo = function() {
        infoContainer.innerHTML = '<h2>' + _name + '</h2>'; // Remove previous town info, if present
        _ui.infoContainer.innerHTML = ''; // Clear previous info for this town (could be outdated)
        infoContainer.appendChild(_ui.infoContainer);
        // Get sun info
        url = './php/getSunInfo.php?lat=' + _lat + '&lon=' + _lon;
        fetch(url)
            .then(response => response.json())
            .then(json => drawSunInfo(json)) // Draw sun info
            .then(function() {
                // Get weather info
                url = './php/getWeatherInfo.php?lat=' + _lat + '&lon=' + _lon;
                ajaxWithXmlRes('GET', url, '', drawWeatherInfo); // Draw weather info
            }
        );
    }

    //
    // Draw the ui for sunrise/sunset info
    // params: the sun data (sunInfoJson)
    //
    var drawSunInfo = function(sunInfoJson) {
        var d = new Date();
        var dateString = d.getUTCFullYear().toString() + '/' + (d.getUTCMonth() + 1).toString() + '/' + d.getUTCDate().toString(); // Get today's UTC date in string format
        var sunRise = new Date(dateString + ' ' + sunInfoJson.results.sunrise + ' UTC').toString(); // Get sunrise and sunset times in nzst string format
        var sunSet = new Date(dateString + ' ' + sunInfoJson.results.sunset + ' UTC').toString();
        _ui.infoContainer.innerHTML += '<div><h3>Sunrise</h3>' // Draw this info
            + '<p class="info">' + sunRise + '</p></div>'
            + '<div><h3>Sunset</h3>'
            + '<p class="info">' + sunSet + '</p></div>';
    }

    //
    // Draw the ui for weather info
    // params: the weather data (weatherInfoXml)
    //
    var drawWeatherInfo = function(weatherInfoXml) {
        var temp = weatherInfoXml.getElementsByTagName('temperature')[0];
        var kToC = 273.15; // kelvins to celcius offset
        _ui.infoContainer.innerHTML += '<div><h3>Temperature (degrees celcius)</h3>'
            + '<p class="info">current: ' + (parseFloat(temp.getAttribute('value'))-kToC).toFixed(3) + '</p>' // Draw current temperature in degrees celcius
            + '<p class="info">min: ' + (parseFloat(temp.getAttribute('min'))-kToC).toFixed(3) + '</p>' // Draw max temp in degrees celcius
            + '<p class="info">max: ' + (parseFloat(temp.getAttribute('max'))-kToC).toFixed(3) + '</p></div>' // Draw min temp in degrees celcius
            + '<div><h3>Other</h3>'
            + '<p class="info">clouds: ' + weatherInfoXml.getElementsByTagName('clouds')[0].getAttribute('name') + '</p>' // Draw clouds and wind information
            + '<p class="info">wind: ' + weatherInfoXml.getElementsByTagName('speed')[0].getAttribute('name') + ', ' + weatherInfoXml.getElementsByTagName('direction')[0].getAttribute('name') + '</p></div>';
    }

    // Construct this object's ui
    this.mapView();
    this.drawRecent();
    this.getAndDrawInfo();
}