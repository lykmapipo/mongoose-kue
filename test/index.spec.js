'use strict';

/* dependencies */
const {
  // connect,
  expect,
  clear,
  createTestModel
} = require('@lykmapipo/mongoose-test-helpers');
const { plugin, worker } = require('../index');

/* @todo sinon spy */

describe('imports', () => {
  before(done => worker.clear(done));
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

  after(done => worker.clear(done));
  after(done => worker.stop(done));
});

describe('static runInBackground', () => {
  let User;

  before(done => worker.clear(done));
  before(done => worker.reset(done));
  before(() => worker.start());

  before(() => {
    User = createTestModel({}, schema => {
      schema.statics.sendEmail = (optns, done) => done(null, optns);
      schema.statics.sendDirectEmail = done => done();
      schema.methods.sendEmail = (optns, done) => done(null, optns);
      schema.methods.sendDirectEmail = done => done();
    }, plugin);
  });

  it('should be able to queue and run function in background', done => {
    const options = {
      method: 'sendEmail',
      to: ['a@ex.com']
    };

    worker.queue.on('job complete', (id, result) => {
      expect(id).to.exist;
      expect(result).to.exist;
      expect(result.to).to.exist;
      expect(result.to).to.be.eql(options.to);
    }).on('job remove', (jobId, jobType) => {
      expect(jobId).to.exist;
      expect(jobType).to.exist;
      done();
    }).on('job failed', error => {
      done(new Error(error));
    });

    const job = User.runInBackground(options);
    expect(job).to.exist;
  });

  after(done => worker.clear(done));
  after(done => worker.stop(done));
  after(done => clear(done));
});

describe('instance runInBackground', () => {
  let User;
  let user;

  before(done => worker.clear(done));
  before(done => worker.reset(done));
  before(() => worker.start());

  before(() => {
    User = createTestModel({}, schema => {
      schema.statics.sendEmail = (optns, done) => done(null, optns);
      schema.statics.sendDirectEmail = done => done();
      schema.methods.sendEmail = (optns, done) => done(null, optns);
      schema.methods.sendDirectEmail = done => done();
    }, plugin);
  });

  before(done => {
    User.create({}, (error, created) => {
      user = created;
      done(error, created);
    });
  });

  it('should be able to queue and run function in background', done => {
    const options = {
      method: 'sendEmail',
      to: ['a@ex.com']
    };

    worker.queue.on('job complete', (id, result) => {
      expect(id).to.exist;
      expect(result).to.exist;
      expect(result.to).to.exist;
      expect(result.to).to.be.eql(options.to);
    }).on('job remove', (jobId, jobType) => {
      expect(jobId).to.exist;
      expect(jobType).to.exist;
      done();
    }).on('job failed', error => {
      done(new Error(error));
    });

    const job = user.runInBackground(options);
    expect(job).to.exist;
  });

  after(done => worker.clear(done));
  after(done => worker.stop(done));
  after(done => clear(done));
});