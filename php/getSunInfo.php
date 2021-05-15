<?php
    $BASE_URL = 'https://api.sunrise-sunset.org/json'; // Setup base url
    $request = $BASE_URL . '?lat=' . $_GET['lat'] . '&lng=' . $_GET['lon'] . '&date=today'; // Add parameters
    $conn = curl_init($request); // Open request and set params
    curl_setopt($conn, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($conn); // Send request and get response
    curl_close($conn);

    // Return response to client
    echo($response);
?>