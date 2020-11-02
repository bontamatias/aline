const compositor = require('./compositor.js');

const varianceFunction = "x^5+0.1*x";
const interpolationFunction = "x";
const varianceScalar = "5";
const inversionChance = "0.3"
const verticalSpaces = "40";
const horizontalSpaces = "20";

let fade = [Math.round(Math.random() * verticalSpaces)];
let burn = [Math.round(Math.random() * verticalSpaces)];

function variate (base) {
  let invert = -1;
  if (Math.random() >= inversionChance) {
    invert = 1;
  }
  return Math.round(base + invert * varianceScalar * parseFloat(varianceFunction.replace(/x/g, Math.random())));
}

function interpolate (first, second) {
  let finalResult = [];
  for (column = 0; column < horizontalSpaces; column++) {
    let interpolationSpread = Math.abs(first[column] - second[column]);
    let interpolationResult = [];
    console.log(first[column] - second[column]);
    for (tick = 0; tick <= interpolationSpread; tick++) {
      interpolationResult.push(Math.floor(255 * tick / interpolationSpread));
    }
    if (first[column] - second[column] < 0) {
      interpolationResult.reverse();
    }
    finalResult.push(interpolationResult);
  }
  return finalResult;
}

function template () {
  let finalResult = [];
  for (column = 0; column < horizontalSpaces; column++) {
    let strip = [];
    for (row = 0; row < verticalSpaces; row++) {
      strip.push(255);
    }
    finalResult.push(strip);
  }
  return finalResult;
}

function map (leadingEdge, interpolatedSet, currentMap) {
  for (column = 0; column < horizontalSpaces; column++) {
    startRow = leadingEdge[column];
    interpolatedSet[column].forEach((interpolatedValue, interpolationIndex) => {
      currentMap[column][startRow + interpolationIndex - 1] = interpolatedValue;
    });
    for (fillIndex = startRow + interpolatedSet[column].length - 1; fillIndex < verticalSpaces; fillIndex++) {
      currentMap[column][fillIndex] = interpolatedSet[column][interpolatedSet[column].length - 1];
    }
  }
}

for (i = 0; i <= horizontalSpaces; i++) {
  next = variate(fade[fade.length-1]);
  fade.push(next);
}
for (i = 0; i <= horizontalSpaces; i++) {
  next = variate(burn[burn.length-1]);
  burn.push(next);
}

console.log(fade);
console.log(burn);
console.log(interpolate(fade, burn));
let testMap = template();
map(fade, interpolate(fade, burn), testMap);
console.log(testMap);
compositor.compositeMap(testMap);
