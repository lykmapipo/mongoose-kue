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
const path = require('path');
const _ = require('lodash');
const worker = require(path.join(__dirname, 'worker'));


module.exports = exports = function mongooseKuePlugin(schema, pluginOptions) {

  //ensure options
  const { defaults } = worker;
  const options = _.merge({}, defaults, pluginOptions);

  //initialize job dispatch queue
  worker.init(options);

  /**
   * @name runInBackground
   * @function runInBackground
   * @description create a job to execute schema method that will 
   * be executed in static context of the schema
   * @return {Object} an instance of kue job
   * @see {@link https://github.com/Automattic/kue#creating-jobs} 
   * @see {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.5.0
   * @public
   */
  schema.statics.runInBackground = function runInBackground(details) {
    //this refer to mongoose model static context

    //merge details
    let _details = _.merge({}, { context: { model: this.modelName } },
      details);
    _details.context.method = _details.context.method || details.method;
    _details.context.model = _details.context.model || details.model;

    //obtain method and model name
    const { model, method } = _details.context;

    //ensure job title
    _details.title =
      (_details.title || 'Run Static Method #' + method + ' in ' + model);


    //create job and dispatch it
    if (model && method) {
      let { name: jobType } = worker.options;
      jobType = (_details.type || jobType);
      const job = worker.create(jobType, _details).save();
      return job;
    }

  };


  /**
   * @name runInBackground
   * @function runInBackground
   * @description create a job to execute schema method that will 
   * be executed in instance context of the schema
   * @return {Object} an instance of kue job
   * @see {@link https://github.com/Automattic/kue#creating-jobs} 
   * @see {@link https://github.com/Automattic/kue#job-events} 
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.5.0
   * @private
   */
  schema.methods.runInBackground = function runInBackground(details) {
    //this refer to mongoose model instance context

    //merge details
    let _details = _.merge({}, {
      context: {
        model: this.constructor.modelName,
        _id: this._id
      }
    }, details);
    _details.context.method = _details.context.method || details.method;
    _details.context.model = _details.context.model || details.model;
    _details.context._id = _details.context._id || details._id;

    //obtain method and model name
    const { _id, model, method } = _details.context;

    //ensure job title
    _details.title =
      (_details.title ||
        'Run instance method #' + method + ' in ' + model + ' - ' + _id
      );


    //create job and dispatch it
    if (model && method && _id) {
      let { name: jobType } = worker.options;
      jobType = (_details.type || jobType);
      const job = worker.create(jobType, _details).save();
      return job;
    }

  };


};