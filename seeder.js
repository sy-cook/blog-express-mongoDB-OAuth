const faker = require('faker');
require("dotenv").config();

const {writerModel, journalModel} = require('./models');
const {writerConnection, journalConnection} = require('./connections');

async function seed() {
    await writerModel.create({
        googleId: process.env.MY_GOOGLEID,
        isActive: true
    });

    await journalModel.create({
        title: faker.lorem.words(3),
        content: faker.lorem.words(100),
    });
}

seed().then(() => {
    writerConnection.close();
    journalConnection.close();
});