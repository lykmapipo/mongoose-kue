'use strict';

const { createModel } = require('@lykmapipo/mongoose-common');
const { plugin: runInBackground } = require('../index');

const User = createModel({
  name: { type: String },
  email: { type: String },
  phone: { type: String }
}, { modelName: 'User' }, runInBackground, schema => {
  schema.statics.sendEmail = function sendEmail(optns, done) {
    console.log('static method called: ', optns);
    return done(null, optns)
  };
  schema.methods.sendEmail = function sendEmail(optns, done) {
    console.log('instance method called: ', optns);
    return done(null, optns);
  }
});

module.exports = { User };