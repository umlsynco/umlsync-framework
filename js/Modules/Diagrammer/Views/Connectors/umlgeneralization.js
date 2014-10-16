
define(['marionette', './../umldiagram'],
    function(Marionette) {
        var Connector = Backbone.Marionette.ConnectorItemView.extend({
            draw: function(c, points, color) {
                if ((points == null) || (points.length < 2)) {
                    return;
                }

                var ep = points.length-1;
                var x2 = points[ep][0],
                    x1 = points[ep-1][0],
                    y2 = points[ep][1],
                    y1 = points[ep-1][1];

                var x = 10,
                    dx = x2 -x1,
                    dy = y2 -y1,
                    gip = Math.sqrt(dx*dx + dy*dy);

                if (gip<x)
                    return;

                var sina = dy/gip,
                    cosa = dx/gip,
                    x3 = x2 - Math.sqrt(x*x*3/4)*cosa,
                    y3 = y2 - Math.sqrt(x*x*3/4)*sina,
                    x6 = x1 - Math.sqrt(x*x*3)*cosa,
                    y6 = y1 - Math.sqrt(x*x*3)*sina,
                    x4 = x3 + x * sina/2,
                    y4 = y3 - x * cosa/2,
                    x5 = x3 - x * sina/2,
                    y5 = y3 + x * cosa/2;

                c.beginPath();
                c.fillStyle = color;
                c.strokeStyle = color;
                c.moveTo(points[0][0], points[0][1]);
                for (i=1; i<ep; ++i) {
                    c.lineTo(points[i][0], points[i][1]);
                }
                c.moveTo(x1, y1);
                c.lineTo(x3, y3);
                c.lineTo(x4, y4);
                c.lineTo(x2, y2);
                c.lineTo(x5, y5);
                c.lineTo(x3, y3);
                c.stroke();
                c.closePath();
            }
        });
        return Connector;
    });


