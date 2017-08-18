'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

/**
 * Constants
 */
app.ASTEROID_SIZE   = 8;

app.SHP_START_PAUSE = 3000; // Milliseconds
app.SHP_SHOT_PAUSE  = 200;  // Milliseconds

app.UFO_SPEED       = 0.2,
app.UFO_TIME_SPAWN  = 50;

app.BONUS_SHIP_POINTS = 10000; // Bonus ship every 10,000 points

app.Colors = {
  DEFAULT_TEXT:     '#5672ff',
  SCORE_TEXT:       '#15db33',
  EXTRA_SHIP:       '#be410e',
  FRAG_POINTS:      '#a8a8a8',
  FRAG_POINTS_FILL: '#001dff',
  // ASTR_SMALL:       '#721919',
  // ASTR_MED:         '#7880a5',
  // ASTR_BIG:         '#5672ff'
  ASTR_SMALL:       null, // Setting these to null, as the asteroid colors
  ASTR_MED:         null, // do not look good.
  ASTR_BIG:         null
};

/**
 * User control settings from html page
 */
app.settings =
(function () {

  var STORAGE_KEY = 'astr-settings';

  // Values must match the html element input ids
  var _inputIds = {
    sound: 'sound-input',
    color: 'color-input',
    colorFill: 'color-fill-input',
    framerate: 'framerate-input',
    inverse: 'inverse-input'
  };

  // Initialize the default settings object
  var settings = {};
  Object.keys(_inputIds).forEach(function(key) { settings[_inputIds[key]] = null; });

  // Initialize settings from local storage
  if (typeof Storage !== 'undefined') {
    try {
      var local = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (typeof local === 'object') {
        Object.keys(local).forEach(function(key) {
          if (typeof local[key] === 'boolean')
            settings[key] = local[key];
        });
      }
    } catch(err) { } // eslint-disable-line no-empty
  }

  /**
   * Check for and retrieve the local off/on setting from local storage
   *
   * @param   {string}  key  key for settings object
   * @param   {boolean} defaultBool default value if setting is not retrieved
   * @return  {boolean} true if setting is on
   */
  function getLocalBooleanSetting(key, defaultBool) {
    var returnBool = defaultBool;
    if (typeof Storage !== 'undefined') {
      try {
        var local = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (typeof local === 'object' && typeof local[key] === 'boolean') {
          returnBool = local[key];
          settings[key] = returnBool;
        }
      } catch(err) { } // eslint-disable-line no-empty
    }
    $('#'+ key).prop('checked', returnBool);
    return returnBool;
  }

  /**
   * Check for and set the local off/on setting from local storage
   *
   * @param   {string}  key key for settings object
   * @return  {boolean} true of color is set to on
   */
  function setLocalBooleanSetting(key, boolVal) {
    if (typeof settings[key] === 'undefined') return;
    settings[key] = boolVal;
    if (typeof Storage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch(err) { } // eslint-disable-line no-empty
    }
  }

  /**
   * Public
   */
  return {

    /**
     * html settings input element ids
     */
    inputIds: _inputIds,

    /**
     * Check for and retrieve the off/on setting
     *
     * @param  {string}  key value of the input setting id
     * @param  {boolean} defaultBoolean value of the default on/off seting
     * @return {boolean} true if sound is set to on
     */
    getLocalInputSetting: function(key, defaultBool) {
      if (typeof defaultBool !== 'boolean') defaultBool = false;
      return getLocalBooleanSetting(key, defaultBool);
    },

    /**
     * Set off/on setting
     *
     * @param  {string}  key value of the input setting id
     * @param  {boolean} isOn setting off/on
     */
    setLocalInputSetting: function(key, isOn) {
      setLocalBooleanSetting(key, isOn);
    }

  };
}());
