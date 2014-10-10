define(['marionette', 'Modules/Diagrammer/Behaviors/ElementBehavior'],
        //'./umlclass', './umlpackage', './umlcomponent', './umlinterface', 'umlport', 'umlinstance'],
    function(Marionette, EB, ClassView, PackageView, ComponentView, InterfaceView, PortView, InstanceView) {

        Backbone.Marionette.ElementItemView  =  Backbone.Marionette.ItemView.extend({
            className: "us-element-border",
            initialize: function() {
                this.$el.attr("id", this.model.cid + "_Border");//.attr("style", "left:"+this.left+";top:px"+this.top+"px;");
                // Call extra init method
                if (this._init) {
                    this._init.call(this, arguments);
                }
            },
            templateHelpers: function() {
                return {
                    cid: this.model.cid
                }
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

        var DiagramView = Backbone.Marionette.ItemView.extend({
            className: "us-diagram",
            template: _.template('<div class="us-canvas-bg" style="width:100%;height:100%;"></div>'),
            initialize: function(options, attr) {
                if (attr && attr.singleCanvas) {
                    // TODO: handle embedded content
                }
                this.$el.css({height:"600px"});

            },
            onRender: function() {
                // Draw all elements

                this.elementsView = new (Marionette.CollectionView.extend({
                    getChildView: function(model) {

                        var type = model.get("type");
                        var view = require("Modules/Diagrammer/Views/Elements/uml"+type);
                        return view;

                    }})) // extend collection with a new method
                    ({collection:this.model.umlelements});
                this.elementsView.render();
                this.$el.append(this.elementsView.$el);

                this.connectorsView = new (Marionette.CollectionView.extend({
                    getChildView: function(model) {
                        var type = model.get("type");
                        var view = require("Modules/Diagrammer/Views/Elements/uml"+type);
                        return view;

                    }})) // extend collection with a new method
                ({collection:this.model.umlelements});


                var that = this;
                $("#" + this.euid + ".us-diagram").scroll(function() {that.drawConnectors();});

            },
            //
            // Re-draw connectors
            //
            drawConnectors: function() {

            }
        });
        return DiagramView;
    });

