$(document).on('ready', function () {
    var blockchain_io = io.connect(document.domain);

    blockchain_io.on('data', function (data) {
        console.log(data);
    });
});