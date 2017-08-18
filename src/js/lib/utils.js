'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

app.utils =
(function () {
  return {
    /**
     * Alternative to setTimeout, will execute callback
     * in true time based on a timestamp; as some browser's
     * timing is different w/ setTimeout
     */
    timeout: function(callback, interval) {
      var start = Date.now();
      (function f() {
        var diff = Date.now()-start;
        //ns = (((interval - diff)/1e3)>>0);
        //m = (ns/60)>>0,
        //s = ns-m*60;
        //console.log('Callback in '+ m +':'+ ((''+s).length>1?'':'0')+s);
        if (diff > interval) {
          callback();
          return void 0;
        }
        //setTimeout(f,1e3);
        setTimeout(f,10);
      })();

    },

    /**
     * Create a unique 9 character id
     *   Math.random should be unique because of its seeding algorithm.
     *   Convert it to base 36 (numbers + letters), and grab the first
     *   9 characters after the decimal.
     */
    uniqueId: function() {
      return '_' + Math.random().toString(36).substr(2, 9);
    },

    getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getRandomFloat: function(min, max) {
      return (Math.random() * (min - max) + max);
    },

    playSound: function(a) {
      0 < a.readyState && (a.pause(),
        a.currentTime = 0,
        a.play());
    },

    playSoundLoop: function(a) {
      0 < a.readyState && a.play();
    },

    stopSoundLoop: function(a) {
      0 < a.readyState && (a.pause(),
        a.currentTime = 0);
    }
  };
}());
