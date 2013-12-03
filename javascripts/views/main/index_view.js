MainIndexView = Backbone.View.extend({
    events: {
    },

    initialize: function () {
        var blockchain_io = io.connect(document.domain + '/experiments', {resource: 'experiments/socket.io'});

        this.render();

        this.collection = new BlockCollection();

        this.main_index_block_list_view = new MainIndexBlockListView({
            el: '#block_list',
            collection: this.collection
        });

        blockchain_io.on('data', $.proxy(function (data) {
            this.collection.reset(data);
        }, this));

        blockchain_io.on('stream', $.proxy(function (data) {
            this.collection.set(data);
        }, this));
    },

    render: function () {
        this.$el.html(render('main/index'));
    }
});
