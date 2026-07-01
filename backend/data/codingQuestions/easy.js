const { createQuestion, buildJsStarter } = require("./helpers");

module.exports = [
    createQuestion({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        order: 1,
        tags: ["Array", "Hash Table"],
        companies: ["Amazon", "Google", "Meta"],
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume exactly one solution, and you may not use the same element twice.`,
        examples: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" },
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "Only one valid answer exists.",
        ],
        functionName: "twoSum",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("twoSum", " * @param {number[]} nums\n * @param {number} target", "number[]"),
        tests: [
            [[[2, 7, 11, 15], 9], [0, 1]],
            [[[3, 2, 4], 6], [1, 2]],
        ],
        hidden: [
            [[[3, 3], 6], [0, 1]],
            [[[1, 5, 3, 7, 9], 10], [1, 3]],
        ],
        hints: [
            "Use a hash map to store seen numbers and their indices.",
            "For each number, check if target minus that number was seen before.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Reverse String",
        slug: "reverse-string",
        difficulty: "Easy",
        order: 2,
        tags: ["String", "Two Pointers"],
        companies: ["Microsoft", "Apple"],
        description: `Write a function that takes an array of characters \`s\` and returns a new array with the characters in reverse order.`,
        examples: [
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "" },
            { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: "" },
        ],
        constraints: [
            "1 <= s.length <= 10^5",
            "s[i] is a printable ascii character.",
        ],
        functionName: "reverseString",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("reverseString", " * @param {character[]} s", "character[]"),
        tests: [
            [[["h", "e", "l", "l", "o"]], ["o", "l", "l", "e", "h"]],
            [[["H", "a", "n", "n", "a", "h"]], ["h", "a", "n", "n", "a", "H"]],
        ],
        hidden: [
            [[["a"]], ["a"]],
            [[["a", "b"]], ["b", "a"]],
        ],
        hints: [
            "Use two pointers at the start and end of the array.",
            "Swap characters while moving the pointers toward the center.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "FizzBuzz",
        slug: "fizzbuzz",
        difficulty: "Easy",
        order: 3,
        tags: ["Math", "Simulation"],
        companies: ["Amazon", "Microsoft"],
        description: `Given an integer \`n\`, return a string array where:

- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
- \`answer[i]\` is the string representation of \`i\` otherwise.`,
        examples: [
            { input: "n = 3", output: '["1","2","Fizz"]', explanation: "" },
            { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]', explanation: "" },
        ],
        constraints: [
            "1 <= n <= 10^4",
            "Return values as strings.",
        ],
        functionName: "fizzBuzz",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("fizzBuzz", " * @param {number} n", "string[]"),
        tests: [
            [[3], ["1", "2", "Fizz"]],
            [[5], ["1", "2", "Fizz", "4", "Buzz"]],
        ],
        hidden: [
            [[15], ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]],
            [[1], ["1"]],
        ],
        hints: [
            "Loop from 1 to n and check divisibility by 3 and 5.",
            "Check divisibility by 15 first to handle FizzBuzz before Fizz or Buzz alone.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) excluding output",
    }),

    createQuestion({
        title: "Palindrome Number",
        slug: "palindrome-number",
        difficulty: "Easy",
        order: 4,
        tags: ["Math"],
        companies: ["Google", "Adobe"],
        description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward.`,
        examples: [
            { input: "x = 121", output: "true", explanation: "121 reads the same forward and backward." },
            { input: "x = -121", output: "false", explanation: "Negative numbers are not palindromes." },
        ],
        constraints: [
            "-2^31 <= x <= 2^31 - 1",
            "Negative numbers are never palindromes.",
        ],
        functionName: "isPalindrome",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("isPalindrome", " * @param {number} x", "boolean"),
        tests: [
            [[121], true],
            [[-121], false],
        ],
        hidden: [
            [[10], false],
            [[0], true],
        ],
        hints: [
            "Convert the number to a string and compare with its reverse.",
            "Alternatively, reverse half the digits mathematically without extra space.",
        ],
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Valid Anagram",
        slug: "valid-anagram",
        difficulty: "Easy",
        order: 5,
        tags: ["String", "Hash Table", "Sorting"],
        companies: ["Amazon", "Bloomberg"],
        description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An anagram uses the same characters with the same frequencies.`,
        examples: [
            { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "" },
            { input: 's = "rat", t = "car"', output: "false", explanation: "" },
        ],
        constraints: [
            "1 <= s.length, t.length <= 5 * 10^4",
            "s and t consist of lowercase English letters.",
        ],
        functionName: "isAnagram",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("isAnagram", " * @param {string} s\n * @param {string} t", "boolean"),
        tests: [
            [["anagram", "nagaram"], true],
            [["rat", "car"], false],
        ],
        hidden: [
            [["a", "ab"], false],
            [["listen", "silent"], true],
        ],
        hints: [
            "Count character frequencies in both strings and compare.",
            "Sorting both strings and comparing is a simple alternative.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) with fixed alphabet size",
    }),

    createQuestion({
        title: "Contains Duplicate",
        slug: "contains-duplicate",
        difficulty: "Easy",
        order: 6,
        tags: ["Array", "Hash Table", "Sorting"],
        companies: ["Google", "Apple"],
        description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and \`false\` if every element is distinct.`,
        examples: [
            { input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears at indices 0 and 3." },
            { input: "nums = [1,2,3,4]", output: "false", explanation: "All elements are distinct." },
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9",
        ],
        functionName: "containsDuplicate",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("containsDuplicate", " * @param {number[]} nums", "boolean"),
        tests: [
            [[[1, 2, 3, 1]], true],
            [[[1, 2, 3, 4]], false],
        ],
        hidden: [
            [[[1]], false],
            [[[1, 1]], true],
        ],
        hints: [
            "Use a Set to track numbers you have already seen.",
            "Sorting the array first is another valid approach.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Merge Sorted Array",
        slug: "merge-sorted-array",
        difficulty: "Easy",
        order: 7,
        tags: ["Array", "Two Pointers", "Sorting"],
        companies: ["Microsoft", "Facebook"],
        description: `You are given two sorted integer arrays \`nums1\` and \`nums2\`, and integers \`m\` and \`n\` representing the number of elements in each array.

Return a new array containing the \`m + n\` merged elements in non-decreasing order. \`nums1\` has length \`m + n\` with the last \`n\` elements set to 0 as placeholders.`,
        examples: [
            { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]", explanation: "" },
            { input: "nums1 = [1], m = 1, nums2 = [], n = 0", output: "[1]", explanation: "" },
        ],
        constraints: [
            "nums1.length == m + n",
            "nums2.length == n",
            "Both arrays are sorted in non-decreasing order.",
        ],
        functionName: "mergeSortedArray",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter(
            "mergeSortedArray",
            " * @param {number[]} nums1\n * @param {number} m\n * @param {number[]} nums2\n * @param {number} n",
            "number[]"
        ),
        tests: [
            [[[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], [1, 2, 2, 3, 5, 6]],
            [[[1], 1, [], 0], [1]],
        ],
        hidden: [
            [[[2, 0], 1, [1], 1], [1, 2]],
            [[[0, 0, 0, 0, 0], 0, [1, 2, 3, 4, 5], 5], [1, 2, 3, 4, 5]],
        ],
        hints: [
            "Use two pointers starting at the end of each valid portion.",
            "Fill the result from back to front to avoid overwriting unmerged values.",
        ],
        timeComplexity: "O(m + n)",
        spaceComplexity: "O(m + n)",
    }),

    createQuestion({
        title: "Best Time to Buy and Sell Stock",
        slug: "best-time-to-buy-and-sell-stock",
        difficulty: "Easy",
        order: 8,
        tags: ["Array", "Dynamic Programming"],
        companies: ["Amazon", "Goldman Sachs"],
        description: `You are given an array \`prices\` where \`prices[i]\` is the price of a stock on day \`i\`.

Return the maximum profit you can achieve from one buy and one sell. If no profit is possible, return \`0\`.`,
        examples: [
            { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price 1) and sell on day 5 (price 6)." },
            { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No transaction yields profit." },
        ],
        constraints: [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4",
        ],
        functionName: "maxProfit",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("maxProfit", " * @param {number[]} prices", "number"),
        tests: [
            [[[7, 1, 5, 3, 6, 4]], 5],
            [[[7, 6, 4, 3, 1]], 0],
        ],
        hidden: [
            [[[1]], 0],
            [[[2, 4, 1]], 2],
        ],
        hints: [
            "Track the minimum price seen so far as you scan the array.",
            "At each day, compute profit if you sold today and keep the maximum.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Remove Duplicates from Sorted Array",
        slug: "remove-duplicates-from-sorted-array",
        difficulty: "Easy",
        order: 9,
        tags: ["Array", "Two Pointers"],
        companies: ["Google", "Adobe"],
        description: `Given a sorted array \`nums\`, remove duplicates in-place conceptually and return \`k\`, the number of unique elements.

The first \`k\` elements of \`nums\` should contain the unique values in order. Return only the count \`k\`.`,
        examples: [
            { input: "nums = [1,1,2]", output: "2", explanation: "Unique elements are [1,2]." },
            { input: "nums = [0,0,1,1,1,2,2,3,3,4]", output: "5", explanation: "Unique elements are [0,1,2,3,4]." },
        ],
        constraints: [
            "1 <= nums.length <= 3 * 10^4",
            "nums is sorted in non-decreasing order.",
        ],
        functionName: "removeDuplicates",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("removeDuplicates", " * @param {number[]} nums", "number"),
        tests: [
            [[[1, 1, 2]], 2],
            [[[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], 5],
        ],
        hidden: [
            [[[1]], 1],
            [[[1, 2, 3]], 3],
        ],
        hints: [
            "Use a slow pointer for the next unique position.",
            "Only advance the slow pointer when a new unique value is found.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Plus One",
        slug: "plus-one",
        difficulty: "Easy",
        order: 10,
        tags: ["Array", "Math"],
        companies: ["Google", "Amazon"],
        description: `Given a non-empty array of digits \`digits\` representing a non-negative integer, increment the integer by one and return the resulting digits as an array.`,
        examples: [
            { input: "digits = [1,2,3]", output: "[1,2,4]", explanation: "123 + 1 = 124." },
            { input: "digits = [9]", output: "[1,0]", explanation: "9 + 1 = 10." },
        ],
        constraints: [
            "1 <= digits.length <= 100",
            "0 <= digits[i] <= 9",
            "digits does not contain leading zeros except for the number 0 itself.",
        ],
        functionName: "plusOne",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("plusOne", " * @param {number[]} digits", "number[]"),
        tests: [
            [[[1, 2, 3]], [1, 2, 4]],
            [[[9]], [1, 0]],
        ],
        hidden: [
            [[[9, 9, 9]], [1, 0, 0, 0]],
            [[[0]], [1]],
        ],
        hints: [
            "Start from the least significant digit and propagate carry leftward.",
            "If all digits are 9, the result needs an extra leading 1.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) excluding output",
    }),

    createQuestion({
        title: "Roman to Integer",
        slug: "roman-to-integer",
        difficulty: "Easy",
        order: 11,
        tags: ["Hash Table", "Math", "String"],
        companies: ["Amazon", "Bloomberg"],
        description: `Given a roman numeral string \`s\`, convert it to an integer.

Roman numerals are formed by adding or subtracting symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.`,
        examples: [
            { input: 's = "III"', output: "3", explanation: "III = 3." },
            { input: 's = "LVIII"', output: "58", explanation: "L + V + III = 58." },
        ],
        constraints: [
            "1 <= s.length <= 15",
            "s contains only valid roman numeral characters.",
        ],
        functionName: "romanToInt",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("romanToInt", " * @param {string} s", "number"),
        tests: [
            [["III"], 3],
            [["LVIII"], 58],
        ],
        hidden: [
            [["MCMXCIV"], 1994],
            [["IV"], 4],
        ],
        hints: [
            "Map each symbol to its value.",
            "If a smaller value appears before a larger one, subtract it instead of adding.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Climbing Stairs",
        slug: "climbing-stairs",
        difficulty: "Easy",
        order: 12,
        tags: ["Math", "Dynamic Programming", "Memoization"],
        companies: ["Amazon", "Google"],
        description: `You are climbing a staircase with \`n\` steps. Each time you can climb 1 or 2 steps.

Return the number of distinct ways to reach the top.`,
        examples: [
            { input: "n = 2", output: "2", explanation: "1+1 or 2." },
            { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, or 2+1." },
        ],
        constraints: [
            "1 <= n <= 45",
            "The answer fits in a 32-bit integer.",
        ],
        functionName: "climbStairs",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("climbStairs", " * @param {number} n", "number"),
        tests: [
            [[2], 2],
            [[3], 3],
        ],
        hidden: [
            [[5], 8],
            [[1], 1],
        ],
        hints: [
            "This follows the Fibonacci pattern: ways(n) = ways(n-1) + ways(n-2).",
            "Use two variables to track the previous two results instead of full recursion.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Binary Search",
        slug: "binary-search",
        difficulty: "Easy",
        order: 13,
        tags: ["Array", "Binary Search"],
        companies: ["Google", "Microsoft", "Amazon"],
        description: `Given a sorted array \`nums\` and a \`target\` value, return the index of \`target\` if found. Otherwise return \`-1\`.

You must write an algorithm with O(log n) runtime.`,
        examples: [
            { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists at index 4." },
            { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist." },
        ],
        constraints: [
            "1 <= nums.length <= 10^4",
            "nums is sorted in ascending order: -10^4 <= nums[i] <= 10^4",
        ],
        functionName: "search",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("search", " * @param {number[]} nums\n * @param {number} target", "number"),
        tests: [
            [[[-1, 0, 3, 5, 9, 12], 9], 4],
            [[[-1, 0, 3, 5, 9, 12], 2], -1],
        ],
        hidden: [
            [[[5], 5], 0],
            [[[2, 5], 1], -1],
        ],
        hints: [
            "Maintain left and right pointers and compare the middle element to target.",
            "Adjust the search range by moving left or right based on the comparison.",
        ],
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Missing Number",
        slug: "missing-number",
        difficulty: "Easy",
        order: 14,
        tags: ["Array", "Math", "Bit Manipulation"],
        companies: ["Microsoft", "Amazon"],
        description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the one number that is missing from the array.`,
        examples: [
            { input: "nums = [3,0,1]", output: "2", explanation: "n = 3, so numbers 0..3 are expected." },
            { input: "nums = [0,1]", output: "2", explanation: "n = 2, so 2 is missing." },
        ],
        constraints: [
            "n == nums.length",
            "All numbers in nums are unique and in range [0, n].",
        ],
        functionName: "missingNumber",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("missingNumber", " * @param {number[]} nums", "number"),
        tests: [
            [[[3, 0, 1]], 2],
            [[[0, 1]], 2],
        ],
        hidden: [
            [[[1]], 0],
            [[[9,6,4,2,3,5,7,0,1]], 8],
        ],
        hints: [
            "The sum of 0..n minus the array sum gives the missing value.",
            "XOR all indices and values together; the leftover is the answer.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Move Zeroes",
        slug: "move-zeroes",
        difficulty: "Easy",
        order: 15,
        tags: ["Array", "Two Pointers"],
        companies: ["Facebook", "Apple"],
        description: `Given an integer array \`nums\`, return a new array with all zeroes moved to the end while maintaining the relative order of non-zero elements.`,
        examples: [
            { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]", explanation: "" },
            { input: "nums = [0]", output: "[0]", explanation: "" },
        ],
        constraints: [
            "1 <= nums.length <= 10^4",
            "-2^31 <= nums[i] <= 2^31 - 1",
        ],
        functionName: "moveZeroes",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("moveZeroes", " * @param {number[]} nums", "number[]"),
        tests: [
            [[[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]],
            [[[0]], [0]],
        ],
        hidden: [
            [[[1, 2, 3]], [1, 2, 3]],
            [[[0, 0, 1]], [1, 0, 0]],
        ],
        hints: [
            "Use a write pointer for the next non-zero position.",
            "Swap or overwrite zeroes as you scan the array once.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Maximum Subarray",
        slug: "maximum-subarray",
        difficulty: "Easy",
        order: 16,
        tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
        companies: ["LinkedIn", "Microsoft"],
        description: `Given an integer array \`nums\`, find the contiguous subarray with the largest sum and return that sum.`,
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum 6." },
            { input: "nums = [1]", output: "1", explanation: "" },
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
        ],
        functionName: "maxSubArray",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("maxSubArray", " * @param {number[]} nums", "number"),
        tests: [
            [[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6],
            [[[1]], 1],
        ],
        hidden: [
            [[[-1]], -1],
            [[[5, 4, -1, 7, 8]], 23],
        ],
        hints: [
            "Use Kadane's algorithm: track current sum and reset when it goes negative.",
            "Keep a running maximum of the best sum seen so far.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Valid Palindrome",
        slug: "valid-palindrome",
        difficulty: "Easy",
        order: 17,
        tags: ["String", "Two Pointers"],
        companies: ["Facebook", "Microsoft"],
        description: `Given a string \`s\`, return \`true\` if it is a palindrome considering only alphanumeric characters and ignoring cases.`,
        examples: [
            { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: "amanaplanacanalpanama is a palindrome." },
            { input: 's = "race a car"', output: "false", explanation: "It is not a palindrome." },
        ],
        constraints: [
            "1 <= s.length <= 2 * 10^5",
            "s consists of printable ASCII characters.",
        ],
        functionName: "isPalindromeString",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("isPalindromeString", " * @param {string} s", "boolean"),
        tests: [
            [["A man, a plan, a canal: Panama"], true],
            [["race a car"], false],
        ],
        hidden: [
            [[" "], true],
            [["0P"], false],
        ],
        hints: [
            "Use two pointers and skip non-alphanumeric characters.",
            "Compare characters case-insensitively while moving inward.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "First Unique Character",
        slug: "first-unique-character",
        difficulty: "Easy",
        order: 18,
        tags: ["String", "Hash Table", "Queue"],
        companies: ["Amazon", "Bloomberg"],
        description: `Given a string \`s\`, return the index of the first non-repeating character. If none exists, return \`-1\`.`,
        examples: [
            { input: 's = "leetcode"', output: "0", explanation: "l is the first unique character." },
            { input: 's = "loveleetcode"', output: "2", explanation: "v is the first unique character." },
        ],
        constraints: [
            "1 <= s.length <= 10^5",
            "s consists of lowercase English letters.",
        ],
        functionName: "firstUniqChar",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("firstUniqChar", " * @param {string} s", "number"),
        tests: [
            [["leetcode"], 0],
            [["loveleetcode"], 2],
        ],
        hidden: [
            [["aabb"], -1],
            [["z"], 0],
        ],
        hints: [
            "Count the frequency of each character first.",
            "Scan the string again and return the first index with count 1.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) with fixed alphabet",
    }),

    createQuestion({
        title: "Majority Element",
        slug: "majority-element",
        difficulty: "Easy",
        order: 19,
        tags: ["Array", "Hash Table", "Divide and Conquer"],
        companies: ["Google", "Adobe"],
        description: `Given an array \`nums\` of size \`n\`, return the element that appears more than \`n / 2\` times.

You may assume the majority element always exists.`,
        examples: [
            { input: "nums = [3,2,3]", output: "3", explanation: "3 appears twice out of 3 elements." },
            { input: "nums = [2,2,1,1,1,2,2]", output: "2", explanation: "2 appears 4 times out of 7." },
        ],
        constraints: [
            "n == nums.length",
            "1 <= n <= 5 * 10^4",
            "The majority element always exists.",
        ],
        functionName: "majorityElement",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("majorityElement", " * @param {number[]} nums", "number"),
        tests: [
            [[[3, 2, 3]], 3],
            [[[2, 2, 1, 1, 1, 2, 2]], 2],
        ],
        hidden: [
            [[[1]], 1],
            [[[6, 5, 5]], 5],
        ],
        hints: [
            "Use the Boyer-Moore voting algorithm to track a candidate.",
            "Counting with a hash map also works in O(n) time.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Intersection of Two Arrays",
        slug: "intersection-of-two-arrays",
        difficulty: "Easy",
        order: 20,
        tags: ["Array", "Hash Table", "Two Pointers"],
        companies: ["Facebook", "Amazon"],
        description: `Given two integer arrays \`nums1\` and \`nums2\`, return an array of their intersection. Each element in the result must be unique and appear in both arrays.`,
        examples: [
            { input: "nums1 = [1,2,2,1], nums2 = [2,2]", output: "[2]", explanation: "2 is shared by both arrays." },
            { input: "nums1 = [4,9,5], nums2 = [9,4,9,8,9]", output: "[9,4]", explanation: "Order may vary; both 9 and 4 are shared." },
        ],
        constraints: [
            "1 <= nums1.length, nums2.length <= 1000",
            "Each value in the result must be unique.",
        ],
        functionName: "intersection",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("intersection", " * @param {number[]} nums1\n * @param {number[]} nums2", "number[]"),
        tests: [
            [[[1, 2, 2, 1], [2, 2]], [2]],
            [[[4, 9, 5], [9, 4, 9, 8, 9]], [9, 4]],
        ],
        hidden: [
            [[[1, 2, 3], [4, 5, 6]], []],
            [[[7, 7, 8], [8, 8, 7]], [7, 8]],
        ],
        hints: [
            "Store elements of one array in a Set for O(1) lookups.",
            "Iterate the other array and collect matches not yet added to the result.",
        ],
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(n + m)",
    }),
];
