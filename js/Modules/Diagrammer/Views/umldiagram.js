define(['marionette', 'Modules/Diagrammer/Behaviors/ElementBehavior', 'Modules/Diagrammer/Behaviors/EditableBehavior'],
    function(Marionette, EB, ClassView, PackageView, ComponentView, InterfaceView, PortView, InstanceView) {

        //
        // @description - base class for all uml elements
        //
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
            ui : {
                "editablefield" : ".editablefield"
            },
            behaviors: {
                ElementBehavior: {},
                EditableBehavior: {}
            },
            modelEvents: {
               "change": "modelChanged"
            },
            // To prevent extra JS class creation, declare this field
            dropParent: null,
            // Indicates if it is possible to drop one element on another
            droppable: false,
            // List of elements which can be dropped on this one
            acceptDrop: [],
            droppedElements: [],
            _checkRelation: function(e1, e2) {
                // e1 could be dropped on e2
                if (e1.droppable && _.contains(e2.acceptDrop, e1.model.get("type"))) {
                    var inner = {
                        left: e1.model.get("left"),
                        top: e1.model.get("top"),
                        width: e1.model.get("width"),
                        height: e1.model.get("height")
                        },
                    outer = {
                        left: e2.model.get("left"),
                        top: e2.model.get("top"),
                        width: e2.model.get("width"),
                        height: e2.model.get("height")
                    };
                    if (outer.top < inner.top && inner.top + inner.height < outer.top + outer.height
                        && outer.left < inner.left && outer.left + outer.width > inner.left + inner.width) {
                        e2.$el.addClass('dropped-' + e1.cid);
                        if (!_.contains(e2.droppedElements, e1)) {
                            e2.droppedElements.push(e1);
                        }
                        return true;
                    }
                    else {
                        e2.droppedElements = _.without(e2.droppedElements, e1);
                        e2.$el.removeClass('dropped-' + e1.cid);
                    }
                }
                return false;
            },
            // Check if this element could accept drop
            dropDone: function(dev) {
                // Check if this element could be dropped on dev
                // or dev could be dropped on this
                //
                this._checkRelation(dev, this) || this._checkRelation(this, dev);
            },
            //model change callback
            modelChanged: function() {
                this.$el.css({left: this.model.get("left"), top: this.model.get("top")});
            },
            // Initial value of the start operation object
            start_operation: null,
            onDragStart: function(ui) {
                this.start_operation = {left: this.model.get("left"), top: this.model.get("top")};
            },
            onDragDo: function(ui) {
                if (this.axis == "x") {
                    ui.top = 0;
                }
                else if (this.axis == "y") {
                    ui.left = 0;
                }
                this.$el.css({'left':this.start_operation.left + ui.left + "px", 'top':this.start_operation.top + ui.top + "px"});
            },
            //
            onDragStop: function(ui) {
                if (this.axis == "x") {
                    ui.top = 0;
                }
                else if (this.axis == "y") {
                    ui.left = 0;
                }
                var pos = {'left':this.start_operation.left + ui.left, 'top':this.start_operation.top + ui.top};
                this.$el.css(pos);
                this.model.set(pos);
                // Drop the start operation object values
                delete this.start_operation;
                this.start_operation = null;
            },
            selected: false,
            onSelect: function(flag) {
                if (this.selected == flag) return;
                this.selected = flag;
                if (flag) {
                    this.$el.addClass("us-selected");
                }
                else {
                    this.$el.removeClass("us-selected");
                }
            }
        });
        
        
        Backbone.Marionette.ElementsView = Marionette.CollectionView.extend({
                    childViewEventPrefix: 'element',
                    getChildView: function(model) {
                        var type = model.get("type");
                        if (type != "helper") {
                          var view = require("Modules/Diagrammer/Views/Elements/uml"+type);
                          return view;
                        }
                        return helperItemView;

                    }});

        //
        // @description - icon menu connection helper
        //
        var helperItemView = Backbone.Marionette.ItemView.extend({
            el: ".us-icon-menu-connection-helper",
            render: function() {}
            
        });


        //
        // @description - connector's labels
        //
        var LabelView = Backbone.Marionette.ItemView.extend({
            tagName: 'li',
            className: 'us-label',
            template: _.template('<a class="editablefield"><%=name%></a>'),
            ui : {
                "editablefield" : ".editablefield"
            },
            dnd: false,
            onRender: function() {
                var view = this,
                isemb = view.options.diagram.model.get("isEmbedded");
if (!isemb) {
                this.$el.draggable({
					start: function() {
						// prevent mouse enter/exit on DND
						view.dnd = true;
					},
                    stop: function(event, ui) {
						view.dnd = false;
                        view.model.set({x:ui.position.left, y:ui.position.top});
                    }
                })
               .bind('contextmenu', function(e) {
                     var p = $(this).offset(),
                     x = e.pageX - p.left,
                     y = e.pageY - p.top;

                       var diagram = view.options.diagram;
                        if (diagram) {
                          diagram.vent.trigger("contextmenu:show", {type:"diagram", subtype: "connector-label", event:e, coordinates: {x:x, y:y}, context: {view:view, diagram: diagram}});
                          e.preventDefault();
                        }
              });
}
              this.$el.mouseenter(this, function (event){
                  // Highlight connector
                  if (view.dnd) 
                    return;
                  view.options.parent.isMouseOverLabel = true;
                  view.options.diagram.drawConnectors();
                  event.stopPropagation();
              })
              .mousemove(view, function(event) {
				  // Prevent connector state checking
				  event.stopPropagation();
			  })
              .mouseleave(view, function (event){
                  if (view.dnd) 
                    return;
				  view.options.parent.isMouseOverLabel = false;
				  view.options.diagram.drawConnectors();
				  event.stopPropagation();
              });
              this.$el.css({top: this.model.get("y"), left: this.model.get("x")});
            },
            behaviors: {
                EditableBehavior: {}
            },
            start_operation: null,
            onDragStart: function(ui) {
                this.start_operation = {x:this.model.get("x"), y:this.model.get("y")};
            },
            onDragDo: function(ui) {
                this.$el.css({left:this.start_operation.x + ui.left, top:this.start_operation.y + ui.top});
            },
            onDragStop: function(ui) {
                this.$el.css({left:this.start_operation.x + ui.left, top:this.start_operation.y + ui.top});
                this.model.set({x:this.start_operation.x + ui.left, y: this.start_operation.y + ui.top});
                this.start_operation = null;
            },
        });
        //
        // @description - base class for all connectors
        //
        Backbone.Marionette.ConnectorItemView  =  Backbone.Marionette.CompositeView.extend({
            template: _.template('<div id="<%= cid %>"><%=getDefaultLabel()%><ul></ul></div>'),
            className: "us-connector",
            childViewContainer: "ul",
            childView: LabelView,
            childViewOptions: function() {
                return {
                  parent: this,
                  diagram: this.options.parent
                };
            },
            templateHelpers: function() {
                return {
                    cid: this.model.cid,
                    // Marionette requires to bind view to some element
                    // So, in that case each connector should have the default empty label
                    // which should be shown on mouse over
                    getDefaultLabel: function() { return ""}
                }
            },
            collectionEvents: {
                'redraw':'redraw'
            },
            onRedraw: function(ctx) {
              this.ctx = this.ctx || ctx;
              this.redraw(ctx);
            },
            initialize: function(opt, attr) {
                var that = this;
            //    this.on("redraw", _.bind(this.redraw, this));
                this.epoints = this.model.get("epoints") || [];
                this.collection = this.model.getUmlLabels();

                var elements = opt.elements;
                this.fromModel = elements.findWhere({id:this.model.get("fromId")});
                this.toModel = elements.findWhere({id:this.model.get("toId")});
            },
            draw: function(ctx, points, color) {
                alert("You should redefine DRAW method for concreate connector!");
            },
            isMouseOver: false,
            redraw: function(ctx, color) {
                var context = ctx;
                var col = color || "rgba(0,0,0,1)";

                col = this.isMouseOver == true || this.isMouseOverLabel == true ? "#43EC28" : col; // Re-draw connector with specific color on mouse over

                if (ctx == undefined) {
                    return;
                }
                this.points = this._getConnectionPoints(this.fromModel.cid, this.toModel.cid, this.epoints);
                this.gip = [];
                for (var i=0;i<this.points.length-1;++i) {
                    var dy = this.points[i].y - this.points[i+1].y,
                        dx = this.points[i].x - this.points[i+1].x;
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
            //
            // @description - helper method to draw dashed line
            //
            dashedLine: function(p1,p2, c) {
                var x2 = p2.x,
                    x1 = p1.x,
                    y2 = p2.y,
                    y1 = p1.y;

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
            //
            // @description - helper method to get all connection points
            //
            _getConnectionPoints: function(fromId, toId, epoints) {

                // No reason to update parameters on DND
                if (this.dragdo) {
                    return this.drag_points;
                }

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

                    if (false) { //this.parrent.options.multicanvas) {
                        var newpoints = [{x:x1 + scrollLeft,y:y1 + scrollTop}, {x:x2 + scrollLeft,y:y2 + scrollTop}];
                        return newpoints;
                    }
                    else {
                        var newpoints = [{x:x1, y:y1}, {x:x2, y:y2}];
                        return newpoints;
                    }
                }
                else {
                    var lln = epoints.length -1;
                    var x1 = this._getRValue(p1.left + p11.left, epoints[0].x - scrollLeft, $('#'+ fromId).width()) ;
                    var y1 = this._getRValue(p1.top + p11.top, epoints[0].y - scrollTop, $('#'+ fromId).height()) ;

                    var x2 = this._getRValue(p2.left + p21.left, epoints[lln].x - scrollLeft, $('#' + toId).width());
                    var y2 = this._getRValue(p2.top + p21.top, epoints[lln].y - scrollTop, $('#' + toId).height());


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
                        newpoints[0] = {x:x1, y:y1};
                        for (var i=1;i<=epoints.length;++i) {
                            newpoints[i] = {x:epoints[i-1].x, y:epoints[i-1].y};//epoints[i-1];
                            newpoints[i].x -= scrollLeft;
                            newpoints[i].y -= scrollTop;
                        }
                        newpoints[epoints.length + 1] = {x:x2,y:y2};
                        return newpoints;
                }
            },
            //
            // @description - helper metho to get the neares point/position
            //
            _getRValue: function(x1, x2, w) {
                var diffx = x2-x1;
                if (diffx>0) {
                    if (diffx > w)
                        return x1 + w;
                    return x2;
                }
                return x1;
            },
            //
            // @description - is point over the line ?
            //
            isPointOnLine: function(x,y) {
                if (this.points == undefined)
                    return false;


                // Check if mouse is near to some extra point ?
                for (var c=0; c<this.epoints.length; ++c) {
                    if ((this.epoints[c].x - 12 < x) && (this.epoints[c].x + 12 > x)
                        && (this.epoints[c].y - 12 < y) && (this.epoints[c].y + 12> y)) {
                     //   dm.at.cs.mouseover = {euid:this.euid,idx:c};
                        return true;
                    }
                }

                for (var i=0;i<this.points.length-1;++i) {
                    var dx1 = x - this.points[i].x,
                        dy1 = y - this.points[i].y,
                        dx = this.points[i+1].x - x,
                        dy = this.points[i+1].y - y,
                        gip1 = Math.sqrt(dx1*dx1 + dy1*dy1),
                        gip = Math.sqrt(dx*dx + dy*dy);

                    if (((gip1 + gip) - this.gip[i]) < 0.2 ) {
                   //     dm.at.cs.mouseover = {euid:this.euid};
                        return true;
                    }
                }
                return false;
            },
            //
            // @description - checker if it is possible to remove point
            //
            canRemovePoint: function(p1,p2,rp) {
                if ((p1 == undefined)
                    || (p2 == undefined)) {
                    return false;
                }
                var dx = p1.x - p2.x,
                    dy = p1.y - p2.y,
                    dx1 = p1.x - rp.x,
                    dy1 = p1.y - rp.y,
                    dx2 = p2.x - rp.x,
                    dy2 = p2.y - rp.y,
                    gip1 = Math.sqrt(dx1*dx1 + dy1*dy1),
                    gip2 = Math.sqrt(dx2*dx2 + dy2*dy2),
                    gip = Math.sqrt(dx*dx + dy*dy);
                if (((gip1 + gip2) - gip) < 0.5)
                    return true;
                return false;
            },
            //
            // @description - add extra points for the connector
            //
            startTransform: function(x1,y1) {
                $.log("START TRANSFORM !! " + x1 + " Y " + y1);
//              if (!this.parrent.options.editable)
//                return;

//              var opman = this.parrent.opman;
//              opman.startTransaction();

              // Clean the previous extra point position
              this.eppos = undefined;

              // Some scrolling stuff, do not take in account
              var x =  x1 + this.$el.parent().scrollLeft(),
              y = y1 + this.$el.parent().scrollTop();

              // cleanOnNextTransform allow us to move vertical and horizontal
              //                      lines between elements.
              //                      It is single extra point which should be removed on next DND
              if ((this.cleanOnNextTransform) && (this.epoints.length == 1)) {
                  $.log("START TRANSFORM !! clean point on next transformation");
                this.cleanOnNextTransform = false;
                this.eppos = 0; // Modify an existing point
                this.epoints[this.eppos] = {x:x1, y:y1};
                //this.epoints.splice(0, 1);
                
//                this.model.umlepoints.splice(0, 1);
              }
              else {
                  // Check if mouse is near to some extra point ?
                  for (var c=0; c<this.epoints.length; ++c) {
                      if ((this.epoints[c].x - 12 < x) && (this.epoints[c].x + 12 > x)
                          && (this.epoints[c].y - 12 < y) && (this.epoints[c].y + 12> y)) {
                          this.eppos = c;
                          $.log("START TRANSFORM !! epoint at " + c);
                          break;
                      }
                  }
              }

              // Don't need to identify position
              if (this.epoints.length == 0) {
                  $.log("START TRANSFORM !! no points at all");
                  // in array for the first element
                  this.eppos = 0;
                  this.epoints[0] = {x:x1,y:y1};
                  this.model.umlepoints.add({x:x1,y:y1});
//                this.report = "+epoint";
              } else {
                  // means that it is not move on existing point
                  //            it is not first point of replaced first point
                  if (this.eppos == undefined) {
                      // Get the list of connection points
                      this.points = this['_getConnectionPoints'](this.fromModel.cid, this.toModel.cid, this.epoints);
                      newPoint = {x:x1, y:y1};
                      var zi=0;
                      for (;zi<this.points.length-1;++zi) {
                        if (this.canRemovePoint(this.points[zi], this.points[zi+1], newPoint)) { // Is Point on Line ?  Stuipid double check on mouseMove !!!
                            this.eppos = zi;
                            this.epoints.splice(zi, 0, newPoint);
                            this.model.umlepoints.add({x:x1,y:y1}, {at:zi});
                            $.log("START TRANSFORM !! new point at " + zi);
                            break;
                        }
                      }
//                  this.report = "+epoint";
                  }
                  else {
//                  this.report = "#epoint";
                   $.log("START TRANSFORM !! epossed " + this.eppos);
                  this.epoints[this.eppos] = {x:x1, y:y1};
                }
              }

//              opman.reportStart(this.report, this.euid, {idx: this.eppos, value: [x,y]});

             if (this.eppos == undefined) {
                 alert("An absolutely UNEXPECTED STATE !!!");
                 return false;
             }

              this.epoints[this.eppos].x = x1;
              this.epoints[this.eppos].y = y1;

//              if (this.onStartTransform != undefined)
//                this.onStartTransform(x,y);

              return true; 
            },
            //
            // @description - stop extra points adding
            //
            stopTransform: function(x1,y1) {
                $.log("STOP TRANSFORM !! " + x1 + " Y " + y1);
              if (this.eppos == undefined) {
                alert("STOP CONNECTORS TRANSFORM WITHOU EPOINT ?");
                return;
              }
              var x = x1 + this.$el.parent().scrollLeft(),
              y = y1 + this.$el.parent().scrollTop();

//              this.parrent.opman.reportStop(this.report, this.euid, {idx: this.eppos, value:[x,y]});

              this.epoints[this.eppos].x = x;
              this.epoints[this.eppos].y = y;

                // Update position before drop
              var modelToUpdate = this.model.umlepoints.at(this.eppos);
                if (modelToUpdate) {
                    modelToUpdate.set(this.epoints[this.eppos]);
                }

              var isEqualPoint = function(p1, p2) {
                if ( (p1.x - 12 < p2.x)
                    && (p1.x + 12 > p2.x)
                    && (p1.y - 12 < p2.y)
                    && (p1.y + 12 > p2.y)) {
                  return true;
                }
                return false;
              };

              //
              // Try to join points on one end
              //
              if (this.eppos < this.epoints.length - 1) {
                if (isEqualPoint(this.epoints[this.eppos], this.epoints[this.eppos + 1])) {
                  $.log("REPORT             1 ");
//                  this.parrent.opman.reportShort("-epoint", this.euid, {idx: this.eppos +1, value:this.epoints[this.eppos+1]});
                  this.epoints.splice(this.eppos +1, 1);
                    // Sync up collection
                    modelToUpdate = this.model.umlepoints.at(this.eppos +1);
                    this.model.umlepoints.remove(modelToUpdate);
                }
              }

              //
              // Tr y to join points on another end
              //
              if (this.eppos > 0) {
                if (isEqualPoint(this.epoints[this.eppos], this.epoints[this.eppos -1])) {
                  this.eppos--;
                  $.log("REPORT             2 ");
//                  this.parrent.opman.reportShort("-epoint", this.euid, {idx: this.eppos, value:this.epoints[this.eppos]});
                  this.epoints.splice(this.eppos, 1);
                    modelToUpdate = this.model.umlepoints.at(this.eppos);
                    this.model.umlepoints.remove(modelToUpdate);
                }
              }

              //
              // Try to join several points in one
              //
              if (this.canRemovePoint(this.points[this.eppos], this.points[this.eppos+2], this.points[this.eppos+1])){
                if (this.epoints.length > 1) {
                  $.log("REPORT             3:  " + this.eppos + "   COUNT: " + this.epoints.length);
//                  this.parrent.opman.reportShort("-epoint", this.euid, {idx: this.eppos, value:this.epoints[this.eppos]});
                  this.epoints.splice(this.eppos, 1);
                    modelToUpdate = this.model.umlepoints.at(this.eppos);
                    this.model.umlepoints.remove(modelToUpdate);
                  $.log("REPORT AFTER       3:  " + this.eppos + "   COUNT: " + this.epoints.length);

                } else {
                  this.cleanOnNextTransform = true;
                }
              }

             this.eppos = undefined;
              
              // TODO: Report Extra-points change for the epoints model/collection ?

              // [TODO] Think about subscribers !!!
//              if ($.isFunction(this.onStopTransform))
//                this.onStopTransform(x,y);

//              this.parrent.opman.stopTransaction();
//              delete this.report; // remove the value

            },
            
            TransformTo: function(x1,y1) {
//                $.log("TRANSFORM !! " + x1 + " Y " + y1 + " EPOS : " + this.eppos);
              if (this.eppos != undefined) {
                var x =  x1 + this.$el.parent().scrollLeft(),
                y = y1 + this.$el.parent().scrollTop();
                this.epoints[this.eppos].x = x;
                this.epoints[this.eppos].y = y;

                // On Transform callback caller
                //if ($.isFunction(this.onTransform))
                //  this.onTransform(x,y);
              }
            },
            dragdo: false,
            drag_points: [],
            start_operation: [],
            onDragStart: function(ui) {
                this.start_operation = this._getConnectionPoints(this.fromModel.cid, this.toModel.cid, this.epoints);
                this.drag_points = this.start_operation;
                this.dragdo = true;

                // List of the connector's labels
                this.children.each(function(label) {
                    label.onDragStart(ui);
                });
            },
            onDragDo: function(ui) {
                this.drag_points = new Array();
                var that = this;
                // Move points
                _.each(this.start_operation, function(point) {
                    that.drag_points.push({x:point.x + ui.left, y:point.y + ui.top})
                });

                // Move labels
                this.children.each(function(label) {
                    label.onDragDo(ui);
                });
            },
            onDragStop: function(ui) {
                // clear arrays
                this.drag_points = [];
                this.start_operation = null;

                _.each(this.epoints, function(point) {
                    point.x += ui.left;
                    point.y += ui.top;
                });
                // Sync up model
                this.model.umlepoints.each(function(model) {
                      model.set({x:model.get("x") + ui.left, y: model.get("y") + ui.top});
                });

                // Stop move for labels too
                this.children.each(function(label) {
                    label.onDragStop(ui);
                });
                // Enable regular points requests
                this.dragdo = false;
            },
        });


        Backbone.Marionette.ConnectorsView = Marionette.CollectionView.extend({
                    childViewEventPrefix: 'connector',
                    className: "us-canvas-bg",
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
                    },
                    startConnectorTransform: function(x,y) {
                        var diag = this;
                        this.children.each(function(child) {
                            if (child.isMouseOver == true) {
                                if (child.startTransform(x,y)) {
                                    diag.selectedConnector = child;
                                };
                            }
                        }); // each
                    }, 
                    stopConnectorTransform: function(x,y) {
                        if (this.selectedConnector != undefined) {
                            this.selectedConnector.stopTransform(x,y);
                            this.selectedConnector = undefined;
                        }
                    },
                    highlighted: null,
                    selectedConnector: null,
                    isPointOnLine: function(x, y) {
						if ($.ipp) {
							$.log("IPOL:");
						}
                        var diag = this;
                        var shouldRedraw = false;
                        // Check of transformat has been started
                        if (diag.selectedConnector && this.selectedConnector != undefined) {
                            diag.selectedConnector.TransformTo(x,y);
                            // force re-draw of connectors
                            diag.trigger("connector:changed");
                            // Return true to prevent further propagation of mousemove event !
                            return true;
                        }
                        
                        this.children.each(function(child) {
                            if (_.isFunction(child.isPointOnLine)) {
                                var result = child.isPointOnLine(x,y);
                                if (result == true) {
                                    child.isMouseOver = true;
                                    child.$el.addClass("hover");
                                    shouldRedraw = diag.highlighted != child;
                                    // Looks strupid because of the else if above
                                    // But actually this case handles use-case of crossing of the several connectors
                                    // So, if user point on the cross-lines then it should get hilighted the latest added connector
                                    if (shouldRedraw && diag.highlighted)
                                        diag.highlighted.isMouseOver = false;
                                    diag.highlighted = child;
                                }
                                else if (child.isMouseOver) {
                                    child.isMouseOver = false;
                                    child.$el.removeClass("hover");
                                    // re-draw if mouse left this connector
                                    shouldRedraw = true;
                                }
                            }
                        });

                        // Check if connector is not highlighted anymore
                        if (diag.highlighted && !diag.highlighted.isMouseOver) {
                            diag.highlighted = null;
                        }
                        if (shouldRedraw == true) {
                            diag.trigger("connector:changed");
                        }
                        return false;
                    },
                    //
                    // Handle the connectors behavior
                    // 1. Select connector
                    // 2. Mouse over
                    // 3. Add extra points for the connectors
                    // 4. Context menu
                    //
                    onRender: function() {
                       var diag = this;
                       this.$el
                       .mousemove(function(e) {  // DEBUG FUNCTIONALITY.
                          var p = $(this).offset(),
                          x = e.pageX - p.left,
                          y = e.pageY - p.top;
                          var status = diag.isPointOnLine(x,y);
                          if (status) {
//                            dm.at.mouse = dm.at.mouse || {};
//                            dm.at.mouse.x = x;
//                            dm.at.mouse.y = y;
                            e.stopPropagation();
                          }
                        })
                        .mouseup(function(e) {
                          var p = $(this).offset(),
                          x = e.pageX - p.left,
                          y = e.pageY - p.top;
                          diag.stopConnectorTransform(x,y);
                        })
                        .mousedown(function(e) {

if(diag.options.isEmbedded) return;

                          var p = $(this).offset(),
                          x = e.pageX - p.left,
                          y = e.pageY - p.top;

// [TODO:Testing] Selenium test suite helper
                          // Selenium can't clickAndHold at concreate position
                          //if (x<1 && y<1) {
                        //    x = dm.at.mouse.x;
//                            y = dm.at.mouse.y;
//                          }

                          if (e.which != 3) {
                            diag.startConnectorTransform(x,y);
                          }

                          if ((diag.selectedconntector)
                              && (!dm['dm']['fw']['CtrlDown'])) {
                            diag.selectedconntector._setOption("selected", true);
                            e.stopPropagation();
                          }
                        })
                        .bind('contextmenu', function(e) {
                          var p = $(this).offset(),
                          x = e.pageX - p.left,
                          y = e.pageY - p.top;

                          if (diag.highlighted) {
                              
                              var diagram = diag.highlighted.options.parent;
                              if (diagram) {
                                  diagram.vent.trigger("contextmenu:show", {type:"diagram", subtype: "connector", event:e, coordinates: {x:x, y:y}, context: {view:diag.highlighted, diagram: diagram}});
                                  e.preventDefault();
                              }
                          }
                        });
                    }
        });

        var DiagramView = Backbone.Marionette.ItemView.extend({
            className: "us-diagram",
            template: _.template('<canvas id="<%=cid%>_Canvas" class="us-canvas" width="1500px" height="800px"></canvas>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid
                }
            },
            //
            // Take platform vent or create a new one
            //
            vent: null,
            initialize: function(options, attr) {
                this.vent = options.vent || _.extend({}, Backbone.Events);
                if (attr && attr.singleCanvas) {
                    // TODO: handle embedded content
                }
                this.$el.css({height:"600px"});

            },
            onRender: function() {
                //
                // INITIALIZE ELEMENTS
                //
                this.elementsView = new  Backbone.Marionette.ElementsView({collection:this.model.umlelements,
                    childViewOptions: {
                        parent: this
                    }
                });

                this.elementsView.render();
                this.$el.append(this.elementsView.$el);

                // Trigger connectors re-draw on DND
                // TODO: skip mouseover events on dragstart and finish to ignore them dragstop
                var redrawer = _.bind(this.drawConnectors, this);
                this.elementsView.on("element:drag:start", redrawer);
                this.elementsView.on("element:drag:do", redrawer);
                this.elementsView.on("element:drag:stop", redrawer);
                this.elementsView.on("element:resize",    redrawer);

                //
                // INITIALIZE CONNECTORS
                //
                this.connectorsView = new Backbone.Marionette.ConnectorsView({collection:this.model.umlconnectors,
                    childViewOptions: {
                        elements:this.model.umlelements,
                        parent: this
                    },
                    isEmbedded: this.model.get("isEmbedded")
                });

                this.connectorsView.render();
                this.$el.append(this.connectorsView.$el);
                
                this.connectorsView.on("connector:changed", redrawer);

                //
                // INITIALIZE CANVAS
                //
                this.canvasEuid = this.model.cid+'_Canvas';
                this.canvas = (this.el.childNodes[0]);// .childNodes[0];
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
                this.connectorsView.ctx = this.ctx;
                this.connectorsView.triggerCustomEvent("redraw", this.ctx);
            },
            setMode: function(mode) {
               var isEditable = mode == "edit";
               this.elementsView.children.each(function(element) {
                  element.triggerMethod("ModeChange", isEditable);
               });
            },

            //
            // @description - remove element logic
            //
            removeElement: function(view, isConnector) {
                if (isConnector && view.model && view.model.collection) {
                        view.model.collection.remove(view.model);
                        this.drawConnectors();
                        return;
                }

                var mid = view.model, that = this;
                this.connectorsView.children.each(function(connector, idx, collection) {
                    if (connector.fromModel == mid || connector.toModel == mid) {
                        that.connectorsView.collection.remove(connector.model);
                    }
                });
                this.elementsView.collection.remove(view.model);

                // re-draw connectors
                this.drawConnectors();
            }
        });
        return DiagramView;
    });

