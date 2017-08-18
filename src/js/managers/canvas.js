'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};
var Class = Class || {};

/**
 * Canvas class. Abstracting out and rendering and animation code
 */
app.Canvas = Class.extend({

  /**
   * Constructor
   *
   * @param  {string} id        id of canvas element
   * @param  {number} width     width of the canvas
   * @param  {number} height    height of the canvas
   * @param  {string} lineColor Default line color
   */
  init: function(id, width, height, lineColor) {
    var self = this;

    // Set dimension of internal canvas
    //this.canvasEle = document.createElement('canvas');
    this.canvasEle = document.getElementById(id);
    this.canvasEle.width = width;
    this.canvasEle.height = height;

    this.lineColorDefault = lineColor;

    // Create augmented drawing context
    this.ctx = (function(ctx) {

      ctx.strokeStyle = self.lineColorDefault;

      ctx.width = ctx.canvas.width;
      ctx.height = ctx.canvas.height;

      ctx.ACODE = 'A'.charCodeAt(0);
      ctx.ZCODE = '0'.charCodeAt(0);
      ctx.SCODE = ' '.charCodeAt(0);

      /**
       * Draws a polygon object
       *
       * @param  {Polygon} p  the polygon to draw
       * @param  {number}  x  the x coordinate
       * @param  {number}  y  draw y coordinate
       * @param  {string}  lc line color (optional)
       * @param  {string}  fc fill color (optional)
       */
      ctx.drawPolygon = function(p, x, y, lc, fc) {
        // this => ctx

        p = p.points;

        // Iterate thru all points and draw with stroke style
        this.beginPath();
        this.moveTo(p[0] + x, p[1] + y);
        for (var i = 2, len = p.length; i < len; i += 2) {
          this.lineTo(p[i] + x, p[i + 1] + y);
        }

        // Line color (optional)
        this.strokeStyle = lc || self.lineColorDefault;
        this.stroke();

        // Fill color (optional)
        if (fc) {
          this.fillStyle = fc;
          this.fill();
        }
      };

      /**
       * Fancy text method using verticies from the point.js
       * file
       * @param  {string/number} text   what to draw
       * @param  {number} s      scalefactor
       * @param  {number} x      x position
       * @param  {number} y      y position
       * @param  {number} offset used when drawing from ltr
       * @param  {string} fc     font color (optional)
       *
       * NOTE: If x/y isn't numbers, is the text centered
       */
      ctx.vectorText = function(text, s, x, y, offset, fc) {

        text = text.toString().toUpperCase();
        var step = s*6; // Stepsize, make sure to scale

        // Add offset if specified
        if (typeof offset === 'number') {
          x += step*(offset - text.length);
        }

        // Center x/y if they aren't numbers
        if (typeof x !== 'number') {
          x = Math.round((this.width - text.length*step)/2);
        }
        if (typeof y !== 'number') {
          y = Math.round((this.height - step)/2);
        }

        x += 0.5; // Add 0.5 for sharp graphics
        y += 0.5;

        // Iterate thru all characters in text stirng (*)
        for (var i = 0, len = text.length; i < len; i++) {
          var ch = text.charCodeAt(i); // get charcode

          // If whitespace increase x with stepsize and continue with (*)
          if (ch === this.SCODE) {
            x += step;
            continue;
          }

          var p;

          // The charcode are decremented by correct constant for right index
          //if (ch - this.ACODE >= 0) {
          if (ch - this.ACODE >= 0 && ch - this.ACODE < app.Points.LETTERS.length) {
            p = app.Points.LETTERS[ch - this.ACODE];
          //} else {
          } else if (ch - this.ZCODE >= 0 && ch - this.ZCODE < app.Points.NUMBERS.length) {
            p = app.Points.NUMBERS[ch - this.ZCODE];
          } else if (app.Points.SYMBOLS[ch]) {
            p = app.Points.SYMBOLS[ch];
          }

          // Iterate thru all points and draw with stroke style
          this.beginPath();
          this.moveTo(p[0]*s + x, p[1]*s + y);
          for (var j = 2, len2 = p.length; j < len2; j += 2) {
            this.lineTo(p[j]*s + x, p[j + 1]*s + y);
          }

          this.strokeStyle = fc || self.lineColorDefault;
          this.stroke();

          // Increase with stepsize after each character
          x += step;
        }
      };

      /**
       * Clears the complete canvas
       */
      ctx.clearAll = function() {
        this.clearRect(0, 0, this.width, this.height);
      };

      // Return augmented drawing context
      return ctx;
    })(this.canvasEle.getContext('2d'));

    // Add canvas to body
    //document.body.appendChild(this.canvasEle);
  },

  /**
   * Wrapper around window.requestAnimationFrame (rAF)
   *
   * @param  {function} loop the function to animate
   */
  animate: function(loop) {
    // Get available rAF version
    var rAF = (function() {
      return window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        window.oRequestAnimationFrame       ||
        window.msRequestAnimationFrame      ||

      // Probably excessive fallback
      function(cb, el) { // eslint-disable-line no-unused-vars
        window.setTimeout(cb, 1000/60);
      };
    })();

    // Actual loop
    var self = this;
    var l = function() {
      loop();
      rAF(l, self.canvas);
    };
    rAF(l, this.canvas);
  }
});
