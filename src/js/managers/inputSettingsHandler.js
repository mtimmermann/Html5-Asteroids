'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
var app = app || {};
var Class = Class || {};

/**
 * InputSettingsHandler listen for game settings changes
 *
 * @param {object} callbackMap An object with the string of an input to monitor
                              with a corresponding callback function to return
                              the value of the input
 */
app.InputSettingsHandler = Class.extend({

  /**
   * Constructor
   *
   * @param {array<object>} callbackMap An array of callbackMap objects containing a
                              {string} id of the elemement
                              {function} callback function to recieve the value
                                         of the input on change
   */
  init: function(callbackMap) {

    callbackMap.forEach(function(key) {
      var ele = $('#'+ key.id)[0];
      if (typeof key.id !== 'string') throw new Error('Required {id}');
      if (typeof key.callback !== 'function') throw new Error('{callback} function required');
      if (!ele) throw new Error('element id "'+ key.id +'" not found');

      if (ele.type === 'checkbox') {
        $(ele).change(function() {
          key.callback(key.id, $(this).is(':checked'));
        });
      }
      else throw new Error ('element type "'+ ele.type +'" not supported');
      // TODO: If needed add type === 'text', etc
    });
  }
});
