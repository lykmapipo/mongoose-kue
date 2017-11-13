# mongoose-kue

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-kue.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-kue)
[![Dependency Status](https://img.shields.io/david/lykmapipo/mongoose-kue.svg?style=flat)](https://david-dm.org/lykmapipo/mongoose-kue)
[![npm version](https://badge.fury.io/js/mongoose-kue.svg)](https://badge.fury.io/js/mongoose-kue)

mongoose plugin to run mongoose schema methods in background.

*Note!: It's highly advice to run worker(s) in separate process for better performance*

## Requirements

- NodeJS v6.5+

## Install
```sh
$ npm install --save mongoose-kue
```

## Usage

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//load and register your schema
...

//ensure connection
mongoose.connect(<url>);

//apply mongoose-kue plugin to mongoose
mongoose.plugin(require('mongoose-kue').plugin, <options>);


//run schema instance method in background
const job = 
	user.runInBackground({ method:'sendSMS', to:[ '255714000111'] });

//run schema static method in background
const job = 
	User.runInBackground({ method:'sendEmail', to:[ 'a@example.com', 'b@example.com'] });


//in separate process start processing
const worker = require('mongoose-kue').worker;
worker.start(<options>);

```


## Options

### Plugin
```js
const runInBackground = require('mongoose-kue').plugin;

mongoose.plugin(runInBackground, {
	mongoose: mongoose,
	name: 'mongoose',
	prefix: 'q',
	redis: {
	    port: 1234,
	    host: '10.0.50.20',
	    auth: 'password',
	    db: 3
	}
});
```

- `mongoose` - Valid instance of mongoose
- `name` - Name of the worker queue to process background work,
- `attempts` - [Failure Attempts](https://github.com/Automattic/kue#failure-attempts)
- `backoff` - [Failure Backoff](https://github.com/Automattic/kue#failure-backoff)
- All applicable [kue](https://github.com/Automattic/kue#redis-connection-settings) connection settngs


### Worker

*Note!: I highly recommend to run this in separate process*

```js
const mongoose = require('mongoose');
const worker = require('mongoose-kue').worker;

//load and register your schemas

//ensure mongoose connection
mongoose.connect(<url>);

//start worker queue to process schema methods in background
worker.start({
	mongoose: mongoose,
	name: 'mongoose',
	concurrency: 10,
	prefix: 'q',
	redis: {
	    port: 1234,
	    host: '10.0.50.20',
	    auth: 'password',
	    db: 3
	}
});

``` 

- `mongoose` - Valid instance of mongoose
- `name` - Name of the worker queue to process background work
- `concurrency` - [Processing Concurrency](https://github.com/Automattic/kue#processing-concurrency). Default to 10
- `timeout` - [Graceful shutdown delay](https://github.com/Automattic/kue#graceful-shutdown)
- All applicable [kue](https://github.com/Automattic/kue#redis-connection-settings) connection settngs


## References
- [mongoose](http://mongoosejs.com/docs/guide.html)
- [kue](https://github.com/Automattic/kue)


## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) 2017 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 