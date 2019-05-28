'use strict';

/* dependencies */
const {
  expect,
  clear,
  createTestModel
} = require('@lykmapipo/mongoose-test-helpers');
const { plugin, worker } = require('../index');
let Party;

/* @todo sinon spy */

describe('imports', () => {
  // before(done => worker.clear(done));
  before(done => worker.reset(done));

  it('should be able to import schema plugin', () => {
    expect(plugin).to.exist;
    expect(plugin).to.be.a('function');
    expect(plugin.length).to.be.equal(2);
  });

  it('should be able to import worker', () => {
    expect(worker).to.exist;
    expect(worker).to.be.an('object');
  });

  // after(done => worker.clear(done));
  after(done => worker.stop(done));
});

describe.skip('static runInBackground', () => {

  before(done => worker.reset(done));

  before(() => {
    Party = createTestModel({}, schema => {
      schema.statics.sendEmail = (optns, done) => done(null,
        optns);
      schema.statics.sendDirectEmail = done => done();
      schema.methods.sendEmail = (optns, done) => done(null,
        optns);
      schema.methods.sendDirectEmail = done => done();
    }, plugin);
  });

  it('should be able to queue and run function in background',
    done => {

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

  after(done => worker.stop(done));
  after(done => clear(done));
});

describe.skip('instance runInBackground', () => {

  let party;

  before(done => worker.reset(done));

  before(() => {
    Party = createTestModel({}, schema => {
      schema.statics.sendEmail = (optns, done) => done(null,
        optns);
      schema.statics.sendDirectEmail = done => done();
      schema.methods.sendEmail = (optns, done) => done(null,
        optns);
      schema.methods.sendDirectEmail = done => done();
    }, plugin);
  });

  before(done => {
    Party.create({}, function (error, created) {
      party = created;
      done(error, created);
    });
  });

  it('should be able to queue and run function in background', done => {
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

  after(done => worker.stop(done));
  after(done => clear(done));
});