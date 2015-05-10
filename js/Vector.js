function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Vector.prototype.mag = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};

Vector.prototype.normalize = function() {
    var m = this.mag();
    if(m != 0 && m != 1) {
        this.x /= m;
        this.y /= m;
        this.z /= m;
    }
};

Vector.prototype.limit = function(max) {
    if(this.mag() > max) {
        this.normalize();
        this.x *= max;
        this.y *= max;
        this.z *= max;
    }
};

Vector.prototype.dist = function(v2) {
    var dx = v2.x - this.x;
    var dy = v2.y - this.y;
    var dz = v2.z - this.z;
    var dx2 = dx*dx; var dy2 = dy*dy; var dz2 = dz*dz;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
};

Vector.prototype.angle = function() {
    return Math.atan2(this.x, -this.y) * 180/Math.PI;
};