// Added a few extra spaces to reduce background noise.
const density = 'Ñ@#W$9876543210?!abc;:+=-,._          ';

// Couple of other ways - didn't look as clean as I imagined :(
//const density = '       .:-i|=+%O#@'
//const density = '        .:░▒▓█';

let video;
let asciiDiv;

function setup() {
  asciiDiv = createDiv();
  noCanvas();
  // LOL! This is way easier than I thought :D
  video = createCapture(VIDEO);
  video.size(64, 48);
}

function draw() {
  video.loadPixels();
  let asciiImage = '';
  for (let j = 0; j < video.height; j++) {
    for (let i = 0; i < video.width; i++) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, 0, len));
      const c = density.charAt(charIndex);
      if (c == ' ') {
        asciiImage += '&nbsp;';
      } else asciiImage += c;
    }
    asciiImage += '<br/>';
  }
  asciiDiv.html(asciiImage);
}
