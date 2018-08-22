'use strict';


/* set environment to test */
process.env.NODE_ENV = 'test';


/* dependencies */
const async = require('async');
const kue = require('kue');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// mongoose.set('debug', true);

/* setup redis connection */
const redis = kue.redis.createClientFactory({
  redis: {}
});


/* clear redis database */
function cleanup(done) {
  redis
    .keys('q*', function (error, rows) {
      if (error) {
        done(error);
      } else {
        async.each(rows, function (row, next) {
          redis.del(row, next);
        }, done);
      }
    });
}


/* clear mongodb database */
function wipe(done) {
  if (mongoose.connection && mongoose.connection.dropDatabase) {
    mongoose.connection.dropDatabase(done);
  } else {
    done();
  }
}


/* setup mongoose connection */
before(function (done) {
  mongoose.connect('mongodb://localhost/mongoose-kue', done);
});

/* clear redis */
before(cleanup);

/* clear mongodb */
before(wipe);

/* clear mongodb */
after(wipe);

/* clear redis */
after(cleanup);