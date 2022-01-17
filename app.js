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

const findOrCreate = require("mongoose-findorcreate");

const faker = require("faker");

const { writerConnection, journalConnection } = require("./connections");
// const {writerModel, journalModel} = require('./models');

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const writerSchema = new mongoose.Schema(
  {
    googleId: String,
    email: String,
    password: String,
    isActive: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Local login strategy
// writerSchema.plugin(passportLocalMongoose);

writerSchema.plugin(findOrCreate);

const writerModel = writerConnection.model("Writer", writerSchema);

// Local login strategy
// passport.use(writerModel.createStrategy());
// passport.serializeUser(writerModel.serializeUser());
// passport.deserializeUser(writerModel.deserializeUser());

// OAuth login strategy
passport.serializeUser(function(writer, done) {
  done(null, writer.id);
});

passport.deserializeUser(function(id, done) {
  writerModel.findById(id, function(err, writer) {
    done(err, writer);
  });
});

const journalSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const journalModel = journalConnection.model("Journal", journalSchema);

module.exports = {
  writerModel,
  journalModel,
};

const homeStartingContent = faker.lorem.words(100);
const aboutContent = faker.lorem.words(100);
const contactContent = faker.lorem.words(100);

// Place this after all the set up, before the routes.
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/compose",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  // Implement a simple check against my googleID
  function(accessToken, refreshToken, profile, cb) {
    writerModel.findOne({ googleId: profile.id }, function (err, writer) {
      if (profile.id === process.env.MY_GOOGLEID) {
        return cb(err, writer);
      } else {
        return cb("Invalid user.");
      }
    });
  }
));

app.get("/", function (req, res) {
  journalModel.find({}, function (err, foundJournals) {
    if (!err) {
      if (foundJournals.length === 0) {
        res.render("home", {
          homeParagraph: homeStartingContent,
          journals: [],
        });
      } else {
        res.render("home", {
          homeParagraph: homeStartingContent,
          journals: foundJournals,
        });
      }
    }
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/compose",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/compose");
  }
);

app.post("/compose", function (req, res) {
  if (req.isAuthenticated()) {
    const journal = new journalModel({
      title: req.body.journalTitle,
      content: req.body.journalBody,
    });

    journal.save(function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/journal/:journalID", function (req, res) {
  const journalID = req.params.journalID;

  journalModel.findOne({ _id: journalID }, function (err, foundJournal) {
    if (!err) {
      res.render("journal", {
        journal: foundJournal,
      });
    }
  });
});

app.get("/compose", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.redirect("/login");
  }
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutParagraph: aboutContent,
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactParagraph: contactContent,
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  const writer = new writerModel({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(writer, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/compose");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server started at http://localhost:${port}`)
);
