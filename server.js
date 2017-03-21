var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newsScraper");
var db = mongoose.connection;

db.on("error", function(error){
    console.log(`Mongoose Error: ${error}`);
});

db.once("open", function(){
    console.log("Mongoose connection succesful.");
});


//SPACE FOR ROUTES


app.listen(3000, function(){
    console.log("App running on port 3000!");
});


