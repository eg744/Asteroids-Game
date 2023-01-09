'use strict';

// ==Matrices==
export class MyMatrix {
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
				throw new Error(
					'Incorrect row, column or data values. Must contain same number of rows and columns, data to fill the matrix.'
				);
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

	// Check 2 matrices have same dimensions
	static compareTwoMatrixDimensions(matrix0, matrix1) {
		if (
			matrix0.rows !== matrix1.rows ||
			matrix0.columns !== matrix1.columns
		) {
			throw new Error('Matrices must have same dimensions');
		}
	}

	// Addition
	static addTwoMatrices(matrix0, matrix1) {
		MyMatrix.compareDimensions(matrix0, matrix1);
		let matrix = new MyMatrix(matrix0.rows, matrix0.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				// Added values stored
				matrix.data[i][j] = matrix0.data[i][j] + matrix1.data[i][j];
			}
		}
		return matrix;
	}

	// Subtraction
	static subtractTwoMatrices(matrix0, matrix1) {
		MyMatrix.compareDimensions(matrix0, matrix1);
		let matrix = new MyMatrix(matrix0.rows, matrix0.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				// Subtracted values stored
				matrix.data[i][j] = matrix0.data[i][j] - matrix1.data[i][j];
			}
		}
		return matrix;
	}

	// Multiplication
	static multiplyTwoMatrices(matrix0, matrix1) {
		MyMatrix.compareDimensions(matrix0, matrix1);
		let matrix = new MyMatrix(matrix0.rows, matrix0.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				// Multiplied values stored
				matrix.data[i][j] = matrix0.data[i][j] * matrix1.data[i][j];
			}
		}
		return matrix;
	}

	// Array => matrix: 1 row
	static convertFromArray(array) {
		// Single row. Pass data 2D array
		return new MyMatrix(1, array.length, [array]);
	}

	// Dot product
	static dotProductTwoMatrices(matrix0, matrix1) {
		// Dot compatibility: matrix0:columns == matrix1:rows
		if (matrix0.columns !== matrix1.rows) {
			throw new Error('Matricies not dot compatible');
		}
		MyMatrix.compareDimensions(matrix0, matrix1);
		let matrix = new MyMatrix(matrix0.rows, matrix1.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				// First cell of 0:row * cell 1:column
				let sum = 0;
				for (let k = 0; k < matrix0.columns; k++) {
					sum += matrix0.data[i][k] * matrix1.data[k][j];
				}
				matrix.data[i][j] = sum;
			}
		}
		return matrix;
	}

	// Function called on each cell
	static mapMatrix(matrix0, matrixFunction) {
		let matrix = new MyMatrix(matrix0.rows, matrix0.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				// After function applied, result in matrix copy
				matrix.data[i][j] = matrixFunction(matrix0.data[i][j]);
			}
		}
		return matrix;
	}

	// Weight
	randomizeWeight() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				// Value between -1, 1
				this.data[i][j] = Math.random() * 2 - 1;
			}
		}
	}
}
