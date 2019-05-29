'use strict';

/* dependencies */
const { connect, clear, drop } = require('@lykmapipo/mongoose-test-helpers');
const { clear: clean } = require('@lykmapipo/kue-common');

/* clear queue test database */
before(done => clean(done));

/* setup mongo test database */
before(done => connect(done));

/* clear mongo test database */
before(done => clear(done));

/* drop mongo test database */
after(done => drop(done));

/* clear queue test database */
after(done => clean(done));