BlockCollection = Backbone.Collection.extend({
    model: Block,

    comparator: 'height'
});