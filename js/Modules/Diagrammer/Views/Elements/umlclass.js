define(['marionette', './../umldiagram'],
    function(Marionette, diagram) {
		var opiv = Backbone.Marionette.ItemView.extend({
			tagName: 'li',
			template: _.template("<a class='editablefield operation'><%= name %></a>"),
            events: {
                "click .editablefield": "editElement"
            },
            editElement: function() {
				this.$el.children().hide();
				var that = this;
                        var xxx = that.$el.children("a").html();
				this.$el.append("<input type='text' value='"+ xxx +"' style='width:100%;'>");

				that.$el.children("input").blur(function() {
					var inp = that.$el.children("input");
					var val = inp.val();
					inp.remove();
					that.$el.children("a").html(val).show();
                                        that.model.set("name", val); // SyncUp Model: Class opertations
				})
				.on('keyup', function(e){
                                       if (e.which == 27) { 
						//$('#status').html("cancel");
						$(this).off('blur').remove();
						that.$el.children("A").show();
					}
					else if (e.which == 13) { 
						$(this).trigger("blur");
					}

				})
				.focus();
			}
		});

		var operationsView = Backbone.Marionette.CollectionView.extend({
			childView : opiv,
			tagName: 'ul'
		});


		var ativ = Backbone.Marionette.ItemView.extend({
			tagName: 'li',
			template: _.template("<a class='editablefield attribute'><%= name %></a>")
		});

		var attributesView = Backbone.Marionette.CollectionView.extend({
			childView : ativ,
			tagName: 'ul'
		});
		
        var ClassView = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-class grElement ">\
                                    <div class="us-class-header">\
                                        <a id="name" class="editablefield us-class-name"><%= name %></a><br>\
                                        <a id="aux" class="us-class-aux"><%= getAux() %></a>\
                                    </div>\
                                    <div class="us-class-attributes"><ul class="us-sortable"></ul></div>\
                                    <div class="us-class-operations us-element-resizable-area"><ul class="us-sortable"></ul></div>\
                                    </div>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid,
                    getAux: function() { return ""},
                    getMethods: function() {return ""},
                    getFields: function() {return ""}
                }
            },
            events: {
                "click .editablefield": "editElement"
            },
            editElement: function() {
				this.$el.append("<input type='text' value='New method'>");
			},
            onRender: function() {
				if (this.model.getUmlAttributes) {
                    this.model.getUmlAttributes().add(new Backbone.DiagramModel({name:"field_1"}));
                    this.model.getUmlAttributes().add(new Backbone.DiagramModel({name:"field_2"}));
                    this.model.getUmlAttributes().add(new Backbone.DiagramModel({name:"field_3"}));
 				    this.attributesView = new attributesView({collection:this.model.getUmlAttributes()});
					this.attributesView.render();
					this.$el.find("DIV#" + this.model.cid + " div.us-class-attributes").append(this.attributesView.$el);
			     }
				if (this.model.getUmlOperations) {
		           this.model.getUmlOperations().add(new Backbone.DiagramModel({name:"method_1()"}));
		           this.model.getUmlOperations().add(new Backbone.DiagramModel({name:"method_12)"}));
		           this.model.getUmlOperations().add(new Backbone.DiagramModel({name:"method_3()"}));
				   this.operationsView = new operationsView({collection:this.model.getUmlOperations()});
                   this.operationsView.render();
				   this.$el.find("DIV#" + this.model.cid + " div.us-class-operations").append(this.operationsView.$el);

			   }
			   this.something = "XXXX";
			}
        });
        return ClassView;
    });

