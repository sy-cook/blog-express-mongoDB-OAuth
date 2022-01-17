const faker = require('faker');

const {writerModel, journalModel} = require('./models');
const {writerConnection, journalConnection} = require('./connections');

async function seed() {
    await journalModel.create({
        title: faker.lorem.words(3),
        content: faker.lorem.words(100),
    });
}

seed().then(() => {
    writerConnection.close();
    journalConnection.close();
});