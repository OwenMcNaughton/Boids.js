function Boid(pos, vel, rot) {
    this.pos = new Vector(pos.x, pos.y, pos.z);
    this.vel = new Vector(vel.x, vel.y, vel.z);
    this.rot = new Vector(rot.x, rot.y, rot.z);
    this.acc = new Vector(0, 0, 0);
    
    this.maxSpeed = .3;
    this.cohDist = 40;
    this.sepDist = 15;
    this.aliDist = 60;
    this.maxForce = 0.0001;
    
    this.sepFac = 2;
    this.cohFac = 1;
    this.aliFac = 4.3;
}

Boid.prototype.update = function(boids) {
    var coh = this.cohesion(boids);
    var sep = this.separation(boids);
    var ali = this.alignment(boids);
    coh.mulScalar(this.cohFac);
    sep.mulScalar(this.sepFac);
    ali.mulScalar(this.aliFac);
    
    this.acc.add(coh);
    this.acc.add(sep);
    this.acc.add(ali);
    this.vel.add(this.acc);
    
    this.vel.limit(this.maxSpeed);
    
    this.pos.add(this.vel);
    
    this.rot.x = this.vel.angleyz();
    this.rot.y = this.vel.anglexz();
    this.rot.z = -this.vel.anglexy();
}

Boid.prototype.cohesion = function(boids) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(dist > 0.001 && dist < this.cohDist) {
            sum.add(boids[i].pos);
            count++;
        }
    }
    
    if(count > 0) {
        sum.divScalar(count);
        return this.seek(sum);
    }
}

Boid.prototype.separation = function(boids) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(dist > 0.001 && dist < this.sepDist) {
            var diff = new Vector(this.pos.x, this.pos.y, this.pos.z);
            diff.sub(boids[i].pos);
            diff.normalize();
            diff.divScalar(dist);
            sum.add(diff);
            count++;
        }
    }
    
    if(count > 0) {
        sum.divScalar(count);
    }
    
    if(sum.x == 0 && sum.y == 0 && sum.z) {
        return diff;
    }
    
    if(sum.mag() > 0) {
        sum.normalize();
        sum.mulScalar(this.maxSpeed);
        sum.sub(this.vel);
        sum.limit(this.maxForce);
    }
    return sum;
}

Boid.prototype.alignment = function(boids) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(dist > 0.001 && dist < this.aliist) {
            sum.add(boids[i].vel);
            count++;
        }
    }
    
    if(count > 0) {
        sum.divScalar(count);
        sum.normalize();
        sum.mulScalar(this.maxSpeed);
        sum.sub(this.vel);
        sum.limit(this.maxForce);
        return sum;
    } else {
        return new Vector(0, 0, 0);
    }
}

Boid.prototype.seek = function(target) {
    target.sub(this.pos);
    target.normalize();
    target.mulScalar(this.maxSpeed);

    target.sub(this.vel);
    target.limit(this.maxForce);
    return target;
}