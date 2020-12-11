const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    comment: {type: String},
    commentBy: {type: Schema.Types.ObjectId, ref:"Player"}
}, {
    timestamps: true
})



module.exports = commentSchema;