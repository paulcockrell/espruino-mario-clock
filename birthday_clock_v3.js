/**********************************
  MARIO CLOCK
  + Converting images to 1bit BMP: Image > Mode > Indexed and tick the "Use black and white (1-bit) palette", Then export as BMP.
  + Online Image convertor: https://www.espruino.com/Image+Converter
  + Set time:  In the IDE click Communications, then scroll down and make sure that Set Current Time is checked.
               Then the next time you send code to the Espruino board, the Web IDE will automatically set up its RTC.
**********************************/
A5.write(0); // GND
A7.write(1); // VCC
A6.write(1); // LIGHT
require("Font8x12").add(Graphics);

var W, H;

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
  y: 25,
  jumpCounter: 0,
  jumpIncrement: Math.PI / 10,
  isJumping: false
};

var STATIC_TILES = {
  "_": {img: floor, x: 16 * 8, y: 45},
  "X": {img: sky, x: 0, y: 0},
  "#": {img: brick, x: 0, y: 0},
};

var TILES = {
  "T": {img: pipe, x: 16 * 8, y: 39},
  "^": {img: pyramid, x: 16 * 8, y: 26},
  "*": {img: flower, x: 16 * 8, y: 39},
  "V": {img: pipePlant, x: 16 * 8, y: 30}
};

var BACKGROUND,
    INITIALIZED = false,
    BACKLIGHT = 1,
    g,
    board,
    tempBoard,
    debug = true,
    timer = 0,
    ONE_SECOND = 1000,
    screenOffset = 0;

// Music
var pitches = {
  'a':220.00,
  'b':246.94,
  'c':261.63,
  'd':293.66,
  'e':329.63,
  'f':349.23,
  'g':392.00,
  'A':440.00,
  'B':493.88,
  'C':523.25,
  'D':587.33,
  'E':659.26,
  'F':698.46,
  'G':783.99,
  'X': 2093, // top C
  'Y': 3135  // top G
};

var BUZZER = B4,
    marioTune = 'EE E CE G   g',
    coinTune = 'XYYY',
    soundPlaying = false;

// Main
function onInit() {
  clearInterval();
  LED1.write(1);
  LED2.write(0);

  // Setup SPI
  var spi = new SPI();
  spi.setup({ sck:B1, mosi:B10 });

  // Connect button
  connectButton();

  // Reset screen offest;
  screenOffset = 0;

  // Initialise the LCD
  g = require("PCD8544").connect(spi, B13, B14, B15, function() {
    INITIALIZED = true;
    LED1.write(0);
    LED2.write(1);
    setTimeout(function() {
      LED2.write(0);
    }, 500);
    W = g.getWidth();
    H = g.getHeight();
    BACKGROUND = new Uint8Array(g.buffer.length);
    g.setContrast(0.5);
    g.setFont8x12();
    g.clear();

    // draw frames
    setInterval(redraw, 100);
    // play intro music
    play(marioTune, 0);
  });
}

function connectButton() {
  setWatch(function(e) {
    if (BACKLIGHT === 0) {
      BACKLIGHT = 1;
    }
    else {
      BACKLIGHT = 0;
    }
    A6.write(BACKLIGHT);
  }, B5, { repeat: true, edge: "falling", debounce: 50});
}

function redraw() {
  g.clear();

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
  // draw floor
  for (var x = 0; x < 16; x++) {
    var floorSprite = Object.assign({}, STATIC_TILES._, {x: x * 8});
    drawTile(floorSprite);
  }

  // draw sky
  var skySprite = STATIC_TILES.X;
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

  for (x = 0; x < backgroundArr.length; x++) {
    var thing = backgroundArr[x];
    thing.x -= 3;
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
    if (minutes % 30 === 29)
      play(marioTune);
    else
      play(coinTune);
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
  if (timer < 1000 && (timer % (ONE_SECOND / 10) === 0)) {
     marioSprite.frameIdx ^= 1;
  }

  //clear behind mario
  g.setColor(0);
  g.drawImage(
    marioSprite.negFrames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y - yShift

  );

  g.setColor(1);
  g.drawImage(
    marioSprite.frames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y - yShift
  );
  
}

function drawBrick(x, y) {
  var brickSprite = Object.assign({}, STATIC_TILES['#'], {x: x, y: y});

  g.setColor(0);
  g.fillRect(x, y, x + 20, y+14);
  g.setColor(1);
  drawTile(brickSprite);
}

function drawTime() {
  // draw hour brick
  drawBrick(20, 3);
  // draw minute brick
  drawBrick(42, 3);

  var t = new Date();
  var hours = ("0" + t.getHours()).substr(-2);
  var mins = ("0" + t.getMinutes()).substr(-2);

  g.drawString(hours, 25, 5);
  g.drawString(mins, 47, 5);

}

function updateTimer() {
  timer += 50;
  if (timer > ONE_SECOND) {
    timer = 0;
  }
}

function freq(f) {
  if (f===0) digitalWrite(BUZZER,0);
  else analogWrite(BUZZER, 0.5, { freq: f } );
}

function play(tune) {
  if (soundPlaying)
    return;
  else
    soundPlaying = true;

  playTune(tune, 0);
}

function playTune(tune, pos) {
  if (pos >= tune.length) {
    freq(0);
    soundPlaying = false;
    return;
  }

  var ch = tune[pos];
  if (ch !== undefined) pos++;
  if (ch in pitches) freq(pitches[ch]);
  else freq(0);

  setTimeout(function() {
    playTune(tune, pos);
  }, 100);
}

