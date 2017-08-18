'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

/**
 * FragLine class
 */
app.FragLine = app.Polygon.extend({

  /**
   * Constructor
   *
   * @param  {Array<number>} p list of verticies
   * @param  {number}        s scalefactor, size frag line
   * @param  {number}        x start x coordinate
   * @param  {number}        y start y coordinate
   */
  init: function(p, s, x, y) {
    this._super(p); // Call Polygon super constructor
    var self = this;

    this.x = x;
    this.y = y;
    this.scale(s);

    // Hide frags after random time
    var intvl = app.utils.getRandomInt(1500, 2500);
    this.visible = true;
    app.utils.timeout(function() { self.visible = false; }, intvl);

    // Set rotation angle used in each update
    this.rotAngle = 0.05*(Math.random()*2 - 1);

    // Generate and calculate velocity
    var r = 2*Math.PI*Math.random();
    //var v = Math.random();
    var v = app.utils.getRandomFloat(0.1, 0.3);
    this.vel = {
      x: v*Math.cos(r),
      y: v*Math.sin(r)
    };
  },

  /**
   * Update position of frag line
   */
  update: function() {
    this.x += this.vel.x;
    this.y += this.vel.y;

    // Rotate
    this.rotate(this.rotAngle);
  },

  /**
   * Draw the frag line to an augmented drawing context
   *
   * @param  {context2d} ctx agumented drawing context
   */
  draw: function(ctx, edgeColor) {
    if (!this.visible) return;

    ctx.drawPolygon(this, this.x, this.y, edgeColor);
  }
});
