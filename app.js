var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, { log: false });
var _ = require('underscore');
var request = require('request');

if (app.get('env') === 'production') {
    app.set('ipaddr', '0.0.0.0');
} else {
    app.set('ipaddr', '127.0.0.1');
}

app.set('port', 8888);
app.set('view engine', 'ejs');
app.enable('strict routing');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static('public', __dirname + '/public'));

app.get('/', function (req, res) {
    res.render('main');
});

// if path/ falls through, remove mistaken trailing slash
app.use(function (req, res, next) {
    if (req.path.substr(-1) === '/' && req.path.length > 1) {
        var query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});

server.listen(app.get('port'), app.get('ipaddr'), function () {
    console.log('Serving ' + app.get('ipaddr') + ':' + app.get('port') + ' in ' + app.get('env') + ' mode');
});

var data_cache;

io.sockets.on('connection', function (socket) {
    if (data_cache != undefined) {
        emitData(data_cache);        
    } else {
        queryBlockchainApi(emitData);        
    }
});

setInterval(function () {
    queryBlockchainApi(emitData);
}, 6000);

function emitData(data) {
    io.sockets.emit('data', data);
}

function queryBlockchainApi(callback) {
    var request_options = {
        url: 'https://blockchain.info/blocks',
        qs: { format: 'json' },
        json: true
    };

    request(request_options, function (error, response, data) {
        if (!error && response.statusCode === 200) {
            callback(data);
        }
    });
}
