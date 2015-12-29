define(['marionette', './../umldiagram', 'Modules/Diagrammer/Behaviors/ListSortableBehavior', 'Modules/Diagrammer/Behaviors/EditableBehavior'],
    function(Marionette, diagram, ListSortableBehavior, EditableBehavior) {
        //
        // Operation item view
        //
        var opiv = Backbone.Marionette.ItemView.extend({
            tagName: 'li',
            template: _.template("<a class='operation'><%= name %></a>"),
            ui : {
                "editablefield" : "A.operation"
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
               'ListSortableBehavior' : function(view) {
                     alert("ASDASDAS");
               }
            },
            childViewOptions: function() {
                return {
                  parent: this, // collection view
                  element: this.options.parent, // element view
                  diagram: this.options.parent.options.parent // diagram view
                };
            },
        });

        //
        // Attribute item view
        //
        var ativ = Backbone.Marionette.ItemView.extend({
            tagName: 'li',
            template: _.template("<a class='attribute'><%= name %></a>"),
            ui : {
                "editablefield" : "A.attribute"
            },
            behaviors: {
                EditableBehavior: {
                    // Make item editable
                }
            },
            childViewOptions: function() {
                return {
                  parent: this,
                  element: this.options.parent,
                  diagram: this.options.parent.options.parent
                };
            },
            onModeChange: function() {
                  alert("ITEM MODE CHANGE");
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
            },
            childViewOptions: function() {
                return {
                  parent: this, // collection view
                  element: this.options.parent, // element view
                  diagram: this.options.parent.options.parent // diagram view
                };
            },
            onModeChange: function() {
               alert("Collection mode change!");
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
              this.attributesView.options.isEmbedded = mode;
              this.operationsView.options.isEmbedded = mode;
            },
            onRender: function() {
                //
                // Extend element with a new fields on render
                //
                // Attributes/Fields
                //
                if (this.model.getUmlAttributes) {
                    this.attributesView = new attributesView({
                        collection:this.model.getUmlAttributes(),
                        parent: this,
                        isEmbedded: this.options.parent.model.get("isEmbedded")
                    });
                    this.attributesView.render();
                    this.$el.find("DIV#" + this.model.cid + " div.us-class-attributes").append(this.attributesView.$el);
                }
                //
                // Operations/methods
                //
                if (this.model.getUmlOperations) {
                   this.operationsView = new operationsView({
                       collection:this.model.getUmlOperations(),
                       parent: this,
                       isEmbedded: this.options.parent.model.get("isEmbedded")
                   });
                   this.operationsView.render();
                   this.$el.find("DIV#" + this.model.cid + " div.us-class-operations").append(this.operationsView.$el);
               }
            }
        });
        return ClassView;
    });

