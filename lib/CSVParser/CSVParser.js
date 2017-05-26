'use strict';

var fs = require('fs'),
    csv = require('csv');

const Readable = require('stream').Readable;

module.exports = class CSVParser extends Readable {
  constructor(options) {
    if (!options) {
      options = {};
    }
    options.objectMode = true;
    super(options);

    this.records = [];
    var self = this;

    csv.parse(fs.readFileSync(options.src), options.csv_options, function(err, data) {
      if (err) {
        if (options.ready) {
          options.ready(err);
        }
      } else {
        self.records = data;
        if (options.ready) {
          options.ready();
        }
      }
    });
  }

  _read(size) {
    if (this.records.length) {
      this.push(this.records.shift());
    } else {
      this.push(null);
    }
  }
};