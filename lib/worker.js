'use strict';

/**
 * @module worker
 * @name worker
 * @description kue worker implementation for running mongoose background 
 * methods
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
const { mergeObjects, uniq, sortedUniq } = require('@lykmapipo/common');
const { getString, getStringSet } = require('@lykmapipo/env');
const {
  connect,
  model,
  SCHEMA_OPTIONS
} = require('@lykmapipo/mongoose-common');
const {
  createQueue,
  createJob,
  withDefaults,
  stop,
  start: startDefined,
  clear: cleanup
} = require('@lykmapipo/kue-common');

/* default options */
exports.defaults = withDefaults({
  //default queue name
  //see https://github.com/Automattic/kue#creating-jobs
  name: getString('KUE_NAME', 'mongoose'),

  //default job types to process
  //see https://github.com/Automattic/kue#creating-jobs
  types: sortedUniq([
    ...getStringSet('KUE_JOB_TYPES', []),
    getString('KUE_NAME', 'mongoose')
  ]),

  //mongodb connection string
  //see https://mongoosejs.com/docs/index.html
  MONGODB_URI: (getString('MONGODB_URI') || getString('MONGODB_URL'))
});

/* initialize options */
exports.options = mergeObjects(exports.defaults);

/**
 * @name init
 * @function init
 * @description initialize worker internals. If not initialize, 
 * worker queue will be initialize with default options.
 * 
 * @param {Object} [opts] valid queue creation options.
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.2.0
 * @version 0.5.0
 * @private
 * @example
 *
 * const { worker } = require('mongoose-kue');
 * worker.init();
 * 
 */
exports.init = options => {
  // collect job types
  const jobTypes = uniq([
    ..._.get(exports, 'defaults.types', []),
    ..._.get(exports, 'options.types', []),
    ..._.get(options, 'types', []),
  ]);

  // merge and ensure options
  exports.options = _.omit(
    mergeObjects(exports.defaults, exports.options, options),
    _.keys(SCHEMA_OPTIONS)
  );

  // reset job types
  exports.options.types = jobTypes;

  // ensure queue and mongoose connection
  if (!exports.queue) {
    // ensure mongoose connection
    connect(exports.options.MONGODB_URI);

    // create worker queue if not exists
    exports.queue = createQueue(mergeObjects(exports.options));
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
exports.create = exports.createJob = (type, data = {}) => {
  // ensure queue
  exports.init();

  // ensure job type
  const name = _.get(exports, 'options.name');
  const jobType = (data.type || type || name);

  // ensure job data
  const jobData = mergeObjects(data);

  // create job
  const job = createJob({ type: jobType, data: jobData });

  // return created job
  return job;
};

/**
 * @function clear
 * @name clear
 * @description cleanup and reset current queue states.
 * @param {Object} [optns] valid queue options
 * @param {Function} [cb] callback to invoke on success or failure.
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * const { clear } = require('mongoose-kue');
 * clear((error) => { ... });
 */
exports.clear = done => cleanup(done);

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
exports.stop = exports.reset = done => {
  // ensure callback
  if (!done && !_.isFunction(done)) {
    done = _.noop;
  }

  // ensure there is queue for safe shutdown
  if (exports.queue) {
    // cross check if shutdown signal was already sent
    // and queue is on process of shutting down 
    if (exports.queue.shuttingDown) {

      // queue is on process of shutting down
      // continue
      done();
    }

    // continue with shutting down queue
    else {
      // issue shutdown command
      stop(error => {

        // reset queue when shutdown succeed
        if (!error) {
          exports.options = mergeObjects(exports.defaults);
          exports.queue = undefined;
        }

        // continue
        done(error);

      });
    }
  }

  // there was no any queue in place
  // just continue
  else {
    done();
  }
};

/**
 * @function runModelStaticMethod description
 * @name runModelStaticMethod description
 * @description execute static method of a model
 * @param {Model} Model valid mongoose model
 * @param {String} modelName valid mongoose model name
 * @param {String} method valid static method name to execute 
 * @param {Object} data data to be passed to method 
 * @param {Function} done a callback to invoke on success or failure
 * @private
 */
const runModelStaticMethod = (Model, modelName, method, data, done) => {
  /*@todo test*/

  // obtain static schema method to run
  const fn = Model[method];

  //ensure there is static method to run
  if (!fn || !_.isFunction(fn)) {
    const error =
      new Error(`Missing Schema Static Method ${modelName}#${method}`);
    error.code = error.status = 500;
    return done(error);
  }

  // obtain method length to know
  // how many parameters have to be 
  // pass as arguments
  const length = fn.length;

  // invoke method
  // with arguments
  if (length > 1) {
    return fn.call(Model, data, done);
  }

  // invoke method
  // with no arguments
  else {
    return fn.call(Model, done);
  }
};

/**
 * @function runModelInstanceMethod description
 * @name runModelInstanceMethod description
 * @description execute instance method of a model
 * @param {Model} Model valid mongoose model
 * @param {String} modelName valid mongoose model name
 * @param {ObjectId} _id valid instance object id 
 * @param {String} method valid instance method name to execute 
 * @param {Object} data data to be passed to method 
 * @param {Function} done a callback to invoke on success or failure
 * @private
 */
const runModelInstanceMethod = (Model, modelName, _id, method, data, done) => {
  /*@todo test*/

  // load mongoose instance
  Model
    .findById(_id)
    .exec((error, instance) => {
      // fail on error
      if (error) {
        error.code = error.status = ((error.code || error.status) || 500);
        return done(error);
      }

      // fail if no instance found
      if (!instance) {
        const error = new Error(`Missing ${modelName} Instance ${_id}`);
        error.code = error.status = 500;
        return done(error);
      }

      // obtain schema instance method to run
      const fn = instance[method];

      // ensure there is instance method to run
      if (!fn || !_.isFunction(fn)) {
        const error =
          new Error(`Missing ${modelName} Instance Method ${method}`);
        error.code = error.status = 500;
        return done(error);
      }

      // obtain method length
      const length = fn.length;

      // invoke method
      // with args
      if (length > 1) {
        fn.call(instance, data, done);
      }

      // invoke method
      // wih no args
      else {
        fn.call(instance, done);
      }
    });
};

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
exports.process = (job, done) => {
  // obtain job data(or mongoose methods options)
  let data = mergeObjects({ context: {} }, job.data);

  // NOTE!:context job data used to tell if a method is
  // bound to mongoose model static or instance context

  // obtain model, method and instance id
  const { model: modelName, method, _id } = data.context;

  // fail job if no model found
  if (_.isEmpty(modelName)) {
    let error = new Error(`Missing Model Name`);
    error.code = error.status = 500;
    return done(error);
  }

  // fail job if no method found
  if (_.isEmpty(method)) {
    const error = new Error(`Missing Method Name`);
    error.code = error.status = 500;
    return done(error);
  }

  // hide out context info from schema method options
  delete data.context;

  // obtain mongoose model
  try {
    //fetch mongoose model
    const Model = model(modelName);

    // ensure model
    if (!Model) {
      const error = new Error(`Missing Model ${modelName}`);
      error.code = error.status = 500;
      return done(error);
    }

    // run static method
    if (_.isEmpty(_id)) {
      return runModelStaticMethod(Model, modelName, method, data, done);
    }

    // run instance method
    else {
      return runModelInstanceMethod(Model, modelName, _id, method, data, done);
    }
  }

  // handle mongoose schema error
  // fail fail if no schema registered for the model name
  catch (error) {
    // remember error
    let _error = error;

    // normalize missing schema error
    if (error.name === 'MissingSchemaError') {
      _error = new Error(`Missing Model ${modelName}`);
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
exports.start = options => {
  // ensure worker queue is initialized
  exports.init(options);

  // start worker for processing jobs
  if (exports.queue) {
    // obtain worker configuration options
    const { concurrency, name, types } = exports.options;

    // collect job types to process
    let jobTypes = [].concat(name).concat(types);
    jobTypes = uniq(jobTypes);

    // register worker process for handling queue jobs
    _.forEach(jobTypes, jobType => {
      // fix job ttl exceeded listeners added
      // see https://github.com/Automattic/kue/issues/1189
      const currentMaxListener =
        (exports.queue.getMaxListeners() + concurrency);
      exports.queue.setMaxListeners(currentMaxListener);
      exports.queue.process(jobType, concurrency, exports.process);
    });

    // start defined jobs processing
    startDefined(options);

    // listen for process termination
    // and gracefull shutdown worker queue
    process.once('SIGTERM', ( /*signal*/ ) => {
      // signal worker queue to shutdown
      exports.stop(error => {
        // exit worker process
        if (!error) {
          process.exit(0);
        }
        // throw shutdown failure
        else {
          throw error;
        }
      });
    });
  }

  /* @todo export queue */

};