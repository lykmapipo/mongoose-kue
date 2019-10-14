'use strict';

const { dispatch } = require('@lykmapipo/kue-common');
const { User } = require('./models');

// dispatch model static method to run in background
setInterval(() => {
  User.runInBackground({
    method: 'sendEmail',
    to: ['a@ex.com']
  });
}, 2000);

// dispatch defined works under job
setInterval(() => {
  dispatch({ type: 'email', data: { to: 'l@j.z' } });
}, 4000);