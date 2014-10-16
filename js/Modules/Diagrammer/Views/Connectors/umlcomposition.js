
define(['marionette', './../umldiagram'],
    function(Marionette) {
        var Connector = Backbone.Marionette.ConnectorItemView.extend({
            draw: function(context2, points, color, isSvg) {
                if ((points == null) || (points.length < 2)) {
                    return;
                }

                var ep = points.length-1;
                var x = 10,
                    dx = points[ep][0] - points[ep-1][0],
                    dy = points[ep][1] - points[ep-1][1],
                    gip = Math.sqrt(dx*dx + dy*dy);

                if (gip<x)
                    return;

                var sina = dy/gip,
                    cosa = dx/gip,
                    x3 = points[ep][0] - Math.sqrt(x*x*3/4)*cosa,
                    y3 = points[ep][1] - Math.sqrt(x*x*3/4)*sina,
                    x6 = points[ep][0] - Math.sqrt(x*x*3)*cosa,
                    y6 = points[ep][1] - Math.sqrt(x*x*3)*sina,
                    x4 = x3 + x * sina/2,
                    y4 = y3 - x * cosa/2,
                    x5 = x3 - x * sina/2,
                    y5 = y3 + x * cosa/2;

                context2.beginPath();
                context2.fillStyle = color;
                context2.strokeStyle = color;
                context2.moveTo(points[0][0], points[0][1]);
                for (i=1; i<ep; ++i) {
                    context2.lineTo(points[i][0], points[i][1]);
                }
                context2.stroke();
                context2.closePath();

                context2.beginPath();
                context2.fillStyle = color;
                context2.strokeStyle = color;
                context2.moveTo(points[ep-1][0], points[ep-1][1]);
                context2.lineTo(x6, y6);
                context2.lineTo(x4, y4);
                context2.lineTo(points[ep][0], points[ep][1]);
                context2.lineTo(x5, y5);
                context2.lineTo(x6, y6);
                context2.fill();
                context2.stroke();
                context2.closePath();

            }
        });
        return Connector;
    });

