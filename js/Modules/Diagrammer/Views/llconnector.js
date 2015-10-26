define(['marionette', './umldiagram'],
    function(Marionette, diagramm) {
        Backbone.Marionette.SequenceConnectorItemView = Backbone.Marionette.ConnectorItemView.extend({
            //
            // @description - helper method to get all connection points
            //
            '_getConnectionPoints': function(fromId, toId, epoints) {
                var p1 = $('#'+ fromId).position();

                var p2 = $('#' + toId).position();

                var p11 = $('#'+ fromId + "_Border").position();
                if (!p11) {
                    return;
                }
                var p21 = $('#' + toId + "_Border").position(),
                    w11 = $('#' + fromId + "_Border").width() + 26,
                    w21 = $('#' + toId + "_Border").width() + 26,
                    scrollTop = $("#" + toId + "_Border").parent().scrollTop(),
                    scrollLeft =$("#" + toId + "_Border").parent().scrollLeft();

                if (toId == "ConnectionHelper") {
                    var y1 = (p11.top + 40 > p21.top) ? p11.top + 40 : p21.top;
                    y1+=5;
                    var y2 = y1;
                    var x1 = (p11.left + w11/2 + 13);
                    var x2 = (p21.left + 10);
                    var newpoints = [{x:x1,y:y1}, {x:x2, y:y2}];
                    return newpoints;
                } else {
                    if ((epoints == undefined) || (epoints.length ==0)) {
                        var y1 = (p11.top > p21.top) ? p11.top : p21.top;
                        h1 = (p11.top > p21.top) ? p1.top : p2.top;
                        y1 += h1;
                        var y2 = y1,
                            x1 = 0,
                            x2 = 0;
                        if (p21.left > p11.left) {
                            x1 = (p11.left + w11 - 20);
                            x2 = (p21.left);
                        } else {
                            x1 = (p11.left + 10 );
                            x2 = (p21.left + w21 - 20);
                        }
                        // x,y are relative coordinates and we need to add
                        // scrolling to them in case individual canvas for diagram
                        var newpoints = [{x:x1+scrollLeft,y:y1+5+scrollTop}, {x:x2+scrollLeft,y:y2+5+scrollTop}];
                         return newpoints;

                    } else {
                        scrollTop = 0;
                        var y2 = epoints[epoints.length-1].y,
                            y1 = y2,
                            x1 = 0,
                            x2 = 0;
                        if (p21.left > p11.left) {
                            x1 = (p11.left + w11 - 20);
                            x2 = (p21.left);
                        } else {
                            x1 = (p11.left + 10 );
                            x2 = (p21.left + w21 - 20);
                        }
                        var newpoints = //[[x1,y1], [x2,y2]];
                            [{x:x1 + scrollLeft, y:y1 - scrollTop}, {x:x2+ scrollLeft, y:y2 - scrollTop}];
                        return newpoints;
                    }
                }
            },            //
            // @description - is point over the line ?
            //
            isPointOnLine: function (x, y) {
                if (this.points == undefined)
                    return false;

                for (var i = 0; i < this.points.length - 1; ++i) {
                    var dx1 = x - this.points[i].x,
                        dy1 = y - this.points[i].y,
                        dx = this.points[i + 1].x - x,
                        dy = this.points[i + 1].y - y,
                        gip1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
                        gip = Math.sqrt(dx * dx + dy * dy);

                    if (((gip1 + gip) - this.gip[i]) < 0.2) {
                        //     dm.at.cs.mouseover = {euid:this.euid};
                        return true;
                    }
                }
                return false;
            },
            //
            // @description - add extra points for the connector
            //
            startTransform: function (x1, y1) {
                $.log("START TRANSFORM !! " + x1 + " Y " + y1);

                // Some scrolling stuff, do not take in account
                var x = x1 + this.$el.parent().scrollLeft(),
                    y = y1 + this.$el.parent().scrollTop();

                this.eppos = 0; // Modify an existing point
                this.epoints[this.eppos] = {x: x1, y: y1};

                this.trigger("drag:start", this.epoints[this.eppos]);
                return true;
            },
            //
            // @description - stop extra points adding
            //
            stopTransform: function (x1, y1) {
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
                this.trigger("drag:stop", this.epoints[this.eppos]);
                this.eppos = undefined;
            },

            TransformTo: function (x1, y1) {
//				$.log("TRANSFORM !! " + x1 + " Y " + y1 + " EPOS : " + this.eppos);
                if (this.eppos != undefined) {
                    var x = x1 + this.$el.parent().scrollLeft(),
                        y = y1 + this.$el.parent().scrollTop();
                    this.epoints[this.eppos].x = x;
                    this.epoints[this.eppos].y = y;

                    var updateModel = this.model.umlepoints.at(0);
                    if (updateModel) {
                        updateModel.set(this.epoints[this.eppos]);
                    }
                    else {
                        this.model.umlepoints.add(this.epoints[this.eppos]);
                    }
                    this.trigger("drag:do", this.epoints[this.eppos]);
                }
            }

        } );

    });
