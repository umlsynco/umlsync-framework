define(['marionette', '../Models/umlclass'],
    function(Marionette, classModel) {
        var ClassView = Backbone.Marionette.ItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-class grElement">\
                                    <div class="us-class-header">\
                                        <a id="name" class="editablefield us-class-name"><%= name %></a><br>\
                                        <a id="aux" class="us-class-aux"><%= getAux() %></a>\
                                    </div>\
                                    <div class="us-class-attributes"><ul class="us-sortable"><%= getMethods() %></ul></div>\
                                    <div class="us-class-operations us-element-resizable-area"><ul class="us-sortable"><%= getFields() %></ul></div>\
                                  </div>'),
            helperMethods: {
                getAux: function() { return ""},
                getMethods: function() {return ""},
                getFields: function() {return ""}
            },
            behaviors: {
                ElementBehavior: {
                    // TODO: extend with sortable behavior
                }
            },
            triggers : {
                "click editable": "edit"
            }
        });
        return ClassView;
    });

