$(document).on('ready', function () {
    var blockchain_io = io.connect(document.domain);
    var graph_width = 800;
    var graph_height = 300;
    var graph;

    blockchain_io.on('data', function (data) {
        setCoordinates(data.blocks);
    });

    function setCoordinates(blocks) {
        var coordinates = [];
        var time_offset = blocks[blocks.length -1].time;
        var scale = graph_width / blocks[0].time - time_offset;

        _.each(blocks, function (block) {
            block.normalized_time = block.time - time_offset;
            block.x = block.normalized_time * scale;
            block.y =  graph_height;

            coordinates.push( { x: block.x, y: block.y } );
        });

        if (graph == undefined) {
            graph = new Rickshaw.Graph({
                element: document.querySelector("#chart"),
                renderer: 'scatterplot',
                stroke: true,
                height: graph_height,
                width: graph_width,
                series: [{
                    data: coordinates,
                    color: 'steelblue'
                }]
            });
        } else {
            graph.series.data = coordinates;
        }

        graph.render();
    }

});