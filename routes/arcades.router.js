const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const createError = require("http-errors");
const queryString = require('query-string');

const uploader = require("./../config/cloudinary-setup");

const Player = require("../models/player.model");
const Arcade = require("../models/arcade.model");
const HighestScore = require("../models/highestScore.model");


// HELPER FUNCTIONS
const {
    isLoggedIn,
    isNotLoggedIn,
    validationLogin
  } = require("../helpers/middlewares");


    // CLOUDINARY: upload a single image per once.
    // ADD an horitzontal middleware
    router.post("/upload", uploader.single("gallery"), (req, res, next) => {
        console.log("file is: ", req.file);
    
        if (!req.file) {
        next(new Error("No file uploaded!"));
        return;
        }
        // get secure_url from the file object and save it in the
        // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
        res.json({ secure_url: req.file.secure_url });
    });

    // GET '/api/arcades/search/:city'
        // 
    router.get('/search/:city', (req, res, next) => {
        // const parsed = queryString.parse(this.props.location.search)
        // console.log(parsed)
        const  city  = req.params.city;
        const searchParams = {}

        if (city) searchParams.city = city.toLowerCase();
        // if (game) searchParams.game = game.toLowerCase();
        // if (isEmulated) searchParams.isEmulated = isEmulated;
        console.log('CITY GOES HERE', city);
        const regex = new RegExp(["^", city, "$"].join(""), "i") //   /^Paris$/i
        Arcade.find({city: regex }) // NOT A FUNCTION
            .populate('highestScores hunterId')
            .then((response) => {
                console.log(response);
                res
                .status(201)
                .json(response);
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
        console.log('THIS IS THE REQ.BODY', req.body);
        const currentUserId = req.session.currentUser._id;

        const coins = Number(req.body.coins);

        const {
            game,
            description,
            maxPlayers,
            isEmulated,
            rating,
            isActive,
            yearReleased,
            highestScores,
            gallery,
            coordinates,
            hunterId,
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
            location: {
                coordinates: coordinates,
                type: "Point"
            },
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
            })
            .catch((err) => {
                res
                 .status(500)
                 .json(err);
            });

            res
             .status(201)
             .json(newArcade);
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
                  foundArcade.hunterId.password = "***";
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