'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿/* eslint-disable no-redeclare */

var app = app || {};

//app.MAX_UFO_SHOTS  = 3,
app.UFO_SHOT_PAUSE = 20;

app.UfoSize = {
  SMALL: 0,
  BIG: 1
};

app.UfoColor = {
  SMALL:      '#efe235',
  BIG:        '#2fff72',
  SMALL_FILL: '#00ff00',
  BIG_FILL:   '#009f62'
};

/**
 * Ufo class, extends Polygon see polygon.js
 */
app.Ufo = app.Polygon.extend({

  /**
   * Bounds for the ufo(s)
   */
  maxX: null,
  maxY: null,
  speedFactor: null,

  /**
   * Constructor
   *
   * @param  {Array<number>} p  list of ufo verticies
   * @param  {Array<number>} pt list of ufo top line verticies
   * @param  {Array<number>} pm list of ufo mid line verticies
   * @param  {number}        s  scalefactor, size of ufo
   * @param  {number}        x  start x coordinate
   * @param  {number}        y  start y coordinate
   * @param  {number}        size Ufo size
   */
  init: function(p, pt, pm, s, x, y, size) {
    this._super(p);

    // The ufo top line and mid line to draw
    this.topLine = new app.Polygon(pt);
    this.topLine.scale(s);
    this.midLine = new app.Polygon(pm);
    this.midLine.scale(s);

    // Ufo Explode
    this.explosion = {
      lineFrags: [],
      //scale: s,
      visible: false
    };

    // Visual flags
    this.visible = false;
    this.active = false;

    // Position
    this.x = x;
    this.y = y;

    this.scale(s);

    // Velocity
    this.vel = {
      x: 0,
      y: 0
    };

    this.size = size;
    this.edgeColor = app.UfoSize.BIG == size ? app.UfoColor.BIG : app.UfoColor.SMALL;
    this.fillColor = app.UfoSize.BIG == size ? app.UfoColor.BIG_FILL : app.UfoColor.SMALL_FILL;

    this.bullets = [];
    this.shotPause = app.UFO_SHOT_PAUSE;
  },

  /**
   * Start/run a ufo
   */
  start: function() {
    this.x = 0;

    //this.y = app.utils.getRandomInt(0, this.maxY);
    // Prevent ufo being stuck on bottom or top
    this.y = app.utils.getRandomInt(15, this.maxY-10);

    this.vel.x = this.speedFactor * app.UFO_SPEED;
    this.vel.y = this.speedFactor * app.UFO_SPEED;
    if (Math.random() < 0.5) {
      this.vel.x = -this.vel.x;
    }
    if (Math.random() < 0.5) {
      this.vel.y = -this.vel.y;
    }
    this.active = true;
    this.visible = true;

    this.bullets = [];
    this.shotPause = app.UFO_SHOT_PAUSE;

    // Set timer to randomly change ufo movement
    var self = this;
    app.utils.timeout(function() {
      self._changeMovement();
    }, this._getChangeMoveInterval());
  },

  /**
   * Returns true or false depending on if the ufo is colling with a poly object
   *
   * @param  {Polygon} polyObj poly object to test
   * @return {Boolean} result from test
   */
  collide: function(astr) {
    // Don't test if not visible
    if (!this.visible) {
      return false;
    }
    for (var i = 0, len = this.points.length - 2; i < len; i += 2) {
      var x = this.points[i] + this.x;
      var y = this.points[i+1] + this.y;

      if (astr.hasPoint(x, y)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Useful point in polygon check, taken from:
   * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
   *
   * @param  {number}  x test x coordinate
   * @param  {number}  y test y coordinate
   * @return {Boolean}   result from check
   *
   * @override Polygon.hasPoint
   */
  hasPoint: function(x, y) {
    return this._super(this.x, this.y, x, y);
  },

  /**
   * Ufo explosion
   */
  explode: function() {
    // Build lineFrags
    this.explosion.lineFrags = [];
    this.explosion.visible = true;

    this.explosion.x = this.x, this.explosion.y = this.y;

    // Build lineFrags based on Ufo points
    var pts = [];
    for (var i=0; i < this.points.length; i++) {
      pts.push(this.points[i]);
      if (pts.length === 4) {
        var line = new app.FragLine(pts, 1, this.explosion.x, this.explosion.y);
        this.explosion.lineFrags.push(line);
        pts.splice(0,2);
      }
    }

    var self = this;
    app.utils.timeout(function() {
      self.explosion.visible = false;
      self.active = false; // Ufo
    }, 3000);
    this.visible = false; // Ufo
  },

  /**
   * Create and return bullet with arguments from current
   * direction and position
   *
   * @return {Bullet} the initated bullet
   */
  shoot: function() {
    var theta = Math.random() * (2 * Math.PI);	// Ufo to shoot in random direction
    var b = new app.Bullet(this.points[0] + this.x, this.points[1] + this.y, theta);
    b.maxX = this.maxX;
    b.maxY = this.maxY;
    return b;
  },

  /**
   * Get a random time interval to change UFO vy movement
   *
   * @return  {number} interval to apply to change ufo movement
   */
  _getChangeMoveInterval: function() {
    return app.utils.getRandomInt(4500, 6000);
  },

  /**
   * Change UFO vy movement
   */
  _changeMovement: function() {
    if (!this.active) return;

    var rdm = Math.random();
    if (rdm < 0.5) {
      if (this.vel.y === 0)
        this.vel.y = this.speedFactor * app.UFO_SPEED;
      else
        this.vel.y = -this.vel.y;
    } else if (rdm >= .05) {
      this.vel.y = 0;
    }

    // Set timer to randomly change ufo movement
    var self = this;
    app.utils.timeout(function() {
      self._changeMovement();
    }, this._getChangeMoveInterval());
  },

  /**
   * Update Ufo position
   */
  update: function() {
    // Update position
    this.x += this.vel.x;
    this.y += this.vel.y;

    // Keep within bounds
    if (this.x > this.maxX) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = this.maxX;
    }
    if (this.y > this.maxY - 10) {
      this.vel.y = -this.vel.y;
    } else if (this.y < 15) {
      this.vel.y = -this.vel.y;
    }

    // Fire ufo bullets
    if (--this.shotPause < 0) {
      this.shotPause = app.UFO_SHOT_PAUSE;
      this.bullets.push(this.shoot());
    }
    // Update all bullets
    for (var i = 0, len = this.bullets.length; i < len; i++) {
      var b = this.bullets[i];
      b.update();

      // Remove bullet if removeflag is setted
      if (b.shallRemove) {
        this.bullets.splice(i, 1);
        len--;
        i--;
      }
    }

    // Update frag lines
    if (this.explosion.visible) {
      for (var i=0; i < this.explosion.lineFrags.length; i++) {
        this.explosion.lineFrags[i].update();
      }
    }
  },

  /**
   * Draw the Ufo with an augmented drawing context
   *
   * @param  {context2d} ctx augmented drawing context
   * @param  {boolean}   colorOn true to add ctx color
   * @param  {boolean}   colorFillOn true to add ctx color fill
   */
  draw: function(ctx, colorOn, colorFillOn) {
    var edgeColor = colorOn ? this.edgeColor : null;

    if (this.explosion.visible) {
      for (var i=0; i < this.explosion.lineFrags.length; i++) {
        this.explosion.lineFrags[i].draw(ctx, edgeColor);
      }
    }

    if (!this.visible) {
      return;
    }

    for (var i = 0, len = this.bullets.length; i < len; i++) {
      this.bullets[i].draw(ctx);
    }

    ctx.drawPolygon(this, this.x, this.y, edgeColor, colorFillOn ? this.fillColor : null);
    ctx.drawPolygon(this.topLine, this.x, this.y, edgeColor);
    ctx.drawPolygon(this.midLine, this.x, this.y, edgeColor);
  }
});
