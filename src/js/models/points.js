'use strict';

// eslint-disable-next-line indent, no-irregular-whitespace
﻿var app = app || {};

/**
 * Global object containing all verticies for the game graphics,
 * see. polygondraw.html
 */
app.Points = {

  ASTEROIDS: [
    [-4, -2, -2, -4, 0, -2, 2, -4, 4, -2, 3, 0, 4, 2, 1, 4, -2, 4, -4, 2, -4, -2],
    [-3, 0, -4, -2, -2, -4, 0, -3, 2, -4, 4, -2, 2, -1, 4, 1, 2, 4, -1, 3, -2, 4, -4, 2, -3, 0],
    [-2, 0, -4, -1, -1, -4, 2, -4, 4, -1, 4, 1, 2, 4, 0, 4, 0, 1, -2, 4, -4, 1, -2, 0],
    [-1, -2, -2, -4, 1, -4, 4, -2, 4, -1, 1, 0, 4, 2, 2, 4, 1, 3, -2, 4, -4, 1, -4, -2, -1, -2],
    [-4, -2, -2, -4, 2, -4, 4, -2, 4, 2, 2, 4, -2, 4, -4, 2, -4, -2]
  ],

  SHIP: [6, 0, -3, -3, -2, 0, -3, 3, 6, 0],

  FLAMES: [-2, 0, -3, -1, -5, 0, -3, 1, -2, 0],

  UFO_BIG: [ -5,-11, -8,-6, -15,0, -8,6, 8,6, 15,0, 8,-6, 5,-11, -5,-11 ],
  UFO_BIG_TOP_LINE: [ -8,-6, 8,-6 ],
  UFO_BIG_MID_LINE: [ -15,0, 15,0 ],

  UFO_SMALL: [ -3,-7, -5,-4, -10,0, -5,4, 5,4, 10,0, 5,-4, 3,-7, -3,-7 ],
  UFO_SMALL_TOP_LINE: [ -5,-4, 5,-4, 3,-7 ],
  UFO_SMALL_MID_LINE: [ -10,0, 10,0 ],

  LETTERS: [
    [0, 6, 0, 2, 2, 0, 4, 2, 4, 4, 0, 4, 4, 4, 4, 6],                         //A
    [0, 3, 0, 6, 2, 6, 3, 5, 3, 4, 2, 3, 0, 3, 0, 0, 2, 0, 3, 1, 3, 2, 2, 3], //B
    [4, 0, 0, 0, 0, 6, 4, 6],                                                 //C
    [0, 0, 0, 6, 2, 6, 4, 4, 4, 2, 2, 0, 0, 0],                               //D
    [4, 0, 0, 0, 0, 3, 3, 3, 0, 3, 0, 6, 4, 6],                               //E
    [4, 0, 0, 0, 0, 3, 3, 3, 0, 3, 0, 6],                                     //F
    [4, 2, 4, 0, 0, 0, 0, 6, 4, 6, 4, 4, 2, 4],                               //G
    [0, 0, 0, 6, 0, 3, 4, 3, 4, 0, 4, 6],                                     //H
    [0, 0, 4, 0, 2, 0, 2, 6, 4, 6, 0, 6],                                     //I
    [4, 0, 4, 6, 2, 6, 0, 4],                                                 //J
    [3, 0, 0, 3, 0, 0, 0, 6, 0, 3, 3, 6],                                     //K
    [0, 0, 0, 6, 4, 6],                                                       //L
    [0, 6, 0, 0, 2, 2, 4, 0, 4, 6],                                           //M
    [0, 6, 0, 0, 4, 6, 4, 0],                                                 //N
    [0, 0, 4, 0, 4, 6, 0, 6, 0, 0],                                           //O
    [0, 6, 0, 0, 4, 0, 4, 3, 0, 3],                                           //P
    [0, 0, 0, 6, 2, 6, 3, 5, 4, 6, 2, 4, 3, 5, 4, 4, 4, 0, 0, 0],             //Q
    [0, 6, 0, 0, 4, 0, 4, 3, 0, 3, 1, 3, 4, 6],                               //R
    [4, 0, 0, 0, 0, 3, 4, 3, 4, 6, 0, 6],                                     //S
    [0, 0, 4, 0, 2, 0, 2, 6],                                                 //T
    [0, 0, 0, 6, 4, 6, 4, 0],                                                 //U
    [0, 0, 2, 6, 4, 0],                                                       //V
    [0, 0, 0, 6, 2, 4, 4, 6, 4, 0],                                           //W
    [0, 0, 4, 6, 2, 3, 4, 0, 0, 6],                                           //X
    [0, 0, 2, 2, 4, 0, 2, 2, 2, 6],                                           //Y
    [0, 0, 4, 0, 0, 6, 4, 6]                                                  //Z
  ],

  NUMBERS: [
    [0, 0, 0, 6, 4, 6, 4, 0, 0, 0],                                           //0
    [2, 0, 2, 6],                                                             //1
    [0, 0, 4, 0, 4, 3, 0, 3, 0, 6, 4, 6],                                     //2
    [0, 0, 4, 0, 4, 3, 0, 3, 4, 3, 4, 6, 0, 6],                               //3
    [0, 0, 0, 3, 4, 3, 4, 0, 4, 6],                                           //4
    [4, 0, 0, 0, 0, 3, 4, 3, 4, 6, 0, 6],                                     //5
    [0, 0, 0, 6, 4, 6, 4, 3, 0, 3],                                           //6
    [0, 0, 4, 0, 4, 6],                                                       //7
    [0, 3, 4, 3, 4, 6, 0, 6, 0, 0, 4, 0, 4, 3],                               //8
    [4, 3, 0, 3, 0, 0, 4, 0, 4, 6]                                            //9
  ],

  SYMBOLS: {
    95: [0, 6, 4, 6]                                                           //_
  }
};
