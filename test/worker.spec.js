'use strict';


/* dependencies */
const path = require('path');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const worker = require(path.join(__dirname, '..', 'lib', 'worker'));
let User;

/* @todo sinon spy */

describe.only('mongoose-kue-worker', function () {

  before(function () {

    let UserSchema = new Schema({});

    UserSchema.statics.sendEmail = function (options, done) {
      done(null, options);
    };

    UserSchema.statics.sendDirectEmail = function (done) {
      done();
    };

    UserSchema.methods.sendEmail = function (options, done) {
      done(null, options);
    };

    UserSchema.methods.sendDirectEmail = function (done) {
      done();
    };

    User = mongoose.model('User', UserSchema);

  });

  describe('import', function () {

    before(function (done) {
      worker.reset(done);
    });

    it('should be imported without initialized', function () {

      expect(worker).to.exist;
      expect(worker.defaults).to.exist;
      expect(worker.options).to.be.eql(worker.defaults);
      expect(worker.queue).to.not.exist;

    });

    after(function (done) {
      worker.stop(done);
    });

  });

  describe('initialization', function () {

    before(function (done) {
      worker.reset(done);
    });

    it('should be able to initialize', function () {
      expect(worker.queue).to.not.exist;

      const options = { name: 'mongoose', timeout: 4000 };
      worker.init(options);

      expect(worker.options).to.exist;
      expect(worker.options.name).to.be.equal(options.name);
      expect(worker.options.timeout).to.be.equal(options.timeout);
      expect(worker.queue).to.exist;

    });

    after(function (done) {
      worker.stop(done);
    });

  });


  describe('process', function () {

    let user;

    before(function (done) {
      worker.reset(done);
    });

    before(function (done) {
      User.create({}, function (error, created) {
        user = created;
        done(error, created);
      });
    });

    it('should be able to process method', function () {

      expect(worker.process).to.exist;
      expect(worker.process).to.be.a('function');
      expect(worker.process.length).to.be.equal(2);

    });


    it('should throw Missing Model Name', function (done) {
      //inject job 
      const job = { data: { context: {} } };

      worker.process(job, function (error) {
        expect(error).to.exist;
        expect(error.message).to.equal('Missing Model Name');
        done();
      });

    });

    it('should throw Missing Method Name', function (done) {
      //inject job
      const job = { data: { context: { model: 'User' } } };

      worker.process(job, function (error) {
        expect(error).to.exist;
        expect(error.message).to.equal('Missing Method Name');
        done();
      });

    });

    it('should throw Missing Model', function (done) {
      //inject job 
      const job = { data: { context: { model: 'Use', method: 'sendEmail' } } };

      worker.process(job, function (error) {
        expect(error).to.exist;
        expect(error.message)
          .to.contain('Missing Model Use');
        done();
      });

    });

    it('should throw Missing Schema Static Method', function (done) {
      //inject job
      const job = { data: { context: { model: 'User', method: 'sentEmail' } } };

      worker.process(job, function (error) {
        expect(error).to.exist;
        expect(error.message)
          .to.contain('Missing Schema Static Method sentEmail');
        done();
      });

    });

    it('should be able run static method with arguments',
      function (done) {
        //inject job
        const job = {
          data: {
            context: { model: 'User', method: 'sendEmail' },
            to: ['a@ex.com']
          }
        };

        worker.process(job, function (error, results) {
          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results.context).to.not.exist;
          expect(results.to).to.exist;
          expect(results.to).to.be.eql(job.data.to);
          done(error, results);
        });

      });

    it('should be able run static method with no arguments',
      function (done) {
        //inject job
        const job = {
          data: {
            context: { model: 'User', method: 'sendDirectEmail' }
          }
        };

        worker.process(job, function (error, results) {
          expect(error).to.not.exist;
          expect(results).to.not.exist;
          done(error, results);
        });

      });

    it('should throw Missing Model Instance', function (done) {
      //inject job 
      const job = {
        data: {
          context: {
            model: 'User',
            method: 'sendEmail',
            _id: '54108337212ffb6d459f854c'
          }
        }
      };

      worker.process(job, function (error) {
        expect(error).to.exist;
        expect(error.message)
          .to.contain('Missing ' + job.data.context.model +
            ' Instance ' + job.data.context
            ._id);
        done();

      });

    });

    it('should be able run instance method with arguments',
      function (done) {
        //inject job
        const job = {
          data: {
            context: {
              model: 'User',
              method: 'sendEmail',
              _id: user._id
            },
            to: ['a@ex.com']
          }
        };

        worker.process(job, function (error, results) {
          expect(error).to.not.exist;
          expect(results).to.exist;
          expect(results.context).to.not.exist;
          expect(results.to).to.exist;
          expect(results.to).to.be.eql(job.data.to);
          done(error, results);
        });

      });

    it('should be able run instance method with no arguments',
      function (done) {
        //inject job
        const job = {
          data: {
            context: {
              model: 'User',
              method: 'sendDirectEmail',
              _id: user._id
            }
          }
        };

        worker.process(job, function (error, results) {
          expect(error).to.not.exist;
          expect(results).to.not.exist;
          done(error, results);
        });

      });

    after(function (done) {
      worker.stop(done);
    });

    after(function (done) {
      User.deleteMany(done);
    });

  });

});