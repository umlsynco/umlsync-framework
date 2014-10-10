define(['marionette', './../umldiagram'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-package">' +
                '<div class="us-package-tab grElement"></div>' +
                '<div class="us-package-body grElement">' +
                    '<a tabindex="1" id="name" class="editablefield"><%= name %></a>' +
                '</div></div>')
        });
        return View;
    });


