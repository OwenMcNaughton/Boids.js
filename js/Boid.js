function Boid(pos, vel, rot, shk) {
    this.pos = new Vector(pos.x, pos.y, pos.z);
    this.vel = new Vector(vel.x, vel.y, vel.z);
    this.rot = new THREE.Euler(rot.x, rot.y, rot.z);
    this.acc = new Vector(0, 0, 0);
    
    this.vfrom = new THREE.Vector3(0, 1, 0);
    
    cohDist = 18;
    sepDist = 10;
    aliDist = 15;
    
    this.shark = shk;
    this.sharkFlag = false;
}

Boid.prototype.update = function(boids, target, sharks) {
    this.sharkFlag = false;
    
    var sep = this.separation(boids);
    var ali = this.alignment(boids);
    var sharkSep = this.sharkSeparation(sharks);
    var coh = this.cohesion(boids);
    
    if(this.shark) {
        if(!(typeof coh === 'undefined')) {
            coh.mulScalar(5);
        }
        if(!(typeof sep === 'undefined')) {
            sep.mulScalar(0.01);
        }
        if(!(typeof ali === 'undefined')) {
            ali.mulScalar(0);
        }
    } else {
        if(this.sharkFlag) {
            if(!(typeof coh === 'undefined')) {
                coh.mulScalar(sharkCohFac);
            }
            if(!(typeof sep === 'undefined')) {
                sep.mulScalar(0);
            }
            if(!(typeof sharkSep === 'undefined')) {
                sharkSep.mulScalar(sharkSepFac);
            }
            if(!(typeof ali === 'undefined')) {
                ali.mulScalar(sharkAliFac);
            }
        } else {
            if(!(typeof coh === 'undefined')) {
                coh.mulScalar(cohFac);
            }
            if(!(typeof sep === 'undefined')) {
                sep.mulScalar(sepFac);
            }
            if(!(typeof sharkSep === 'undefined')) {
                sharkSep.mulScalar(0);
            }
            if(!(typeof ali === 'undefined')) {
                ali.mulScalar(aliFac);
            }
        }
    }
    
    if(!(typeof sep === 'undefined')) {
        this.acc.add(sep);
    }
    if(!(typeof coh === 'undefined')) {
        this.acc.add(coh);
    }
    if(!(typeof ali === 'undefined')) {
        this.acc.add(ali);
    }
    if(!(typeof sharkSep === 'undefined')) {
        this.acc.add(sharkSep);
    }
    
    if(!(typeof target === 'undefined')) {
        var tar = new Vector(target.x, target.y, target.z);
        tar = this.seek(tar);
        if(this.shark) {
            tar.mulScalar(tarFac*20);
        } else {
            tar.mulScalar(tarFac);
        }
        this.acc.add(tar);
    } else {
        var tar = new Vector(0, 0, 0);
        tar = this.seek(tar);
        tar.mulScalar(tarFac);
        this.acc.add(tar);
    }
    
    this.vel.add(this.acc);
    
    if(this.shark) {
        this.vel.limit(maxSpeed*1.5);
    } else {
        if(this.sharkFlag) {
            this.vel.limit(sharkMaxSpeed);
        } else {
            this.vel.limit(maxSpeed);
        }
    }
    
    this.pos.add(this.vel);
    
    var quat = new THREE.Quaternion();
    var v = new THREE.Vector3(this.vel.x, this.vel.y, this.vel.z);
    v.normalize();
	quat.setFromUnitVectors(this.vfrom, v);
	
	this.rot.setFromQuaternion(quat);
};

Boid.prototype.cohesion = function(boids) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != boids.length; i++) {
        var dist = this.pos.dist(boids[i].pos);
        if(this.shark) {
            if(dist > 0.001 && dist < cohDist*3) {
                sum.add(boids[i].pos);
                count++;
            }
        } else {
            if(dist > 0.001 && dist < cohDist) {
                sum.add(boids[i].pos);
                count++;
            }
        }
    }
    
    if(count > 0) {
        sum.divScalar(count);
        if(this.sharkFlag) {
            return this.disperse(sum);
        } else {
            return this.seek(sum);
        }
    } else {
        return new Vector(0, 0, 0);
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

Boid.prototype.sharkSeparation = function(sharks) {
    var count = 0;
    var sum = new Vector(0, 0, 0);
    
    for(var i = 0; i != sharks.length; i++) {
        var dist = this.pos.dist(sharks[i].pos);
        if(dist > 0.001 && dist < sharkSepDist) {
            var diff = new Vector(this.pos.x, this.pos.y, this.pos.z);
            diff.sub(boids[i].pos);
            diff.normalize();
            diff.divScalar(dist);
            sum.add(diff);
            this.sharkFlag = true;
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
        sum.mulScalar(sharkMaxSpeed);
        sum.sub(this.vel);
        sum.limit(sharkMaxForce);
    }
    return sum;
}

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
    if(this.shark) {
        target.sub(this.pos);
        target.normalize();
        target.mulScalar(maxSpeed*10);
    
        target.sub(this.vel);
        target.limit(maxForce);
        return target;
    } else {
        target.sub(this.pos);
        target.normalize();
        target.mulScalar(maxSpeed);
    
        target.sub(this.vel);
        target.limit(maxForce);
        return target;
    }
};

Boid.prototype.disperse = function(target) {
    target.sub(this.pos);
    target.normalize();
    target.mulScalar(-maxSpeed*100);

    target.sub(this.vel);
    target.limit(maxForce*10);
    return target;
};