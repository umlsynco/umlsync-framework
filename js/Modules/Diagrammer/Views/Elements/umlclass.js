define(['marionette', './../umldiagram', 'Modules/Diagrammer/Behaviors/ListSortableBehavior', 'Modules/Diagrammer/Behaviors/EditableBehavior'],
    function(Marionette, diagram, ListSortableBehavior, EditableBehavior) {
        //
        // Operation item view
        //
        var opiv = Backbone.Marionette.ItemView.extend({
            tagName: 'li',
            template: _.template("<a class='editablefield operation'><%= name %></a>"),
            ui : {
                "editablefield" : ".editablefield"
            },
            behaviors: {
                EditableBehavior: {
                }
            }
        });

        //
        // Operation collection view
        //
        var operationsView = Backbone.Marionette.CollectionView.extend({
            childView : opiv,
            tagName: 'ul',
            behaviors: {
                ListSortableBehavior: {
                }
            }
        });

        //
        // Attribute item view
        //
        var ativ = Backbone.Marionette.ItemView.extend({
            tagName: 'li',
            template: _.template("<a class='editablefield attribute'><%= name %></a>"),
            ui : {
                "editablefield" : ".editablefield"
            },
            behaviors: {
                EditableBehavior: {
                    // Make item editable
                }
            }
        });

        //
        // Attribute collection view
        //
        var attributesView = Backbone.Marionette.CollectionView.extend({
            childView : ativ,
            tagName: 'ul',
            behaviors: {
                ListSortableBehavior: {
                }
            }
        });

        //
        // UML class element as item view
        //
        var ClassView = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-class grElement ">\
                                    <div class="us-class-header">\
                                        <span name="name"><a id="name" class="editablefield us-class-name"><%= name %></a></span><br>\
                                        <span name="aux"><a id="aux" class="editablefield us-class-aux"><%= getAux() %></a></span>\
                                    </div>\
                                    <div class="us-class-attributes" name="height_a"><ul class="us-sortable"></ul></div>\
                                    <div class="us-class-operations us-element-resizable-area" name="height_o"><ul class="us-sortable"></ul></div>\
                                    </div>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid,
                    getAux: function() { return ""},
                    getMethods: function() {return ""},
                    getFields: function() {return ""}
                }
            },
            customResize: {
              selector: '.us-class-attributes',
              handlers: 's-l'
            },
            //
            // Passthrough on mode change behavior
            // for methods and field
            //
            onModeChange: function(mode) {
              if (this.attributesView)
                this.attributesView.triggerMethod("ModeChange", mode);
              if (this.operationsView)
                this.operationsView.triggerMethod("ModeChange", mode);
            },
            onRender: function() {
                //
                // Extend element with a new fields on render
                //
                // Attributes/Fields
                //
                if (this.model.getUmlAttributes) {
                    this.attributesView = new attributesView({collection:this.model.getUmlAttributes()});
                    this.attributesView.render();
                    this.$el.find("DIV#" + this.model.cid + " div.us-class-attributes").append(this.attributesView.$el);
                }
                //
                // Operations/methods
                //
                if (this.model.getUmlOperations) {
                   this.operationsView = new operationsView({collection:this.model.getUmlOperations()});
                   this.operationsView.render();
                   this.$el.find("DIV#" + this.model.cid + " div.us-class-operations").append(this.operationsView.$el);
               }
            }
        });
        return ClassView;
    });

