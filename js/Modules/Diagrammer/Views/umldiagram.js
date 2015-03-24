define(['marionette', 'Modules/Diagrammer/Behaviors/ElementBehavior'],
    function(Marionette, EB, ClassView, PackageView, ComponentView, InterfaceView, PortView, InstanceView) {

        Backbone.Marionette.ElementItemView  =  Backbone.Marionette.CompositeView.extend({
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
                    // [TODO]: extend with sortable behavior
                }
            },
            triggers : {
                "click editable": "edit"
            },
            modelEvents: {
               "change": "modelChanged"
            },
            modelChanged: function() {
				this.$el.css({left:this.model.get("left"), top:this.model.get("top")});
			}
        });

        Backbone.Marionette.ConnectorItemView  =  Backbone.Marionette.ItemView.extend({
            template: _.template('<div id="<%= cid %>"><%=getDefaultLabel()%></div>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid,
                    // Marionette requires to bind view to some element
                    // So, in that case each connector should have the default empty label
                    // which should be shown on mouse over
                    getDefaultLabel: function() { return "________"}
                }
            },
            collectionEvents: {
                'redraw':'redraw'
            },
            onRedraw: function(ctx) {
              this.redraw(ctx);
            },
            initialize: function(opt, attr) {
                var that = this;
            //    this.on("redraw", _.bind(this.redraw, this));

                var elements = opt.elements;
                this.fromModel = elements.findWhere({id:this.model.get("fromId")});
                this.toModel = elements.findWhere({id:this.model.get("toId")});
            },
            draw: function(ctx, points, color) { alert("You should redefine DRAW method !");},
            redraw: function(ctx, color) {
                var context = ctx;
                var col = color || "rgba(0,0,0,1)";
                if (ctx == undefined) {
                    return;
                }
                this.points = this._getConnectionPoints(this.fromModel.cid, this.toModel.cid, this.model.get("epoints"));
                this.gip = [];
                for (var i=0;i<this.points.length-1;++i) {
                    var dy = this.points[i][1] - this.points[i+1][1],
                        dx = this.points[i][0] - this.points[i+1][0];
                    this.gip[i] = Math.sqrt(dx*dx + dy*dy);
                }
                /*
                 if (model.get('linewidth') != undefined) {
                 ctx.lineWidth = model.get('linewidth');
                 }

                 if (model.attributes['selected']) {
                 ctx.lineWidth += 2;
                 model.redraw(ctx, "#43EC28");
                 ctx.lineWidth -= 2;
                 this.umlconnectors.models[c].redraw(ctx);
                 }
                 else if (this.selectedconntector == this.umlconnectors.models[c]) {
                 this.umlconnectors.models[c].redraw(ctx, "#43EC28");


                 if (this.umlconnectors.models[c].attributes['color'])
                 this.umlconnectors.models[c].redraw(ctx, this.umlconnectors.models[c].attributes['color']);
                 else
                 this.umlconnectors.models[c].redraw(ctx);

                 }
                 */
                this['draw'](context, this.points, col);
            },
            dashedLine: function(p1,p2, c) {
                var x2 = p2[0],
                    x1 = p1[0],
                    y2 = p2[1],
                    y1 = p1[1];

                var x = 10, // dash length
                    dashf = 5,
                    dashe = 3,
                    dx = x2 -x1,
                    dy = y2 -y1,
                    gip = Math.sqrt(dx*dx + dy*dy);

                if (gip<x) // Nothing to draw
                    return;

                var sina = dy/gip,
                    cosa = dx/gip,
                    fx = dashf * cosa,
                    fy = dashf * sina,
                    ex = dashe * cosa,
                    ey = dashe * sina;

                for (var i=0; i<(gip/(dashf + dashe)); ++i) {
                    c.moveTo(x1, y1);

                    c.lineTo(x1+fx, y1+fy);
                    x1+= (ex + fx);
                    y1+= (ey + fy);
                }
            },
            _getConnectionPoints: function(fromId, toId, epoints) {

                var p1 = $('#'+ fromId).position();
                var p2 = $('#' + toId).position();
                if (p2 == null) {
                    return [];
                }
///////////////////////////////////////////    PERFORMANCE IMPROVMENT REQUIRED  !!!!!!!!! ///////////////////////////////////
///////////////////////////////////////////    Do not recalculate coordinates for all elements !!!!!!!!! ////////////////////
///////////////////////////////////////////    It is necessary for draggable and resizable elements only !!!!!!!!! //////////
                var p11 = $('#'+ fromId + "_Border").position();
                if (!p11) {
                    return;
                }
                var p21 = $('#' + toId + "_Border").position();

                var scrollTop = $(".us-diagram").scrollTop(),
                    scrollLeft = $(".us-diagram").scrollLeft();

                if ((epoints == undefined) || (epoints.length == 0)) {
                    var x1 = this._getRValue(p1.left + p11.left, p2.left + p21.left, $('#'+ fromId).width()) ;
                    var y1 = this._getRValue(p1.top + p11.top, p2.top + p21.top, $('#'+ fromId).height()) ;

                    var x2 = this._getRValue(p2.left + p21.left, p1.left + p11.left, $('#' + toId).width());
                    var y2 = this._getRValue(p2.top + p21.top, p1.top + p11.top,  $('#' + toId).height());

                    if (this.parrent.options.multicanvas) {
                        var newpoints = [[x1 + scrollLeft,y1 + scrollTop], [x2 + scrollLeft,y2 + scrollTop]];
                        return newpoints;
                    }
                    else {
                        var newpoints = [[x1,y1], [x2,y2]];
                        return newpoints;
                    }
                }
                else {
                    var lln = epoints.length -1;
                    var x1 = this._getRValue(p1.left + p11.left, epoints[0][0] - scrollLeft, $('#'+ fromId).width()) ;
                    var y1 = this._getRValue(p1.top + p11.top, epoints[0][1] - scrollTop, $('#'+ fromId).height()) ;

                    var x2 = this._getRValue(p2.left + p21.left, epoints[lln][0] - scrollLeft, $('#' + toId).width());
                    var y2 = this._getRValue(p2.top + p21.top, epoints[lln][1] - scrollTop, $('#' + toId).height());


                    /*
                     var x1 = p1.left + p11.left;
                     var y1 = p1.top + p11.top;
                     var x2 = p2.left + p21.left;
                     var y2 = p2.top + p21.top;
                     */
                        // Canvas doesn't corresponding to diagram type
                        // and not scrollable
                        // therefore keep x,y on place and shift extra points
                        var newpoints = [];
                        newpoints[0] = [x1,y1];
                        for (var i=1;i<=epoints.length;++i) {
                            newpoints[i] = [epoints[i-1][0], epoints[i-1][1]];//epoints[i-1];
                            newpoints[i][0] -= scrollLeft;
                            newpoints[i][1] -= scrollTop;
                        }
                        newpoints[epoints.length + 1] = [x2,y2];
                        return newpoints;
                }
            },
            _getRValue: function(x1, x2, w) {
                var diffx = x2-x1;
                if (diffx>0) {
                    if (diffx > w)
                        return x1 + w;
                    return x2;
                }
                return x1;
            },
            isPointOnLine: function(x,y) {
                if (this.points == undefined)
                    return false;

                // Check if mouse is near to some extra point ?
                for (var c=0; c<this.epoints.length; ++c) {
                    if ((this.epoints[c][0] - 12 < x) && (this.epoints[c][0] + 12 > x)
                        && (this.epoints[c][1] - 12 < y) && (this.epoints[c][1] + 12> y)) {
                        dm.at.cs.mouseover = {euid:this.euid,idx:c};
                        return true;
                    }
                }

                for (var i=0;i<this.points.length-1;++i) {
                    var dx1 = x - this.points[i][0],
                        dy1 = y - this.points[i][1],
                        dx = this.points[i+1][0] - x,
                        dy = this.points[i+1][1] - y,
                        gip1 = Math.sqrt(dx1*dx1 + dy1*dy1),
                        gip = Math.sqrt(dx*dx + dy*dy);

                    if (((gip1 + gip) - this.gip[i]) < 0.2 ) {
                        dm.at.cs.mouseover = {euid:this.euid};
                        return true;
                    }
                }
                return false;
            },
            canRemovePoint: function(p1,p2,rp) {
                if ((p1 == undefined)
                    || (p2 == undefined)) {
                    return false;
                }
                var dx = p1[0] - p2[0],
                    dy = p1[1] - p2[1],
                    dx1 = p1[0] - rp[0],
                    dy1 = p1[1] - rp[1],
                    dx2 = p2[0] - rp[0],
                    dy2 = p2[1] - rp[1],
                    gip1 = Math.sqrt(dx1*dx1 + dy1*dy1),
                    gip2 = Math.sqrt(dx2*dx2 + dy2*dy2),
                    gip = Math.sqrt(dx*dx + dy*dy);
                if (((gip1 + gip2) - gip) < 0.5)
                    return true;
                return false;
            }
        });

        var DiagramView = Backbone.Marionette.ItemView.extend({
            className: "us-diagram",
            template: _.template('<div class="us-canvas-bg" style="width:100%;height:100%;">' +
                '<canvas id="<%=cid%>_Canvas" class="us-canvas" width="1500px" height="800px"></canvas></div>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid
                }
            },
            initialize: function(options, attr) {
                if (attr && attr.singleCanvas) {
                    // TODO: handle embedded content
                }
                this.$el.css({height:"600px"});

            },
            onRender: function() {
                // Draw all elements
                this.elementsView = new (Marionette.CollectionView.extend({
                    childViewEventPrefix: 'element',
                    getChildView: function(model) {

                        var type = model.get("type");
                        var view = require("Modules/Diagrammer/Views/Elements/uml"+type);
                        return view;

                    }})) // extend collection with a new method
                ({collection:this.model.umlelements});
                this.elementsView.render();
                this.$el.append(this.elementsView.$el);

                // Trigger connectors re-draw on DND
                // TODO: skip mouseover events on dragstart and finish to ignore them dragstop
                this.elementsView.on("element:drag", _.bind(this.drawConnectors, this));

                // Draw all connectors
                this.connectorsView = new (Marionette.CollectionView.extend({
                    childViewOptions: {
                       elements:this.model.umlelements
                    },
                    getChildView: function(model) {
                        var type = model.get("type");
                        var view = require("Modules/Diagrammer/Views/Connectors/uml"+type);
                        return view;

                    },
                    triggerCustomEvent: function(method, arg){
                        this.children.each(function(child){
                            if (_.isFunction(child.triggerMethod)) {
                                child.triggerMethod(method, arg);
                            } else {
                                Marionette.triggerMethod.call(child, method, arg);
                            }
                        });
                    }
                })) // extend collection with a new method
                ({collection:this.model.umlconnectors});

                this.connectorsView.render();
                this.$el.append(this.connectorsView.$el);

                // Initialize canvas
                this.canvasEuid = this.model.cid+'_Canvas';
                this.canvas = (this.el.childNodes[0]).childNodes[0];
            },

            //
            // Re-draw connectors
            //
            drawConnectors: function() {
                if (!this.canvas)
                    return;
                this.ctx = this.ctx || this.canvas.getContext("2d");

                // Empty area
                this.ctx.fillStyle = "#EEEEEE";//"rgba(140,140,140,1)";
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                var views = this.connectorsView.children._views;
                this.connectorsView.triggerCustomEvent("redraw", this.ctx);
            }
        });
        return DiagramView;
    });

