/**
 * Resolve test case input into an argument list for the target function.
 * - spread: fn(...input)  e.g. twoSum([2,7,11,15], 9)
 * - single: fn(...input) where input is already the arg list e.g. fizzBuzz(15) from [15]
 */
function resolveTestArgs(input, expectedInputFormat = "spread") {
    if (input === undefined || input === null) {
        return [];
    }

    if (expectedInputFormat === "single") {
        return Array.isArray(input) ? input : [input];
    }

    return Array.isArray(input) ? input : [input];
}

module.exports = {
    resolveTestArgs,
};
