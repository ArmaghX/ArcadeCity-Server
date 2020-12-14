const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  player: { type: String, required: true, unique: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, required: true },
  avatarImg: String,
  favourites: [{type: Schema.Types.ObjectId, ref:"Arcade"}],
  hasFound: Boolean,
  listedArcades: [{type: Schema.Types.ObjectId, ref:"Arcade"}],
  rankings: [{type: Schema.Types.ObjectId, ref:"HighestScore"}]
}, {
  timestamps: true
});


const Player = mongoose.model('Player', playerSchema);

module.exports = Player;