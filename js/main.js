// #([900, 700], [853, 172], [75, 600], 2000, 17),
// # Test7 = 12 [200,400], [20,40],[10,2],500

var canvas, ctx;
var slider;
var output;

var PLAYER_X = 853;
var PLAYER_Y = 172;

var GUARD_X = 75;
var GUARD_Y = 600;

var MAX_RANGE = 2000;

var WIDTH = 900;
var HEIGHT = 700;

var NONE = 0;
var LEFT = 1;
var RIGHT = 2;
var TOP = 3;
var BOTTOM = 4;

function initialise() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  ctx.font = "16px Arial";

  slider = document.getElementById("myRange");
  output = document.getElementById("demo");
  output.innerHTML = slider.value;

  drawPlayers();

  slider.oninput = function () {
    output.innerHTML = this.value;

    ctx.beginPath();
    ctx.clearRect(0, 0, 900, 700);
    ctx.stroke();

    drawPlayers();

    //this.value = 71;
    var rad = (this.value / 360) * Math.PI * 2;
    var dx = Math.sin(rad);
    var dy = Math.cos(rad);

    if (dx != 0 && dy != 0 && dx != dy
    ) {
      var lines = generateLines(dx, dy);

      lines.forEach(function (line) {
        drawLine(line);
      });
    }

  }
}

function drawLine(line) {
  ctx.beginPath();
  ctx.moveTo(line.startx, line.starty);
  ctx.lineTo(line.endx, line.endy);
  ctx.strokeStyle = '#FF0000';
  ctx.stroke();
  var midx = line.startx + (line.endx - line.startx) / 2;
  var midy = line.starty + (line.endy - line.starty) / 2;
  ctx.fillText(Math.round(line.length), midx, midy);
}


function findNearestHitWall(startx, starty, endx, endy, dx, dy) {
  var slope = dy / dx;
  // (y-y1)=m(x-x1)
  // y=slope(x-startx)+starty
  // y=slope*x - slope*startx + starty
  // y=mx+b
  // b=-slope*startx+starty
  var b = ((slope * -startx) + starty);
  // when x = 0, y=b
  // when x=WIDTH y = slope*WIDTH+b
  // when y=HEIGHT, x=(HEIGHT-b)/slope
  // when y=0, x=-b/slope
  var y_at_min_x = b;
  var y_at_max_x = slope * WIDTH + b;
  var x_at_min_y = -b / slope;
  var x_at_max_y = (HEIGHT - b) / slope;
  var endpoint = {wall: NONE};
  if (dx > 0 && dy > 0) {
    if (0< endx && endx < WIDTH && 0< endy && endy < HEIGHT) {
      endpoint = {wall: NONE};
    } else {
      if (y_at_max_x < HEIGHT) {
        endpoint = {wall: RIGHT, x: WIDTH, y: y_at_max_x};
      } else if (x_at_max_y < WIDTH) {
        endpoint = {wall: TOP, x: x_at_max_y, y: HEIGHT};
      }
    }
  } else if (dx > 0 && dy < 0) {
    if (0< endx && endx < WIDTH && 0< endy && endy < HEIGHT) {
      endpoint = {wall: NONE};
    } else {
      if (y_at_max_x > 0) {
        endpoint = {wall: RIGHT, x: WIDTH, y: y_at_max_x};
      } else if (x_at_min_y < WIDTH) {
        endpoint = {wall: BOTTOM, x: x_at_min_y, y: 0};
      }
    }
  } else if (dx < 0 && dy > 0) {
    if (0< endx && endx < WIDTH && 0< endy && endy < HEIGHT) {
      endpoint = {wall: NONE};
    } else {
      if (y_at_min_x < HEIGHT) {
        endpoint = {wall: LEFT, x: 0, y: y_at_min_x}
      } else if (x_at_max_y > 0) {
        endpoint = {wall: TOP, x: x_at_max_y, y: HEIGHT};
      }
    }
  } else if (dx < 0 && dy < 0) {
    if (0< endx && endx < WIDTH && 0< endy && endy < HEIGHT) {
      endpoint = {wall: NONE};
    } else {
      if (y_at_min_x > 0) {
        endpoint = {wall: LEFT, x: 0, y: y_at_min_x};
      } else if (x_at_min_y > 0) {
        endpoint = {wall: BOTTOM, x: x_at_min_y, y: 0};
      }
    }
  }

  return endpoint;
}

function generateLines(dx, dy) {
  var segments = [];
  var startx = PLAYER_X;
  var starty = PLAYER_Y;
  var range = MAX_RANGE;
  while (range > 1) {
    var xmove = dx * range;
    var ymove = dy * range;
    var endx = xmove + startx;
    var endy = ymove + starty;
    var endpoint = findNearestHitWall(startx, starty, endx, endy, dx, dy);
    if (endpoint.wall == RIGHT) {
      dx = -dx;
      actualx = WIDTH - startx;
      actualy = starty - endpoint.y;
      hypo_move = Math.sqrt(actualy * actualy + actualx * actualx);
      range -= hypo_move;
      endx = endpoint.x;
      endy = endpoint.y;
    } else if (endpoint.wall == LEFT) {
      dx = -dx;
      actualx = startx;
      actualy = starty - endpoint.y;
      hypo_move = Math.sqrt(actualy * actualy + actualx * actualx);
      range -= hypo_move;
      endx = endpoint.x;
      endy = endpoint.y;
    } else if (endpoint.wall == TOP) {
      dy = -dy;
      actualy = HEIGHT - starty;
      actualx = startx - endpoint.x;
      hypo_move = Math.sqrt(actualy * actualy + actualx * actualx);
      range -= hypo_move;
      endy = endpoint.y;
      endx = endpoint.x;
    } else if (endpoint.wall == BOTTOM) {
      dy = -dy;
      actualy = starty;
      actualx = startx - endpoint.x;
      hypo_move = Math.sqrt(actualy * actualy + actualx * actualx);
      range -= hypo_move;
      endy = endpoint.y;
      endx = endpoint.x;
    } else if (endpoint.wall == NONE) {
      hypo_move = Math.sqrt(xmove * xmove + ymove * ymove);
      range -= hypo_move;
    }
    segments.push({startx: startx, starty: starty, endx: endx, endy: endy, length: hypo_move});
    startx = endx;
    starty = endy;
  }


  return segments;
}

function drawPlayers() {
  ctx.beginPath();
  ctx.arc(PLAYER_X, PLAYER_Y, 10, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(GUARD_X, GUARD_Y, 10, 0, 2 * Math.PI);
  ctx.strokeStyle = '#0000FF';
  ctx.stroke();
}



