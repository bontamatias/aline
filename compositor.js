var fs = require('fs');

var currentFile = "test.svg";

fs.appendFile('test.svg', 'LINE ', function (err) {
  if (err) throw err;
});

function setBarHeight (height) {

}

function setWidthRatio (ratio) {

}

function setupCanvas () {
  fs.appendFile(currentFile, "<svg width='400' height='110'>");
}
