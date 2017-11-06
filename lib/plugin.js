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
  schema.methods.runInBackgroundQueue =
    schema.statics.runInBackgroundQueue =
    (options.queue || kue.createQueue(options));


  //store runInBackground schema options
  schema.methods.runInBackgroundOptions =
    schema.statics.runInBackgroundOptions = options;


  /**
   * @name runInBackground
   * @description create a job to execute schema method that will 
   *              be executed in static context of the schema
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.1.0
   * @public
   */
  schema.statics.runInBackground = function (options) {
    //this refer to mongoose model static context

    //obtain model name
    let model = this.modelName;

    //merge options
    options = _.merge({ context: { model: model } }, options);

    //obtain method and model name
    const { method } = options;

    //ensure job title
    options.title =
      (options.title || 'Run Static Method #' + method + ' in ' + model);


    //create job and dispatch it
    if (this.queue && options.model && options.method) {
      this.queue.create(this.runInBackgroundOptions.name, options).save();
    }


  };


  /**
   * @name runInBackground
   * @description create a job to execute schema method that will 
   *              be executed in instance context of the schema
   * @author lally elias <lallyelias87@mail.com>
   * @since 0.1.0
   * @version 0.1.0
   * @private
   */
  schema.methods.runInBackground = function (options) {
    //this refer to mongoose model instance context

    //obtain model name
    let model = this.constructor.modelName;

    //merge options
    options = _.merge({ context: { model: model, _id: this._id } }, options);

    //obtain method and model name
    const { method } = options;

    //ensure job title
    options.title =
      (options.title ||
        'Run instance method #' + method + ' in ' + model + ' - ' + this._id
      );


    //create job and dispatch it
    if (this.queue && options.model && options.method && options._id) {
      this.queue.create(this.runInBackgroundOptions.name, options).save();
    }

  };


};