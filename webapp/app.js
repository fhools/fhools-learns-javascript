/* app.js */

var
    connectHello, server,
    http = require('http'),
    express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    errorHandler = require('errorhandler'),
    methodOveride = require('method-override'),
    servStatic = require('serve-static'),
    bodyText = 'Hello Connect';

app = express();
server = http.createServer(app);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(methodOveride());
app.use(servStatic('public'));

app.get('/', function (request, response) {
    response.send('Hello Express');
});

server.listen(3000);

console.log('Listening on port %d', server.address().port);
