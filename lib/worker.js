'use strict';


/**
 * @module worker
 * @name worker
 * @description kue worker implementation for running mongoose background methods
 * @param {Object} valid kue configurations
 * @return {Object} mongoose kue worker definition
 * @see {@link https://github.com/Automattic/kue}
 * @see {@link https://github.com/Automattic/kue#redis-connection-settings}
 * @license MIT
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.5.0
 * @public
 * @example
 *
 * const { worker } = require('mongoose-kue');
 * worker.start();
 *
 * or
 * 
 * worker.start({
 *    prefix: 'q',
 *    redis: {
 *      port: 1234,
 *      host: '10.0.50.20',
 *      auth: 'password',
 *      db: 3, // if provided select a non-default redis db
 *      options: {
 *        // see https://github.com/mranney/node_redis#rediscreateclient
 *      }
 *    }
 * });
 *  
 */

/* @todo support multiple named job */
/* @todo remove job on complete */


/* dependencies */
const _ = require('lodash');
const env = require('@lykmapipo/env');
const kue = require('kue');
const mongoose = require('mongoose');


/* utils */
const noop = function () {};
const { getNumber, getString, getBoolean } = env;


/* default options */
exports.defaults = {

  //default queue name
  //see https://github.com/Automattic/kue#creating-jobs
  name: getString('QUEUE_NAME', 'mongoose'),

  //default queue shutdown delay
  //see https://github.com/Automattic/kue#graceful-shutdown
  timeout: getNumber('QUEUE_TIMEOUT', 5000),

  //default worker concurrency
  //see https://github.com/Automattic/kue#processing-concurrency
  concurrency: getNumber('QUEUE_CONCURRENCY', 10),

  //number of retries
  //see https://github.com/Automattic/kue#failure-attempts
  attempts: getNumber('QUEUE_ATTEMPTS', 3),

  //failure attempt strategy
  //see https://github.com/Automattic/kue#failure-backoff
  backoff: { type: 'exponential' },

  //remove complete jobs for cleanup
  //see https://github.com/Automattic/kue#job-cleanup
  removeOnComplete: getBoolean('QUEUE_REMOVE_ON_COMPLETE', true),

  //redis connection
  //see https://github.com/Automattic/kue#redis-connection-settings
  redis: (getString('REDIS_URL') || { port: 6379, host: '127.0.0.1' })

};


/* initialize options */
exports.options = _.merge({}, exports.defaults);


/**
 * @name init
 * @function init
 * @description initialize worker internals. If not initialize, 
 * worker queue will be initialize with default options.
 * 
 * @param {Object} valid kue queue options
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.5.0
 * @private
 * @example
 *
 * const { worker } = require('mongoose-kue');
 * worker.init();
 * 
 */
exports.init = function init(options) {

  //merge and ensure options
  exports.options =
    (_.merge({}, exports.defaults, exports.options, options));

  //create worker queue if not exists
  if (!exports.queue) {
    exports.queue =
      (
        exports.options.queue ?
        exports.options.queue :
        kue.createQueue(exports.options)
      );
    delete exports.options.queue;
  }

  return exports;

};


/**
 * @name create
 * @function create
 * @description create new job
 * 
 * @see {@link https://github.com/Automattic/kue#creating-jobs}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.5.0
 * @public
 * @example
 *
 * const { worker } = require('mongoose-kue');
 * worker.create('email', {
 *   title: 'welcome email for tj', 
 *   to: 'tj@learnboost.com', 
 *   template: 'welcome-email'
 *});
 * 
 */
exports.create = exports.createJob = function createJob(type, data) {

  //ensure queue
  exports.init();

  //obtain job options
  let { name, attempts, backoff, removeOnComplete } = exports.options;
  attempts = (attempts || data.attempts);
  backoff = (backoff || data.backoff);
  removeOnComplete = (removeOnComplete || data.removeOnComplete);

  //ensure job type
  const jobType = (name || type || data.type);

  //ensure jobData
  const jobData = _.merge({}, data);

  //create job
  const job = exports.queue.create(jobType, jobData);
  job.attempts(attempts);
  job.backoff(backoff);
  job.removeOnComplete(removeOnComplete);

  //return job
  return job;

};


/**
 * @name stop
 * @function stop
 * @description stop worker queue from processing jobs
 * @param {Function} [done] callback to invoke on success or failure
 * @see {@link https://github.com/Automattic/kue#graceful-shutdown}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const { worker } = require('mongoose-kue');
 * worker.stop();
 * 
 */
exports.stop = exports.reset = function stop(done) {

  //ensure callback
  if (!done && !_.isFunction(done)) {
    done = noop;
  }

  //ensure there is queue 
  //for safe shutdown
  if (exports.queue) {

    //cross check if shutdown signal was already sent
    //and queue is on process of shutting down 
    if (exports.queue.shuttingDown) {

      //queue is on process of shutting down
      //continue
      done();

    }

    //continue with shutting down queue
    else {

      //obtain queue shutdown delay
      const { timeout } = exports.options;

      //issue shutdown command
      exports.queue.shutdown(timeout, function (error) {

        //reset queue when shutdown succeed
        if (!error) {
          exports.options = _.merge({}, exports.defaults);
          exports.queue = undefined;
        }

        //continue
        done(error);

      });

    }

  }

  //there was no any queue in place
  //just continue
  else {
    done();
  }

};


/**
 * @name runModelStaticMethod description
 * @description execute static method of a model
 * @param {Model} Model valid mongoose model
 * @param {model} Model valid mongoose model model name
 * @param {String} method valid static method name to execute 
 * @param {Object} data data to be passed to method 
 * @param {Function} done a callback to invoke on success or failure
 * @private
 */
function runModelStaticMethod(Model, model, method, data, done) { /*@todo test*/

  //obtain static schema method to run
  const fn = Model[method];

  //ensure there is static method to run
  if (!fn || !_.isFunction(fn)) {
    const error =
      new Error(`Missing Schema Static Method ${model}#${method}`);
    error.code = error.status = 500;
    return done(error);
  }

  //obtain method length to know
  //how many parameters have to be 
  //pass as arguments
  const length = fn.length;

  //invoke method
  //with arguments
  if (length > 1) {
    return fn.call(Model, data, done);
  }

  //invoke method
  //with no arguments
  else {
    return fn.call(Model, done);
  }
}


/**
 * @name runModelInstanceMethod description
 * @description execute instance method of a model
 * @param {Model} Model valid mongoose model
 * @param {model} Model valid mongoose model model name
 * @param {ObjectId} _id valid instance object id 
 * @param {String} method valid instance method name to execute 
 * @param {Object} data data to be passed to method 
 * @param {Function} done a callback to invoke on success or failure
 * @private
 */
function runModelInstanceMethod(Model, model, _id, method, data, done) { /*@todo test*/

  //load mongoose instance
  Model
    .findById(_id)
    .exec(function (error, instance) {

      //fail on error
      if (error) {
        error.code = error.status = ((error.code || error.status) || 500);
        return done(error);
      }

      //fail if no instance found
      if (!instance) {
        const error = new Error(`Missing ${model} Instance ${_id}`);
        error.code = error.status = 500;
        return done(error);
      }

      //obtain schema instance method to run
      const fn = instance[method];

      //ensure there is instance method to run
      if (!fn || !_.isFunction(fn)) {
        const error =
          new Error(`Missing ${model} Instance Method ${method}`);
        error.code = error.status = 500;
        return done(error);
      }

      //obtain method length
      const length = fn.length;

      //invoke method
      //with args
      if (length > 1) {
        fn.call(instance, data, done);
      }

      //invoke method
      //wih no args
      else {
        fn.call(instance, done);
      }

    });

}


/**
 * @name process
 * @function process
 * @description implementation of job runner(worker fn) to process queue jobs
 * @see {@link https://github.com/Automattic/kue#processing-jobs}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @private
 */
exports.process = function process(job, done) {

  //obtain job data(or mongoose methods options)
  let data = _.merge({}, { context: {} }, job.data);

  //NOTE!:context job data used to tell if a method is
  //bound to mongoose model static or instance context

  //obtain model, method and instance id
  const { model, method, _id } = data.context;

  //fail job if no model found
  if (_.isEmpty(model)) {
    let error = new Error(`Missing Model Name`);
    error.code = error.status = 500;
    return done(error);
  }

  //fail job if no method found
  if (_.isEmpty(method)) {
    const error = new Error(`Missing Method Name`);
    error.code = error.status = 500;
    return done(error);
  }

  //hide out context info from schema method options
  delete data.context;

  //fail job if no mongoose instance found
  if (!mongoose) {
    const error = new Error(`Missing mongoose Instance`);
    error.code = error.status = 500;
    return done(error);
  }

  //obtain mongoose model
  try {

    //fetch mongoose model
    const Model = mongoose.model(model);

    //ensure model
    if (!Model) {
      const error = new Error(`Missing Model ${model}`);
      error.code = error.status = 500;
      return done(error);
    }

    //run static method
    if (_.isEmpty(_id)) {
      return runModelStaticMethod(Model, model, method, data, done);
    }

    //run instance method
    else {
      return runModelInstanceMethod(Model, model, _id, method, data, done);
    }

  }

  //handle mongoose schema error
  //fail fail if no schema registered for the model name
  catch (error) {
    //remember error
    let _error = error;

    //normalize missing schema error
    if (error.name === 'MissingSchemaError') {
      _error = new Error(`Missing Model ${model}`);
      _error.code = error.status = ((error.code || error.status) || 500);
    }

    return done(_error);

  }

};


/**
 * @name start
 * @description start processing queued mongoose schema methods
 * @param {Object} [options] valid mongoose kue options
 * @see {@link https://github.com/Automattic/kue#processing-jobs}
 * @see {@link https://github.com/Automattic/kue#processing-concurrency}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const { worker } = require('mongoose-kue');
 * worker.start();
 * 
 */
exports.start = function start(options) {

  //ensure worker queue is initialized
  exports.init(options);

  //start worker for processing jobs
  if (exports.queue) {

    //obtain worker configuration options
    const { concurrency, name, jobTypes } = exports.options;

    //collect job types to process
    let _jobTypes = [].concat(name).concat(jobTypes);
    _jobTypes = _.compact(_.uniq(_jobTypes));

    //register worker process for handling queue jobs
    _.forEach(_jobTypes, function (jobType) {
      exports.queue.process(jobType, concurrency, exports.process);
    });

    //listen for process termination
    //and gracefull shutdown worker queue
    process.once('SIGTERM', function ( /*signal*/ ) {

      //signal worker queue to shutdown
      exports.stop(function (error) {

        //exit worker process
        if (!error) {
          process.exit(0);
        }

        //throw shutdown failure
        else {
          throw error;
        }

      });

    });

  }

  /* @todo export queue */

};