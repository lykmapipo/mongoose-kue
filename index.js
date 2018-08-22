'use strict';


/**
 * @name mongoose-kue
 * @description run mongoose schema methods in background(or another) process.
 * @return {Object} valid mongoose kue definition
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.5.0
 * @example
 *
 * const mongoose = require('mongoose');
 * const { plugin: runInBackground } = require('mongoose-kue');
 *
 * ...
 * 
 * UserSchema.plugin(runInBackground);
 *
 * //queue static methods to be runned in background
 * User.runInBackground({method: 'sendEmail' to: ['a@example.com']});
 *
 * //queue instance method to be runned in background
 * user.runInBackground({method:'sendEmail' to: ['a@example.com']});
 * 
 */


/* dependencies */
const path = require('path');
const plugin = require(path.join(__dirname, 'lib', 'plugin'));
const worker = require(path.join(__dirname, 'lib', 'worker'));


/**
 * @name worker
 * @description valid mongoose kue worker
 * @type {Object}
 * @since 0.1.0
 * @version 0.5.0
 */
exports.plugin = plugin;


/**
 * @name worker
 * @description valid mongoose kue worker
 * @type {Object}
 * @since 0.1.0
 * @version 0.5.0
 */
exports.worker = worker;