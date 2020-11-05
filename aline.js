const compositor = require('./compositor.js');

const varianceFunction = "x^10+0.2*x";
const interpolationFunction = "x";
const minimumInterpolation = "6";
const maximumUniformity = "0.5"
const varianceScalar = "5";
const inversionChance = "0.3"
const verticalSpaces = "70";
const horizontalSpaces = "30";

let generationFailed = false;
let failedAttempts = 0;

function variate (base) {
  /*let variation = [0];
  let invert = 1;
  for (column = 0; column <= horizontalSpaces; column++) {
    if (Math.random() >= inversionChance) {
      invert *= -1;
    }
    variation.push(variation[variation.length - 1] + invert * varianceScalar * parseFloat(varianceFunction.replace(/x/g, Math.random())));
  }
  for (column = 0; column <= horizontalSpaces; column++) {
    base.push(variation[column] + base[column]);
  }*/
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
    if (interpolationSpread < minimumInterpolation && !generationFailed) {
      console.log("FAILED: greyscale interpolation step too small.");
      generationFailed = true;
    }
    let interpolationResult = [];
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
    if (currentMap[column][startRow - 1] != 255 && currentMap[column][startRow - 1] != 0 && !generationFailed) {
      console.log("FAILED: overlap detected during position mapping.");
      generationFailed = true;
    }
    interpolatedSet[column].forEach((interpolatedValue, interpolationIndex) => {
      if ((startRow + interpolationIndex - 1) < verticalSpaces) { currentMap[column][startRow + interpolationIndex - 1] = interpolatedValue; }
    });
    for (fillIndex = startRow + interpolatedSet[column].length - 1; fillIndex < verticalSpaces; fillIndex++) {
      currentMap[column][fillIndex] = interpolatedSet[column][interpolatedSet[column].length - 1];
    }
  }
}

function disunify (map) {
  for (row = 0; row < verticalSpaces; row++) {
    let mode;
    let rowContainer = [];
    for (column = 0; column < horizontalSpaces; column++) {
      rowContainer.push(map[column][row]);
    }

    mode = rowContainer.reduce(function(current, item) {
        var val = current.numMapping[item] = (current.numMapping[item] || 0) + 1;
        if (val > current.greatestFreq) {
            current.greatestFreq = val;
            current.mode = item;
        }
        return current;
    }, {mode: null, greatestFreq: -Infinity, numMapping: {}}).mode;

    if (rowContainer.filter(darknessIndex => darknessIndex == mode).length / horizontalSpaces > maximumUniformity && mode != 255 && !generationFailed) {
      console.log("FAILED: row did not pass anti-unifomity check.");
      generationFailed = true;
    }
  }
}

function attemptGeneration (fileName) {
  let fade = [Math.round(Math.random() * verticalSpaces * (1 / varianceScalar))];
  let burn = [];
  let mod = [Math.round(verticalSpaces * (1 / varianceScalar))];

  let fadeAgain = [];
  let burnAgain = [Math.round(Math.random() * verticalSpaces)];
  burnAgain = [30]
  let modAgain = [Math.round(verticalSpaces * (1 / varianceScalar))];

  generationFailed = false;

  /*variate(fade);
  variate(mod);
  variate(burnAgain);
  variate(modAgain);
  for (i = 0; i <= horizontalSpaces; i++) {
    burn.push(fade[i] + mod[i]);
  }
  for (i = 0; i <= horizontalSpaces; i++) {
    fadeAgain.push(burnAgain[i] + modAgain[i]);
  }*/

  for (i = 0; i <= horizontalSpaces; i++) {
    next = variate(fade[fade.length-1]);
    fade.push(next);
  }
  for (i = 0; i <= horizontalSpaces; i++) {
    next = variate(mod[mod.length-1]);
    mod.push(next);
  }
  for (i = 0; i <= horizontalSpaces; i++) {
    burn.push(fade[i] + mod[i]);
  }

  for (i = 0; i <= horizontalSpaces; i++) {
    next = variate(burnAgain[burnAgain.length-1]);
    burnAgain.push(next);
  }
  for (i = 0; i <= horizontalSpaces; i++) {
    next = variate(modAgain[modAgain.length-1]);
    modAgain.push(next);
  }
  for (i = 0; i <= horizontalSpaces; i++) {
    fadeAgain.push(burnAgain[i] + modAgain[i]);
  }

  let testMap = template();
  map(fade, interpolate(fade, burn), testMap);
  map(burnAgain, interpolate(burnAgain, fade), testMap);
  disunify (testMap);
  if (failedAttempts > 5000) {
    console.log("FAILED: recursive generation exceeded 5000 attempts, terminating.");
  }
  else if (!generationFailed) {
    if (failedAttempts == 0) { console.log("SUCCEEDED: passed all checks the first time? Something's not right..."); }
    if (failedAttempts == 1) {  console.log("SUCCEEDED: passed all checks after just one failed attempt. Weird."); }
    else { console.log("SUCCEEDED: passed all checks after " + failedAttempts + " failed attempts."); }
    compositor.compositeMap(testMap, fileName);
  }
  else {
    failedAttempts++;
    attemptGeneration(fileName);
  }
}

let generationTarget = 1;
let batchLabel = "testBatch";
if (process.argv.slice(2)[0]) { generationTarget = process.argv.slice(2)[0] }
if (process.argv.slice(2)[1]) { batchLabel = process.argv.slice(2)[1] }
generationTarget++;

for (index = 1; index < generationTarget; index++) {
  failedAttempts = 0;
  attemptGeneration(`output/${batchLabel}${index}.svg`);
}

/*
let test = [10];
let next;

for (i = 0; i <= horizontalSpaces; i++) {
  next = variate(test[test.length-1]);
  test.push(next);
}

console.log(test);*/
