<?php
    $my_open_weather_key = getenv('key_openweather');
    $BASE_URL = 'api.openweathermap.org/data/2.5/weather'; // Setup base url
    $request = $BASE_URL . '?lat=' . $_GET['lat'] . '&lon=' . $_GET['lon'] . '&appid=' . $my_open_weather_key . '&mode=xml'; // Add parameters
    $conn = curl_init($request); // Open request and set params
    curl_setopt($conn, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($conn); // Send request and get response
    curl_close($conn);

    $responseXML=simplexml_load_string($response) // Convert string to xml object
        or die("----error: converting to xml object failed"); // Handle potential error

    header('Content-type: text/xml');
    echo $responseXML->asXML(); // Set appropriate xml header and return xml back through responseXML
?>