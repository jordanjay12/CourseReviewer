var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    professor: String,
    year: String,
    difficulty: String,
    material: String,
    other: String
});

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;