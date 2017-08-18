'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};
var Class = Class || {};
var Audio = Audio || {};

/**
 * Enum type, game states
 */
app.States = {
  NO_CHANGE: 0,
  HOLD_STATE: 1,
  MENU: 2,
  GAME: 3,
  END: 4
};

/**
 * Game class, manages, update and render states
 */
app.Game = Class.extend({

  self: null,

  // Frame rate calculation data
  _frameData: {
    frameCnt: 0,
    elapsedCntr: 0,

    lastFrame: Date.now(),
    curFrame: null,
    elapsed: null,
    delta: null
  },

  /**
   * Constructor
   */
  init: function() {
    self = this; // eslint-disable-line no-global-assign

    // Public members used for update and rendering
    this.canvas = new app.Canvas('canvas-main', 640, 480, '#fff');

    this.input = new app.InputHandler({
      left:       37,
      up:         38,
      right:      39,
      down:       40,
      spacebar:   32,
      enter:      13,
      pause:      80, // P
      hyperspace: 72  // H
    });

    // Game settings, e.g. Sound on/off
    this._inputSettings = new app.InputSettingsHandler([
      { id: app.settings.inputIds.sound, callback: this._soundSetting },
      { id: app.settings.inputIds.color, callback: this._colorSetting },
      { id: app.settings.inputIds.colorFill, callback: this._colorFillSetting },
      { id: app.settings.inputIds.framerate, callback: this._frameRateSetting },
      { id: app.settings.inputIds.inverse, callback: this._inverseSetting }
    ]);

    // Declare variables used for managing states
    this.currentState = null;
    this.stateVars = { score: 0 };
    this.nextState = app.States.MENU;

    // Frame rate info
    this.frameRateInfo = {
      display: app.settings.getLocalInputSetting(app.settings.inputIds.framerate, false),
      avg: 0
    };

    // Inverse Display option
    this.inverseDisplayOn = app.settings.getLocalInputSetting(app.settings.inputIds.inverse);
    this._inverseSetting(app.settings.inputIds.inverse, this.inverseDisplayOn);

    // Color On/Off option
    this.colorOn = app.settings.getLocalInputSetting(app.settings.inputIds.color, true);
    this.colorFillOn = app.settings.getLocalInputSetting(app.settings.inputIds.colorFill, false);
    if (this.colorFillOn) this.colorOn = true;

    this.sound = {
      on: app.settings.getLocalInputSetting(app.settings.inputIds.sound, false),
      sounds: {
        largeExpl: new Audio('./assets/audio/largeExpl.wav'),
        mediumExpl: new Audio('./assets/audio/mediumExpl.wav'),
        smallExpl: new Audio('./assets/audio/smallExpl.wav'),
        explosion: new Audio('./assets/audio/explode.wav'), // Ship or Ufo
        shipFire: new Audio('./assets/audio/shipFire.wav'),
        thrust: new Audio('./assets/audio/thrust.wav'),
        beat1: new Audio('./assets/audio/beat1.wav'),
        beat2: new Audio('./assets/audio/beat2.wav'),
        extraShip: new Audio('./assets/audio/extraShip.wav'),
        ufoBig: new Audio('./assets/audio/ufobig.wav'),
        ufoSmall: new Audio('./assets/audio/ufosmall.wav')
      }
    };
  },

  /**
   * Initial game run entry point
   */
  run: function() {

    this.canvas.animate(function() {

      // Frame rate calculation setup
      if (self.frameRateInfo.display) {
        self._frameData.curFrame = Date.now();
        self._frameData.elapsed = self._frameData.curFrame - self._frameData.lastFrame;
        self._frameData.lastFrame = self._frameData.curFrame;
        self._frameData.delta = self._frameData.elapsed / 30;
      }


      // Change and initiate states when needed
      if (self.nextState !== app.States.NO_CHANGE) {
        switch(self.nextState) {
          case app.States.MENU:
            self.currentState = new app.MenuState(self);
            break;
          case app.States.GAME:
            self.currentState = new app.GameState(self);
            break;
          case app.States.END:
            self.currentState = new app.EndState(self);
            break;
        }
        if (self.nextState !== app.States.HOLD_STATE)
          self.nextState = app.States.NO_CHANGE;
      }

      // Update and render active state
      self.currentState.handleInputs(self.input);
      self.currentState.update();
      self.currentState.render(self.canvas.ctx);


      // Frame rate results
      if (self.frameRateInfo.display) {
        self._frameData.frameCnt++;
        self._frameData.elapsedCntr += self._frameData.elapsed;
        if (self._frameData.elapsedCntr > 1000) {
          self._frameData.elapsedCntr -= 1000;
          self.frameRateInfo.avg = self._frameData.frameCnt;
          self._frameData.frameCnt = 0;
        }
      }

    });
  },

  /**
   * Switch sound on or off, using callback function from inputSettingsHandler
   *
   * @param  {boolean} isChecked true if html checkbox is checked
   * @param  {string}  key value of the input setting id
   */
  _soundSetting: function(key, isChecked) {
    self.sound.on = isChecked;
    app.settings.setLocalInputSetting(key, isChecked);
  },

  /**
   * Switch color on or off, using callback function from inputSettingsHandler
   *
   * @param  {boolean} isChecked true if html checkbox is checked
   * @param  {string}  key value of the input setting id
   */
  _colorSetting: function(key, isChecked) {
    self.colorOn = isChecked;
    app.settings.setLocalInputSetting(key, isChecked);

    if (isChecked) {
      self.colorFillOn = false;
      $('#'+ app.settings.inputIds.colorFill).prop('checked', false);
      app.settings.setLocalInputSetting(app.settings.inputIds.colorFill, false);
    }
  },

  /**
   * Switch color on or off, using callback function from inputSettingsHandler
   *
   * @param  {boolean} isChecked true if html checkbox is checked
   * @param  {string}  key value of the input setting id
   */
  _colorFillSetting: function(key, isChecked) {
    self.colorOn = isChecked;
    self.colorFillOn = isChecked;
    app.settings.setLocalInputSetting(key, isChecked);

    if (isChecked) {
      $('#'+ app.settings.inputIds.color).prop('checked', false);
      app.settings.setLocalInputSetting(app.settings.inputIds.color, false);
    }
  },

  /**
   * Switch frame rate display on or off, using callback function
   * from inputSettingsHandler
   *
   * @param  {boolean} isChecked true if html checkbox is checked
   * @param  {string}  key value of the input setting id
   */
  _frameRateSetting: function(key, isChecked) {
    self.frameRateInfo.display = isChecked;
    app.settings.setLocalInputSetting(key, isChecked);
  },

  /**
   * Switch inverse display on or off, using callback function
   * from inputSettingsHandler
   *
   * @param  {boolean} isChecked true if html checkbox is checked
   * @param  {string}  key value of the input setting id
   */
  _inverseSetting: function(key, isChecked) {
    var bgColor = isChecked ? '#fff' : '#000';
    self.canvas.lineColorDefault  = isChecked ? '#000' : '#fff';
    $('#canvas-main').css('background-color', bgColor);
    self.inverseDisplayOn = isChecked;
    app.settings.setLocalInputSetting(key, isChecked);
  }
});
