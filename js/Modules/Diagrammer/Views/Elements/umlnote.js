define(['marionette', './../umldiagram'],
    function(Marionette, diagram) {
        var ClassView = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-note grElement">\
                        <a id="name" class="editablefield Name"><%= name %></a>\
                        <img src="./images/corner.png" class="us-note-corner"></div>')
        });
        return ClassView;
});

