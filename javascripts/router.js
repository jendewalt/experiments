Router = Backbone.Router.extend({
    routes: {
        '': 'mainIndex'
    },

    mainIndex: function () {
        this.currentView = new MainIndexView({ el: 'section' });
    }
});
