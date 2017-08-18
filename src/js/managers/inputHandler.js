'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};
var Class = Class || {};

/**
 * InputHandler class, listen for keypresses and keeps state of
 * monitored keys
 */
app.InputHandler = Class.extend({

  /**
   * Constructor
   *
   * @param  {object} keys keys to monitor
   */
  init: function(keys) {
    // Declare private fields
    this.keys = {};
    this.down = {};
    this.pressed = {};

    // Initiate private fields
    for (var key in keys) {
      var code = keys[key];

      this.keys[code] = key;
      this.down[key] = false;
      this.pressed[key] = false;
    }

    var self = this;

    // Binding event listeners to canvas, not the document ensures
    //  scroll bars will not scroll on keystrokes when canvas has focus,
    //  but allows does not prevent normal key stroke operations outside
    //  the canvas. https://codepen.io/M85Timm/pen/xLXoXZ
    // var canvasContainer = document.getElementById('canvas-container');
    // canvasContainer.tabIndex = 1;
    document.addEventListener('keydown', function(evt) {
      if (self.keys[evt.keyCode]) {
        self.down[self.keys[evt.keyCode]] = true;
      }

      // Prevent scrolling on keystrokes (e.g. down, up keys)
      // Dont block keystrokes if text input has focus
      if (evt.target.id !== 'name-input' && self.keys[evt.keyCode]) {
        evt.preventDefault();
        return false;
      }
    });
    document.addEventListener('keyup', function(evt) {
      if (self.keys[evt.keyCode]) {
        self.down[self.keys[evt.keyCode]] = false;
        self.pressed[self.keys[evt.keyCode]] = false;
      }
    });
  },

  /**
   * Informs if a monitored key is hold down
   *
   * @param  {string}  key name of monitored key
   * @return {Boolean}     result from check
   */
  isDown: function(key) {
    return this.down[key];
  },

  /**
   * Tells if a monitored key is pressed, returns true first time
   * the key is pressed
   *
   * @param  {string}  key name of monitored key
   * @return {Boolean}     result from check
   */
  isPressed: function(key) {
    if (this.pressed[key]) {
      return false;
    } else if (this.down[key]) {
      return this.pressed[key] = true;
    }
    return false;
  }
});
