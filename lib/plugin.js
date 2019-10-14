'use strict';


/**
 * @module plugin
 * @name plugin
 * @description mongoose plugin to run schema methods in background(or worker) 
 * process
 * @param {Schema} schema  valid mongoose schema
 * @return {Function} valid mongoose plugin
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.5.0
 * @example
 *
 * const User = mongoose.model('User');
 *
 * User.runInBackground({ method: 'sendEmail', to:['a@ex.com']});
 *
 * or
 * 
 * user.runInBackground({ method:'sendEmail', to:['a@ex.com']});
 *
 */


/* dependencies */
const { mergeObjects } = require('@lykmapipo/common');
const worker = require('./worker');


module.exports = exports = function mongooseKuePlugin(schema, pluginOptions) {

  //ensure options
  const { defaults } = worker;
  const options = mergeObjects(defaults, pluginOptions);

  //initialize job dispatch queue
  worker.init(options);

  /**
   * @name runInBackground
   * @function runInBackground
   * @description create a job to execute schema method that will 
   * be executed in static context of the schema
   * @param {Object} [optns] valid job options
   * @param {Function} [done] callback to invoke on success or failure
   * @return {Object} an instance of kue job
   * @see {@link https://github.com/Automattic/kue#creating-jobs} 
   * @see {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.5.0
   * @public
   */
  schema.statics.runInBackground = function runInBackground(optns, done) {
    //this refer to mongoose model static context

    //merge details
    let details =
      mergeObjects({ context: { model: this.modelName } }, optns);
    details.context.method = details.context.method || details.method;
    details.context.model = details.context.model || details.model;

    //obtain method and model name
    const { model, method } = details.context;

    //ensure job title
    details.title =
      (details.title || 'Run Static Method #' + method + ' in ' + model);


    //create job and dispatch it
    if (model && method) {
      let { name: jobType } = worker.options;
      jobType = (details.type || jobType);
      const job = worker.create(jobType, details);
      return job.save(done);
    }

  };


  /**
   * @name runInBackground
   * @function runInBackground
   * @description create a job to execute schema method that will 
   * be executed in instance context of the schema
   * @param {Object} [optns] valid job options
   * @param {Function} [done] callback to invoke on success or failure
   * @return {Object} an instance of kue job
   * @see {@link https://github.com/Automattic/kue#creating-jobs} 
   * @see {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.5.0
   * @private
   */
  schema.methods.runInBackground = function runInBackground(optns, done) {
    //this refer to mongoose model instance context

    //merge details
    let details = mergeObjects({
      context: {
        model: this.constructor.modelName,
        _id: this._id
      }
    }, optns);
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
    if (model && method && _id) {
      let { name: jobType } = worker.options;
      jobType = (details.type || jobType);
      const job = worker.create(jobType, details);
      return job.save(done);
    }

  };

};