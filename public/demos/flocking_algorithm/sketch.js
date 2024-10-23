let flock;

function setup() {
  createCanvas(1200, 800);
  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 500; i++) {
    let b = new Boid(random(width), random(height));
    flock.addBoid(b);
  }
}

function draw() {
  background(51); // Dark background color
  flock.run();
}

// Flock class
function Flock() {
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// Boid class
function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 5.0; // Increased size for better visibility
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.stayWithinBounds();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
}

Boid.prototype.render = function() {
  let theta = this.velocity.heading() + radians(90);
  let hue = map(theta, -PI, PI, 0, 360); // Map heading to hue value
  colorMode(HSB);
  fill(hue, 255, 255); // Set color based on hue
  stroke(255, 255, 255); // White outline for birds

  push();
  translate(this.position.x, this.position.y);
  rotate(theta);

  // Draw the circle body
  ellipse(0, 0, this.r * 2, this.r * 2);

  // Draw the arrow indicating direction
  strokeWeight(2);
  line(0, 0, 0, -this.r * 2);
  line(0, -this.r * 2, -this.r / 2, -this.r * 1.5);
  line(0, -this.r * 2, this.r / 2, -this.r * 1.5);

  pop();
  colorMode(RGB); // Reset color mode to RGB
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Keep boids within boundaries
Boid.prototype.stayWithinBounds = function() {
  let d = 25;
  let steer = createVector(0, 0);

  if (this.position.x < d) {
    let desired = createVector(this.maxspeed, this.velocity.y);
    steer = p5.Vector.sub(desired, this.velocity);
  } else if (this.position.x > width - d) {
    let desired = createVector(-this.maxspeed, this.velocity.y);
    steer = p5.Vector.sub(desired, this.velocity);
  }

  if (this.position.y < d) {
    let desired = createVector(this.velocity.x, this.maxspeed);
    steer = p5.Vector.sub(desired, this.velocity);
  } else if (this.position.y > height - d) {
    let desired = createVector(this.velocity.x, -this.maxspeed);
    steer = p5.Vector.sub(desired, this.velocity);
  }

  steer.limit(this.maxforce);
  this.applyForce(steer);
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < desiredseparation)) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }
  if (count > 0) {
    steer.div(count);
  }

  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);
  } else {
    return createVector(0, 0);
  }
}
