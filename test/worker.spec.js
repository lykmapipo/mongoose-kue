'use strict';

/* dependencies */
const {
  expect,
  clear,
  createTestModel
} = require('@lykmapipo/mongoose-test-helpers');
const worker = require('../lib/worker');

/* @todo sinon spy */

describe.only('worker import', () => {
  // before(done => worker.clear(done));
  before(done => worker.reset(done));

  it('should be imported without initialized', () => {
    expect(worker).to.exist;
    expect(worker.defaults).to.exist;
    expect(worker.options).to.be.eql(worker.defaults);
    expect(worker.queue).to.not.exist;
  });

  // after(done => worker.clear(done));
  after(done => worker.stop(done));
});

describe.only('worker initialization', () => {
  // before(done => worker.clear(done));
  before(done => worker.reset(done));

  it('should be able to initialize', () => {
    expect(worker.queue).to.not.exist;

    const options = { name: 'mongoose', timeout: 4000 };
    worker.init(options);

    expect(worker.options).to.exist;
    expect(worker.options.name).to.be.equal(options.name);
    expect(worker.options.timeout).to.be.equal(options.timeout);
    expect(worker.queue).to.exist;
  });

  // after(done => worker.clear(done));
  after(done => worker.stop(done));
});


describe.only('worker process', () => {
  let user;
  const User = createTestModel({}, schema => {
    schema.statics.sendEmail = (optns, done) => done(null, optns);
    schema.statics.sendDirectEmail = done => done();
    schema.methods.sendEmail = (optns, done) => done(null, optns);
    schema.methods.sendDirectEmail = done => done();
  });

  // before(done => worker.clear(done));
  before(done => worker.reset(done));

  beforeEach(done => {
    User.create({}, (error, created) => {
      user = created;
      done(error, created);
    });
  });

  it('should be able to process method', () => {
    expect(worker.process).to.exist;
    expect(worker.process).to.be.a('function');
    expect(worker.process.length).to.be.equal(2);
  });

  it('should throw Missing Model Name', done => {
    const job = { data: { context: {} } };

    worker.process(job, error => {
      expect(error).to.exist;
      expect(error.message).to.equal('Missing Model Name');
      done();
    });
  });

  it('should throw Missing Method Name', done => {
    const job = {
      data: { context: { model: User.modelName } }
    };

    worker.process(job, error => {
      expect(error).to.exist;
      expect(error.message).to.equal('Missing Method Name');
      done();
    });
  });

  it('should throw Missing Model', done => {
    const job = {
      data: { context: { model: 'Use', method: 'sendEmail' } }
    };

    worker.process(job, error => {
      expect(error).to.exist;
      expect(error.message)
        .to.contain('Missing Model Use');
      done();
    });
  });

  it('should throw Missing Schema Static Method', done => {
    const job = {
      data: { context: { model: User.modelName, method: 'sentEmail' } }
    };

    worker.process(job, error => {
      expect(error).to.exist;
      expect(error.message)
        .to.contain('Missing Schema Static Method sentEmail');
      done();
    });
  });

  it('should be able run static method with arguments', done => {
    const job = {
      data: {
        context: { model: User.modelName, method: 'sendEmail' },
        to: ['a@ex.com']
      }
    };

    worker.process(job, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results.context).to.not.exist;
      expect(results.to).to.exist;
      expect(results.to).to.be.eql(job.data.to);
      done(error, results);
    });
  });

  it('should be able run static method with no arguments', done => {
    const job = {
      data: {
        context: { model: User.modelName, method: 'sendDirectEmail' }
      }
    };

    worker.process(job, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.not.exist;
      done(error, results);
    });
  });

  it('should throw Missing Model Instance', done => {
    const job = {
      data: {
        context: {
          model: User.modelName,
          method: 'sendEmail',
          _id: '54108337212ffb6d459f854c'
        }
      }
    };

    worker.process(job, error => {
      expect(error).to.exist;
      expect(error.message)
        .to.contain('Missing ' + job.data.context.model +
          ' Instance ' + job.data.context
          ._id);
      done();

    });
  });

  it('should be able run instance method with arguments', done => {
    const job = {
      data: {
        context: {
          model: User.modelName,
          method: 'sendEmail',
          _id: user._id
        },
        to: ['a@ex.com']
      }
    };

    worker.process(job, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.exist;
      expect(results.context).to.not.exist;
      expect(results.to).to.exist;
      expect(results.to).to.be.eql(job.data.to);
      done(error, results);
    });
  });

  it('should be able run instance method with no arguments', done => {
    const job = {
      data: {
        context: {
          model: User.modelName,
          method: 'sendDirectEmail',
          _id: user._id
        }
      }
    };

    worker.process(job, (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.not.exist;
      done(error, results);
    });
  });

  // after(done => worker.clear(done));
  after(done => worker.stop(done));

  after(done => clear(done));
});