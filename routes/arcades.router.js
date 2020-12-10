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



// PUBLIC ROUTES

    // GET '/api/arcades?filters'
    router.get('/', (req, res, next) => {
        console.log(req.query)
        const { city, game, isEmulated } = req.query;

        const searchQuery = {}

        if (city) searchQuery.city = city.toLowerCase();
        if (game) searchQuery.game = game.toLowerCase();
        if (isEmulated) searchQuery.isEmulated = isEmulated;

        Arcade.find(searchQuery)
 
    })

     // GET '/api/arcades/:id'
     router.get('/:id', (req, res, next) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res
             .status(400)
             .json({ message: 'Wrong Arcade URL'})
            return;
        }

        Arcade.findById(id)
              .then((foundArcade) => {
                  res
                   .status(200)
                   .json(foundArcade);
              })
              .catch((err) => {
                  res
                   .status(500)
                   .json(err);
              });
    });


// PRIVATE ROUTES

    // POST '/api/arcades'
    router.post('/', isLoggedIn, (req, res, next) => {
        const currentUserId = req.session.currentUser._id.toString();

        const {
            game,
            description,
            maxPlayers,
            isEmulated,
            rating,
            isActive,
            coins,
            yearReleased,
            gallery,
            hunterId,
            coordinates,
            contactInfo,
            address,
            city,
            comments
        } = req.body;

        Arcade.create({
            game,
            description,
            maxPlayers,
            isEmulated,
            rating,
            isActive,
            coins,
            yearReleased,
            highestScores: [],
            gallery: [],
            hunterId,
            coordinates: [],
            contactInfo,
            address,
            city,
            comments: []
        })
        .then((newArcade) => {
            Player.findByIdAndUpdate(
                currentUserId,
                { 
                    $push:{ listedArcades: newArcade._id },
                    $set:{ hasFound: true }
                },
                {new: true}
            )
            .then((updatedPlayer) => {
                updatedPlayer.password = "***";

                res
                 .status(201)
                 .json(updatedPlayer);
            })
            .catch((err) => {
                res
                 .status(500)
                 .json(err);
            });
        })
        .catch((err) => {
            res
            .status(500)
            .json(err);
        });
    });

    // PUT '/api/arcades/:id/highest-scores'

    // DELETE '/api/arcades/:id' -> req.params 
    router.delete('/:id', isLoggedIn, (req, res, next) => {
        const currentUserId = req.session.currentUser._id.toString();
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res
             .status(400)
             .json({ message: 'Wrong Arcade URL'})
            return;
        }

        Arcade.findByIdAndRemove(id)
            .then((deletedArcade) => {
                res
                .status(204)
                .json(deletedArcade);
            })
            .catch((err) => {
                res
                .status(500)
                .json(err);
            });
        
        Player.findByIdAndUpdate(
            currentUserId,
            {$pull:{listedArcades: id}},
            {new: true}
            )
            .then((updatedList) => {
                res
                .status(204)
                .json(updatedList);
            })
            .catch((err) => {
                res
                .status(500)
                .json(err);
            });

});

    // PUT '/api/arcades/:id/comments'
    // router.put('/:id/comments', isLoggedIn, (req, res, next) => {
    //     const currentUserId = req.session.currentUser._id.toString();
    //     const { id } = req.params;
    //     const { comments } = req.body;

    //     if (!mongoose.Types.ObjectId.isValid(id)) {
    //         res
    //          .status(400)
    //          .json({ message: 'Wrong Arcade URL'})
    //         return;
    //     }

    //     Arcade.findByIdAndUpdate(
    //         id,
    //         { 
    //             $push:{ comments:{comment:}} 
    //         },
    //         {new: true}
    //     )
    //     .then((updatedComments) => {
    //         res
    //          .status(201)
    //          .json(updatedComments);
    //     })
    //     .catch((err) => {
    //         res
    //          .status(500)
    //          .json(err);
    //     });
    // })




module.exports = router;