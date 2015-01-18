var http = require('http'),
    fs = require('fs');




http.createServer(function (req, resp) {
    // Regular expression will remove trailing '/' and also query portion of URL, then convert to lowercase
    var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    switch (path) {
            case '':
                resp.writeHead(200, { 'content-type' : 'text/plain' });
                resp.end('Homepage');
                break;
            
            case '/about':
                resp.writeHead(200, { 'content-type' : 'text/plain' });
                resp.end('About');
                break;
            
            default:
                resp.writeHead(404, { 'content-type' : 'text/plain'});
                resp.end('Not Found');
                break;
    }
}).listen(3001);

console.log('Server started on localhost:3001...');
