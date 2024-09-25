let shapes = [];
let radiusSlider,
  distortionFactorSlider,
  baseTransitionDurationSlider,
  baseHoldTimeSlider,
  textSizeSlider,
  strokeWeightSlider;
let radius = 200;
let distortionFactor = 0.5;
let baseTransitionDuration = 30;
let baseHoldTime = 30;
let bezierEase = [0.075, 0.82, 0.165, 1];

let polygonFillColorPicker, textColorPicker, strokeColorPicker;
let polygonFillColor, textColor, strokeColor;
let strokeWeightValue = 1;

let customFont;
let uploadedFont;
let fontInput;

// Input boxes for top and bottom text
let topTextInput, bottomTextInput;
let topText = "iSchool";
let bottomText = "institute";

function preload() {
  customFont = loadFont("./fonts/SpaceMono-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  radiusSlider = createSlider(10, 350, radius, 1);
  distortionFactorSlider = createSlider(0, 1, distortionFactor, 0.01);
  baseTransitionDurationSlider = createSlider(
    10,
    100,
    baseTransitionDuration,
    1
  );

  baseHoldTimeSlider = createSlider(10, 100, baseHoldTime, 1);
  textSizeSlider = createSlider(10, 60, 24, 1);
  strokeWeightSlider = createSlider(0, 10, 1, 0.5);

  polygonFillColorPicker = createColorPicker("#ffff");
  textColorPicker = createColorPicker("#000000");
  strokeColorPicker = createColorPicker("#000000");

  radiusSlider.position(190, 10);
  distortionFactorSlider.position(190, 40);
  baseTransitionDurationSlider.position(190, 70);
  baseHoldTimeSlider.position(190, 100);
  textSizeSlider.position(190, 130);
  strokeWeightSlider.position(190, 160);

  polygonFillColorPicker.position(190, 190);
  textColorPicker.position(190, 220);
  strokeColorPicker.position(190, 250);

  // Create a file input for font upload
  fontInput = createFileInput(handleFontUpload);
  fontInput.position(190, 280);

  // Create text input for top and bottom text
  topTextInput = createInput(topText);
  topTextInput.position(190, 310);
  topTextInput.input(updateTopText);

  bottomTextInput = createInput(bottomText);
  bottomTextInput.position(190, 340);
  bottomTextInput.input(updateBottomText);

  textFont(customFont);
  textAlign(CENTER, BASELINE);
  textSize(24);
  stroke(0);
  strokeWeight(1);

  let shapeObj = {
    currentShape: [],
    targetShape: [],
    transitionProgress: 0,
    holdCounter: 0,
    isTransitioning: true,
    transitionDuration: baseTransitionDuration + random(-5, 5),
    holdTime: baseHoldTime + random(-10, 10),
  };
  generateShape(shapeObj.currentShape);
  generateShape(shapeObj.targetShape);
  shapes.push(shapeObj);
}

function draw() {
  background(255);

  // Use uploaded font if available, otherwise fall back to customFont
  textFont(uploadedFont || customFont);

  push();
  textAlign(LEFT, BASELINE);
  textSize(13);
  noStroke();
  fill(0);
  text("Radius", 20, 25);
  text("Distortion Factor", 20, 55);
  text("Transition Duration", 20, 85);
  text("Hold Time", 20, 115);
  text("Text Size", 20, 145);
  text("Stroke Weight", 20, 175);
  text("Polygon Fill Color", 20, 205);
  text("Text Color", 20, 235);
  text("Stroke Color", 20, 265);
  text("Upload Font", 20, 295);
  text("Top Text", 20, 325);
  text("Bottom Text", 20, 355);
  pop();

  radius = radiusSlider.value();
  distortionFactor = distortionFactorSlider.value();
  baseTransitionDuration = baseTransitionDurationSlider.value();
  baseHoldTime = baseHoldTimeSlider.value();
  let textSizeValue = textSizeSlider.value();
  strokeWeightValue = strokeWeightSlider.value();

  polygonFillColor = polygonFillColorPicker.color();
  textColor = textColorPicker.color();
  strokeColor = strokeColorPicker.color();

  translate(width / 2, height / 2);

  shapes.forEach((shapeObj, index) => {
    let vertices = [];

    stroke(strokeColor);
    strokeWeight(strokeWeightValue);
    fill(polygonFillColor);

    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i;
      let currentRadius = shapeObj.currentShape[i];
      let targetRadius = shapeObj.targetShape[i];
      let easedProgress = cubicBezierEase(
        shapeObj.transitionProgress / shapeObj.transitionDuration,
        bezierEase
      );
      let interpolatedRadius = lerp(currentRadius, targetRadius, easedProgress);
      let x = cos(angle) * interpolatedRadius;
      let y = sin(angle) * interpolatedRadius;
      vertex(x, y);
      vertices.push(createVector(x, y));
    }
    endShape(CLOSE);

    let leftEdgeVec = p5.Vector.sub(vertices[4], vertices[5]);
    let leftEdgeMid = p5.Vector.add(vertices[4], vertices[5]).div(2);

    let rightEdgeVec = p5.Vector.sub(vertices[1], vertices[2]);
    let rightEdgeMid = p5.Vector.add(vertices[1], vertices[2]).div(2);

    push();
    translate(leftEdgeMid.x, leftEdgeMid.y);
    let leftEdgeAngle = atan2(leftEdgeVec.y, leftEdgeVec.x);

    if (abs(degrees(leftEdgeAngle)) > 90) {
      leftEdgeAngle += PI;
    }
    rotate(leftEdgeAngle);
    noStroke();
    fill(textColor);
    textSize(textSizeValue);
    text(topText, 0, 30); // Using topText variable
    pop();

    push();
    translate(rightEdgeMid.x, rightEdgeMid.y);
    let rightEdgeAngle = atan2(rightEdgeVec.y, rightEdgeVec.x);

    if (abs(degrees(rightEdgeAngle)) > 90) {
      rightEdgeAngle += PI;
    }
    rotate(rightEdgeAngle);
    noStroke();
    fill(textColor);
    textSize(textSizeValue);
    text(bottomText, 0, -12); // Using bottomText variable
    pop();

    if (shapeObj.isTransitioning) {
      shapeObj.transitionProgress++;

      if (shapeObj.transitionProgress >= shapeObj.transitionDuration) {
        shapeObj.isTransitioning = false;
        shapeObj.holdCounter = 0;
        shapeObj.currentShape = [...shapeObj.targetShape];
      }
    } else {
      shapeObj.holdCounter++;

      if (shapeObj.holdCounter >= shapeObj.holdTime) {
        shapeObj.isTransitioning = true;
        shapeObj.transitionProgress = 0;
        shapeObj.transitionDuration = baseTransitionDuration + random(-5, 5);
        shapeObj.holdTime = baseHoldTime + random(-10, 10);
        generateShape(shapeObj.targetShape);
      }
    }
  });
}

// Function to handle font upload
function handleFontUpload(file) {
  if (file.type === "font") {
    uploadedFont = loadFont(file.data);
  } else {
    console.log("Please upload a valid font file.");
  }
}

// Function to update top text from input
function updateTopText() {
  topText = this.value();
}

// Function to update bottom text from input
function updateBottomText() {
  bottomText = this.value();
}

function generateShape(shape) {
  for (let i = 0; i < 6; i++) {
    let noiseValue = random(-distortionFactor, distortionFactor);
    shape[i] = radius + noiseValue * radius;
  }
}

function cubicBezierEase(t, bezier) {
  let [p1, p2, p3, p4] = bezier;
  return 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
}
