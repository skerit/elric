console.log('If you see this, it worked');

var ctx = document.getElementById('mycanvas').getContext('2d');

function drawCircle(circle, stroke, dot) {

	ctx.beginPath();
	ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, false); 
	ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = stroke || '#003000';
	ctx.stroke();

	drawPoints(circle, stroke || dot || 'rgba(0,0,0,0.3)');
}

function drawPoints(points, color) {

	var point,
	    i;

	if (color == null) {
		color = 'red';
	}

	points = Array.cast(points);

	for (i = 0; i < points.length; i++) {
		point = points[i];

		ctx.beginPath();
		ctx.arc(point.x, point.y, 5, 0, Math.PI*2, false); 
		ctx.fillStyle = color;
		ctx.fill();
	}
}

var bureau   = [297, 380, 364, 339],
    topright = [1, 53, 502, 331],
    kitchen  = [342, 352, 26, 94],
    inkom    = [277, 454, 232, 261],
    badkamer = [218, 502, 201, 102],
    zetel    = [275, 111, 396, 312],
    bottom   = [233, 485, 227, 357],
    wc       = [26, 225, 274, 165],
    tafel    = [213, 342, 305, 342];

var cur = wc;

var c1 = new Blast.Classes.Circle(cur[0], 280, 360),
    c2 = new Blast.Classes.Circle(cur[1], 520, 40),
    c3 = new Blast.Classes.Circle(cur[2], 160, 360),
    c4 = new Blast.Classes.Circle(cur[3], 250, 40);

// da - 0.646 - 0.6312
// 14 - 0.542 - 0.4478
// eb - 0.547 - 0.5232
// 26 - 0.606 - 0.5737

drawCircle(c1, 'rgba(200,0,0,0.3)');
drawCircle(c2, 'rgba(0,200,0,0.3)');
drawCircle(c3, 'rgba(0,0,200,0.3)');
drawCircle(c4, 'rgba(200,0,200,0.3)');

drawPoints(c1.intersect(c2));

// Bureau
drawPoints({x: 560, y: 340}, 'cyan')

//drawPoints(c1.intersect(c3));
//drawPoints(c2.intersect(c3));

var pos = Blast.Classes.Circle.trilaterate(c1, c2, c3);
var pos2 = Blast.Classes.Circle.trilaterate(c1, c2, c3, c4);

console.log('Trilaterated:', pos, pos2);
drawPoints(pos, 'green')
drawPoints(pos2, 'orange');