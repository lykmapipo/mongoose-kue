'use strict';


/* dependencies */
const {
  expect,
  createTestModel
} = require('@lykmapipo/mongoose-test-helpers');
const plugin = require('../lib/plugin');
const worker = require('../lib/worker');
let User;

/* @todo sinon spy */

describe.only('plugin', () => {
  // before(done => worker.clear(done));
  before(done => worker.reset(done));

  before(() => {
    User = createTestModel({}, schema => {
      schema.statics.sendEmail = (optns, done) => done(null, optns);
      schema.statics.sendDirectEmail = done => done();
      schema.methods.sendEmail = (optns, done) => done(null, optns);
      schema.methods.sendDirectEmail = done => done();
    }, plugin);
  });

  it('should be applied to schema', () => {
    // assert static
    expect(User.runInBackground).to.exist;

    //assert instance
    const user = new User({});
    expect(user.runInBackground).to.exist;
  });

  it('should queue static method to run in background', () => {
    const job = User.runInBackground({
      method: 'sendEmail',
      to: ['a@ex.com']
    });

    expect(job.data.context).to.exist;
    expect(job.data.context.model).to.exist;
    expect(job.data.context.model).to.be.equal(User.modelName);
    expect(job.data.context.method).to.exist;
    expect(job.data.context.method).to.be.equal('sendEmail');
  });

  it('should queue instance method to run in background', () => {
    const user = new User({});
    const job = user.runInBackground({
      method: 'sendEmail',
      to: ['a@ex.com']
    });

    expect(job.data.context).to.exist;
    expect(job.data.context._id).to.exist;
    expect(job.data.context.model).to.exist;
    expect(job.data.context.model).to.be.equal(User.modelName);
    expect(job.data.context.method).to.exist;
    expect(job.data.context.method).to.be.equal('sendEmail');
  });

  // after(done => worker.clear(done));
  after(done => worker.stop(done));
});