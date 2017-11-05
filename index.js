'use strict';


/**
 * @name mongoose-kue
 * @description run mongoose schema methods in background(or another) process.
 * @return {Object} valid mongoose kue definition
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 * const mongoose = require('mongoose');
 * mongoose.plugin(require('mongoose-kue').plugin);
 *
 *
 * //queue static methods to be runned in background
 * User.runInBackground({method: 'sendEmail' to: ['a@example.com']});
 *
 * //queue instance method to be runned in background
 * use.runInBackground({method:'sendEmail' to: ['a@example.com']});
 */


//global dependencies(or imports)
