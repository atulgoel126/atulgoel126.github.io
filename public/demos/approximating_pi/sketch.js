const r = 200;

let total = 0;
let circle = 0;

let recordPI = 0;
let last10Values = [];

let resultP;
let pointsPerFrame = 10; // Start with a slower rate
let iterationCount = 0;

function setup() {
  createCanvas(402, 402);
  frameRate(30);
  resultP = createP("Approximated Values:<br>");
  createP(`Actual Value of PI: ${Math.PI}`);
  background(0);
  translate(width / 2, height / 2);
  stroke(255);
  strokeWeight(4);
  noFill();
  ellipse(0, 0, r * 2, r * 2);
  rectMode(CENTER);
  rect(0, 0, r * 2, r * 2);
}

function draw() {
  translate(width / 2, height / 2);

  for (let i = 0; i < pointsPerFrame; i++) {
    const x = random(-r, r);
    const y = random(-r, r);
    total++;

    const d = x * x + y * y;
    if (d < r * r) {
      circle++;
      stroke(240, 99, 164);
    } else {
      stroke(45, 197, 244);
    }
    strokeWeight(1);
    point(x, y);

    const pi = 4 * (circle / total);
    let recordDiff = Math.abs(Math.PI - recordPI);
    let diff = Math.abs(Math.PI - pi);
    if (diff < recordDiff) {
      recordDiff = diff;
      recordPI = pi;
      last10Values.push(recordPI);
      if (last10Values.length > 10) {
        last10Values.shift();
      }
      resultP.html("Approximated Values:<br>" + last10Values.join("<br>"));
    }
  }

  iterationCount++;
  if (iterationCount % 100 === 0) {
    // Increase pointsPerFrame every 100 iterations
    pointsPerFrame += 10; // Gradually increase the points per frame
  }
}
