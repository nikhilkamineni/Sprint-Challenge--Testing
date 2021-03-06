const mongoose = require('mongoose');
const chai = require('chai');
const { expect } = chai;
const chaihttp = require('chai-http');
const sinon = require('sinon');

const server = require('./server');
chai.use(chaihttp);
const Game = require('./models');

describe('Games', () => {
  before(done => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/test');
    const db = mongoose.connection;
    db.on('error', () => console.error.bind(console, 'connection error'));
    db.once('open', () => {
      console.log('we are connected');
      done();
    });
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
      console.log('we are disconnected');
    });
  });
  // declare some global variables for use of testing
  // hint - these wont be constants because you'll need to override them.
  let testGameId;

  beforeEach(done => {
    // write a beforeEach hook that will populate your test DB with data
    // each time this hook runs, you should save a document to your db
    // by saving the document you'll be able to use it in each of your `it`
    const testGame = {
      title: 'Bioshock',
      genre: 'Video game',
      releaseDate: 'August 2007',
    };

    new Game(testGame).save((err, game) => {
      if (err) {
        console.error(err);
        done();
      }
      testGameId = game.id;
      console.log('Test game added');
      done();
    });
  });

  afterEach(done => {
    // simply remove the collections from your DB.
    Game.remove({}, err => {
      if (err) console.error(err);
      console.log('Test game dropped');
      done();
    });
  });

  // test the POST here
  describe('[POST] /api/game/create', () => {
    it('should save a new game correctly', done => {
      const game = {
        title: 'Monopoly',
        genre: 'Board game',
        releaseDate: '1933',
      };

      chai
        .request(server)
        .post('/api/game/create')
        .send(game)
        .end((err, res) => {
          if (err) return console.error(err);
          expect(res.body.title).to.equal('Monopoly');
          done();
        });
    });
  });

  // test the GET here
  describe('[GET] /api/game/get', () => {
    it('should retrieve the games correctly', done => {
      chai
        .request(server)
        .get('/api/game/get')
        .end((err, res) => {
          if (err) return console.error(err);
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].title).to.equal('Bioshock');
          done();
        });
    });
  });

  // test the PUT here
  describe('[PUT] /api/game/update', () => {
    it('should update the game correctly', done => {
      const updatedGame = {
        title: 'Bioshock: The Collection',
        id: testGameId,
      };
      chai
        .request(server)
        .put('/api/game/update')
        .send(updatedGame)
        .end((err, res) => {
          if (err) return console.error(err);
          expect(res.body.title).to.equal('Bioshock: The Collection');
          done();
        });
    });
  });

  // --- Stretch Problem ---
  // Test the DELETE here
  describe('[DELETE] /api/game/destroy/:id', () => {
    it('should delete the game correctly', done => {
      chai
        .request(server)
        .delete(`/api/game/destroy/${testGameId}`)
        .end((err, res) => {
          if (err) return console.error(err);
          expect(res.body.success).to.equal('Bioshock was removed from the DB');
          done()
        });
    });
  });
});
