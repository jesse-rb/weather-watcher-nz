// Create new map
var map = new L.Map("leaflet-map-container", {
    url: "//stamen-tiles-{s}.a.ssl.fastly.net/",
    center: new L.LatLng(37.7, -122.4),
    maxZoom: 18,
    tileSize: 512
});

// Create and add new stamen layer
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
{
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
}).addTo(map);

searchTown('Hamilton'); // Set initial town