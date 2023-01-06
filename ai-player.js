'use strict';

// ==Matrices==
class Matrix {
   constructor(rows, columns, data = []) {
      this._rows = rows;
      this._columns = columns;
      this._data = data;

      // Default to 0 if no any other valid values exist
      if (data == null || data.length == 0) {
         this._data = [];
         for (let i = 0; i < this._rows; i++) {
            this._data[i] = [];
            for (let j = 0; j < this._columns; j++) {
               // Matrix populated with 0
               this._data[i][j] = 0;
            }
         }
      } else {
         if (data.length != rows || data[0].length != columns) {
            throw new Error('');
         }
      }
   }

   get rows() {
      return this._rows;
   }

   get columns() {
      return this._columns;
   }

   get data() {
      return this._data;
   }
}
