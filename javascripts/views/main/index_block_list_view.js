MainIndexBlockListView = Backbone.View.extend({
    events: {
    },

    initialize: function () {
        this.listenTo(this.collection, 'add', this.renderBlock);
    },

    renderBlock: function (block) {
        var block_view = new MainIndexBlockView({
            tagName: 'li',
            className: 'flash',
            model: block
        });

        this.$el.prepend(block_view.el);
    }
});
