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



    // GET '/api/arcades?filters'
        // Gets all Arcades or filtered ones
    router.get('/', (req, res, next) => {
        console.log(req.query)
        const { city, game, isEmulated } = req.query;
        const searchQuery = {}

        if (city) searchQuery.city = city.toLowerCase();
        if (game) searchQuery.game = game.toLowerCase();
        if (isEmulated) searchQuery.isEmulated = isEmulated;

        Arcade.find(searchQuery) // NOT A FUNCTION
            .then((foundArcades) => {
                res
                .status(201)
                .json(foundArcades);
            })
            .catch((err) => {
                res
                .status(500)
                .json(err);
            });
    });


    // POST '/api/arcades'
        // Creates new Arcade
    router.post('/', isLoggedIn, (req, res, next) => {
        const currentUserId = req.session.currentUser._id;

        console.log(currentUserId)
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
            rating: [],
            isActive,
            coins,
            yearReleased,
            highestScores: [],
            gallery,
            hunterId: currentUserId,
            coordinates: [],
            contactInfo,
            address,
            city,
            comments: []
        })
        .then((newArcade) => {
            Player.findByIdAndUpdate(
                hunterId,
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


    // GET '/api/arcades/:id'
        // Gets specific Arcade
     router.get('/:id', (req, res, next) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res
             .status(400)
             .json({ message: 'Wrong Arcade URL'})
            return;
        }

        Arcade.findById(id)
              .populate('hunterId')
              .populate({
                  path: 'highestScores',
                    populate: {
                       path: 'arcade',
                       path: 'scoredBy' 
                    }})
              .then((foundArcade) => {
                  console.log(foundArcade)
                // foundArcade.scoredBy.password = "***";
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


    // PUT '/api/arcades/:id/highest-scores'
        // Adds new score into the highest-scores of that specific Arcade
        // Updates Player High-Scores Info
    router.post('/:id/highest-scores', isLoggedIn, (req, res, next) => {
        const currentUserId = req.session.currentUser._id.toString();
        const { id } = req.params;
        const { score } = req.body;
        const newScore = {
                        score,
                        arcade: mongoose.Types.ObjectId(id),
                        scoredBy: mongoose.Types.ObjectId(currentUserId)
        }
        console.log(newScore);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res
             .status(400)
             .json({ message: 'Wrong Arcade URL'})
            return;
        }

         // created highscore, findbyidandupdate and push it into the array
         HighestScore.create(newScore)
            .then((newScoreEntry) => {
                // console.log(newScoreEntry)
                return Arcade.findByIdAndUpdate(
                    id,
                    { 
                        $push:{ highestScores: newScoreEntry._id }
                    },
                    {new: true}
                )
                .then(() => {
                    return Player.findByIdAndUpdate(
                        currentUserId,
                        { 
                            $push:{ rankings: newScoreEntry._id}
                        },
                        {new: true}
                    )
                    .then((updatedPlayerScore) => {
                        res
                         .status(201)
                         .json(updatedPlayerScore);
                    })
                    .catch((err) => {
                        next(err);
                    });
                })
                .catch((err) => {
                    next(err);
                });
            })
            .catch((err) => {
                next(err);
            });
    });


    // DELETE '/api/arcades/:id'
        // Erases specific Arcade
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
            .then(() => {
                return Player.findByIdAndUpdate(
                            currentUserId,
                            {
                                $pull:{listedArcades: id}
                            },
                            {new: true}
                        )
                        .then((updatedPlayer) => {
                            if (updatedPlayer.listedArcades.length === 0) {
                                 return false
                            } else true
                        })
                        .then((results) => {
                            if (results === false) {
                                return Player.findByIdAndUpdate(
                                    currentUserId,
                                    {
                                        $set:{hasFound: false}
                                    },
                                    {new: true}
                                )
                            }
                        })
                        .then((updatedUser) => {
                            res
                            .status(204)
                            .json(updatedUser);
                        })
                        .catch((err) => {
                            res
                            .status(500)
                            .json(err);
                        });

        });
    });

    
    // PUT '/api/arcades/:id/comments'
        // Adds new comment to that specific arcade
    router.put('/:id/comments', isLoggedIn, (req, res, next) => {
        const currentUserId = req.session.currentUser._id;
        const { id } = req.params;
        const { comment } = req.body;
        const newComment = { 
                        comment, 
                        commentBy: currentUserId
                            }
        console.log(newComment)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res
             .status(400)
             .json({ message: 'Wrong Arcade URL'})
            return;
        }

        Arcade.findByIdAndUpdate(
            id,
            { 
                $push:{ comments: newComment}
            },
            {new: true}
        )
        .then((updatedComments) => {
            res
             .status(201)
             .json(updatedComments);
        })
        .catch((err) => {
            res
             .status(500)
             .json(err);
        });
    })




module.exports = router;