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
				// Added values stored
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
				// Added values stored
				matrix.data[i][j] = matrix0.data[i][j] * matrix1.data[i][j];
			}
		}
		return matrix;
	}

	// Dot product
	static dotTwoMatrices(matrix0, matrix1) {
		MyMatrix.compareDimensions(matrix0, matrix1);
		let matrix = new MyMatrix(matrix0.rows, matrix0.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				// Added values stored
				matrix.data[i][j] = matrix0.data[i][j] - matrix1.data[i][j];
			}
		}
		return matrix;
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
