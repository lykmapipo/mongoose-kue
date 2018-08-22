'use strict';


/* dependencies */
const path = require('path');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const plugin = require(path.join(__dirname, '..', 'lib', 'plugin'));
let Vendor;

/* @todo sinon spy */

describe('mongoose-kue-plugin', function () {

  //fake queue
  function FakeQueue(queueName, options) {
    this.queueName = queueName;
    this.data = options;
  }

  FakeQueue.create = function (queueName, options) {
    let job = new FakeQueue(queueName, options);
    return job;
  };

  FakeQueue.prototype.attempts = function ( /*attempts*/ ) {
    return this;
  };

  FakeQueue.prototype.backoff = function ( /*backoff*/ ) {
    return this;
  };

  FakeQueue.prototype.save = function () {
    return this;
  };

  before(function () {

    mongoose.plugin(plugin, { name: 'mongoose', queue: FakeQueue });

    let VendorSchema = new Schema({});

    VendorSchema.statics.sendEmail = function (options, done) {
      done(null, options);
    };

    VendorSchema.statics.sendDirectEmail = function (done) {
      done();
    };

    VendorSchema.methods.sendEmail = function (options, done) {
      done(null, options);
    };

    VendorSchema.methods.sendDirectEmail = function (done) {
      done();
    };

    Vendor = mongoose.model('Vendor', VendorSchema);

  });

  it('should be applied to schema', function () {

    //assert static
    expect(Vendor.runInBackground).to.exist;

    //assert instance
    const vendor = new Vendor({});
    expect(vendor.runInBackground).to.exist;

  });


  it('should queue static method to run in background', function () {
    const job = Vendor.runInBackground({
      method: 'sendEmail',
      to: [
        'a@ex.com'
      ]
    });

    expect(job.data.context).to.exist;
    expect(job.data.context.model).to.exist;
    expect(job.data.context.model).to.be.equal('Vendor');
    expect(job.data.context.method).to.exist;
    expect(job.data.context.method).to.be.equal('sendEmail');

  });

  it('should queue instance method to run in background', function () {
    const vendor = new Vendor({});
    const job = vendor.runInBackground({
      method: 'sendEmail',
      to: [
        'a@ex.com'
      ]
    });

    expect(job.data.context).to.exist;
    expect(job.data.context._id).to.exist;
    expect(job.data.context.model).to.exist;
    expect(job.data.context.model).to.be.equal('Vendor');
    expect(job.data.context.method).to.exist;
    expect(job.data.context.method).to.be.equal('sendEmail');

  });

});