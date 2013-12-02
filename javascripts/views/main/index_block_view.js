MainIndexBlockView = Backbone.View.extend({
    events: {
    },

    initialize: function () {
        this.render();
        this.listenTo(this.model, 'remove', this.remove);
    },

    render: function () {
        this.$el.html(render('main/index_block', this.model));

        setTimeout($.proxy(function () {
            this.$el.removeClass('flash');
        }, this), 2000);
    }
});
