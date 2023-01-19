'use strict';

// https://www.freecodecamp.org/news/how-to-create-a-neural-network-in-javascript-in-only-30-lines-of-code-343dafc50d49/
// https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/

// Error logs on neural network
const ERROR_LOGGING = true;
// (in iterations)
const ERROR_LOG_FREQUENCY = 10000;

export class MyNeuralNetwork {
	constructor(numInputs, numHidden, numOutputs) {
		this._numInputs = numInputs;
		this._numHidden = numHidden;
		this._numOutputs = numOutputs;
		this._hiddenValues = [];
		this._inputs = [];

		this._weight0 = new MyMatrix(this._numInputs, this._numHidden);
		this._weight1 = new MyMatrix(this._numHidden, this._numOutputs);

		this._bias0 = new MyMatrix(1, this._numHidden);
		this._bias1 = new MyMatrix(1, this._numOutputs);

		// Randomize weights, biases
		this._weight0.randomizeWeight();
		this._weight1.randomizeWeight();

		this._bias0.randomizeWeight();
		this._bias1.randomizeWeight();

		// Error logs
		this._logCount = ERROR_LOG_FREQUENCY;
	}

	get logCount() {
		return this._logCount;
	}
	set logCount(logCount) {
		this._logCount = logCount;
	}
	// Count

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

	get bias0() {
		return this._bias0;
	}
	set bias0(bias) {
		this._bias0 = bias;
	}

	get bias1() {
		return this._bias1;
	}
	set bias1(bias) {
		this._bias1 = bias;
	}

	get hiddenValues() {
		return this._hiddenValues;
	}
	set hiddenValues(hiddenValues) {
		this._hiddenValues = hiddenValues;
	}

	get inputs() {
		return this._inputs;
	}
	set inputs(inputs) {
		this._inputs = inputs;
	}

	feedForward(inputArray) {
		// inputArray to matrix
		this.inputs = MyMatrix.convertFromArray(inputArray);

		// find hidden values, run activation on each data value (random weights)
		this.hiddenValues = MyMatrix.dotProductTwoMatrices(
			this.inputs,
			this.weight0
		);

		// Bias: output own weights (1 on input, 1 on hidden)
		this.hiddenValues = MyMatrix.addTwoMatrices(
			this.hiddenValues,
			this.bias0
		);
		// Bias helpful in case: All inputs in XOR test could be 0. (0 * any weight = 0)

		this.hiddenValues = MyMatrix.mapMatrix(this.hiddenValues, (x) =>
			sigmoid(x)
		);
		// console.table('hidden', hiddenValues.data);

		let outputs = MyMatrix.dotProductTwoMatrices(
			this.hiddenValues,
			this.weight1
		);
		outputs = MyMatrix.addTwoMatrices(outputs, this.bias1);

		outputs = MyMatrix.mapMatrix(outputs, (x) => sigmoid(x));
		// console.table('outputs', outputs.data);
		return outputs;
	}

	// Insert training data
	training(inputArray, targetArray) {
		// data in
		let outputs = this.feedForward(inputArray);
		// console.log('outputs', outputs);

		let targets = MyMatrix.convertFromArray(targetArray);

		let outputErrors = MyMatrix.subtractTwoMatrices(targets, outputs);

		// Training error log
		if (ERROR_LOGGING) {
			if (this.logCount == ERROR_LOG_FREQUENCY) {
				console.log('output errors:', outputErrors.data[0][0]);
			}
			this.logCount--;
			if (this.logCount == 0) {
				this.logCount = ERROR_LOG_FREQUENCY;
			}
		}

		// Deltas (output errors * derivitive of output)
		let outputDerivitives = MyMatrix.mapMatrix(outputs, (x) =>
			sigmoid(x, true)
		);

		let outputDeltas = MyMatrix.multiplyTwoMatrices(
			outputErrors,
			outputDerivitives
		);

		// Hidden layer errors (delta dot transpose of weights1)
		let weight1Transpose = MyMatrix.transposeMatrix(this.weight1);
		// console.table('outdelta', outputDeltas.data);

		// todo: output.columns and weighttransposed.rows not dot compatible. Check transposematrix, args accepted in order: columns, rows.
		let hiddenErrors = MyMatrix.dotProductTwoMatrices(
			outputDeltas,
			weight1Transpose
		);

		// Delta of hidden
		let hiddenDerivites = MyMatrix.mapMatrix(this.hiddenValues, (x) =>
			sigmoid(x, true)
		);

		let hiddenDeltas = MyMatrix.multiplyTwoMatrices(
			hiddenErrors,
			hiddenDerivites
		);

		// Weights: Add transpose of layers (dot deltas)
		let hiddenTranspose = MyMatrix.transposeMatrix(this.hiddenValues);

		this.weight1 = MyMatrix.addTwoMatrices(
			this.weight1,
			MyMatrix.dotProductTwoMatrices(hiddenTranspose, outputDeltas)
		);

		let inputsTranspose = MyMatrix.transposeMatrix(this.inputs);

		this.weight0 = MyMatrix.addTwoMatrices(
			this.weight0,
			MyMatrix.dotProductTwoMatrices(inputsTranspose, hiddenDeltas)
		);

		// Biases
		this.bias1 = MyMatrix.addTwoMatrices(this.bias1, outputDeltas);
		this.bias0 = MyMatrix.addTwoMatrices(this.bias0, hiddenDeltas);
	}
}

// Activation "Sigmoid" function return val from 0 to 1
function sigmoid(x, derivitive = false) {
	// True derivitive = sig(x) * (1 - sig(x))
	if (derivitive) {
		// When x = sigmoid(x)
		return x * (1 - x);
	}
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
		// MyMatrix.compareTwoMatrixDimensions(matrix0, matrix1);
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

	// Array converted to matrix with 1 row
	static convertFromArray(array) {
		// Single row. Pass data in 2D array
		return new MyMatrix(1, array.length, [array]);
	}

	// Transpose (swap rows, columns) single matrix
	static transposeMatrix(matrix0) {
		// I don't know why cols arg 0, rows, arg 1
		let matrix = new MyMatrix(matrix0.columns, matrix0.rows);
		//let matrix = new MyMatrix(matrix0.row, matrix0.columns);

		for (let i = 0; i < matrix0.rows; i++) {
			for (let j = 0; j < matrix0.columns; j++) {
				matrix.data[j][i] = matrix0.data[i][j];
			}
		}
		return matrix;
	}

	// Dot product
	static dotProductTwoMatrices(matrix0, matrix1) {
		// Dot compatibility: matrix0:columns == matrix1:rows
		if (matrix0.columns !== matrix1.rows) {
			throw new Error(
				`Matricies not dot compatible. 0.columns (columns :${matrix0.columns}) Must equal 1.rows (rows: ${matrix1.rows})`
			);
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
