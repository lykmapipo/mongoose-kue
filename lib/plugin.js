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


//global dependencies(or imports)
const _ = require('lodash');
const kue = require('kue');
let mongoose = require('mongoose');


//default options
const defaults = {

  //default queue name
  //see https://github.com/Automattic/kue#creating-jobs
  name: 'mongoose',

  //number of retries
  //see https://github.com/Automattic/kue#failure-attempts
  attempts: 3,

  //failure attempt strategy
  //see https://github.com/Automattic/kue#failure-backoff
  backoff: { type: 'exponential' }

};


//initialize options
let options = defaults;



module.exports = exports = function (schema, pluginOptions) {


  //ensure options
  options = _.merge({}, defaults, pluginOptions);


  //use passed mongoose instance
  if (options.mongoose) {
    mongoose = options.mongoose;
    delete options.mongoose;
  }


  //create and assign job dispatch queue to mongoose schema
  if (!mongoose.mongooseKue) {
    const queue = (options.queue || kue.createQueue(options));
    delete options.queue;
    mongoose.mongooseKue = {
      queue: queue,
      options: options
    };
  }



  /**
   * @name runInBackground
   * @description create a job to execute schema method that will 
   *              be executed in static context of the schema
   * @return {Object} an instance of kue job
   * @see  {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  schema.statics.runInBackground = function (details) {
    //this refer to mongoose model static context


    //merge details
    details = _.merge({ context: { model: this.modelName } }, details);
    details.context.method = details.context.method || details.method;
    details.context.model = details.context.model || details.model;

    //obtain method and model name
    const { model, method } = details.context;

    //ensure job title
    details.title =
      (details.title || 'Run Static Method #' + method + ' in ' + model);


    //create job and dispatch it
    if (mongoose.mongooseKue.queue && model && method) {
      const { name, attempts, backoff } = mongoose.mongooseKue.options;
      const job = mongoose.mongooseKue.queue.create(name, details)
        .attempts(attempts)
        .backoff(backoff)
        .save();

      return job;
    }


  };


  /**
   * @name runInBackground
   * @description create a job to execute schema method that will 
   *              be executed in instance context of the schema
   * @return {Object} an instnce of kue job
   * @see  {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.1.0
   * @private
   */
  schema.methods.runInBackground = function (details) {
    //this refer to mongoose model instance context

    //merge details
    details = _.merge({
      context: {
        model: this.constructor.modelName,
        _id: this._id
      }
    }, details);
    details.context.method = details.context.method || details.method;
    details.context.model = details.context.model || details.model;
    details.context._id = details.context._id || details._id;

    //obtain method and model name
    const { _id, model, method } = details.context;

    //ensure job title
    details.title =
      (details.title ||
        'Run instance method #' + method + ' in ' + model + ' - ' + _id
      );


    //create job and dispatch it
    if (mongoose.mongooseKue.queue && model && method && _id) {
      const { name, attempts, backoff } = mongoose.mongooseKue.options;
      const job = mongoose.mongooseKue.queue.create(name, details)
        .attempts(attempts)
        .backoff(backoff)
        .save();

      return job;
    }

  };


};