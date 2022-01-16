//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const req = require("express/lib/request");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const faker = require('faker');

const {writerModel, journalModel} = require('./models');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// app.get('/writers', async (req, res) => {
//   const writers = await writerModel.find({});

//   res.json(writers);
// });

// app.get('journals', async (req, res) => {
//   const journals = await journalModel.find({});

//   res.json(journals);
// });

// mongoose.connect("mongodb://localhost:27017/blogDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const homeStartingContent = faker.lorem.words(100);
const aboutContent = faker.lorem.words(100);
const contactContent = faker.lorem.words(100);

// const postSchema = {
//   title: String,
//   content: String
// };

// const Journal = new mongoose.model("Journal", postSchema);

app.get("/", function(req, res) {
  journalModel.find({}, function(err, foundJournals) {
    if (!err) {
      if (foundJournals.length === 0) {
        res.render("home", {
          homeParagraph: homeStartingContent,
          posts: []
        });
      } else {
        res.render("home", {
          homeParagraph: homeStartingContent,
          posts: foundJournals
        });
      }
    }
  });
});

app.post("/compose", function(req, res) {
  const journal = new journalModel({
    title: req.body.journalTitle,
    content: req.body.journalBody
  });

  journal.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get('/journals/:journalID', function(req, res) {
  const journalID = req.params.journalID;

  journalModel.findOne({_id: journalID}, function(err, foundJournal) {
    if (!err) {
      res.render("journal", {
        journal: foundJournal
      });
    }
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutParagraph: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    contactParagraph: contactContent
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

const port = 3000;
app.listen(port, () => console.log(`Server started at http://localhost:${port}`));


