const mongoose = require('mongoose');
const {writerConnection, journalConnection} = require('./connections');

// const mongoAtlas = `mongodb+srv://admin-seyoung:${process.env.MONGODB_PW}@cluster0.kgiyy.mongodb.net/blogDB`

// Mongo Atlas
// mongoose.connect(mongoAtlas, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).catch((e) => {
//   console.log(e);
// });

const writerSchema = new mongoose.Schema({
    googleId: String,
    isActive: Boolean,
  }, {
    versionKey: false,
    timestamps: true,
  });
  
const writerModel = writerConnection.model('Writer', writerSchema);

const journalSchema = new mongoose.Schema({
    title: String,
    content: String,
}, {
    versionKey: false,
    timestamps: true,
});

const journalModel = journalConnection.model('Journal', journalSchema);

module.exports = {
    writerModel, journalModel
};