var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String, 
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("ArticleSchema");

module.exports = Article;