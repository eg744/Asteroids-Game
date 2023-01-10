'use strict';

// https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/

export class MyNeuralNetwork {
	constructor(numInputs, numHidden, numOutputs) {
		this._numInputs = numInputs;
		this._numHidden = numHidden;
		this._numOutputs = numOutputs;

		this._weight0 = new MyMatrix(this._numInputs, this._numHidden);
		this._weight1 = new MyMatrix(this._numHidden, this._numOutputs);

		this.weight0.randomizeWeight();
		this.weight1.randomizeWeight();
	}

	get weight0() {
		return this._weight0;
	}
	set weight0(weight) {
		this._weight0 = weight;
	}

	get weight1() {
		return this._weight1;
	}
	set weight1(weight) {
		this._weight1 = weight;
	}

	feedForward(inputArray) {
		// inputArray to matrix
		let inputs = MyMatrix.convertFromArray(inputArray);
		// console.table('inputs', inputs.data);

		// find hidden values, run activation on each data value (random weights)
		let hiddenValues = MyMatrix.dotProductTwoMatrices(inputs, this.weight0);
		hiddenValues = MyMatrix.mapMatrix(hiddenValues, (x) => sigmoid(x));
		// console.table('hidden', hiddenValues.data);

		let outputs = MyMatrix.dotProductTwoMatrices(
			hiddenValues,
			this.weight1
		);

		outputs = MyMatrix.mapMatrix(outputs, (x) => sigmoid(x));
		// console.table('outputs', outputs.data);
		return outputs;

		// Bias
	}

	// Insert training data
	training(inputArray, targetArray) {
		// data in
		let outputs = this.feedForward(inputArray);
		console.table('output', outputs.data);

		let targets = MyMatrix.convertFromArray(targetArray);
		console.table('targets', targets.data);

		let outputErrors = MyMatrix.subtractTwoMatrices(targets, outputs);
		console.table('outputerrors', outputErrors.data);
	}
}

// Activation "Sigmoid" function return val from 0 to 1
function sigmoid(x) {
	return 1 / (1 + Math.exp(-x));
}

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
		} else if (data.length != rows || data[0].length != columns) {
			throw new Error(
				'Incorrect row, column or data values. Must contain same number of rows and columns, data to fill the matrix.'
			);
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
		MyMatrix.compareTwoMatrixDimensions(matrix0, matrix1);
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
		MyMatrix.compareTwoMatrixDimensions(matrix0, matrix1);

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
		MyMatrix.compareTwoMatrixDimensions(matrix0, matrix1);
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
		// Single row. Pass data in 2D array
		return new MyMatrix(1, array.length, [array]);
	}

	// Transpose (swap rows, columns) single matrix
	static transposeMatrix(matrix0) {
		let matrix = new MyMatrix(matrix0.rows, matrix0.columns);
		for (let i = 0; i < matrix.rows; i++) {
			for (let j = 0; j < matrix.columns; j++) {
				matrix.data[j][i] = matrix0.data[i][j];
			}
		}
	}

	// Dot product
	static dotProductTwoMatrices(matrix0, matrix1) {
		// Dot compatibility: matrix0:columns == matrix1:rows
		if (matrix0.columns !== matrix1.rows) {
			throw new Error('Matricies not dot compatible');
		}
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
