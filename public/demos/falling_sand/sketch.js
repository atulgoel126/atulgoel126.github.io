let grid;
let velocityGrid;

// I am lazy and don't want to hold the mouse button down
let automatic = true;

// Size of each square
let w = 5;
let cols, rows;
let hueValue = 200;

// If we don't want to accelerate, set this to 0.
let gravity = 0.75;

// Check if a row is within the bounds
function withinCols(i) {
  return i >= 0 && i <= cols - 1;
}

// Check if a column is within the bounds
function withinRows(j) {
  return j >= 0 && j <= rows - 1;
}

function setup() {
  const canvas = createCanvas(500, windowHeight - 100);
  canvas.parent('canvasContainer');
  colorMode(HSB, 360, 255, 255);
  cols = width / w;
  rows = height / w;
  grid = make2DArray(cols, rows);
  velocityGrid = make2DArray(cols, rows, 1);
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  // Initialize the entire 2D array with 0s to make the current status as empty
  for (let i = 0; i < arr.length; i++) {
    // Floor the row in case the row var is not a whole number
    arr[i] = new Array(Math.floor(rows));
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

function mouseDragged() {}

function draw() {
  background(0);

  if (mouseIsPressed || automatic) {
    let mouseCol = floor(mouseX / w);
    let mouseRow = floor(mouseY / w);

    // Randomly add an area of sand particles
    let matrix = 10;
    let extent = floor(matrix / 2);
    for (let i = -extent; i <= extent; i++) {
      for (let j = -extent; j <= extent; j++) {
        if (random(1) < 0.75) {
          let col = mouseCol + i;
          let row = mouseRow + j;
          if (withinCols(col) && withinRows(row)) {
            grid[col][row] = hueValue;
            velocityGrid[col][row] = 1;
          }
        }
      }
    }
    // Change the color of the sand over time
    hueValue += 0.5;
    if (hueValue > 360) {
      hueValue = 1;
    }
  }

  frameRate(30);

  // Draw the sand
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      if (grid[i][j] > 0) {
        fill(grid[i][j], 255, 255);
        let x = i * w;
        let y = j * w;
        square(x, y, w);
      }
    }
  }

  // Create a 2D array for the next frame of animation
  let nextGrid = make2DArray(cols, rows);
  let nextVelocityGrid = make2DArray(cols, rows);

  // Check every cell
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Find the current state of each cell.
      let state = grid[i][j];
      let velocity = velocityGrid[i][j];
      let moved = false;
      if (state > 0) {
        let newPos = int(j + velocity);
        for (let y = newPos; y > j; y--) {
          let below = grid[i][y];
          let dir = 1;
          if (random(1) < 0.5) {
            dir *= -1;
          }
          let belowA = -1;
          let belowB = -1;
          if (withinCols(i + dir)) belowA = grid[i + dir][y];
          if (withinCols(i - dir)) belowB = grid[i - dir][y];

          if (below === 0) {
            nextGrid[i][y] = state;
            nextVelocityGrid[i][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowA === 0) {
            nextGrid[i + dir][y] = state;
            nextVelocityGrid[i + dir][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowB === 0) {
            nextGrid[i - dir][y] = state;
            nextVelocityGrid[i - dir][y] = velocity + gravity;
            moved = true;
            break;
          }
        }
      }

      // Check if the cell has moved to add optimization
      if (state > 0 && !moved) {
        nextGrid[i][j] = grid[i][j];
        nextVelocityGrid[i][j] = velocityGrid[i][j] + gravity;
      }
    }
  }
  grid = nextGrid;
  velocityGrid = nextVelocityGrid;
}
