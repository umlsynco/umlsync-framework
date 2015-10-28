define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>'),
            axis: "x", // Should be changed on axis 'y' on dropDone
            dropParent: null,
            droppable: true,
            behaviors: {
                ElementBehavior: {
                    "resize-handles": 'n-ul,s-ul',
                    "axis": "y"
                },
                EditableBehavior: {}
            },
            dropDone: function(element) {
               // It is not possible to change dropped parent after selection
               if (!this.dropParent) {
                 if (this._checkRelation(this, element)) {
                     this.dropParent = element;
                     this.axis = 'y';
                     this.$el.draggable({axis:'y'});
                 }
               }
               // Lets check the position of element
               if (this.dropParent == element) {
                   // Drop parent is objinstance
                   // and it should merge 
                   this.dropParent.dropDone(this);
               }
            },
            onDragDo: function(ui) {
				if (this.axis == "x") {
					//ui.top = 0;
				}
				else if (this.axis == "y") {
					ui.left = 0;
				}
                this.$el.css({'left':this.start_operation.left + ui.left + "px", 'top':this.start_operation.top + ui.top + "px"});
            },
            onDragStop: function(ui) {
				if (this.axis == "x") {
					//ui.top = 0;
				}
				else if (this.axis == "y") {
					ui.left = 0;
				}
                var pos = {'left':this.start_operation.left + ui.left, 'top':this.start_operation.top + ui.top};
                this.$el.css(pos);
                this.model.set(pos);
            },

        });
        return View;
    });


