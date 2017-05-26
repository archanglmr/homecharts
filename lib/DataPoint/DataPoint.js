'use strict';

module.exports = class DataPoint {
  constructor(data) {
    this.data = data;

    this.date = data.date || null;
    this.time = data.time || null;
    this.name = data.name || null;
    this.value = (undefined === data.value) ? null : data.value;
    this.valueType = data.valueType || 'STRING';
    this.metaJson = data.metaJson || {};

    if (data.date) {
      if (typeof data.date === 'Date') {
        this.date = data.getDate();
      } else {
        this.date = data.date;
      }
    }

    if (data.timestamp) {
      this.date = data.timestamp.getDate();
      this.time = data.timestamp.getTime() || this.time;
    }


    if (null === this.date) {
      throw new Error('Date is required');
    } else if (null === this.name) {
      throw new Error('Name is required');
    }
  }
};