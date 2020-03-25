/**********************************
  MARIO CLOCK V3
  + Converting images to 1bit BMP: Image > Mode > Indexed and tick the "Use black and white (1-bit) palette", Then export as BMP.
  + Online Image convertor: https://www.espruino.com/Image+Converter
  + Set time:  In the IDE click Communications, then scroll down and make sure that Set Current Time is checked.
               Then the next time you send code to the Espruino board, the Web IDE will automatically set up its RTC.
**********************************/

var W, H;
const LIGHTEST = "#effedd";
const LIGHT = "#add795";
const DARK = "#588d77";
const DARKEST = "#122d3e";

// Mario Images
var marioRunningImage1 = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("B8AfwH+B/8f/z4M+KExcnAUSCw87w4L8CJQRNB/YH+AxgCEAPAA="))
};

var marioRunningImage1Neg = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAHwB0DOgY/jt8PDAPAEAB2gOyAAgAAAOAB4AAAA="))
};

var marioRunningImage2 = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("B8AfwH+B/8f/z4M+KExcnAUSCw87w4J6BEsPnSfyT+S+OMAAAAA="))
};

var marioRunningImage2Neg = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAHwB0DOgY/jt8PDAPAGEA7QAYhgMMBhAAAAAAAA="))
};

var pyramid = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAkAAQgAIEAEAgCAEBAAggAEQAAoAAE="))
};

var pipe = {
  width : 9, height : 6, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/8BxaCRSCA=="))
};

var floor = {
  width : 8, height : 3, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/6pE"))
};

var sky = {
  width : 128, height : 30, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("VVVVVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAAAAAABVVVVVVVVVVVVVVVVVVVVVIiIiIiIiIiIiIiIiIiIiIlVVVVVVVVVVVVVVVVVVVVWIiIiIiIiIiIiIiIiIiIiIVVVVVVVVVVVVVVVVVVVVVSIiIiIiIiICIiIiIiIiIiJVVVVVVVVVAVVVVVVVVVVViIiIiIiIiACIiIiIiIiIiFVVVVVVVVQAVVVVVVVVVVUiIiIiIiIgACIiIiIiIiIiVVVVVVVVUAAVVVUBVVVVUKqqqqqqqggAKCqqAKqqqoBVUBVVVVQAABAVVABVVVUAIiACIiIgAAAgAiAAIiIiAFVABVVVUAAAUAVUABRVVQCqgAKCqqAAACAAAAAgCqoAVUABAVVAAAAAAAAAAAVQAKqAAACqoAAAAAAAAAACgABAAAAAUEAAAAAAAAAABQAAgAAAACAAAAAAAAAAAAIAAAAAAABQAAAAAAAAAAAEAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
};

var brick = {
  width : 21, height : 15, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("f//0AABoAAsAABgAAMAABgAAMAABgAAMAABgAAMAABoAAsAABf//wA=="))
};

var flower = {
  width : 7, height : 7, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("fY3wjW+OAA=="))
};

var pipePlant = {
  width : 9, height : 15, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("FBsNhsHDWPn/gOLQSKQSKQQ="))
};

var marioSprite = {
  frameIdx: 0,
  frames: [
    marioRunningImage1,
    marioRunningImage2
  ],
  negFrames: [
    marioRunningImage1Neg,
    marioRunningImage2Neg
  ],
  x: 35,
  y: 45,
  jumpCounter: 0,
  jumpIncrement: Math.PI / 10,
  isJumping: false
};

var STATIC_TILES = {
  "_": {img: floor, x: 16 * 8, y: 65},
  "X": {img: sky, x: 0, y: 0},
  "#": {img: brick, x: 0, y: 0},
};

var TILES = {
  "T": {img: pipe, x: 16 * 8, y: 59},
  "^": {img: pyramid, x: 16 * 8, y: 46},
  "*": {img: flower, x: 16 * 8, y: 58},
  "V": {img: pipePlant, x: 16 * 8, y: 50}
};

var BACKGROUND,
    INITIALIZED = false,
    BACKLIGHT = 1,
    board,
    tempBoard,
    debug = true,
    timer = 0,
    ONE_SECOND = 1000,
    screenOffset = 0;

function redraw() {
  g.clear();
  g.setFontVector(9);

  drawBackground();
  drawTime();
  drawMario();
  updateTimer();

  g.flip();
}

function drawTile(sprite) {
  g.drawImage(sprite.img, sprite.x, sprite.y);
}

var backgroundArr = [];
function drawBackground() {
  g.setColor(LIGHTEST);
  g.fillRect(0, 0, W, H);

  // draw floor
  g.setColor(DARK);
  for (var x = 0; x < 16; x++) {
    var floorSprite = Object.assign({}, STATIC_TILES._, {x: x * 8});
    drawTile(floorSprite);
  }

  // draw sky
  var skySprite = STATIC_TILES.X;
  g.setColor(LIGHT);
  drawTile(skySprite);

  // new random sprite
  var spriteKeys = Object.keys(TILES);
  var key = spriteKeys[Math.floor(Math.random() * spriteKeys.length)];
  var newSprite = Object.assign({}, TILES[key]);

  // remove first sprite if offscreen
  var firstBackgroundSprite = backgroundArr[0];
  if (firstBackgroundSprite) {
      if (firstBackgroundSprite.x < -20) backgroundArr.splice(0, 1);
  }

  // set background sprite if array empty
  var lastBackgroundSprite = backgroundArr[backgroundArr.length - 1];
  if (!lastBackgroundSprite) {
    lastBackgroundSprite = newSprite;
    backgroundArr.push(lastBackgroundSprite);
  }

  // add random sprites
  if (backgroundArr.length < 6 && lastBackgroundSprite.x < (16 * 7)) {
    var randIdx = Math.floor(Math.random() * 25);
    if (randIdx < spriteKeys.length - 1) {
      backgroundArr.push(newSprite);
    }
  }

  /* g.setColor("#aed697"); */
  g.setColor(LIGHT);
  for (x = 0; x < backgroundArr.length; x++) {
    var thing = backgroundArr[x];
    thing.x -= 5;
    drawTile(thing);
  }

  // set background buffer
  BACKGROUND.set(g.buffer);

  // refresh background
  new Uint8Array(g.buffer).set(BACKGROUND.buffer);
}

function drawMario() {
  // calculate jumping
  var t = new Date(),
      seconds = t.getSeconds(),
      minutes = t.getMinutes(),
      milliseconds = t.getMilliseconds(),
      yShift = 0;

  if (seconds == 59 && milliseconds > 800 && !marioSprite.isJumping) {
    marioSprite.isJumping = true;
  }

  if (marioSprite.isJumping) {
    yShift = ((Math.sin(marioSprite.jumpCounter).toFixed(1) * 10));
    marioSprite.jumpCounter += marioSprite.jumpIncrement;

    if (yShift < 0) {
      marioSprite.jumpCounter = 0;
      marioSprite.isJumping = false;
    }
  }

  // calculate animation timing
  if (timer < 1000 && (timer % (ONE_SECOND / 20) === 0)) {
     marioSprite.frameIdx ^= 1;
  }

  //clear behind mario
  g.setColor(LIGHT);
  g.drawImage(
    marioSprite.negFrames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y - yShift
  );

  g.setColor(DARKEST);
  g.drawImage(
    marioSprite.frames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y - yShift
  );
}


function drawBrick(x, y) {
  var brickSprite = Object.assign({}, STATIC_TILES['#'], {x: x, y: y});

  g.setColor(LIGHT);
  g.fillRect(x, y, x + 20, y+14);
  g.setColor(DARK);
  drawTile(brickSprite);
}

function drawTime() {
  // draw hour brick
  drawBrick(20, 15);
  // draw minute brick
  drawBrick(42, 15);

  var t = new Date();
  var hours = ("0" + t.getHours()).substr(-2);
  var mins = ("0" + t.getMinutes()).substr(-2);

  g.setColor(DARKEST);
  g.drawString(hours, 24, 17);
  g.drawString(mins, 46, 17);

}

function updateTimer() {
  timer += 50;
  if (timer > ONE_SECOND) {
    timer = 0;
  }
}


// Main
function StartMarioClock() {
  clearInterval();

  // Reset screen offest;
  screenOffset = 0;

  Bangle.setLCDMode("80x80");
  //Bangle.setLCDMode("120x120");
  //Bangle.setLCDMode("doublebuffered");
  g.clear();
  BACKGROUND = new Uint8Array(g.buffer);

  W = g.getWidth();
  H = g.getHeight();

  // draw frames
  setInterval(redraw, 100);

  INITIALIZED = true;
}

StartMarioClock();

