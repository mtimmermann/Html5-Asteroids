'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

/**
 * Ship class, extends Polygon
 */
app.Ship = app.Polygon.extend({

  /**
   * Bounds for the ship
   */
  maxX: null,
  maxY: null,

  /**
   * Constructor
   *
   * @param  {Array<number>} p  list of ship verticies
   * @param  {Array<number>} pf list of flames verticies
   * @param  {number}        s  scalefactor, size of ship
   * @param  {number}        x  start x coordinate
   * @param  {number}        y  start y coordinate
   */
  init: function(p, pf, s, x, y) {
    this._super(p);

    // Flame polygon
    this.flames = new app.Polygon(pf);
    this.flames.scale(s);

    // Ship Explode
    this.explosion = {
      lineFrags: [],
      //scale: s,
      visible: false
    };

    // Visual flags
    this.drawFlames = false;
    this.visible = true;
    this.active = true;

    // Position
    this.x = x;
    this.y = y;

    this.scale(s);

    this.edgeColor = '#be410e';
    this.fillColor = '#be410e';
    this.edgeColorFlames = '#cca12d';
    this.fillColorFlames = '#e5a909';

    // Facing direction
    this.angle = 0;

    // Velocity
    this.vel = {
      x: 0,
      y: 0
    };
  },

  /**
   * Returns whether ship is colling with a poly object
   *
   * @param  {Polygon} polyObj poly object to test
   * @return {Boolean} result from test
   */
  collide: function(polyObj) {
    // Don't test if not visible
    if (!this.visible) {
      return false;
    }
    for (var i = 0, len = this.points.length - 2; i < len; i += 2) {
      var x = this.points[i] + this.x;
      var y = this.points[i+1] + this.y;

      if (polyObj.hasPoint(x, y)) {
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
   * Ship explosion
   */
  explode: function() {
    // Build lineFrags
    this.explosion.lineFrags = [];
    this.explosion.visible = true;

    this.explosion.x = this.x, this.explosion.y = this.y;
    //for (var i=0; i < Points.SHIP_FRAG_LINES.length; i++) {
    //  var line = new FragLine(Points.SHIP_FRAG_LINES[i], this.explosion.scale,
    //                          this.explosion.x, this.explosion.y);
    //  line.rotate(this.angle);
    //  this.explosion.lineFrags.push(line);
    //}

    // Build lineFrags based on Ship points
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
    app.utils.timeout(function() { self.explosion.visible = false; }, 3000);
  },

  /**
   * Create and return bullet with arguments from current
   * direction and position
   *
   * @return {Bullet} the initated bullet
   */
  shoot: function() {
    var b = new app.Bullet(this.points[0] + this.x, this.points[1] + this.y, this.angle);
    b.maxX = this.maxX;
    b.maxY = this.maxY;
    return b;
  },

  /**
   * Update the velocity of the bullet depending on facing
   * direction
   */
  addVel: function() {
    // Length of veloctity vector estimated with pythagoras theorem, i.e.
    // 		a*a + b*b = c*c
    if (this.vel.x*this.vel.x + this.vel.y*this.vel.y < 20*20) {
      this.vel.x += 0.05*Math.cos(this.angle);
      this.vel.y += 0.05*Math.sin(this.angle);
    }

    this.drawFlames = true;
  },

  /**
   * Rotate the ship and flame polygon clockwise
   *
   * @param  {number} theta angle to rotate with
   *
   * @override Polygon.rotate
   */
  rotate: function(theta) {
    this._super(theta);
    this.flames.rotate(theta);
    this.angle += theta;
  },

  /**
   * Decrease velocity and update ship position
   */
  update: function() {
    // Update position
    this.x += this.vel.x;
    this.y += this.vel.y;

    this.vel.x *= 0.99;
    this.vel.y *= 0.99;

    // Keep within bounds
    if (this.x > this.maxX) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = this.maxX;
    }
    if (this.y > this.maxY) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = this.maxY;
    }

    // Update frag lines
    if (this.explosion.visible) {
      for (var i=0; i < this.explosion.lineFrags.length; i++) {
        this.explosion.lineFrags[i].update();
      }
    }
  },

  /**
   * Draw the ship with an augmented drawing context
   *
   * @param  {context2d} ctx augmented drawing context
   * @param  {boolean}   colorOn     true to add ctx color
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
    ctx.drawPolygon(this, this.x, this.y, edgeColor, colorFillOn ? this.fillColor : null);

    if (this.drawFlames) {
      if (Math.random() < 0.8) { // Add flame flicker effect
        ctx.drawPolygon(this.flames, this.x, this.y,
          colorOn ? this.edgeColorFlames : null,
          colorFillOn ? this.fillColorFlames : null);
        this.drawFlames = false;
      }
    }
  }
});
