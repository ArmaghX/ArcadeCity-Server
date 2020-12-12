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

  

    // GET '/api/player/me'       // WORKING
      // Gets Current User Information (with Favs, ListedArcades and Rankings/Scores)
    router.get('/me', isLoggedIn, (req, res, next) => {
        const currentUserSessionData = req.session.currentUser;

      Player.findById(currentUserSessionData)
            .populate('listedArcades')
            .populate('rankings')
            .populate('favourites')
            .then((me) => {
              me.password = "***";
              res
              .status(200)
              .json(me);
            })
      });


    // DELETE '/api/player/me'      // IN PROGRESS
      // Erases Current User
      // DON'T REMOVE LISTED ARCADES OR HIGHSCORES FROM DB BUT REMOVE PLAYER COMMENTS
    router.delete('/me', isLoggedIn, (req, res, next) => {

      const currentUserId = req.session.currentUser._id.toString();
      
      Player.findByIdAndRemove(currentUserId, function(err){
        if(err) {
          return next(err);
        }

        req.session.destroy( function(err){
          if (err) {
            return next(err);
          }

        res
          .status(202)
          .json({message: 'User was deleted from the DB'});
        })
      })
    });


    // PUT '/api/player/me/'
      // Updates Current User Profile
      router.put('/me', isLoggedIn, (req, res, next)=>{
        const id = req.session.currentUser._id;
        const { avatarImg } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          res
           .status(400)
           .json({ message: 'Invalid Session: id not found' });
          return;
        }
        Player.findByIdAndUpdate(id, { avatarImg }, {new: true})
          .then((updatedUser) => {
            res
             .status(200)
             .json(updatedUser);
          })
          .catch(err => {
            res.status(500).json(err);
          })
    });


    // GET '/api/player/:player'
      // Displays other Users Profile   
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
    
    });



    module.exports = router;