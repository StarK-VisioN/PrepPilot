const { createQuestion, buildJsStarter } = require("./helpers");

module.exports = [
    createQuestion({
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        order: 1,
        difficulty: "Medium",
        tags: ["String", "Stack"],
        companies: ["Amazon", "Google", "Meta", "Microsoft"],
        description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        examples: [
            { input: 's = "()"', output: "true", explanation: "" },
            { input: 's = "()[]{}"', output: "true", explanation: "" },
            { input: 's = "(]"', output: "false", explanation: "" },
        ],
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'.",
        ],
        functionName: "isValid",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("isValid", " * @param {string} s", "boolean"),
        tests: [
            [["()"], true],
            [["()[]{}"], true],
            [["(]"], false],
        ],
        hidden: [
            [["([)]"], false],
            [["{[]}"], true],
        ],
        hints: ["Use a stack to track opening brackets.", "When you see a closing bracket, the top of the stack must match."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Group Anagrams",
        slug: "group-anagrams",
        order: 2,
        difficulty: "Medium",
        tags: ["Array", "Hash Table", "String", "Sorting"],
        companies: ["Amazon", "Google", "Meta"],
        description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in **any order**.

An **anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.`,
        examples: [
            { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "" },
            { input: 'strs = [""]', output: '[[""]]', explanation: "" },
            { input: 'strs = ["a"]', output: '[["a"]]', explanation: "" },
        ],
        constraints: [
            "1 <= strs.length <= 10^4",
            "0 <= strs[i].length <= 100",
            "strs[i] consists of lowercase English letters.",
        ],
        functionName: "groupAnagrams",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("groupAnagrams", " * @param {string[]} strs", "string[][]"),
        tests: [
            [[["eat", "tea", "tan", "ate", "nat", "bat"]], [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]],
            [[[""]], [[""]]],
            [[["a"]], [["a"]]],
        ],
        hidden: [
            [[["abc", "bca", "cab", "xyz"]], [["abc", "bca", "cab"], ["xyz"]]],
        ],
        hints: ["Sort each string or count character frequencies to build a group key.", "Use a hash map from key to list of strings."],
        timeComplexity: "O(n * k log k)",
        spaceComplexity: "O(n * k)",
    }),

    createQuestion({
        title: "Product of Array Except Self",
        slug: "product-of-array-except-self",
        order: 3,
        difficulty: "Medium",
        tags: ["Array", "Prefix Sum"],
        companies: ["Amazon", "Apple", "Meta"],
        description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.

You must write an algorithm that runs in \`O(n)\` time and without using the division operation.`,
        examples: [
            { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", explanation: "" },
            { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]", explanation: "" },
        ],
        constraints: [
            "2 <= nums.length <= 10^5",
            "-30 <= nums[i] <= 30",
            "The product of any prefix or suffix fits in a 32-bit integer.",
        ],
        functionName: "productExceptSelf",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("productExceptSelf", " * @param {number[]} nums", "number[]"),
        tests: [
            [[[1, 2, 3, 4]], [24, 12, 8, 6]],
            [[[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]],
        ],
        hidden: [
            [[[2, 3, 4, 5]], [60, 40, 30, 24]],
        ],
        hints: ["Compute prefix products from the left, then suffix products from the right.", "You can use the output array to store prefix values first."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) excluding output",
    }),

    createQuestion({
        title: "Top K Frequent Elements",
        slug: "top-k-frequent-elements",
        order: 4,
        difficulty: "Medium",
        tags: ["Array", "Hash Table", "Heap", "Bucket Sort"],
        companies: ["Amazon", "Google", "Meta", "Apple"],
        description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in **any order**.`,
        examples: [
            { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", explanation: "" },
            { input: "nums = [1], k = 1", output: "[1]", explanation: "" },
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
            "k is in the range [1, the number of unique elements in the array].",
            "It is guaranteed that the answer is unique.",
        ],
        functionName: "topKFrequent",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("topKFrequent", " * @param {number[]} nums\n * @param {number} k", "number[]"),
        tests: [
            [[[1, 1, 1, 2, 2, 3], 2], [1, 2]],
            [[[1], 1], [1]],
        ],
        hidden: [
            [[[4, 1, -1, 2, -1, 2, 3], 2], [-1, 2]],
        ],
        hints: ["Count frequencies with a hash map.", "Use a bucket sort by frequency or a min-heap of size k."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        order: 5,
        difficulty: "Medium",
        tags: ["Hash Table", "String", "Sliding Window"],
        companies: ["Amazon", "Google", "Meta", "Bloomberg"],
        description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
        examples: [
            { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
            { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with length 1.' },
            { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with length 3.' },
        ],
        constraints: [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces.",
        ],
        functionName: "lengthOfLongestSubstring",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("lengthOfLongestSubstring", " * @param {string} s", "number"),
        tests: [
            [["abcabcbb"], 3],
            [["bbbbb"], 1],
            [["pwwkew"], 3],
        ],
        hidden: [
            [[""], 0],
        ],
        hints: ["Use a sliding window with two pointers.", "Track the last index of each character to shrink the window when duplicates appear."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(n, m))",
    }),

    createQuestion({
        title: "Container With Most Water",
        slug: "container-with-most-water",
        order: 6,
        difficulty: "Medium",
        tags: ["Array", "Two Pointers", "Greedy"],
        companies: ["Amazon", "Google", "Meta", "Apple"],
        description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
        examples: [
            { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 and 8 form a container of area 49." },
            { input: "height = [1,1]", output: "1", explanation: "" },
        ],
        constraints: [
            "n == height.length",
            "2 <= n <= 10^5",
            "0 <= height[i] <= 10^4",
        ],
        functionName: "maxArea",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("maxArea", " * @param {number[]} height", "number"),
        tests: [
            [[[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49],
            [[[1, 1]], 1],
        ],
        hidden: [
            [[[4, 3, 2, 1, 4]], 16],
        ],
        hints: ["Use two pointers at both ends of the array.", "Move the pointer at the shorter line inward — the taller line is the limiting factor."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "3Sum",
        slug: "3sum",
        order: 7,
        difficulty: "Medium",
        tags: ["Array", "Two Pointers", "Sorting"],
        companies: ["Amazon", "Google", "Meta", "Microsoft"],
        description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
        examples: [
            { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "" },
            { input: "nums = [0,1,1]", output: "[]", explanation: "The only possible triplet does not sum to zero." },
            { input: "nums = [0,0,0]", output: "[[0,0,0]]", explanation: "" },
        ],
        constraints: [
            "3 <= nums.length <= 3000",
            "-10^5 <= nums[i] <= 10^5",
        ],
        functionName: "threeSum",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("threeSum", " * @param {number[]} nums", "number[][]"),
        tests: [
            [[[-1, 0, 1, 2, -1, -4]], [[-1, -1, 2], [-1, 0, 1]]],
            [[[0, 1, 1]], []],
            [[[0, 0, 0]], [[0, 0, 0]]],
        ],
        hidden: [
            [[[-2, 0, 1, 1, 2]], [[-2, 0, 2], [-2, 1, 1]]],
        ],
        hints: ["Sort the array first.", "Fix one element and use two pointers to find pairs that sum to its negation.", "Skip duplicate values to avoid duplicate triplets."],
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1) excluding output",
    }),

    createQuestion({
        title: "Search in Rotated Sorted Array",
        slug: "search-in-rotated-sorted-array",
        order: 8,
        difficulty: "Medium",
        tags: ["Array", "Binary Search"],
        companies: ["Amazon", "Google", "Meta", "Microsoft"],
        description: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` (\`1 <= k < nums.length\`) such that the resulting array is \`[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]\`.

Given the array \`nums\` after the rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not.`,
        examples: [
            { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "" },
            { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1", explanation: "" },
            { input: "nums = [1], target = 0", output: "-1", explanation: "" },
        ],
        constraints: [
            "1 <= nums.length <= 5000",
            "-10^4 <= nums[i] <= 10^4",
            "All values of nums are unique.",
            "nums is an ascending array that is possibly rotated.",
        ],
        functionName: "searchRotated",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("searchRotated", " * @param {number[]} nums\n * @param {number} target", "number"),
        tests: [
            [[[4, 5, 6, 7, 0, 1, 2], 0], 4],
            [[[4, 5, 6, 7, 0, 1, 2], 3], -1],
            [[[1], 0], -1],
        ],
        hidden: [
            [[[1], 1], 0],
        ],
        hints: ["Binary search still works — identify which half is sorted.", "Check if the target lies within the sorted half; otherwise search the other half."],
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Set Matrix Zeroes",
        slug: "set-matrix-zeroes",
        order: 9,
        difficulty: "Medium",
        tags: ["Array", "Hash Table", "Matrix"],
        companies: ["Amazon", "Microsoft", "Apple"],
        description: `Given an \`m x n\` integer matrix \`matrix\`, if an element is \`0\`, set its entire row and column to \`0\`'s.

Return the matrix with all zeroes applied.`,
        examples: [
            { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]", explanation: "" },
            { input: "matrix = [[0,1],[1,0]]", output: "[[0,0],[0,0]]", explanation: "" },
        ],
        constraints: [
            "m == matrix.length",
            "n == matrix[0].length",
            "1 <= m, n <= 200",
            "-2^31 <= matrix[i][j] <= 2^31 - 1",
        ],
        functionName: "setZeroes",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("setZeroes", " * @param {number[][]} matrix", "number[][]"),
        tests: [
            [[[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], [[1, 0, 1], [0, 0, 0], [1, 0, 1]]],
            [[[[0, 1], [1, 0]]], [[0, 0], [0, 0]]],
        ],
        hidden: [
            [[[[1, 0, 1], [1, 1, 1], [1, 1, 1]]], [[0, 0, 0], [1, 0, 1], [1, 0, 1]]],
        ],
        hints: ["Mark which rows and columns should be zeroed using the first row and column as flags.", "Handle the first row and column separately since they serve dual purposes."],
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Rotate Image",
        slug: "rotate-image",
        order: 10,
        difficulty: "Medium",
        tags: ["Array", "Math", "Matrix"],
        companies: ["Amazon", "Google", "Microsoft"],
        description: `You are given an \`n x n\` 2D matrix \`matrix\` representing an image.

Rotate the image by **90 degrees clockwise** and return the rotated matrix.`,
        examples: [
            { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", explanation: "" },
            { input: "matrix = [[1,2],[3,4]]", output: "[[3,1],[4,2]]", explanation: "" },
        ],
        constraints: [
            "n == matrix.length == matrix[i].length",
            "1 <= n <= 20",
            "-1000 <= matrix[i][j] <= 1000",
        ],
        functionName: "rotate",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("rotate", " * @param {number[][]} matrix", "number[][]"),
        tests: [
            [[[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[7, 4, 1], [8, 5, 2], [9, 6, 3]]],
            [[[[1, 2], [3, 4]]], [[3, 1], [4, 2]]],
        ],
        hidden: [
            [[[[1]]], [[1]]],
        ],
        hints: ["Transpose the matrix, then reverse each row.", "Alternatively, rotate groups of four cells in place."],
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1) excluding output",
    }),

    createQuestion({
        title: "Coin Change",
        slug: "coin-change",
        order: 11,
        difficulty: "Medium",
        tags: ["Array", "Dynamic Programming", "Breadth-First Search"],
        companies: ["Amazon", "Google", "Uber"],
        description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
        examples: [
            { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
            { input: "coins = [2], amount = 3", output: "-1", explanation: "" },
            { input: "coins = [1], amount = 0", output: "0", explanation: "" },
        ],
        constraints: [
            "1 <= coins.length <= 12",
            "1 <= coins[i] <= 2^31 - 1",
            "0 <= amount <= 10^4",
        ],
        functionName: "coinChange",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("coinChange", " * @param {number[]} coins\n * @param {number} amount", "number"),
        tests: [
            [[[1, 2, 5], 11], 3],
            [[[2], 3], -1],
            [[[1], 0], 0],
        ],
        hidden: [
            [[[1, 2, 5], 100], 20],
        ],
        hints: ["Use bottom-up dynamic programming: dp[i] = min coins for amount i.", "For each amount, try every coin and take the minimum."],
        timeComplexity: "O(amount * coins.length)",
        spaceComplexity: "O(amount)",
    }),

    createQuestion({
        title: "House Robber",
        slug: "house-robber",
        order: 12,
        difficulty: "Medium",
        tags: ["Array", "Dynamic Programming"],
        companies: ["Amazon", "Google", "LinkedIn"],
        description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected, so **you cannot rob two adjacent houses**.

Given an integer array \`nums\` representing the amount of money of each house, return the maximum amount of money you can rob tonight **without alerting the police**.`,
        examples: [
            { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob house 1 (7) + house 3 (3) + house 5 (1) = 12." },
            { input: "nums = [2,1,1,2]", output: "4", explanation: "" },
        ],
        constraints: [
            "1 <= nums.length <= 100",
            "0 <= nums[i] <= 400",
        ],
        functionName: "rob",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("rob", " * @param {number[]} nums", "number"),
        tests: [
            [[[2, 7, 9, 3, 1]], 12],
            [[[2, 1, 1, 2]], 4],
        ],
        hidden: [
            [[[5, 1, 2, 10, 6]], 17],
        ],
        hints: ["At each house, choose max(rob current + skip previous, skip current).", "Track only the previous two DP values to use O(1) space."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Number of Islands",
        slug: "number-of-islands",
        order: 13,
        difficulty: "Medium",
        tags: ["Array", "Depth-First Search", "Breadth-First Search", "Matrix", "Union Find"],
        companies: ["Amazon", "Google", "Meta", "Microsoft"],
        description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.`,
        examples: [
            {
                input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
                output: "3",
                explanation: "",
            },
            { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1", explanation: "" },
        ],
        constraints: [
            "m == grid.length",
            "n == grid[i].length",
            "1 <= m, n <= 300",
            "grid[i][j] is '0' or '1'.",
        ],
        functionName: "numIslands",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("numIslands", " * @param {character[][]} grid", "number"),
        tests: [
            [
                [[
                    ["1", "1", "0", "0", "0"],
                    ["1", "1", "0", "0", "0"],
                    ["0", "0", "1", "0", "0"],
                    ["0", "0", "0", "1", "1"],
                ]],
                3,
            ],
            [
                [[
                    ["1", "1", "1"],
                    ["0", "1", "0"],
                    ["1", "1", "1"],
                ]],
                1,
            ],
        ],
        hidden: [
            [[[["1"]]], 1],
        ],
        hints: ["Run DFS or BFS from each unvisited '1' cell.", "Mark visited cells to avoid counting the same island twice."],
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m * n)",
    }),

    createQuestion({
        title: "Course Schedule",
        slug: "course-schedule",
        order: 14,
        difficulty: "Medium",
        tags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
        companies: ["Amazon", "Google", "Meta", "Microsoft"],
        description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you **must** take course \`b_i\` first if you want to take course \`a_i\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
        examples: [
            { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "Take course 0 then course 1." },
            { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "Circular dependency." },
        ],
        constraints: [
            "1 <= numCourses <= 2000",
            "0 <= prerequisites.length <= 5000",
            "prerequisites[i].length == 2",
            "0 <= a_i, b_i < numCourses",
            "All the pairs prerequisites[i] are unique.",
        ],
        functionName: "canFinish",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("canFinish", " * @param {number} numCourses\n * @param {number[][]} prerequisites", "boolean"),
        tests: [
            [[2, [[1, 0]]], true],
            [[2, [[1, 0], [0, 1]]], false],
        ],
        hidden: [
            [[3, [[1, 0], [2, 1]]], true],
        ],
        hints: ["Model courses as a directed graph.", "Detect cycles with DFS or use Kahn's algorithm (BFS topological sort)."],
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V + E)",
    }),

    createQuestion({
        title: "Kth Largest Element in an Array",
        slug: "kth-largest-element-in-an-array",
        order: 15,
        difficulty: "Medium",
        tags: ["Array", "Divide and Conquer", "Sorting", "Heap", "Quickselect"],
        companies: ["Amazon", "Google", "Meta", "Apple"],
        description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\`th largest element in the array.

Note that it is the \`k\`th largest element in the sorted order, not the \`k\`th distinct element.`,
        examples: [
            { input: "nums = [3,2,1,5,6,4], k = 2", output: "5", explanation: "" },
            { input: "nums = [3,2,3,1,2,4,1,5,5,6], k = 4", output: "4", explanation: "" },
        ],
        constraints: [
            "1 <= k <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
        ],
        functionName: "findKthLargest",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("findKthLargest", " * @param {number[]} nums\n * @param {number} k", "number"),
        tests: [
            [[[3, 2, 1, 5, 6, 4], 2], 5],
            [[[3, 2, 3, 1, 2, 4, 1, 5, 5, 6], 4], 4],
        ],
        hidden: [
            [[[1], 1], 1],
        ],
        hints: ["Use a min-heap of size k to track the k largest elements.", "Quickselect partitions around a pivot in expected O(n) time."],
        timeComplexity: "O(n) average",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Daily Temperatures",
        slug: "daily-temperatures",
        order: 16,
        difficulty: "Medium",
        tags: ["Array", "Stack", "Monotonic Stack"],
        companies: ["Amazon", "Google", "Meta"],
        description: `Given an array of integers \`temperatures\` representing daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i\`th day to get a warmer temperature. If there is no future day with a warmer temperature, keep \`answer[i] == 0\`.`,
        examples: [
            { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]", explanation: "" },
            { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]", explanation: "" },
            { input: "temperatures = [30,60,90]", output: "[1,1,0]", explanation: "" },
        ],
        constraints: [
            "1 <= temperatures.length <= 10^5",
            "30 <= temperatures[i] <= 100",
        ],
        functionName: "dailyTemperatures",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("dailyTemperatures", " * @param {number[]} temperatures", "number[]"),
        tests: [
            [[[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]],
            [[[30, 40, 50, 60]], [1, 1, 1, 0]],
        ],
        hidden: [
            [[[30, 60, 90]], [1, 1, 0]],
        ],
        hints: ["Use a monotonic decreasing stack storing indices.", "When a warmer day is found, pop indices and compute the day difference."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Longest Consecutive Sequence",
        slug: "longest-consecutive-sequence",
        order: 17,
        difficulty: "Medium",
        tags: ["Array", "Hash Table", "Union Find"],
        companies: ["Amazon", "Google", "Meta", "Apple"],
        description: `Given an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in \`O(n)\` time.`,
        examples: [
            { input: "nums = [100,4,200,1,3,2]", output: "4", explanation: "The longest consecutive sequence is [1, 2, 3, 4]." },
            { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9", explanation: "" },
        ],
        constraints: [
            "0 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9",
        ],
        functionName: "longestConsecutive",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("longestConsecutive", " * @param {number[]} nums", "number"),
        tests: [
            [[[100, 4, 200, 1, 3, 2]], 4],
            [[[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], 9],
        ],
        hidden: [
            [[[]], 0],
        ],
        hints: ["Put all numbers in a hash set for O(1) lookups.", "Only start counting from numbers that are the beginning of a sequence (num - 1 not in set)."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Subarray Sum Equals K",
        slug: "subarray-sum-equals-k",
        order: 18,
        difficulty: "Medium",
        tags: ["Array", "Hash Table", "Prefix Sum"],
        companies: ["Amazon", "Google", "Meta", "Facebook"],
        description: `Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.`,
        examples: [
            { input: "nums = [1,1,1], k = 2", output: "2", explanation: "" },
            { input: "nums = [1,2,3], k = 3", output: "2", explanation: "" },
        ],
        constraints: [
            "1 <= nums.length <= 2 * 10^4",
            "-1000 <= nums[i] <= 1000",
            "-10^7 <= k <= 10^7",
        ],
        functionName: "subarraySum",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("subarraySum", " * @param {number[]} nums\n * @param {number} k", "number"),
        tests: [
            [[[1, 1, 1], 2], 2],
            [[[1, 2, 3], 3], 2],
        ],
        hidden: [
            [[[1, -1, 0], 0], 3],
        ],
        hints: ["Track running prefix sums in a hash map.", "If prefixSum - k exists in the map, those subarrays sum to k."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Decode String",
        slug: "decode-string",
        order: 19,
        difficulty: "Medium",
        tags: ["String", "Stack", "Recursion"],
        companies: ["Amazon", "Google", "Meta"],
        description: `Given an encoded string, return its decoded string.

The encoding rule is: \`k[encoded_string]\`, where the \`encoded_string\` inside the square brackets is being repeated exactly \`k\` times. \`k\` is guaranteed to be a positive integer.

You may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc.`,
        examples: [
            { input: 's = "3[a]2[bc]"', output: '"aaabcbc"', explanation: "" },
            { input: 's = "3[a2[c]]"', output: '"accaccacc"', explanation: "" },
            { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"', explanation: "" },
        ],
        constraints: [
            "1 <= s.length <= 30",
            "s consists of lowercase English letters, digits, and square brackets '[]'.",
            "s is guaranteed to be a valid input.",
            "All the integers in s are in the range [1, 300].",
        ],
        functionName: "decodeString",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("decodeString", " * @param {string} s", "string"),
        tests: [
            [["3[a]2[bc]"], "aaabcbc"],
            [["3[a2[c]]"], "accaccacc"],
            [["2[abc]3[cd]ef"], "abcabccdcdcdef"],
        ],
        hidden: [
            [["10[a]"], "aaaaaaaaaa"],
        ],
        hints: ["Use a stack to handle nested brackets.", "Push current string and repeat count when you see '['; pop and repeat on ']'."],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Word Break",
        slug: "word-break",
        order: 20,
        difficulty: "Medium",
        tags: ["Array", "Hash Table", "String", "Dynamic Programming", "Trie", "Memoization"],
        companies: ["Amazon", "Google", "Meta", "Apple"],
        description: `Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.

**Note** that the same word in the dictionary may be reused multiple times in the segmentation.`,
        examples: [
            { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true", explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
            { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true", explanation: "" },
            { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false", explanation: "" },
        ],
        constraints: [
            "1 <= s.length <= 300",
            "1 <= wordDict.length <= 1000",
            "1 <= wordDict[i].length <= 20",
            "s and wordDict[i] consist of only lowercase English letters.",
            "All the strings of wordDict are unique.",
        ],
        functionName: "wordBreak",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter("wordBreak", " * @param {string} s\n * @param {string[]} wordDict", "boolean"),
        tests: [
            [["leetcode", ["leet", "code"]], true],
            [["applepenapple", ["apple", "pen"]], true],
            [["catsandog", ["cats", "dog", "sand", "and", "cat"]], false],
        ],
        hidden: [
            [["aaaaaaa", ["aaaa", "aaa"]], true],
        ],
        hints: ["Use dynamic programming: dp[i] = true if s[0..i) can be segmented.", "For each position, try every dictionary word that ends at that position."],
        timeComplexity: "O(n^2 * m)",
        spaceComplexity: "O(n)",
    }),
];
