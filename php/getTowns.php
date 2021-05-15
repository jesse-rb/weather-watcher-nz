<?php
    $my_geocoding_key = getenv('key_geocoding');
    $BASE_URL = 'http://www.mapquestapi.com/geocoding/v1/address'; // Setup base url
    $request = $BASE_URL . '?key=' . $my_geocoding_key . '&location='.$_GET['townString'].',NZ' . '&inFormat=kvp' . '&outFormat=json'; // Add parameters
    $conn = curl_init($request); // Open request and set params
    curl_setopt($conn, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($conn); // Send request and get response
    curl_close($conn);

    // Return response to client
    echo($response);
?>