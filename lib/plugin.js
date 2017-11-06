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


//default options
const defaults = {

  //default queue name
  //see https://github.com/Automattic/kue#creating-jobs
  name: 'mongoose'

};


module.exports = exports = function (schema, options) {

  //ensure options
  options = _.merge({}, defaults, options);


  //create and assign job dispatch queue to mongoose schema
  const queue = (options.queue || kue.createQueue(options));
  schema.statics.runInBackgroundQueue = queue;
  schema.virtual('runInBackgroundQueue').get(function () {
    return this.constructor.runInBackgroundQueue;
  });


  //store runInBackgroundOptions schema options
  delete options.queue;
  schema.statics.runInBackgroundOptions = options;
  schema.virtual('runInBackgroundOptions').get(function () {
    return this.constructor.runInBackgroundOptions;
  });


  /**
   * @name runInBackground
   * @description create a job to execute schema method that will 
   *              be executed in static context of the schema
   * @return {Object} an instnce of kue job
   * @see  {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  schema.statics.runInBackground = function (options) {
    //this refer to mongoose model static context


    //merge options
    options = _.merge({ context: { model: this.modelName } }, options);
    options.context.method = options.context.method || options.method;
    options.context.model = options.context.model || options.model;

    //obtain method and model name
    const { model, method } = options.context;

    //ensure job title
    options.title =
      (options.title || 'Run Static Method #' + method + ' in ' + model);

    //create job and dispatch it
    if (this.runInBackgroundQueue && model && method) {
      const job = this.runInBackgroundQueue
        .create(this.runInBackgroundOptions.name, options)
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
  schema.methods.runInBackground = function (options) {
    //this refer to mongoose model instance context

    //merge options
    options = _.merge({
      context: {
        model: this.constructor.modelName,
        _id: this._id
      }
    }, options);
    options.context.method = options.context.method || options.method;
    options.context.model = options.context.model || options.model;
    options.context._id = options.context._id || options._id;

    //obtain method and model name
    const { _id, model, method } = options.context;

    //ensure job title
    options.title =
      (options.title ||
        'Run instance method #' + method + ' in ' + model + ' - ' + _id
      );


    //create job and dispatch it
    if (this.runInBackgroundQueue && model && method && _id) {
      const job = this.runInBackgroundQueue
        .create(this.runInBackgroundOptions.name, options)
        .save();

      return job;
    }

  };


};