const {
    normalizeOutput,
    deepEqual,
    compareOutputs,
} = require("../utils/outputComparer");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function testNormalizeOutput() {
    assert(deepEqual(normalizeOutput(42), 42), "number 42");
    assert(deepEqual(normalizeOutput("hello"), "hello"), "string hello");
    assert(normalizeOutput("hello") === "hello", "plain string unchanged");
    assert(deepEqual(normalizeOutput(true), true), "boolean true");
    assert(deepEqual(normalizeOutput([1, 2, 3]), [1, 2, 3]), "array numbers");
    assert(
        deepEqual(normalizeOutput(["1", "2", "Fizz"]), ["1", "2", "Fizz"]),
        "fizzbuzz strings"
    );
    assert(
        deepEqual(
            normalizeOutput([
                [1, 2],
                [3, 4],
            ]),
            [
                [1, 2],
                [3, 4],
            ]
        ),
        "nested arrays"
    );
    assert(
        deepEqual(normalizeOutput({ b: 2, a: 1 }), { a: 1, b: 2 }),
        "object key ordering"
    );
    assert(
        deepEqual(normalizeOutput([{ b: 2, a: 1 }, { d: 4, c: 3 }]), [
            { a: 1, b: 2 },
            { c: 3, d: 4 },
        ]),
        "array of objects key ordering"
    );
    assert(normalizeOutput(null) === null, "null");
    assert(normalizeOutput(undefined) === undefined, "undefined");
    assert(
        deepEqual(normalizeOutput('["1","2","Fizz"]'), ["1", "2", "Fizz"]),
        "json string array"
    );
    assert(deepEqual(normalizeOutput('{"b":2,"a":1}'), { a: 1, b: 2 }), "json string object");
}

function testCompareOutputs() {
    const cases = [
        { actual: 42, expected: 42, passed: true },
        { actual: "hello", expected: "hello", passed: true },
        { actual: true, expected: true, passed: true },
        { actual: [1, 2, 3], expected: [1, 2, 3], passed: true },
        { actual: ["1", "2", "Fizz"], expected: ["1", "2", "Fizz"], passed: true },
        {
            actual: [
                [1, 2],
                [3, 4],
            ],
            expected: [
                [1, 2],
                [3, 4],
            ],
            passed: true,
        },
        { actual: { b: 2, a: 1 }, expected: { a: 1, b: 2 }, passed: true },
        { actual: [{ a: 1 }, { b: 2 }], expected: [{ a: 1 }, { b: 2 }], passed: true },
        { actual: null, expected: null, passed: true },
        { actual: undefined, expected: undefined, passed: true },
        { actual: [0, 1], expected: [1, 0], passed: false },
        { actual: "42", expected: 42, passed: false },
        { actual: '["1","2","Fizz"]', expected: ["1", "2", "Fizz"], passed: true },
        {
            actual: [
                "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
                "11", "Fizz", "13", "14", "FizzBuzz",
            ],
            expected: [
                "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
                "11", "Fizz", "13", "14", "FizzBuzz",
            ],
            passed: true,
        },
        {
            actual: [
                "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
                "11", "Fizz", "13", "14", "FizzBuzz",
            ],
            expected: [
                "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "10",
                "Buzz", "Fizz", "13", "14", "FizzBuzz",
            ],
            passed: false,
        },
    ];

    for (const testCase of cases) {
        const result = compareOutputs(testCase.actual, testCase.expected);
        assert(
            result.passed === testCase.passed,
            `compareOutputs failed for actual=${JSON.stringify(testCase.actual)} expected=${JSON.stringify(testCase.expected)}`
        );
    }
}

function runTests() {
    testNormalizeOutput();
    testCompareOutputs();
    console.log("outputComparer: all tests passed");
}

runTests();
