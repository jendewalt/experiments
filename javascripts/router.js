Router = Backbone.Router.extend({
    routes: {
        'experiments': 'mainIndex'
    },

    mainIndex: function () {
        this.currentView = new MainIndexView({ el: 'section' });
    }
});
