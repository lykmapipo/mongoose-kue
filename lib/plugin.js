'use strict';


/**
 * @name mongoose-kue-plugin
 * @description mongoose plugin to run schema methods in background(or worker) process.
 * @param  {Schema} schema  valid mongoose schema
 * @return {Function} valid mongoose plugin
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 * const User = mongoose.model('User');
 * 
 * //run static method 
 * User.runInBackground({method:'sendEmail', to:['a@ex.com']});
 *
 * ...
 * 
 * //run instance method
 * user.runInBackground({method:'sendEmail', to:['a@ex.com']});
 *
 */


//dependencies
const _ = require('lodash');


module.exports = exports = function (schema, options) {

};
