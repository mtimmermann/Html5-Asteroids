'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

/**
 * MenuState class, set on game start
 */
app.MenuState = app.State.extend({

  /**
   * Constructor
   *
   * @param  {Game} game manager for the state
   */
  init: function(game) {
    this._super(game);

    // Store canvas dimensions for later use
    this.canvasWidth = game.canvas.ctx.width;
    this.canvasHeight = game.canvas.ctx.height;

    this.fontColor = app.Colors.DEFAULT_TEXT;

    // Create and initiate background asteroids
    var num = Math.random()*5 + 5;
    this.asteroids = [];
    for (var i = 0; i < num; i++) {
      // Choose asteroid polygon randomly
      var n = Math.round(Math.random() * (app.Points.ASTEROIDS.length - 1));

      // Set position
      var x = Math.random() * this.canvasWidth;
      var y = Math.random() * this.canvasHeight;

      // Set size of asteroid
      var s = [1, 2, 4][Math.round(Math.random() * 2)];

      // Actual creation of asteroid
      var astr = new app.Asteroid(app.Points.ASTEROIDS[n], app.ASTEROID_SIZE/s, x, y);
      astr.maxX = this.canvasWidth;
      astr.maxY = this.canvasHeight;
      this.asteroids.push(astr);
    }
  },

  /**
   * @override State.handleInputs
   *
   * @param  {InputHandeler} input keeps track of all pressed keys
   */
  handleInputs: function(input) {
    if (input.isPressed('spacebar') && this.game.nextState !== app.States.HOLD_STATE) {
      this.game.nextState = app.States.HOLD_STATE;

      var self = this;
      // Brief pause before starting the game
      app.utils.timeout(function() {
        self.game.nextState = app.States.GAME;
      }, 300);
    }
  },

  /**
   * @override State.update
   */
  update: function() {
    for (var i = 0, len = this.asteroids.length; i < len; i++) {
      this.asteroids[i].update();
    }
  },

  /**
  * @override State.render
  *
  * @param  {context2d} ctx augmented drawing context
  */
  render: function(ctx) {
    ctx.clearAll();

    var fontColor = this.game.colorOn ? this.fontColor : null;

    for (var i = 0, len = this.asteroids.length; i < len; i++) {
      this.asteroids[i].draw(ctx);
    }

    // Draw title text
    ctx.vectorText('ASTEROIDS', 6, null, 180, null, fontColor);
    ctx.vectorText('space to start', 2, null, 260, null, fontColor);

    if (this.game.frameRateInfo.display) {
      if (this.game.frameRateInfo.avg)
        ctx.vectorText(this.game.frameRateInfo.avg, 2, 615, 462, null,
          this.game.colorOn ? app.Colors.DEFAULT_TEXT : null);
    }
  }
});
