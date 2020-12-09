const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highestScoreSchema = new Schema({
    score: {type: Number, default: 0},
    arcade: {type: Schema.Types.ObjectId, ref:"Arcade"},
    scoredBy: {type: Schema.Types.ObjectId, ref:"Player"}
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },

});

const HighestScore = mongoose.model('HighestScore', highestScoreSchema);

module.exports = HighestScore;