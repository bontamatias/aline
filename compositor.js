var fs = require('fs');

var currentFile = 'test.svg';
var currentFD;

var calculatedWidth = 100;
var explicitHeight = 25;
var barHeight = explicitHeight;
var widthRatio = calculatedWidth / explicitHeight;

const debug = false;

function setupCanvas (horizontalSpaces, verticalSpaces, barHeight, widthRatio) {


  let barWidth = barHeight * widthRatio;
  let canvasHeight = (barHeight * (verticalSpaces * 2 - 1)) + (barWidth * 2);
  let canvasWidth = barWidth * (horizontalSpaces + 2);

  fs.appendFileSync(currentFile, `<?xml version="1.0" standalone="no"?>\n<svg width="${canvasWidth}" height="${canvasHeight}" version="1.1" xmlns="http://www.w3.org/2000/svg">`, function (err) {
    if (err) throw err;
  });

  if (debug) {
    fs.appendFileSync(currentFile, `\n<rect x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" style="fill:none;stroke:black;stroke-width:10"/>`, function (err) {
      if (err) throw err;
    });
  }
}

function sealCanvas () {
  fs.appendFileSync(currentFile, `\n</svg>`, function (err) {
    if (err) throw err;
  });
}

function wipeCanvas () {
  fs.writeFile(currentFile, ``, function (err) {
    if (err) throw err;
  });
}

function drawBar (posX, posY, indexRGB) {
  calculatedX = posX * calculatedWidth + calculatedWidth;
  calculatedY = 2 * posY * explicitHeight + calculatedWidth;

  fs.appendFileSync(currentFile, `\n<rect x="${calculatedX}" y="${calculatedY}" width="${calculatedWidth}" height="${explicitHeight}" style="fill:rgb(${indexRGB},${indexRGB},${indexRGB});stroke-width:0"/>`, function (err) {
    if (err) throw err;
  });
}

function compositeMap (map, filePath) {
  if (filePath) { currentFile = filePath; }
  wipeCanvas();
  setupCanvas(map.length, map[0].length, barHeight, widthRatio, filePath);
  map.forEach((columnMap, columnIndex) => {
    columnMap.forEach((darknessIndex, rowIndex) => {
      drawBar(columnIndex, rowIndex, darknessIndex);
    });
  });
  sealCanvas();
}

module.exports = { compositeMap };
