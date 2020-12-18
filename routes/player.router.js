const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const createError = require("http-errors");

const uploader = require("./../config/cloudinary-setup");

const Player = require("../models/player.model");
const Arcade = require("../models/arcade.model");


// HELPER FUNCTIONS
const {
    isLoggedIn,
    isNotLoggedIn,
    validationLogin
  } = require("../helpers/middlewares");

  
    // include CLOUDINARY: upload a single image per once.
    // ADD an horitzontal middleware
    router.post("/upload", uploader.single("avatarImg"), (req, res, next) => {
      // console.log("file is: ", req.file);
  
      if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
      }
      // get secure_url from the file object and save it in the
      // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
      res.json({ secure_url: req.file.secure_url });
  });


    // GET '/api/player/me'       // WORKING
      // Gets Current User Information (with Favs, ListedArcades and Rankings/Scores)
    router.get('/me', isLoggedIn, (req, res, next) => {
        const id = req.session.currentUser._id;

      Player.findById(id)
            .populate('listedArcades rankings favourites')
            .then((me) => {
              me.password = "***";
              res
              .status(200)
              .json(me);
            })
            .catch(err => {
              res.status(500).json(err);
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
      router.put('/me', isLoggedIn, (req, res, next) => {
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

    // PUT '/api/player/favourites/:id'
      // Updates Current User Favourites List
      router.put('/favourites/:id', isLoggedIn, (req, res, next) => {
        const  newFavouriteArcadeId  = req.params.id;
        const id = req.session.currentUser._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          res
           .status(400)
           .json({ message: 'Invalid Session: id not found' });
          return;
        }
        
        Player.findByIdAndUpdate(
          id,
          { 
              $push:{ favourites: newFavouriteArcadeId },
              $set:{ hasFound: true }
          },
          {new: true}
          )
          .then((updatedUser) => {
            res
             .status(200)
             .json(updatedUser);
          })
          .catch(err => {
            res.status(500).json(err);
          })
      })

    // DELETE '/api/player/favourites/:id'
      // Updates Current User Favourites List by deleting fav entry

      router.post('/favourites/:id', isLoggedIn, (req, res, next) => {
        const  deleteFavouriteArcadeId  = req.params.id;
        const id = req.session.currentUser._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          res
           .status(400)
           .json({ message: 'Invalid Session: id not found' });
          return;
        }
        
        Player.findByIdAndUpdate(
          id,
          { 
              $pull:{ favourites: deleteFavouriteArcadeId },
              $set:{ hasFound: true }
          },
          {new: true}
          )
          .then((updatedUser) => {
            res
             .status(200)
             .json(updatedUser);
          })
          .catch(err => {
            res.status(500).json(err);
          })
      })

    // GET '/api/player/:player'
      // Displays other Users Profile   
    router.get('/:player', (req, res, next) => {
      const { player } = req.params;

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