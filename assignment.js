const fs = require('fs');

// Function to decode y-values from different bases
const decodeValue = (base, value) => {
    return parseInt(value, base);
};

// Function to read and parse JSON test case
const readTestCase = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

// Function to calculate Lagrange Interpolation for finding the constant term (c)
const lagrangeInterpolation = (points) => {
    let secret = 0;

    for (let i = 0; i < points.length; i++) {
        let xi = points[i][0];
        let yi = points[i][1];
        let term = yi;

        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                let xj = points[j][0];
                term *= (0 - xj) / (xi - xj); // Lagrange polynomial term calculation
            }
        }

        secret += term;
    }

    return Math.round(secret); // Secret (constant term) of the polynomial
};

// Function to process the test case and find the secret
const processTestCase = (testCase) => {
    const { keys, ...points } = testCase;
    const n = keys.n;
    const k = keys.k;

    let decodedPoints = [];

    // Decoding each (x, y) point from the JSON
    for (let key in points) {
        const x = parseInt(key);
        const base = parseInt(points[key].base);
        const value = points[key].value;
        const y = decodeValue(base, value);
        decodedPoints.push([x, y]);
    }

    // Applying Lagrange Interpolation to find the secret (constant term c)
    const secret = lagrangeInterpolation(decodedPoints.slice(0, k)); // Using first k points

    return secret;
};

// Function to find imposter points in the second test case
const findImposterPoints = (testCase) => {
    const { keys, ...points } = testCase;
    const n = keys.n;
    const k = keys.k;

    let decodedPoints = [];
    let correctPoints = [];
    let imposterPoints = [];

    // Decoding each (x, y) point from the JSON
    for (let key in points) {
        const x = parseInt(key);
        const base = parseInt(points[key].base);
        const value = points[key].value;
        const y = decodeValue(base, value);
        decodedPoints.push([x, y]);
    }

    // Applying Lagrange Interpolation using first k points to find the correct polynomial
    const secret = lagrangeInterpolation(decodedPoints.slice(0, k));

    // Check if each point fits the correct polynomial
    for (let i = 0; i < decodedPoints.length; i++) {
        let xi = decodedPoints[i][0];
        let yi = decodedPoints[i][1];

        // Interpolate again for remaining points to check correctness
        let calculatedY = lagrangeInterpolation(
            decodedPoints.filter((_, index) => index !== i).slice(0, k)
        );

        if (Math.abs(yi - calculatedY) > 1e-6) {
            imposterPoints.push(decodedPoints[i]);
        } else {
            correctPoints.push(decodedPoints[i]);
        }
    }

    return imposterPoints;
};

// Main execution
const main = () => {
    const testCase1 = readTestCase('testcase1.json'); // Read first test case from file
    const testCase2 = readTestCase('testcase2.json'); // Read second test case from file

    const secret1 = processTestCase(testCase1); // Process first test case
    console.log('Secret (c) from Test Case 1:', secret1);

    const secret2 = processTestCase(testCase2); // Process second test case
    console.log('Secret (c) from Test Case 2:', secret2);

    const imposters = findImposterPoints(testCase2); // Find imposter points in the second test case
    console.log('Imposter Points in Test Case 2:', imposters);
};

// Run the program
main();
