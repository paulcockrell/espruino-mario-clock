/**********************************
  MARIO CLOCK V3
  + Converting images to 1bit BMP: Image > Mode > Indexed and tick the "Use black and white (1-bit) palette", Then export as BMP.
  + Online Image convertor: https://www.espruino.com/Image+Converter
  + Set time:  In the IDE click Communications, then scroll down and make sure that Set Current Time is checked.
               Then the next time you send code to the Espruino board, the Web IDE will automatically set up its RTC.
**********************************/

// Screen dimensions
let W, H;

// Space to draw watch widgets (e.g battery, bluetooth status)
const WIDGETS_GUTTER = 10;

// Colours
const LIGHTEST = "#effedd";
const LIGHT = "#add795";
const DARK = "#588d77";
const DARKEST = "#122d3e";

// Mario Images
const marioRunningImage1 = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("B8AfwH+B/8f/z4M+KExcnAUSCw87w4L8CJQRNB/YH+AxgCEAPAA="))
};

const marioRunningImage1Neg = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAHwB0DOgY/jt8PDAPAEAB2gOyAAgAAAOAB4AAAA="))
};

const marioRunningImage2 = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("B8AfwH+B/8f/z4M+KExcnAUSCw87w4J6BEsPnSfyT+S+OMAAAAA="))
};

const marioRunningImage2Neg = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAHwB0DOgY/jt8PDAPAGEA7QAYhgMMBhAAAAAAAA="))
};

const pyramid = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAkAAQgAIEAEAgCAEBAAggAEQAAoAAE="))
};

const pipe = {
  width : 9, height : 6, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/8BxaCRSCA=="))
};

const floor = {
  width : 8, height : 3, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/6pE"))
};

const sky = {
  width : 128, height : 30, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("VVVVVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAAAAAABVVVVVVVVVVVVVVVVVVVVVIiIiIiIiIiIiIiIiIiIiIlVVVVVVVVVVVVVVVVVVVVWIiIiIiIiIiIiIiIiIiIiIVVVVVVVVVVVVVVVVVVVVVSIiIiIiIiICIiIiIiIiIiJVVVVVVVVVAVVVVVVVVVVViIiIiIiIiACIiIiIiIiIiFVVVVVVVVQAVVVVVVVVVVUiIiIiIiIgACIiIiIiIiIiVVVVVVVVUAAVVVUBVVVVUKqqqqqqqggAKCqqAKqqqoBVUBVVVVQAABAVVABVVVUAIiACIiIgAAAgAiAAIiIiAFVABVVVUAAAUAVUABRVVQCqgAKCqqAAACAAAAAgCqoAVUABAVVAAAAAAAAAAAVQAKqAAACqoAAAAAAAAAACgABAAAAAUEAAAAAAAAAABQAAgAAAACAAAAAAAAAAAAIAAAAAAABQAAAAAAAAAAAEAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
};

const brick = {
  width : 21, height : 15, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("f//0AABoAAsAABgAAMAABgAAMAABgAAMAABgAAMAABoAAsAABf//wA=="))
};

const flower = {
  width : 7, height : 7, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("fY3wjW+OAA=="))
};

const pipePlant = {
  width : 9, height : 15, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("FBsNhsHDWPn/gOLQSKQSKQQ="))
};

let marioSprite = {
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
  y: 55,
  jumpCounter: 0,
  jumpIncrement: Math.PI / 10,
  isJumping: false
};

const STATIC_TILES = {
  "_": {img: floor, x: 16 * 8, y: 75},
  "X": {img: sky, x: 0, y: 10},
  "#": {img: brick, x: 0, y: 0},
};

const TILES = {
  "T": {img: pipe, x: 16 * 8, y: 69},
  "^": {img: pyramid, x: 16 * 8, y: 56},
  "*": {img: flower, x: 16 * 8, y: 68},
  "V": {img: pipePlant, x: 16 * 8, y: 60}
};

const ONE_SECOND = 1000;

let BACKGROUND;
let timer = 0;


function redraw() {
  // Reset the screen
  g.clear();
  g.setFontVector(9);

  // Update timers
  incrementTimer();

  // Draw frame
  drawBackground();
  drawTime();
  drawMario();

  // Render new frame
  g.flip();
}

function incrementTimer() {
  if (timer > 1000) {
    timer = 0;
  }
  else {
    timer += 50;
  }
}

function drawTile(sprite) {
  g.drawImage(sprite.img, sprite.x, sprite.y);
}

var backgroundArr = [];
function drawBackground() {
  g.setColor(LIGHTEST);
  g.fillRect(0, 10, W, H);

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

    if (yShift <= 0) {
      marioSprite.jumpCounter = 0;
      marioSprite.isJumping = false;
    }
  }

  // calculate animation timing
  /*
  if (timer < ONE_SECOND && (timer % (ONE_SECOND / 2) === 0)) {
     marioSprite.frameIdx ^= 1;
  }
  */
  if (timer % 100 === 0) marioSprite.frameIdx ^= 1;

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
  drawBrick(20, 25);
  // draw minute brick
  drawBrick(42, 25);

  var t = new Date();
  var hours = ("0" + t.getHours()).substr(-2);
  var mins = ("0" + t.getMinutes()).substr(-2);

  g.setColor(DARKEST);
  g.drawString(hours, 24, 27);
  g.drawString(mins, 46, 27);

}

// Main
function StartMarioClock() {
  clearInterval();

  Bangle.setLCDMode("80x80");
  g.clear();
  BACKGROUND = new Uint8Array(g.buffer);

  W = g.getWidth();
  H = g.getHeight();

  // draw frames
  setInterval(redraw, 50);

  // Get Mario to jump!
  setWatch(() => {
    Bangle.buzz();
    if (!marioSprite.isJumping) marioSprite.isJumping = true;
  }, BTN2, {repeat:true});
}

StartMarioClock();

