function Boid(pos, vel, rot) {
    this.pos = new Vector(pos.x, pos.y, pos.z);
    this.vel = new Vector(vel.x, vel.y, vel.z);
    this.rot = new THREE.Euler(rot.x, rot.y, rot.z);
    this.acc = new Vector(0, 0, 0);
    
    this.vfrom = new THREE.Vector3(0, 1, 0);
    
    cohDist = 18;
    sepDist = 10;
    aliDist = 15;

    this.tarFac = .1;
}

Boid.prototype.update = function(boids, target, splitFlag) {
    var coh = this.cohesion(boids, splitFlag);
    var sep = this.separation(boids);
    var ali = this.alignment(boids);
    
    if(!(typeof coh === 'undefined')) {
        coh.mulScalar(cohFac);
        this.acc.add(coh);
    }
    
    if(!(typeof coh === 'undefined')) {
        sep.mulScalar(sepFac);
        this.acc.add(sep);
    }
    
    if(!(typeof coh === 'undefined')) {
        ali.mulScalar(aliFac);
        this.acc.add(ali);
    }
    
    if(!(typeof target === 'undefined')) {
        var tar = new Vector(target.position.x, target.position.y, target.position.z);
        tar = this.seek(tar);
        tar.mulScalar(this.tarFac);
        this.acc.add(tar);
    } else {
        var tar = new Vector(0, 0, 0);
        tar = this.seek(tar);
        tar.mulScalar(this.tarFac);
        this.acc.add(tar);
    }
    
    
    this.vel.add(this.acc);
    
    
    this.vel.limit(maxSpeed);
    
    this.pos.add(this.vel);
    
    var quat = new THREE.Quaternion();
    var v = new THREE.Vector3(this.vel.x, this.vel.y, this.vel.z);
    v.normalize();
	quat.setFromUnitVectors(this.vfrom, v);
	
	this.rot.setFromQuaternion(quat);
};

Boid.prototype.cohesion = function(boids, splitFlag) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(dist > 0.001 && dist < cohDist) {
            sum.add(boids[i].pos);
            count++;
        }
    }
    
    if(count > 0) {
        sum.divScalar(count);
        if(splitFlag) {
            return this.disperse(sum);
        } else {
            return this.seek(sum);
        }
    }
};

Boid.prototype.separation = function(boids) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(dist > 0.001 && dist < sepDist) {
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
        sum.mulScalar(maxSpeed);
        sum.sub(this.vel);
        sum.limit(maxForce);
    }
    return sum;
};

Boid.prototype.alignment = function(boids) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(dist > 0.001 && dist < aliDist) {
            sum.add(boids[i].vel);
            count++;
        }
    }
    
    if(count > 0) {
        sum.divScalar(count);
        sum.normalize();
        sum.mulScalar(maxSpeed);
        sum.sub(this.vel);
        sum.limit(maxForce);
        return sum;
    } else {
        return new Vector(0, 0, 0);
    }
};

Boid.prototype.seek = function(target) {
    target.sub(this.pos);
    target.normalize();
    target.mulScalar(maxSpeed);

    target.sub(this.vel);
    target.limit(maxForce);
    return target;
};

Boid.prototype.disperse = function(target) {
    target.sub(this.pos);
    target.normalize();
    target.mulScalar(-maxSpeed*100);
    maxForce = this.forceHigh;

    target.sub(this.vel);
    target.limit(maxForce);
    return target;
};