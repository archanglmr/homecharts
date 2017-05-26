'use strict';

const Writable = require('stream').Writable;

module.exports = class DataPointWriter extends Writable {
  constructor(options) {
    if (!options) {
      options = {};
    }
    options.objectMode = true;
    super(options);

    this.connection = options.connection;
    this.writeCalls = 0;
    this.recordsReceived = 0;
    this.databaseWrites = 0;
    this.databaseSkips = 0;
  }

  _write(obj, encoding, callback) {
    try {
      this.writeCalls += 1;
      if (Array.isArray(obj)) {
        this.recordsReceived += obj.length;
      } else {
        this.recordsReceived += 1;
      }
      this.insertRows(obj, function() {callback(null, obj)});

    } catch(err) {
      return callback(err);
    }
  }


  /**
   *
   * @param {array|DataPoint} dataPoints
   * @param {function} finishCallback
   * @returns {string}
   */
  insertRows(dataPoints, finishCallback) {
    if (!Array.isArray(dataPoints)) {
      dataPoints = [dataPoints];
    }

    let counter = make_counter(dataPoints.length),
        sqlCallback = function(error, result, fields) {
          if (error) {
            if ('ER_DUP_ENTRY' === error.code) {
              this.databaseSkips += 1;
              console.log('Duplicate found...');
            } else {
              throw error;
            }
          } else {
            this.databaseWrites += 1;
            console.log('Wrote row...');
          }

          if (!counter()) {
            console.log(`processed ${dataPoints.length} rows...`);
            finishCallback();
          }
        }.bind(this);



    for (let i = 0, c = dataPoints.length; i < c; i += 1) {
      let dataPoint = dataPoints[i];
      this.connection.query('INSERT INTO `DataPoints` ' +
          '(`date`, `time`, `name`, `value`, `valueType`, `metaJson`) ' +
          'VALUES (?, ?, ?, ?, ?, ?) ' +
          //'ON DUPLICATE KEY UPDATE `id` = `id`' +
          '',
          [
            dataPoint.date,
            dataPoint.time,
            dataPoint.name,
            dataPoint.value,
            dataPoint.valueType,
            JSON.stringify(dataPoint.metaJson)
          ],
          sqlCallback
        );
    }
  }

  /**
   * Method to call in the finish event.
   */
  finish() {
    console.log(`FINISHED:`);
    console.log(` - write calls: ${this.writeCalls}`);
    console.log(` - records received: ${this.recordsReceived}`);
    console.log(` - database writes: ${this.databaseWrites}`);
    console.log(` - database writes skipped: ${this.databaseSkips}`);

    this.connection.end();
    console.log('Connection closed');
  }
};


/**
 * Makes a function that simply counts down from the passed number. Used to
 * track how many "threads" are still outstanding.
 * @param count
 * @returns {Function}
 */
function make_counter(count) {
  return () => count -= 1;
}