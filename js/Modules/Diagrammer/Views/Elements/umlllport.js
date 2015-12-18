define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>'),
            axis: "y",
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
               // Or drop element on multiple targets
               $.log("dropDone: " + this.model.get("type") + ": "+ this.model.cid);
               if (!this.dropParent) {
				   $.log("Drop it !!!" );
                 if (element._checkRelation(this, element)) {
                     this.dropParent = element;
                     $.log("Drop it 2!!!" );
                 }
                 else {
					 return;
				 }
               }
               // Lets check the position of element
               if (this.dropParent == element) {
				   $.log("Drop it 3!!!" );
                   // Drop parent is objinstance
                   // and it should merge 
                   this.dropParent.dropDone(this);
               }
            },
            onDragDo: function(ui) {
				// Unfortunatly DND will be called twice for the llport
				if (!(this.dropParent != null &&  (this.dropParent.start_operation != null || this.dropParent.operation_start)))
				    ui.left = 0;
                this.$el.css({'left':this.start_operation.left + ui.left + "px", 'top':this.start_operation.top + ui.top + "px"});
            },
            onDragStop: function(ui) {
				if (!(this.dropParent != null &&  (this.dropParent.start_operation != null || this.dropParent.operation_start)))
				    ui.left = 0;
                var pos = {'left':this.start_operation.left + ui.left, 'top':this.start_operation.top + ui.top};
                this.$el.css(pos);
                this.model.set(pos);
            },

        });
        return View;
    });


