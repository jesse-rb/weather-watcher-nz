//
// Perform an async ajax request and get xml data
// params: post or get (method), script to execute (url), data to pass if method is post (data), method to execute afterwards (callback)
//
function ajaxWithXmlRes(method, url, data, callback) {
    let req = new XMLHttpRequest();
    req.open(method, url, true); // Open request

    if (method == 'POST') {
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // Set content header if method is POST
    }

    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) { // Check if  the request finished successfully
                let res = req.responseXML; // Get xml response
                callback(res) // Request was successful so execute callback function
            } else {
                console.log('AJAX ERROR');
            }
        }
    }

    req.send(data); // Send request
}