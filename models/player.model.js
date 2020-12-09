const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  player: { type: String, required: true },
  email: { type: String, require: true },
  password: { type: String, required: true },
  avatarImg: String,
  favourites: [{type: Schema.Types.ObjectId, ref:"Arcade"}],
  hasFound: Boolean,
  listedArcades: [{type: Schema.Types.ObjectId, ref:"Arcade"}],
  rankings: [{type: Schema.Types.ObjectId, ref:"HighestScore"}]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});


const Player = mongoose.model('Player', playerSchema);

module.exports = Player;