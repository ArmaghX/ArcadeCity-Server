const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = require('./sub-schemas/comment.schema');



const arcadeSchema = new Schema({
    game: {type: String, required: true},
    description: String,
    maxPlayers: Number,
    isEmulated: Boolean,
    rating: [{type: Number, min: 0, max: 10}],
    isActive: Boolean,
    coins: Number,
    yearReleased: Number,
    highestScores: [{type: Schema.Types.ObjectId, ref:"HighestScore"}],
    gallery: {type: String, required: true},
    hunterId: {type: Schema.Types.ObjectId, ref:"Player"},
    location: {
        type: {
          type: String
        },
        coordinates: [Number]
      },
    contactInfo: String,
    address: String,
    city: String,
    comments: [ 
        commentSchema
     ]
}, {
    timestamps: true,
});

arcadeSchema.index({ location: '2dsphere' });

const Arcade = mongoose.model('Arcade', arcadeSchema);

module.exports = Arcade;