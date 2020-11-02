var fs = require('fs');

var currentFile = 'test.svg';

var calculatedWidth = 100;
var explicitHeight = 25;
var barHeight = explicitHeight;
var widthRatio = calculatedWidth / explicitHeight;


function setupCanvas (horizontalSpaces, verticalSpaces, barHeight, widthRatio) {

  let barWidth = barHeight * widthRatio;
  let canvasHeight = (barHeight * (verticalSpaces * 2 - 1)) + (barWidth * 2);
  let canvasWidth = barWidth * (horizontalSpaces + 2);

  fs.appendFile(currentFile, `<?xml version="1.0" standalone="no"?>\n<svg width="${canvasWidth}" height="${canvasHeight}" version="1.1" xmlns="http://www.w3.org/2000/svg">`, function (err) {
    if (err) throw err;
  });
}

function sealCanvas () {
  fs.appendFile(currentFile, `\n</svg>`, function (err) {
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

  fs.appendFile(currentFile, `\n<rect x="${calculatedX}" y="${calculatedY}" width="${calculatedWidth}" height="${explicitHeight}" style="fill:rgb(${indexRGB},${indexRGB},${indexRGB});stroke-width:0"/>`, function (err) {
    if (err) throw err;
  });
}

function compositeMap (map) {
  wipeCanvas();
  setTimeout(() => {  console.log("wiping canvas..."); }, 500);
  setupCanvas(map.length, map[0].length, barHeight, widthRatio);
  setTimeout(() => {  console.log("setting up SVG..."); }, 500);
  map.forEach((columnMap, columnIndex) => {
    columnMap.forEach((darknessIndex, rowIndex) => {
      drawBar(columnIndex, rowIndex, darknessIndex);
    });
  });
  setTimeout(() => {  console.log("compositing map..."); }, 500);
  sealCanvas();
}

wipeCanvas();

module.exports = { compositeMap };
