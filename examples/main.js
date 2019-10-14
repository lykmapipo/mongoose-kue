'use strict';

const { dispatch } = require('@lykmapipo/kue-common');

// dispatch works
setInterval(() => {
  dispatch({ type: 'email', data: { to: 'l@j.z' } });
}, 2000);