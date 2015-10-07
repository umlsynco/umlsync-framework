
require("underscore");

define(['marionette', './../umldiagram'],
    function(Marionette) {
        var Connector = Backbone.Marionette.ConnectorItemView.extend({
            draw: function(context2, points, color) {
                if ((points == null) || (points.length < 2)) {
                    return;
                }

                var ep = points.length-1;
                var x = 10,
                    dx = points[ep].x - points[ep-1].x,
                    dy = points[ep].y - points[ep-1].y,
                    gip = Math.sqrt(dx*dx + dy*dy);

                if (gip<x)
                    return;

                var sina = dy/gip,
                    cosa = dx/gip,
                    x3 = points[ep].x - Math.sqrt(x*x*3/4)*cosa,
                    y3 = points[ep].y - Math.sqrt(x*x*3/4)*sina,
                    x6 = points[ep].x - Math.sqrt(x*x*3)*cosa,
                    y6 = points[ep].y - Math.sqrt(x*x*3)*sina,
                    x4 = x3 + x * sina/2,
                    y4 = y3 - x * cosa/2,
                    x5 = x3 - x * sina/2,
                    y5 = y3 + x * cosa/2;

                context2.beginPath();
                context2.fillStyle = color;
                context2.strokeStyle = color;

                context2.moveTo(points[0].x, points[0].y);
                //        context2.arc(points.x.x, points.x.y, 3, 0, Math.PI * 2, true);
                for (var i=1; i<ep; ++i) {
                    context2.lineTo(points[i].x, points[i].y);
                    //    context2.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2, true);
                }
                context2.moveTo(points[ep-1].x, points[ep-1].y);
                context2.lineTo(x6, y6);
                context2.lineTo(x4, y4);
                context2.lineTo(points[ep].x, points[ep].y);
                context2.lineTo(x5, y5);
                context2.lineTo(x6, y6);

                context2.stroke();
                context2.closePath();
            } // draw
        });
        return Connector;
    });
