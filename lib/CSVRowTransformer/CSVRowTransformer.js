'use strict';

const Transform = require('stream').Transform,
    DataPoint = require('../DataPoint');

module.exports = function(options) {
  return new CSVRowTransformer(options);
};

/**
 * Transforms the passed CSV Row data into DataPoints.
 */
class CSVRowTransformer extends Transform {
  constructor(options) {
    if (!options) {
      options = {};
    }
    options.objectMode = true;
    super(options);

    this.map = options.map;
    this.metaJson = options.metaJson;
  }

  _transform(obj, encoding, callback) {
    var clean;

    try {
      clean = this.cleanRow(obj);
    } catch(err) {
      return callback(err);
    }

    callback(null, clean);
  }

  cleanRow(row) {
    var clean = [],
        date = row['Date'],
        time = row['Time'];

    for (let key in row) {
      if (key && row.hasOwnProperty(key) && this.map.hasOwnProperty(key)) {
        let mapData = this.map[key],
            current = {
              date,
              time,
              name: (mapData['name'] || row['Name']),
              value: row[key],
              valueType: (mapData['valueType'] || 'STRING'),
              metaJson: this.metaJson
            };

        if (mapData.hasOwnProperty('allowEmpty') && false === mapData.allowEmpty) {
          let value = current.value;
          if ('' === value) {
            current = false;
          }
        }

        if (false !== current) {
          clean.push(new DataPoint(current));
        }
      }
    }

    return clean;
  }
}