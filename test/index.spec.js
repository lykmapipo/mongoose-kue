'use strict';


//global dependencies(or import)
const path = require('path');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const plugin = require(path.join(__dirname, '..', 'index')).plugin;
const worker = require(path.join(__dirname, '..', 'index')).worker;
let Party;

describe('mongoose-kue', function () {

  before(function () {

    mongoose.plugin(plugin);

    let PartySchema = new Schema({});

    PartySchema.statics.sendEmail = function (options, done) {
      done(null, options);
    };

    PartySchema.statics.sendDirectEmail = function (done) {
      done();
    };

    PartySchema.methods.sendEmail = function (options, done) {
      done(null, options);
    };

    PartySchema.methods.sendDirectEmail = function (done) {
      done();
    };

    Party = mongoose.model('Party', PartySchema);

  });


  describe('import/require', function () {

    it('should be able to import schema plugin', function () {
      expect(plugin).to.exist;
      expect(plugin).to.be.a('function');
      expect(plugin.length).to.be.equal(2);
    });

    it('should be able to import worker', function () {
      expect(worker).to.exist;
      expect(worker).to.be.an('object');
    });

  });

});