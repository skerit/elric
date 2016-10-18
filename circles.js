var Blast = require('./index')(true);

/**
 * Calculate distance between 2 points
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
function calculateDistance(sx, sy, dx, dy) {
	return Math.sqrt(Math.pow(dx - sx, 2) + Math.pow(dy - sy, 2));
}

/**
 * The circle class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Circle = Function.inherits(function Circle(radius, x, y) {
	this.radius = radius;
	this.x = x;
	this.y = y;
});

/**
 * Do these 2 circles intersect?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Circle}   other_circle
 *
 * @return   {Boolean}
 */
Circle.setMethod(function intersects(other_circle) {
	var distance = calculateDistance(this.x, this.y, other_circle.x, other_circle.y);
	return distance > this.radius + other_circle.radius;
});

/**
 * Is the other circle inside this circle?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Circle}   other_circle
 *
 * @return   {Boolean}
 */
Circle.setMethod(function contains(other_circle) {
	var distance = calculateDistance(this.x, this.y, other_circle.x, other_circle.y);
	return distance < (this.radius - other_circle.radius);
});

/**
 * Is this circle inside the other circle?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Circle}   other_circle
 *
 * @return   {Boolean}
 */
Circle.setMethod(function inside(other_circle) {
	return other_circle.contains(this);
});

/**
 * Intersect 2 circles
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Circle.setMethod(function intersect(other_circle) {

	var distance = calculateDistance(this.x, this.y, other_circle.x, other_circle.y),
	    px,
	    py,
	    a,
	    h;

	// These circles do not overlap
	if (distance > this.radius + other_circle.radius) {
		return [];
	}

	// One circle contains the other
	if (distance < Math.abs(this.radius - other_circle.radius)) {
		return [];
	}

	// Two circles are equal
	if (distance == 0 && this.radius == other_circle.radius) {
		return [];
	}

	console.log(distance);

	// Find distances of dimensions from the first circle center
	a = (Math.pow(this.radius, 2) - Math.pow(other_circle.radius, 2) + Math.pow(distance, 2)) / (2 * distance);
	h = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(a, 2));

	// Determine point on the line between centers perpendicular to intersects
	px = this.x + a * (other_circle.x - this.x) / distance;
	py = this.y + a * (other_circle.y - this.y) / distance;

	return [
		{
			x: px + h * (other_circle.y - this.y) / distance,
			y: py - h * (other_circle.x - this.x) / distance
		},
		{
			x: px - h * (other_circle.y - this.y) / distance,
			y: py + h * (other_circle.x - this.x) / distance
		}
	];
});

var c1 = new Circle(5, 1, 3),
    c2 = new Circle(12, 1, 3);

console.log('Contains:', c1.contains(c2));
console.log('Inside:', c1.inside(c2));

// https://gist.github.com/alanctkc/8566411
var triangulate = function(c1, r1, c2, r2, c3, r3) {
    // A circle object
    var Circle = function(c, r) {
        this.center = c;
        this.radius = r;
    };

    // Initialize circles
    var circles = [
        new Circle(c1, r1),
        new Circle(c2, r2),
        new Circle(c3, r3)
    ];

    // Triangulate with all combinations
    var points = [];
    for (var i = 0; i < 3; i ++) {
        var crossPoints = intersectCircles(
            circles[i].center, circles[i].radius,
            circles[(i+1)%3].center, circles[(i+1)%3].radius
        );
        var thirdPoint = circles[(i+2)%3];
        var offsets = [
            Math.abs(distancePoints(crossPoints[0], thirdPoint.center) - thirdPoint.radius),
            Math.abs(distancePoints(crossPoints[1], thirdPoint.center) - thirdPoint.radius)
        ];
        points.push([crossPoints[0], offsets[0]]);
        points.push([crossPoints[1], offsets[1]]);
    }

    // Find the most precisely triangulated point
    var pointIndex = 0;
    for (var i = 0; i < points.length; i ++) {
        if (points[i][1] < points[pointIndex][1])
            pointIndex = i;
    }
    return points[pointIndex][0];
};
