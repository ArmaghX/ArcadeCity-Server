const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const createError = require("http-errors");

const Player = require("../models/player.model");
const Arcade = require("../models/arcade.model");
const HighestScore = require("../models/highestScore.model");

// HELPER FUNCTIONS
const {
    isLoggedIn,
    isNotLoggedIn,
    validationLogin
  } = require("../helpers/middlewares");




    // GET '/api/player/me'

    router.get('/me', isLoggedIn, (req, res, next) => {
        const currentUserSessionData = req.session.currentUser;
      
        res
          .status(200)
          .json(currentUserSessionData);
      
      });

    // GET '/api/player/me/scores'
    router.get('/me/scores', isLoggedIn, (req, res, next) => {
      const currentUserSessionData = req.session.currentUser;

    });

    // GET '/api/player/:player'

    router.get('/:player', (req, res, next) => {
      const { player } = req.params;
      console.log(player);

      Player.findOne({player})
              .populate('favourites')
              .populate('listedArcades')
              .populate('rankings')
              .then((foundPlayer) => {
                foundPlayer.password = "***";
                  res
                   .status(200)
                   .json(foundPlayer);
              })
              .catch((err) => {
                  res
                   .status(500)
                   .json(err);
              });
    
    })


    // GET '/api/player/:name/scores'
    

    module.exports = router;