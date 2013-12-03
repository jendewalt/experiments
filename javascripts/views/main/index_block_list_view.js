MainIndexBlockListView = Backbone.View.extend({
    events: {
    },

    initialize: function () {
        this.listenTo(this.collection, 'add', function (block) {
            this.renderBlock(block, 'flash');
        });

        this.listenTo(this.collection, 'reset', this.resetBlocks);
    },

    renderBlock: function (block, class_name) {
        class_name = class_name || 'none';
        var block_view = new MainIndexBlockView({
            tagName: 'li',
            className: class_name,
            model: block
        });

        this.$el.prepend(block_view.el);
    },

    resetBlocks: function () {
        this.$el.html('');

        this.collection.each(function (block) {
            this.renderBlock(block);
        }, this);
    }
});
