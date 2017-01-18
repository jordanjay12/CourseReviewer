var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    professor: String,
    year: String,
    difficulty: Number,
    workload: Number,
    material: String,
    other: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }    
});

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;