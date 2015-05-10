function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.mag = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
};

Vector.prototype.normalize = function() {
    var m = this.mag();
    if(m != 0 && m != 1) {
        this.x /= m;
        this.y /= m;
    }
};

Vector.prototype.limit = function(max) {
    if(this.mag() > max) {
        this.normalize();
        this.x *= max;
        this.y *= max;
    }
};

Vector.prototype.dist = function(v2) {
    var dx = this.x - v2.x;
    var dy = this.y - v2.y;
    return Math.sqrt(dx*dx + dy*dy);
};

Vector.prototype.angle = function() {
    return Math.atan2(this.x, -this.y) * 180/Math.PI;
};