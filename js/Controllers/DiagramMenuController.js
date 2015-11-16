define(['marionette',
        'Views/Dialogs/diagramMenuDialog',
        'Modules/Diagrammer/Views/contextmenu'
    ],
    function(Marionette, dialog, DiagramCtxMenu) {
        var Controller = Marionette.Controller.extend({

            //////////////////////////////////////// Content Type Observer
            //
            //  On content type registration done (if accepted)
            //
            //  Need to create diagram-menu-region
            //
            onRegister: function (options) {
				// TODO:
                // Framework->addDialog(#diagram-menu)
                // new Dialog(#diagram-menu)
                this.dialog = new dialog({Framework:options.framework});

                if (options.framework) {
					// TODO: REMOVE
                    options.framework.vent.on("diagram:element:create", function(model) {
						// [TODO]: Get diagram content handler -> focus diagram -> create element !!!
						alert("Create something !!!!");
					});
                }

                var that = this;
                // TODO: REMOVE
                this.dialog.on("add:accordion", function(somthing) {
					that.trigger("add:accordion", somthing);					
				});

  			    options.framework.DiagramMenuRegion.show(this.dialog, {forceShow: true});
			    this.hide();
			  
            },
            //
            // On new content creation or open existing one
            //
            onRequest: function(model2) {
 				this.dialog.addAccordionItem(model2);
			},
			//
			// 
			//
			onActivate: function(options) {
			  this.show();
			  if (!this.dctx) {
				  this.dctx = new DiagramCtxMenu({registry:options.contextMenuRegistry});
			  }
			},
            getDialog: function() {
				return this.dialog;
			},
			//
			// Show and hide current dialog
			//
			show: function() {
			    $(this.dialog.$el).show();
			},
			hide: function() {
				$(this.dialog.$el).hide();
			}
        });

        return Controller;
    }
);


