'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

/**
 * EndState class, called on game over
 */
app.EndState = app.State.extend({

  /**
   * Constructor
   *
   * @param  {Game} game manager for the state
   */
  init: function(game) {
    this._super(game);

    this.hasEnterName = false; // internal stage flag
    this.name = '';
    this.score = game.stateVars.score;
    this.hiScores = this.getHighScoresLocal();

    var lowestScore = Math.min.apply(null, this.hiScores.map(function(arr) { return arr[1]; }));
    this.qualifyHiScoreList = this.score > lowestScore || this.hiScores.length < 10;

    this.fontColor = app.Colors.DEFAULT_TEXT;
    this.fontScoreColor = app.Colors.SCORE_TEXT;

    // Get and init inputfiled from DOM
    this.nameInput = document.getElementById('name-input');
    this.nameInput.value = this.name;
    this.nameInput.focus();
    this.nameInput.select();
  },

  getHighScoresLocal: function() {
    var highScores = null;
    if (typeof Storage !== 'undefined') {
      try {
        highScores = JSON.parse(localStorage.getItem('astr-scores'));
      } catch (err) { } // eslint-disable-line no-empty
    }
    return highScores ||
    [
      ['MET', 51220],
      ['CO1', 10370],
      ['TNT', 8900],
      ['TEZ', 7380],
      ['TEZ', 6200],
      ['ABC', 5740],
      ['TEZ', 5100],
      ['ZRT', 1720],
      ['MAX', 580],
      ['JNK', 200]
    ];
  },
  setHighScoresLocal: function() {
    if (typeof Storage !== 'undefined') {
      try {
        localStorage.setItem('astr-scores', JSON.stringify(this.hiScores));
      } catch (err) { } // eslint-disable-line no-empty
    }
  },

  /**
   * @override State.handleInputs
   *
   * @param  {InputHandeler} input keeps track of all pressed keys
   */
  handleInputs: function(input) {
    if (this.hasEnterName || !this.qualifyHiScoreList) {
      if (input.isPressed('spacebar')) {
        this.game.nextState = app.States.MENU;
      }
    } else {
      if (input.isPressed('enter')) {
        // Take to next stage
        this.hasEnterName = true;
        //this.nameInput.blur();

        // Cleanup and add to high scores
        this.name = this.name.replace(/[^a-zA-Z0-9\s]/g, '');
        this.hiScores.push([this.name, this.score]);

        // Sort hiscore in ascending order
        this.hiScores.sort(function(a, b) {
          return b[1] - a[1];
        });

        // Ensure high scores is max 10 length
        this.hiScores = this.hiScores.splice(0, 10);

        this.setHighScoresLocal();
      }
    }
  },

  /**
   * @override State.update
   */
  update: function() {
    if (!this.hasEnterName) {
      this.nameInput.focus(); // focus so player input is read
      // Exit if same nameInput not updated
      if (this.name === this.nameInput.value) {
        return;
      }
      // Clean nameInput value and set to name variable (no spaces allowed)
      this.nameInput.value = this.nameInput.value.replace(/[^a-zA-Z0-9]/g, '');
      this.name = this.nameInput.value;
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
    var fontScoreColor = this.game.colorOn ? this.fontScoreColor : null;

    if (this.hasEnterName || !this.qualifyHiScoreList) {
      ctx.vectorText('Hiscore', 3, null, 50, null, fontColor);
      for (var i = 0, len = this.hiScores.length; i < len; i++) {
        var hs = this.hiScores[i];
        ctx.vectorText(hs[0], 2, 200, 90+25*i, null, fontScoreColor);
        ctx.vectorText(hs[1], 2, 320, 90+25*i, 10, fontScoreColor);
      }
      ctx.vectorText('space to continue', 2, null, 370, null, fontColor);

    } else {
      ctx.vectorText('Enter your name', 4, null, 100, null, fontColor);
      ctx.vectorText('Name', 2, null, 180, null, fontColor);

      this.name.split('').forEach(function(char, idx) {
        ctx.vectorText(char, 3, 288 + (idx * 25), 220, null, fontScoreColor);
      });
      ctx.vectorText('___', 4, 286, 225, null, fontScoreColor);

      ctx.vectorText(this.score, 3, null, 300, null, fontScoreColor);
    }

    if (this.game.frameRateInfo.display) {
      if (this.game.frameRateInfo.avg)
        ctx.vectorText(this.game.frameRateInfo.avg, 2, 615, 462, null,
          this.game.colorOn ? app.Colors.DEFAULT_TEXT : null);
    }
  }
});
