'use strict';


/* dependencies */
const path = require('path');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { plugin, worker } = require(path.join(__dirname, '..', 'index'));
let Party;

/* @todo sinon spy */


describe('mongoose-kue', function () {

  before(function (done) {
    worker.reset(done);
  });

  before(function () {

    let PartySchema = new Schema({});

    PartySchema.statics.sendEmail = function (options, done) {
      done(null, options);
    };

    PartySchema.statics.sendDirectEmail = function (done) {
      done();
    };

    PartySchema.methods.sendEmail = function (options, done) {
      done(null, options);
    };

    PartySchema.methods.sendDirectEmail = function (done) {
      done();
    };

    PartySchema.plugin(plugin);

    Party = mongoose.model('Party', PartySchema);

  });


  describe('import/require', function () {

    it('should be able to import schema plugin', function () {
      expect(plugin).to.exist;
      expect(plugin).to.be.a('function');
      expect(plugin.length).to.be.equal(2);
    });

    it('should be able to import worker', function () {
      expect(worker).to.exist;
      expect(worker).to.be.an('object');
    });

  });

  describe('static#runInBackground', function () {

    before(function (done) {
      worker.reset(done);
    });

    before(function () {
      worker.start();
    });

    it('should be able to queue and run function in background',
      function (done) {

        const options = {
          method: 'sendEmail',
          to: ['a@ex.com']
        };

        //listen to queue events
        worker.queue.on('job complete', function (id, result) {
          expect(id).to.exist;
          expect(result).to.exist;
          expect(result.to).to.exist;
          expect(result.to).to.be.eql(options.to);
          // done();
        }).on('job remove', function (jobId, jobType) {
          expect(jobId).to.exist;
          expect(jobType).to.exist;
          console.log('job removed');
          done();
        }).on('job failed', function (error) {
          console.log('job failed');
          done(new Error(error));
        });

        const job = Party.runInBackground(options);
        expect(job).to.exist;

      });

    after(function (done) {
      worker.stop(done);
    });

  });


  describe('instance#runInBackground', function () {

    let party;

    before(function (done) {
      worker.reset(done);
    });

    before(function () {
      worker.start();
    });

    before(function (done) {

      Party.create({}, function (error, created) {
        party = created;
        done(error, created);
      });

    });

    it('should be able to queue and run function in background',
      function (done) {

        const options = {
          method: 'sendEmail',
          to: ['a@ex.com']
        };

        //listen to queue events
        worker.queue.on('job complete', function (id, result) {
          expect(id).to.exist;
          expect(result).to.exist;
          expect(result.to).to.exist;
          expect(result.to).to.be.eql(options.to);
          done();
        }).on('job failed', function (error) {
          done(new Error(error));
        });

        const job = party.runInBackground(options);
        expect(job).to.exist;

      });

    after(function (done) {
      worker.stop(done);
    });

  });

  after(function (done) {
    worker.stop(done);
  });

  after(function (done) {
    Party.deleteMany(done);
  });

});