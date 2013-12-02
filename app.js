var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, {resource: '/experiments/socket.io', log: false });
var WebSocket = require('ws');
var ws = new WebSocket('ws://ws.blockchain.info/inv');
var _ = require('underscore');
var request = require('request');
var path = require('path');
var wrench = require('wrench');
var compressor = require('node-minify');
var sass = require('node-sass');
var ejs = require('ejs');
var fs = require('graceful-fs');
var assets_config = JSON.parse(fs.readFileSync('config/client.json'));

if (app.get('env') === 'production') {
    app.set('ipaddr', '0.0.0.0');

    createJstSync('javascripts/templates');

    var js_files = getJavascriptFiles(assets_config.js_files);

    minifyJavascriptFiles(js_files);

    var compiled_css = sass.renderSync({ file: 'css/blockchain.scss' });

    fs.writeFileSync('experiments/css/blockchain.css', compiled_css);
    fs.createReadStream('css/reset.css').pipe(fs.createWriteStream('experiments/css/reset.css'));
} else {
    app.set('ipaddr', '127.0.0.1');
}

app.set('port', 8888);
app.set('view engine', 'ejs');
app.enable('strict routing');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static('experiments', __dirname + '/public'));

app.get('/experiments', function (req, res) {
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

function attachHandlers (obj) {
    obj.on('open', function() {
        obj.send('{"op":"blocks_sub"}');
    });
    obj.on('message', mergeWithDataCache);
    obj.on('close', function () {
        delete ws;
        ws = new WebSocket('ws://ws.blockchain.info/inv');
        attachHandlers(ws);
    });
}

attachHandlers(ws);

var data_cache = [];
var block_list = [];

queryBlockchainApi(formBlockList);

var experiments_io = io.of('/experiments').on('connection', function (socket) {
    if (data_cache.length === 50) {
        emitData(data_cache);        
    }
});

function dateInMilliseconds(days_ago) {    
    var one_day = 86400000;
    var date_offset = 2710225;

    return Math.floor(new Date().getTime() / one_day) * one_day + date_offset - days_ago * one_day;
}

function emitData(data) {
    experiments_io.emit('data', data);
}

function queryBlockchainApi(callback, days_ago) {
    days_ago = days_ago || 0;
    var request_options = {
        url: 'https://blockchain.info/blocks/' + String(dateInMilliseconds(days_ago)),
        qs: { format: 'json' },
        json: true
    };

    request(request_options, function (error, response, data) {
        if (!error && response.statusCode === 200) {
            callback(data, days_ago);
        } else {
            setTimeout(function () {
                queryBlockchainApi(callback, days_ago);
            }, 1000);
        }
    });
}

function formBlockList(data, days_ago) {
    block_list = block_list.concat(data.blocks);
    if (block_list.length < 50) {
        queryBlockchainApi(formBlockList, days_ago + 1);
    } else {
        block_list = block_list.slice(0, 50);
        getAllBlockDetails();
    }
}

function getAllBlockDetails() {
    _.each(block_list, function (block) {
        queryBlockDetails(block.hash, formDataCache);
    });
}

function queryBlockDetails(hash, callback) {
    var request_options = {
        url: 'https://blockchain.info/rawblock/' + hash,
        qs: { format: 'json' },
        json: true
    };

    request(request_options, function (error, response, data) {
        if (!error && response.statusCode === 200) {
            callback(data);
        } else {
            setTimeout(function () {
                queryBlockDetails(hash, callback);
            }, 1000);
        }
    });
}

function formDataCache(data) {
    delete data.prev_block;
    delete data.main_chain;
    delete data.received_time;
    delete data.relayed_by;
    delete data.tx;

    data.time = data.time * 1000;
    data_cache.push(data);

    if (data_cache.length == 50) {

        data_cache = _.sortBy(data_cache, 'height');

        emitData(data_cache);
    }
}

function mergeWithDataCache(data, flags) {
    data = JSON.parse(data).x;

    if (!_.findWhere(data_cache, { hash: data.hash })) {
        data = {
            hash: data.hash,
            ver: data.version,
            mrkl_root: data.mrklRoot,
            time: data.time,
            bits: data.bits,
            nonce: data.nonce,
            n_tx: data.nTx,
            size: data.size,
            block_index: data.blockIndex,
            height: data.height
        }
        data_cache.shift();
        data_cache.push(data);

        emitData(data_cache);
    }
}

function getJavascriptFiles(items) {
    items = items || [];
    var filterd_files;
    var js_files = [];
    _.each(items, function (item) {
        if (path.extname(item) === '.js') {
            js_files.push(item);
        } else {
            filterd_files = _.reject(wrench.readdirSyncRecursive('javascripts/' + item), function (result) { return path.extname(result) !== '.js'; });
            js_files = js_files.concat(_.map(filterd_files, function (file) { return item + '/' + file; }));
        }
    });
    return js_files;
}

function minifyJavascriptFiles(js_files) {
    js_files = _.map(js_files, function (file) { return 'javascripts/' + file; });
    var output_file = 'experiments/javascripts/application.js';
    var js_comp = new compressor.minify({
        type: 'no-compress',
        fileIn: js_files,
        fileOut: output_file,
        callback: function (err, min) {
            if (!err) {
                var js_comp = new compressor.minify({
                    type: 'uglifyjs',
                    fileIn: output_file,
                    fileOut: output_file,
                    callback: function (err, min) {} 
                });
            }
        }
    });
};

function createJstSync(dir) {
    var templates = [];
    var file = 'javascripts/system/jst.js';
    if (fs.existsSync(dir)) {
        templates = _.reject(wrench.readdirSyncRecursive(dir), function (result) { return path.extname(result) !== '.jst'; });
    }

    fs.writeFileSync(file, 'window.JST = {};\nfunction render(template, data) { return JST[template](data); }\n');
    _.each(templates, function (template) {
        var processed_file = ejs.render(fs.readFileSync(dir + '/' + template).toString());
        _.templateSettings = {
            evaluate    : /\[\[([\s\S]+?)\]\]/g,
            interpolate : /\[\[-([\s\S]+?)\]\]/g,
            escape      : /\[\[=([\s\S]+?)\]\]/g
        };
        var template_function;
        try {
            template_function = _.template(processed_file).source;
        } catch (e) {
            e.message += '\n    at ' + template + ': ??';
            console.log(e.stack);
            process.exit();
        }
        fs.appendFileSync(file, 'window.JST[' + JSON.stringify(template.replace('.jst', '')) + '] = ' + template_function + ';\n');
    });
};
