'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿/* eslint-disable no-redeclare */
var app = app || {};

app.ShotStates = {
  ON: 0,
  HOLD_INIT: 1,
  HOLD: 2
};

// Enum for managing background beat sounds
app.BeatStates = {
  BEAT1_ON:   0,
  BEAT1_CONT: 1,
  BEAT2_ON:   2,
  BEAT2_CONT: 3,
  ALL_OFF:    4
};

// Background sound beat intervals
app.BgSoundPace = {
  SLOW: 800,
  MED:  400,
  FAST: 200
};

/**
 * GameState class, celled when game start, handle game updating and
 * rendering
 */
app.GameState = app.State.extend({

  /**
   * Constructor
   *
   * @param  {Game} game manager for the state
   */
  init: function(game) {
    this._super(game);

    // Canvas dimensions
    this.canvasWidth = game.canvas.ctx.width;
    this.canvasHeight = game.canvas.ctx.height;

    // Ship object
    this.ship = new app.Ship(app.Points.SHIP, app.Points.FLAMES, 2, 0, 0);
    this.ship.maxX = this.canvasWidth;
    this.ship.maxY = this.canvasHeight;

    this.ship.shotPause = 0;// SHP_SHOT_PAUSE; // Pause between shots
    //this.ship.shotState = false;
    this.ship.shotState = app.ShotStates.ON;

    // Ufo objects
    this.ufoBig = new app.Ufo(
      app.Points.UFO_BIG,
      app.Points.UFO_BIG_TOP_LINE,
      app.Points.UFO_BIG_MID_LINE,
      1, 0, 0, app.UfoSize.BIG);
    this.ufoBig.maxX = this.canvasWidth;
    this.ufoBig.maxY = this.canvasHeight;
    this.ufoBig.speedFactor = 5;
    this.ufoSmall = new app.Ufo(
      app.Points.UFO_SMALL,
      app.Points.UFO_SMALL_TOP_LINE,
      app.Points.UFO_SMALL_MID_LINE,
      1, 0, 0, app.UfoSize.SMALL);
    this.ufoSmall.maxX = this.canvasWidth;
    this.ufoSmall.maxY = this.canvasHeight;
    this.ufoSmall.speedFactor = 8;

    this.ufoTimeSpawn = (Math.random() * app.UFO_TIME_SPAWN) + app.UFO_TIME_SPAWN;

    this.lives = 3;
    this.gameOver = false;
    this.score = 0;
    this.newShipPoints = app.BONUS_SHIP_POINTS;
    this.lvl = 0;
    this.paused = false;
    this._handleInputsLocked = false;
    this._hyperspaceLocked = false;

    // Asteroid explosion frags
    this.asteroidFrags = {};

    // Create ship life polygon and rotate 45° counter clockwise
    this.lifepolygon = new app.Polygon(app.Points.SHIP);
    this.lifepolygon.scale(1.5);
    this.lifepolygon.rotate(-Math.PI/2);

    // Generate asteroids and set ship position
    this.generateLevel();

    // Manage backgroud beat sounds
    this.beats = {
      state: app.BeatStates.BEAT1_ON,
      interval: 800 // Milliseconds
    };
  },

  /**
   * Create and initiate asteroids and bullets
   */
  generateLevel: function() {
    // Calculate the number of asteroid to create
    var num = Math.round(10*Math.atan(this.lvl/25)) + 4;

    // Set ship position
    if (this.lvl === 0) {
      this.ship.x = this.canvasWidth/2;
      this.ship.y = this.canvasHeight/2;
    }

    // Init bullet array
    this.bullets = [];

    // Dynamically create asteroids and push to array
    this.asteroids = [];
    for (var i = 0; i < num; i++) {
      // Choose asteroid polygon randomly
      var n = Math.round(Math.random() * (app.Points.ASTEROIDS.length - 1));

      // Set position close to edges of canvas
      var x = 0, y = 0;
      if (Math.random() > 0.5) {
        x = Math.random() * this.canvasWidth;
      } else {
        y = Math.random() * this.canvasHeight;
      }
      // Create asteroid
      var astr = new app.Asteroid(app.Points.ASTEROIDS[n], app.ASTEROID_SIZE, x, y);
      astr.maxX = this.canvasWidth;
      astr.maxY = this.canvasHeight;
      this.asteroids.push(astr);
    }
  },

  /**
   * Reset or kill a ship after a hit or collision
   */
  _resetShip: function() {
    this.ship.x = this.canvasWidth/2;
    this.ship.y = this.canvasHeight/2;
    this.ship.vel = {
      x: 0,
      y: 0
    };
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
    }

    this.ship.visible = false;
    this.ship.active = false;
    this.beats.state = app.BeatStates.ALL_OFF;
  },

  /**
   * Restart the ship after a hit or collision
   */
  _restartShip: function() {
    if (this.ship.active) return;
    if (!this.ship.active) {
      this.ship.active = true;
    }

    // Brief time before restarting ship
    var interval = null;
    app.utils.timeout(function() {
      interval = setInterval(tryRestart, 100);
    }, app.SHP_START_PAUSE);


    var self = this;
    function tryRestart() {
      if (canRestart()) {
        self.ship.rotate(-self.ship.angle);
        self.ship.visible = true;
        self.ship.active = true;
        self.beats.state = app.BeatStates.BEAT1_ON;
        self._updateBackgroundSoundPace();
        clearInterval(interval);
      }
    }
    function canRestart() {
      var isSafe = true;
      for (var i = 0; i < self.asteroids.length; i++) {
        var a = self.asteroids[i];
        if (Math.abs(self.ship.x - a.x) <= 100 &&  Math.abs(self.ship.y - a.y) <= 100) {
          //console.log('a.x: '+ a.x +'  a.y: '+ a.y);
          isSafe = false;
          break;
        }
      }
      // TODO check if current ufo, and is safe starting distance

      return isSafe;
    }
  },

  _hyperspace: function() {
    if (this._hyperspaceLocked) return;
    this._hyperspaceLocked = true;

    this.ship.visible = false;
    var self = this;
    app.utils.timeout(function() {
      self.ship.x = app.utils.getRandomInt(20, self.canvasWidth-20);
      self.ship.y = app.utils.getRandomInt(20, self.canvasHeight-20);
      self.ship.vel = {
        x: 0,
        y: 0
      };
      self.ship.visible = true;
      self._hyperspaceLocked = false;
    }, 500);
  },

  /**
   * @override State.handleInputs
   *
   * @param  {InputHandeler} input keeps track of all pressed keys
   */
  handleInputs: function(input) {
    var self = this;

    if (this._handleInputsLocked) return;

    if (input.isPressed('pause')) {
      this.paused = !this.paused;
    }
    if (this.paused) return;

    // Only update ship orientation and velocity if it's visible
    if (!this.ship.visible) {

      // Change state if game over
      if (this.gameOver) {

        // Prevent this section being called mult times, the
        //  result is the high score input screen locking up
        //  for a period of time
        this._handleInputsLocked = true;

        this.game.stateVars.score = this.score;
        app.utils.timeout(function() {
          self.game.nextState = app.States.END;
        }, app.SHP_START_PAUSE);
        return;
      } else {
        if (!this.ship.active) {
          this._restartShip();
        }
        return;
      }
    }

    if (input.isDown('right')) {
      this.ship.rotate(0.06);
    }
    if (input.isDown('left')) {
      this.ship.rotate(-0.06);
    }
    if (input.isDown('up')) {
      if (this.game.sound.on)
        app.utils.playSoundLoop(this.game.sound.sounds.thrust);
      this.ship.addVel();
    }

    // Note orig 79' Asteroids game, one shot per fire press, going to
    //  ingnore and allow the spacebar to be held down for constant fire
    //if (input.isPressed('spacebar')) {
    if (input.isDown('spacebar')) { // Fire

      // Fire if shot state is not HOLD, uses a timestamp timer
      if (this.ship.shotState === app.ShotStates.ON) {
        this.bullets.push(this.ship.shoot());
        if (this.game.sound.on)
          app.utils.playSound(this.game.sound.sounds.shipFire);
        this.ship.shotState = app.ShotStates.HOLD_INIT;
      } else if (this.ship.shotState === app.ShotStates.HOLD_INIT) {
        this.ship.shotState = app.ShotStates.HOLD;
        app.utils.timeout(function() { self.ship.shotState = app.ShotStates.ON; }, app.SHP_SHOT_PAUSE);
      }

      // Old shot pause method, simple var decrement, not guarunteed acurate
      //  on diff systems
      //if (this.bullets.length < MAX_SHOTS_SHP && --this.ship.shotPause < 0) {
      //  this.bullets.push(this.ship.shoot());
      //  this.ship.shotPause = app.SHP_SHOT_PAUSE;
      //} else {
      //  console.log('hold');
      //}
    }

    if (input.isPressed('hyperspace')) {
      this._hyperspace();
    }
  },

  /**
   * @override State.update
   */
  update: function() {
    var self = this;
    if (this.paused) return;

    // Check score for bonus ship
    if (this.score > this.newShipPoints) {
      this.lives++;
      this.newShipPoints += app.BONUS_SHIP_POINTS;
      if (this.game.sound.on)
        app.utils.playSound(this.game.sound.sounds.extraShip);
    }

    // Spawn new ufo
    var ufo = { active: false, type: null };
    if ((!this.ufoBig.active && !this.ufoSmall.active) && --this.ufoTimeSpawn < 0) {
      this.ufoTimeSpawn = (Math.random() * app.UFO_TIME_SPAWN) + app.UFO_TIME_SPAWN;
      if (this.score > 4000 && Math.random() > 0.2) {
        this.ufoSmall.start();
      } else {
        this.ufoBig.start();
      }
    }
    if (this.ufoBig.active) ufo = this.ufoBig;
    else if (this.ufoSmall.active) ufo = this.ufoSmall;

    if (ufo.active) {
      ufo.update();

      // Play Ufo sound
      if (!this.gameOver && ufo.visible) {
        if (ufo.size === app.UfoSize.BIG && this.game.sound.on)
          app.utils.playSoundLoop(this.game.sound.sounds.ufoBig);
        else if (this.game.sound.on)
          app.utils.playSoundLoop(this.game.sound.sounds.ufoSmall);
      }

      // Check for ship - ufo collision
      if (this.ship.visible && ufo.visible) {
        if (this.ship.collide(ufo)) {
          ufo.explode();
          this.ship.explode();
          if (this.game.sound.on)
            app.utils.playSound(this.game.sound.sounds.explosion);
          this._resetShip();
        }

        // Check if ufo bullets hit the ship
        for (var i = 0, len = ufo.bullets.length; i < len; i++) {
          var b = ufo.bullets[i];

          if (this.ship.hasPoint(b.x, b.y)) {
            this.bullets.splice(i, 1);
            len--;
            i--;
            this.ship.explode();
            if (this.game.sound.on)
              app.utils.playSound(this.game.sound.sounds.explosion);
            this._resetShip();
          }
        }
      }
    }

    // Update all asteroids
    for (var i = 0, len = this.asteroids.length; i < len; i++) {
      var a = this.asteroids[i];
      a.update();

      // If ufo collides with asteroid
      if (ufo.visible) {

        if (ufo.collide(a)) {
          if (this.game.sound.on)
            app.utils.playSound(this.game.sound.sounds.explosion);
          ufo.explode();

          // Handle the collision w/ Asteroid
          if (asteroidSplit(a, this)) {
            len += 2;
          }
          len--;
        }

        // Check if ufo bullets hit the current asteroid
        for (var j = 0, len2 = ufo.bullets.length; j < len2; j++) {
          var b = ufo.bullets[j];

          if (a.hasPoint(b.x, b.y)) {
            ufo.bullets.splice(j, 1);
            len2--;
            j--;

            if (this.game.sound.on)
              app.utils.playSound(this.game.sound.sounds.explosion);

            // Handle collision w/ Asteroid
            if (asteroidSplit(a, this)) {
              len += 2;
            }
            len--;
            i--;
          }
        }
      }

      // If ship collides reset position and decrement lives
      if (this.ship.collide(a)) {

        // Handle collision w/ Asteroid
        //  Note: Explosion sound handled in asteroidHitScore
        asteroidHitScore(a, this);
        if (asteroidSplit(a, this)) {
          len += 2;
        }
        len--;

        this.ship.explode();
        this._resetShip();
      }

      // Check if ship bullets hit the current asteroid
      for (var j = 0, len2 = this.bullets.length; j < len2; j++) {
        var b = this.bullets[j];

        if (a.hasPoint(b.x, b.y)) {
          this.bullets.splice(j, 1);
          len2--;
          j--;

          // Handle collision w/ Asteroid
          asteroidHitScore(a, this);
          if (asteroidSplit(a, this)) {
            len += 2;
          }
          len--;
          i--;
        }
      }
    }

    // Update all bullets
    for (var i = 0, len = this.bullets.length; i < len; i++) {
      var b = this.bullets[i];

      // Check if ship bullets hit a ufo
      if (ufo.visible) {
        if (ufo.hasPoint(b.x, b.y)) {
          this.bullets.splice(i, 1);
          len--;
          i--;
          ufo.explode();
          ufoHitScore(ufo, this);
        }
      }

      b.update();

      // Remove bullet if removeflag is set
      if (b.shallRemove) {
        this.bullets.splice(i, 1);
        len--;
        i--;
      }
    }

    this.ship.update();

    // Update all Asteroids frag points
    Object.keys(this.asteroidFrags).forEach(function(key) {
      var af = self.asteroidFrags[key];
      if (af.frag.visible) af.frag.update();
      else delete self.asteroidFrags[key];
    });

    // Check if level completed
    if (this.asteroids.length === 0) {
      this.lvl++;
      this.generateLevel();
    }

    this._updateBackgroundSound();

    /**
     * Internal method, handle asteroid hit scoring
     */
    function asteroidHitScore(a, self) {

      // Change pace of background sound
      self._updateBackgroundSoundPace();

      // Update score depending on asteroid size
      switch (a.size) {
        case app.ASTEROID_SIZE:
          if (self.game.sound.on)
            app.utils.playSound(self.game.sound.sounds.largeExpl);
          self.score += 20;
          break;
        case app.ASTEROID_SIZE/2:
          if (self.game.sound.on)
            app.utils.playSound(self.game.sound.sounds.mediumExpl);
          self.score += 50;
          break;
        case app.ASTEROID_SIZE/4:
          if (self.game.sound.on)
            app.utils.playSound(self.game.sound.sounds.smallExpl);
          self.score += 100;
          break;
      }
    }

    /**
     * Internal method, handle Asteroid split
     * @return {Boolean} return true if Asteroid was split
     */
    function asteroidSplit(a, self) {

      // Generate Asteroid explosion frags
      for (var k = 0; k < 12; k++) {
        self.asteroidFrags[app.utils.uniqueId()] = {
          frag: new app.FragPoint([0,0, 0,1, 1,1, 1,0, 0,0], 1, a.x, a.y)
        };
      }

      // If asteroid is split twice, then remove
      //  else split in half
      if (a.size > app.ASTEROID_SIZE/4) {
        for (var k = 0; k < 2; k++) {
          var n = Math.round(Math.random() * (app.Points.ASTEROIDS.length - 1));

          var astr = new app.Asteroid(app.Points.ASTEROIDS[n], a.size/2, a.x, a.y);
          astr.maxX = self.canvasWidth;
          astr.maxY = self.canvasHeight;

          self.asteroids.push(astr);
          //len++;
        }
      }
      self.asteroids.splice(i, 1);
    }

    /**
     * Internal method, handle ufo hit scoring
     */
    function ufoHitScore(ufo, self) {
      if (ufo.size === app.UfoSize.SMALL) self.score += 1000;
      else self.score += 200;
    }
  },

  /**
   * Background beat sounds
   */
  _updateBackgroundSound: function() {
    var self = this;

    switch (this.beats.state) {
      case app.BeatStates.BEAT1_ON:
        if (this.game.sound.on)
          app.utils.playSound(this.game.sound.sounds.beat1);
        this.beats.state = app.BeatStates.BEAT1_CONT;
        app.utils.timeout(function() {
          if (self.ship.visible) {
            self.beats.state = app.BeatStates.BEAT2_ON;
          }
        }, this.beats.interval);
        break;
      case app.BeatStates.BEAT2_ON:
        if (this.game.sound.on)
          app.utils.playSound(this.game.sound.sounds.beat2);
        this.beats.state = app.BeatStates.BEAT2_CONT;
        app.utils.timeout(function() {
          if (self.ship.visible) {
            self.beats.state = app.BeatStates.BEAT1_ON;
          }
        }, this.beats.interval);
        break;
    }
  },

  _updateBackgroundSoundPace: function() {
    var counts = { lg: 0, md: 0, sm: 0 };
    for (var i=0; i < this.asteroids.length; i++) {
      switch (this.asteroids[i].size) {
        case app.ASTEROID_SIZE:
          counts.lg++;
          break;
        case app.ASTEROID_SIZE/2:
          counts.md++;
          break;
        case app.ASTEROID_SIZE/4:
          counts.sm++;
          break;
      }
    }
    //console.log(JSON.stringify(counts, null, ' '));

    if (counts.lg <= 1 && counts.md <= 2) {
      this.beats.interval = app.BgSoundPace.FAST;
      //console.log('Fast');
    } else if ((counts.lg <= 2 && counts.md <= 4) && this.beats.interval !== app.BgSoundPace.FAST) {
      this.beats.interval = app.BgSoundPace.MED;
      //console.log('Med');
    } else if (this.beats.interval !== app.BgSoundPace.MED) {
      this.beats.interval = app.BgSoundPace.SLOW;
      //console.log('Slow');
    }
  },

  /**
   * @override State.render
   *
   * @param  {context2d} ctx augmented drawing context
   */
  render: function(ctx) {
    var self = this;
    ctx.clearAll();

    // Score and Extra lives
    ctx.vectorText(this.score, 3, 35, 15, null,
      this.game.colorOn ? app.Colors.SCORE_TEXT : null);
    for (var i = 0; i < this.lives; i++) {
      ctx.drawPolygon(this.lifepolygon, 40+15*i, 50,
        this.game.colorOn ? app.Colors.EXTRA_SHIP : null);
    }

    for (var i = 0, len = this.asteroids.length; i < len; i++) {
      this.asteroids[i].draw(ctx, this.game.colorOn, this.game.colorFillOn);
    }

    for (var i = 0, len = this.bullets.length; i < len; i++) {
      this.bullets[i].draw(ctx, this.game.canvas.lineColorDefault);
    }

    // Draw game over messege
    if (this.gameOver) {
      ctx.vectorText('Game Over', 4, null, null, null,
        this.game.colorOn ? app.Colors.DEFAULT_TEXT : null);
    }

    if (this.ufoBig.active) {
      this.ufoBig.draw(ctx, this.game.colorOn, this.game.colorFillOn);
    }
    if (this.ufoSmall.active) {
      this.ufoSmall.draw(ctx, this.game.colorOn, this.game.colorFillOn);
    }

    this.ship.draw(ctx, this.game.colorOn, this.game.colorFillOn);

    // Update all Asteroids frag points
    Object.keys(this.asteroidFrags).forEach(function(key) {
      var af = self.asteroidFrags[key];
      if (af.frag.visible) af.frag.draw(ctx, self.game.colorOn, self.game.colorFillOn);
    });

    if (this.game.frameRateInfo.display) {
      if (this.game.frameRateInfo.avg)
        ctx.vectorText(this.game.frameRateInfo.avg, 2, 615, 462, null,
          this.game.colorOn ? app.Colors.DEFAULT_TEXT : null);
    }
  }
});
