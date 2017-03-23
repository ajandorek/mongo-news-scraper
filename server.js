var express = require("express");
var exphbs = require("express-handlebars")
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var methodOverride = require("method-override");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

var app = express();

app.use(methodOverride('_method'))

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newsScraper");
var db = mongoose.connection;

db.on("error", function (error) {
    console.log(`Mongoose Error: ${error}`);
});

db.once("open", function () {
    console.log("Mongoose connection succesful.");
});

// app.get('/', function (req, res) {
//     res.render('index', Article);
// });

app.get("/scrape", function (req, res) {
    request("http://m.mlb.com/news/", function (error, response, html) {
        var $ = cheerio.load(html);
        $("li.item.cf").each(function (i, element) {
            var result = {};
            result.title = $(element).find(".headline").text();
            result.link = $(element).find("a").attr("href");

            var entry = new Article(result);

            entry.save(function (err, doc) {
                // if (err) {
                //     console.log(err);
                // } else {
                //     //console.log(doc);
                // }
            });//saving each entry into our DB
        });//grabbing each news title
        setTimeout(function(){ res.redirect("/") }, 500);
    });//requesting MLB homepage to get news
});//serving our scrape page

app.get("/", function (req, res) {
    Article.find({}, function (error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            var article = {
                article: doc
            };
            res.render("index", article);
        }
    });
});

app.get("/articles/:id", function (req, res) {
    Article.findOne({ "_id": req.params.id })
        .populate("note")
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(doc);
            }
        });
});


app.post("/articles/:id", function (req, res) {
    console.log("hello")
    var newNote = new Note(req.body);
    newNote.save(function (error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                .exec(function (err, doc) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.send(doc);
                    }
                });
        }
    });
});

app.delete("/articles/:id", function (req, res){
    Note.deleteOne({"_id": req.params.id})
        .exec(function (err, doc){
            if (err) {
                console.log(err);
            } else {
                console.log("Note Removed");
            }
        });
});

app.get("/saved", function (req, res) {
    Article.find({ "saved": true }, function (error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            var article = {
                article: doc
            };
            res.render("saved", article);
        }
    });
});

app.put("/saved/:id", function (req, res) {
    console.log(req.body)
    console.log(req.params.id)
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": req.body })
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/");
            }
        });
});
Note.remove({}).then(function(){
    console.log("Notes Cleared");
});
Article.remove({}).then(function () {
    app.listen(3000, function () {
        console.log("App running on port 3000!");
    });
});


