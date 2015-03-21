define(['marionette', './../umldiagram'],
    function(Marionette, diagram) {
		var opiv = Backbone.Marionette.ItemView.extend({
			tagName: 'li',
			template: _.template("<a class='editablefield operation'><%= name %></a>")
		});

		var operationsView = Backbone.Marionette.CollectionView.extend({
			childView : opiv
		});


		var ativ = Backbone.Marionette.ItemView.extend({
			tagName: 'li',
			template: _.template("<a class='editablefield attribute'><%= name %></a>")
		});

		var attributesView = Backbone.Marionette.CollectionView.extend({
			childView : ativ
		});
		
        var ClassView = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-class grElement">\
                                    <div class="us-class-header">\
                                        <a id="name" class="editablefield us-class-name"><%= name %></a><br>\
                                        <a id="aux" class="us-class-aux"><%= getAux() %></a>\
                                    </div>\
                                    <div class="us-class-attributes"><ul class="us-sortable"><%= getMethods() %></ul></div>\
                                    <div class="us-class-operations us-element-resizable-area"><ul class="us-sortable"><%= getFields() %></ul></div>\
                                    </div>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid,
                    getAux: function() { return ""},
                    getMethods: function() {return ""},
                    getFields: function() {return ""}
                }
            },
            onRender: function() {
				if (this.model.getAttributes)
				  this.attributesView = new attributesView(this.model.getAttributes());
				if (this.model.getOperations)
				this.operationsView = new operationsView(this.model.getOperations());
			}
        });
        return ClassView;
    });

