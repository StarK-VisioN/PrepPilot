function starters(fn) {
    return fn;
}

const CHALLENGE_STARTERS = {
    "two-sum": starters((fn) => ({
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function ${fn}(nums, target) {
  // Write your code here
}`,
        python: `def ${fn}(nums, target):
    # Write your code here
    pass`,
        java: `class Solution {
    public int[] ${fn}(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
        cpp: `vector<int> ${fn}(vector<int>& nums, int target) {
    // Write your code here
    return {};
}`,
    })),
    "reverse-string": starters((fn) => ({
        javascript: `/**
 * @param {character[]} s
 * @return {character[]}
 */
function ${fn}(s) {
  // Write your code here
}`,
        python: `def ${fn}(s):
    # Write your code here
    pass`,
        java: `class Solution {
    public String[] ${fn}(String[] s) {
        // Write your code here
        return s;
    }
}`,
        cpp: `vector<string> ${fn}(vector<string> s) {
    // Write your code here
    return s;
}`,
    })),
    "valid-parentheses": starters((fn) => ({
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function ${fn}(s) {
  // Write your code here
}`,
        python: `def ${fn}(s):
    # Write your code here
    pass`,
        java: `class Solution {
    public boolean ${fn}(String s) {
        // Write your code here
        return false;
    }
}`,
        cpp: `bool ${fn}(string s) {
    // Write your code here
    return false;
}`,
    })),
    fizzbuzz: starters((fn) => ({
        javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function ${fn}(n) {
  // Write your code here
}`,
        python: `def ${fn}(n):
    # Write your code here
    pass`,
        java: `import java.util.*;

class Solution {
    public List<String> ${fn}(int n) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
        cpp: `vector<string> ${fn}(int n) {
    // Write your code here
    return {};
}`,
    })),
    "palindrome-number": starters((fn) => ({
        javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function ${fn}(x) {
  // Write your code here
}`,
        python: `def ${fn}(x):
    # Write your code here
    pass`,
        java: `class Solution {
    public boolean ${fn}(int x) {
        // Write your code here
        return false;
    }
}`,
        cpp: `bool ${fn}(int x) {
    // Write your code here
    return false;
}`,
    })),
};

function getStartersForChallenge(slug, functionName) {
    const factory = CHALLENGE_STARTERS[slug];
    if (!factory) return null;
    return factory(functionName);
}

module.exports = { getStartersForChallenge };
