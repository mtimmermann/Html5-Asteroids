'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};
var Class = Class || {};

/**
 * State base class
 */
app.State = Class.extend({

  /**
   * Contstrutor
   *
   * @param  {Game} game manager for the state
   */
  init: function(game) {
    // Field to state manager
    this.game = game;
  },

  /**
   * React to pressed keys, called before the update  method
   *
   * @param  {InputHandeler} input keeps track of all pressed keys
   */
  handleInputs: function(input) { // eslint-disable-line no-unused-vars
    return void 0;
  },

  /**
   * Called when state is updated
   */
  update: function() {
    return void 0;
  },

  /**
   * Render the state to a canavas
   *
   * @param  {context2d} ctx augmented drawing context
   */
  render: function(ctx) { // eslint-disable-line no-unused-vars
    return void 0;
  }
});
