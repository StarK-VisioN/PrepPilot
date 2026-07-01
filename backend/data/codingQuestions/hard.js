const { createQuestion, buildJsStarter } = require("./helpers");

module.exports = [
    createQuestion({
        title: "Median of Two Sorted Arrays",
        slug: "median-of-two-sorted-arrays",
        difficulty: "Hard",
        order: 1,
        tags: ["Array", "Binary Search", "Divide and Conquer"],
        companies: ["Google", "Amazon", "Meta", "Microsoft"],
        description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.`,
        examples: [
            {
                input: "nums1 = [1,3], nums2 = [2]",
                output: "2.0",
                explanation: "Merged array = [1,2,3] and median is 2.",
            },
            {
                input: "nums1 = [1,2], nums2 = [3,4]",
                output: "2.5",
                explanation: "Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
            },
        ],
        constraints: [
            "nums1.length == m",
            "nums2.length == n",
            "0 <= m <= 1000",
            "0 <= n <= 1000",
            "1 <= m + n <= 2000",
            "-10^6 <= nums1[i], nums2[i] <= 10^6",
        ],
        functionName: "findMedianSortedArrays",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter(
            "findMedianSortedArrays",
            " * @param {number[]} nums1\n * @param {number[]} nums2",
            "number"
        ),
        tests: [
            [[[1, 3], [2]], 2.0],
            [[[1, 2], [3, 4]], 2.5],
        ],
        hidden: [[[[0, 0], [0, 0]], 0.0]],
        hints: [
            "Binary search on the smaller array to partition both arrays.",
            "Ensure the left partition contains exactly half the total elements.",
            "Compare border elements across partitions to shrink the search range.",
        ],
        timeComplexity: "O(log(min(m, n)))",
        spaceComplexity: "O(1)",
    }),

    createQuestion({
        title: "Merge K Sorted Lists",
        slug: "merge-k-sorted-lists",
        difficulty: "Hard",
        order: 2,
        tags: ["Array", "Heap", "Divide and Conquer", "Merge Sort"],
        companies: ["Amazon", "Meta", "Google", "Microsoft"],
        description: `You are given an array of \`k\` sorted integer arrays \`lists\`.

Merge all the sorted arrays into one sorted array and return it.`,
        examples: [
            {
                input: "lists = [[1,4,5],[1,3,4],[2,6]]",
                output: "[1,1,2,3,4,4,5,6]",
                explanation: "Merging the three sorted arrays produces one sorted list.",
            },
            {
                input: "lists = [[1],[1]]",
                output: "[1,1]",
                explanation: "",
            },
        ],
        constraints: [
            "k == lists.length",
            "0 <= k <= 10^4",
            "0 <= lists[i].length <= 500",
            "-10^4 <= lists[i][j] <= 10^4",
            "lists[i] is sorted in ascending order.",
        ],
        functionName: "mergeKLists",
        expectedInputFormat: "single",
        starterCode: buildJsStarter(
            "mergeKLists",
            " * @param {number[][]} lists",
            "number[]"
        ),
        tests: [
            [[[[1, 4, 5], [1, 3, 4], [2, 6]]], [1, 1, 2, 3, 4, 4, 5, 6]],
            [[[[1], [1]]], [1, 1]],
        ],
        hidden: [ [[[[], [1, 2, 3]]], [1, 2, 3]] ],
        hints: [
            "Use a min-heap to always pick the smallest available head element.",
            "Alternatively, merge pairs of lists repeatedly (divide and conquer).",
            "Handle empty input lists without breaking the merge loop.",
        ],
        timeComplexity: "O(N log k) where N is total elements",
        spaceComplexity: "O(k) for the heap",
    }),

    createQuestion({
        title: "Trapping Rain Water",
        slug: "trapping-rain-water",
        difficulty: "Hard",
        order: 3,
        tags: ["Array", "Two Pointers", "Stack", "Monotonic Stack"],
        companies: ["Amazon", "Google", "Meta"],
        description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
        examples: [
            {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation: "The elevation map traps 6 units of rain water.",
            },
            {
                input: "height = [4,2,0,3,2,5]",
                output: "9",
                explanation: "",
            },
        ],
        constraints: [
            "n == height.length",
            "1 <= n <= 2 * 10^4",
            "0 <= height[i] <= 10^5",
        ],
        functionName: "trap",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("trap", " * @param {number[]} height", "number"),
        tests: [
            [[[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6],
            [[[4, 2, 0, 3, 2, 5]], 9],
        ],
        hidden: [[[[1, 2, 3]], 0]],
        hints: [
            "Water at index i is limited by min(maxLeft, maxRight) - height[i].",
            "Two pointers let you track running left and right maxima in O(n) time.",
            "A monotonic stack can also compute trapped water layer by layer.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1) with two pointers",
    }),

    createQuestion({
        title: "Sliding Window Maximum",
        slug: "sliding-window-maximum",
        difficulty: "Hard",
        order: 4,
        tags: ["Array", "Queue", "Sliding Window", "Monotonic Queue", "Heap"],
        companies: ["Amazon", "Google", "Meta", "Bloomberg"],
        description: `You are given an array of integers \`nums\` and an integer \`k\`.

There is a sliding window of size \`k\` which moves from the very left to the very right of the array. Return the max sliding window values as an array.`,
        examples: [
            {
                input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
                output: "[3,3,5,5,6,7]",
                explanation: "Window positions and their maximums are shown in the classic example.",
            },
            {
                input: "nums = [1], k = 1",
                output: "[1]",
                explanation: "",
            },
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
            "1 <= k <= nums.length",
        ],
        functionName: "maxSlidingWindow",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter(
            "maxSlidingWindow",
            " * @param {number[]} nums\n * @param {number} k",
            "number[]"
        ),
        tests: [
            [[[1, 3, -1, -3, 5, 3, 6, 7], 3], [3, 3, 5, 5, 6, 7]],
            [[[1], 1], [1]],
        ],
        hidden: [[[[1, -1], 1], [1, -1]]],
        hints: [
            "A deque storing indices in decreasing value order tracks the current maximum.",
            "Pop from the back while the new element is greater than deque tail values.",
            "Remove indices that fall outside the current window from the front.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
    }),

    createQuestion({
        title: "Largest Rectangle in Histogram",
        slug: "largest-rectangle-in-histogram",
        difficulty: "Hard",
        order: 5,
        tags: ["Array", "Stack", "Monotonic Stack"],
        companies: ["Google", "Amazon", "Meta"],
        description: `Given an array of integers \`heights\` representing the histogram's bar height where the width of each bar is \`1\`, return the area of the largest rectangle in the histogram.`,
        examples: [
            {
                input: "heights = [2,1,5,6,2,3]",
                output: "10",
                explanation: "The largest rectangle has area 10 (heights 5 and 6).",
            },
            {
                input: "heights = [2,4]",
                output: "4",
                explanation: "",
            },
        ],
        constraints: [
            "1 <= heights.length <= 10^5",
            "0 <= heights[i] <= 10^4",
        ],
        functionName: "largestRectangleArea",
        expectedInputFormat: "single",
        starterCode: buildJsStarter(
            "largestRectangleArea",
            " * @param {number[]} heights",
            "number"
        ),
        tests: [
            [[[2, 1, 5, 6, 2, 3]], 10],
            [[[2, 4]], 4],
        ],
        hidden: [[[[1]], 1]],
        hints: [
            "For each bar, find how far it can extend left and right while remaining the minimum height.",
            "A monotonic increasing stack finds the nearest smaller bar on each side in O(n).",
            "Area for a popped bar uses width between its left and right boundaries.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Serialize and Deserialize Binary Tree",
        slug: "serialize-deserialize-binary-tree",
        difficulty: "Hard",
        order: 6,
        tags: ["String", "Tree", "Breadth-First Search", "Design"],
        companies: ["Meta", "Amazon", "Google", "Microsoft"],
        description: `You are given a binary tree represented as a **level-order array** where \`null\` marks missing nodes (e.g. \`[1,2,3,null,null,4,5]\`).

Implement \`serializeDeserialize(tree)\` that:

1. Serializes the level-order array into a string (or intermediate form).
2. Deserializes it back into a level-order array with the same structure.
3. Returns \`true\` if the deserialized array equals the original structure, otherwise \`false\`.

Compare arrays position by position, including \`null\` placeholders.`,
        examples: [
            {
                input: "tree = [1,2,3,null,null,4,5]",
                output: "true",
                explanation: "Round-trip serialization preserves the tree structure.",
            },
            {
                input: "tree = [1]",
                output: "true",
                explanation: "A single-node tree round-trips correctly.",
            },
        ],
        constraints: [
            "0 <= tree.length <= 10^4",
            "tree[i] is null or an integer in [-10^4, 10^4]",
        ],
        functionName: "serializeDeserialize",
        expectedInputFormat: "single",
        starterCode: buildJsStarter(
            "serializeDeserialize",
            " * @param {Array<number|null>} tree",
            "boolean"
        ),
        tests: [
            [[[1, 2, 3, null, null, 4, 5]], true],
            [[[1]], true],
        ],
        hidden: [[[[1, null, 2]], true]],
        hints: [
            "BFS level-order encoding with a sentinel for null nodes is a natural fit.",
            "When deserializing, rebuild the queue of parent indices as you assign children.",
            "Compare the final level-order array element-wise, including trailing nulls if your format keeps them.",
        ],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "LFU Cache Simulation",
        slug: "lfu-cache-simulation",
        difficulty: "Hard",
        order: 7,
        tags: ["Hash Table", "Linked List", "Design"],
        companies: ["Amazon", "Google"],
        description: `Simulate a **Least Frequently Used (LFU)** cache.

You are given an object \`{ capacity, ops }\` where \`ops\` is an ordered list of operations:

- \`["put", key, value]\` — insert or update a key-value pair. When at capacity, evict the least frequently used key; on ties, evict the least recently used key.
- \`["get", key]\` — return the value if present (and update its frequency), otherwise return \`null\`.

Return an array containing the result of every \`get\` operation in order.`,
        examples: [
            {
                input: 'capacity = 2, ops = [["put",1,1],["put",2,2],["get",1],["put",3,3],["get",2],["put",4,4],["get",1],["get",3],["get",4]]',
                output: "[1,null,null,3,4]",
                explanation: "get(1)->1; put(3,3) evicts key 2; get(2)->null; put(4,4) evicts key 1; get(1)->null; get(3)->3; get(4)->4.",
            },
            {
                input: 'capacity = 1, ops = [["put",1,1],["get",1],["put",2,2],["get",1],["get",2]]',
                output: "[1,null,2]",
                explanation: "Only one slot: put(2,2) evicts key 1.",
            },
        ],
        constraints: [
            "1 <= capacity <= 10^4",
            "0 <= ops.length <= 10^5",
            "ops[i] is [\"put\", key, value] or [\"get\", key]",
            "0 <= key, value <= 10^5",
        ],
        functionName: "lfuCache",
        expectedInputFormat: "single",
        starterCode: buildJsStarter(
            "lfuCache",
            " * @param {{ capacity: number, ops: string[][] }} input",
            "Array<number|null>"
        ),
        tests: [
            [
                [
                    {
                        capacity: 2,
                        ops: [
                            ["put", 1, 1],
                            ["put", 2, 2],
                            ["get", 1],
                            ["put", 3, 3],
                            ["get", 2],
                            ["put", 4, 4],
                            ["get", 1],
                            ["get", 3],
                            ["get", 4],
                        ],
                    },
                ],
                [1, null, null, 3, 4],
            ],
            [
                [
                    {
                        capacity: 1,
                        ops: [
                            ["put", 1, 1],
                            ["get", 1],
                            ["put", 2, 2],
                            ["get", 1],
                            ["get", 2],
                        ],
                    },
                ],
                [1, null, 2],
            ],
        ],
        hidden: [
            [
                [
                    {
                        capacity: 3,
                        ops: [
                            ["put", 2, 2],
                            ["put", 1, 1],
                            ["get", 2],
                            ["get", 1],
                            ["get", 2],
                        ],
                    },
                ],
                [2, 1, 2],
            ],
        ],
        hints: [
            "Track frequency buckets mapping freq -> set of keys (with LRU order within a bucket).",
            "On get/put, move the key to the next frequency bucket and update minFreq when needed.",
            "Use a Map for O(1) key lookup storing value, frequency, and recency metadata.",
        ],
        timeComplexity: "O(1) per operation",
        spaceComplexity: "O(capacity)",
    }),

    createQuestion({
        title: "N-Queens Count",
        slug: "n-queens-count",
        difficulty: "Hard",
        order: 8,
        tags: ["Backtracking"],
        companies: ["Google", "Amazon", "Meta"],
        description: `The **n-queens** puzzle is the problem of placing \`n\` queens on an \`n x n\` chessboard such that no two queens attack each other.

Given an integer \`n\`, return the number of distinct solutions.`,
        examples: [
            {
                input: "n = 4",
                output: "2",
                explanation: "There are two distinct solutions to the 4-queens puzzle.",
            },
            {
                input: "n = 1",
                output: "1",
                explanation: "A single queen on a 1x1 board has one solution.",
            },
        ],
        constraints: [
            "1 <= n <= 9",
        ],
        functionName: "totalNQueens",
        expectedInputFormat: "single",
        starterCode: buildJsStarter("totalNQueens", " * @param {number} n", "number"),
        tests: [
            [[4], 2],
            [[1], 1],
        ],
        hidden: [[[8], 92]],
        hints: [
            "Place queens row by row and skip columns under attack.",
            "Track occupied columns and both diagonal directions with sets or bitmasks.",
            "Backtrack when a row has no valid column; count complete placements.",
        ],
        timeComplexity: "O(n!)",
        spaceComplexity: "O(n)",
    }),

    createQuestion({
        title: "Edit Distance",
        slug: "edit-distance",
        difficulty: "Hard",
        order: 9,
        tags: ["String", "Dynamic Programming"],
        companies: ["Google", "Amazon", "Meta", "Microsoft"],
        description: `Given two strings \`word1\` and \`word2\`, return the minimum number of operations required to convert \`word1\` to \`word2\`.

You have the following three operations permitted on a word:

- Insert a character
- Delete a character
- Replace a character`,
        examples: [
            {
                input: 'word1 = "horse", word2 = "ros"',
                output: "3",
                explanation: "horse -> rorse -> rose -> ros (3 operations).",
            },
            {
                input: 'word1 = "intention", word2 = "execution"',
                output: "5",
                explanation: "",
            },
        ],
        constraints: [
            "0 <= word1.length, word2.length <= 500",
            "word1 and word2 consist of lowercase English letters.",
        ],
        functionName: "minDistance",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter(
            "minDistance",
            " * @param {string} word1\n * @param {string} word2",
            "number"
        ),
        tests: [
            [["horse", "ros"], 3],
            [["intention", "execution"], 5],
        ],
        hidden: [[["", "a"], 1]],
        hints: [
            "dp[i][j] is the edit distance between the first i chars of word1 and first j chars of word2.",
            "If characters match, dp[i][j] = dp[i-1][j-1]; otherwise take 1 + min(insert, delete, replace).",
            "Initialize first row/column for conversions to or from an empty string.",
        ],
        timeComplexity: "O(m * n)",
        spaceComplexity: "O(m * n), reducible to O(min(m, n))",
    }),

    createQuestion({
        title: "Word Ladder",
        slug: "word-ladder",
        difficulty: "Hard",
        order: 10,
        tags: ["String", "Hash Table", "Breadth-First Search"],
        companies: ["Amazon", "Meta", "LinkedIn", "Google"],
        description: `A **transformation sequence** from \`beginWord\` to \`endWord\` is a sequence of words where:

- Only one letter differs between adjacent words.
- Every word in the sequence is in \`wordList\`.
- \`beginWord\` does not need to be in \`wordList\`.

Given \`beginWord\`, \`endWord\`, and \`wordList\`, return the length of the shortest transformation sequence from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.`,
        examples: [
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
                output: "5",
                explanation: "hit -> hot -> dot -> dog -> cog is one shortest path (5 words).",
            },
            {
                input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","lot"]',
                output: "0",
                explanation: "endWord is not reachable from beginWord.",
            },
        ],
        constraints: [
            "1 <= beginWord.length <= 10",
            "endWord.length == beginWord.length",
            "1 <= wordList.length <= 5000",
            "wordList[i].length == beginWord.length",
            "beginWord, endWord, and wordList[i] consist of lowercase English letters.",
            "beginWord != endWord",
            "All words in wordList are unique.",
        ],
        functionName: "ladderLength",
        expectedInputFormat: "spread",
        starterCode: buildJsStarter(
            "ladderLength",
            " * @param {string} beginWord\n * @param {string} endWord\n * @param {string[]} wordList",
            "number"
        ),
        tests: [
            [
                ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
                5,
            ],
            [["hit", "cog", ["hot", "dot", "lot"]], 0],
        ],
        hidden: [[["a", "c", ["a", "b", "c"]], 2]],
        hints: [
            "BFS from beginWord explores words one transformation away at each level.",
            "Pre-build a pattern -> words map (e.g. *ot -> hot, dot, lot) for fast neighbor lookup.",
            "Return 0 immediately if endWord is not in wordList.",
        ],
        timeComplexity: "O(M^2 * N) where M is word length and N is list size",
        spaceComplexity: "O(M * N)",
    }),
];
