function valueToJavaLiteral(value) {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return Number.isInteger(value) ? `${value}` : `${value}`;
    if (typeof value === "string") {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return "new int[]{}";
        const allNumbers = value.every((v) => typeof v === "number");
        const allStrings = value.every((v) => typeof v === "string");
        if (allNumbers) return `new int[]{${value.join(", ")}}`;
        if (allStrings) {
            return `new String[]{${value.map((v) => valueToJavaLiteral(v)).join(", ")}}`;
        }
        return `new Object[]{${value.map((v) => valueToJavaLiteral(v)).join(", ")}}`;
    }
    throw new Error("Unsupported test case value for Java harness");
}

function valueToCppLiteral(value) {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return `${value}`;
    if (typeof value === "string") {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    if (Array.isArray(value)) {
        if (value.every((v) => typeof v === "number")) {
            return `{${value.join(", ")}}`;
        }
        if (value.every((v) => typeof v === "string")) {
            return `{${value.map((v) => valueToCppLiteral(v)).join(", ")}}`;
        }
    }
    throw new Error("Unsupported test case value for C++ harness");
}

const JAVA_JSON_SERIALIZER = `
    static String toJson(Object value) {
        if (value == null) return "null";
        if (value instanceof Boolean) return ((Boolean) value) ? "true" : "false";
        if (value instanceof Integer || value instanceof Long || value instanceof Double || value instanceof Float) {
            return String.valueOf(value);
        }
        if (value instanceof String) {
            return "\\"" + ((String) value).replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";
        }
        if (value instanceof int[]) {
            int[] arr = (int[]) value;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (value instanceof String[]) {
            String[] arr = (String[]) value;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(arr[i]));
            }
            sb.append("]");
            return sb.toString();
        }
        if (value instanceof java.util.List) {
            java.util.List<?> list = (java.util.List<?>) value;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        }
        return String.valueOf(value);
    }
`;

const CPP_JSON_HELPERS = `
string jsonEscape(const string& s) {
    string out = "\\"";
    for (char c : s) {
        if (c == '\\\\' || c == '\\"') out += '\\\\';
        out += c;
    }
    out += "\\"";
    return out;
}

template<typename T>
string toJson(const T& value);

template<>
string toJson<bool>(const bool& value) {
    return value ? "true" : "false";
}

template<>
string toJson<int>(const int& value) {
    return to_string(value);
}

template<>
string toJson<string>(const string& value) {
    return jsonEscape(value);
}

template<>
string toJson<vector<int>>(const vector<int>& value) {
    string out = "[";
    for (size_t i = 0; i < value.size(); i++) {
        if (i > 0) out += ",";
        out += to_string(value[i]);
    }
    out += "]";
    return out;
}

template<>
string toJson<vector<string>>(const vector<string>& value) {
    string out = "[";
    for (size_t i = 0; i < value.size(); i++) {
        if (i > 0) out += ",";
        out += toJson(value[i]);
    }
    out += "]";
    return out;
}
`;

function detectJavaEntryClass(userCode) {
    if (/class\s+Main\b/.test(userCode)) return "Main";
    if (/class\s+Solution\b/.test(userCode)) return "Solution";
    return "Main";
}

function wrapJavaUserCode(userCode) {
    const trimmed = userCode.trim();
    if (/class\s+(Main|Solution)\b/.test(trimmed)) {
        return trimmed;
    }
    return `public class Main {\n${trimmed}\n}`;
}

function buildJavaHarness(userCode, functionName, args) {
    const wrapped = wrapJavaUserCode(userCode);
    const entryClass = detectJavaEntryClass(wrapped);

    let invocation;
    if (entryClass === "Solution") {
        const argList = args.map((arg) => valueToJavaLiteral(arg)).join(", ");
        invocation = `new Solution().${functionName}(${argList})`;
    } else {
        const hasStaticMethod = new RegExp(
            `static\\s+[\\w\\<\\>\\[\\],\\s]+\\s+${functionName}\\s*\\(`
        ).test(wrapped);
        const argList = args.map((arg) => valueToJavaLiteral(arg)).join(", ");
        invocation = hasStaticMethod
            ? `Main.${functionName}(${argList})`
            : `new Main().${functionName}(${argList})`;
    }

    const mainMethod = `
    public static void main(String[] args) throws Exception {
        Object result = ${invocation};
        System.out.print(toJson(result));
    }
${JAVA_JSON_SERIALIZER}`;

    if (entryClass === "Solution") {
        return {
            files: [
                { name: "Solution.java", content: wrapped },
                {
                    name: "RunMain.java",
                    content: `class RunMain {
    public static void main(String[] args) throws Exception {
        Object result = ${invocation};
        System.out.print(toJson(result));
    }
${JAVA_JSON_SERIALIZER}
}`,
                },
            ],
        };
    }

    if (/public\s+static\s+void\s+main\s*\(/.test(wrapped)) {
        return { files: [{ name: "Main.java", content: wrapped }] };
    }

    const lastBrace = wrapped.lastIndexOf("}");
    const mainContent = `${wrapped.slice(0, lastBrace)}${mainMethod}\n}`;

    return {
        files: [{ name: "Main.java", content: mainContent }],
    };
}

function buildJavascriptHarness(userCode, functionName, args) {
    const argsLiteral = JSON.stringify(args);
    return {
        files: [
            {
                name: "main.js",
                content: `${userCode}
if (typeof ${functionName} !== "function") {
  throw new Error("Function '${functionName}' is not defined");
}
const __args__ = ${argsLiteral};
const __result__ = ${functionName}(...__args__);
console.log(JSON.stringify(__result__));
`,
            },
        ],
    };
}

function buildPythonHarness(userCode, functionName, args) {
    const argsLiteral = JSON.stringify(args);
    return {
        files: [
            {
                name: "main.py",
                content: `import json

${userCode}

__args__ = ${argsLiteral}
_fn__ = globals().get("${functionName}")
if _fn__ is None or not callable(_fn__):
    raise Exception("Function '${functionName}' is not defined")
__result__ = _fn__(*__args__)
print(json.dumps(__result__), end="")
`,
            },
        ],
    };
}

function buildCppHarness(userCode, functionName, args) {
    const argList = args.map((arg) => valueToCppLiteral(arg)).join(", ");
    const needsIncludes = !/#include/.test(userCode);

    return {
        files: [
            {
                name: "main.cpp",
                content: `${needsIncludes ? "#include <bits/stdc++.h>\nusing namespace std;\n\n" : ""}${userCode}

${CPP_JSON_HELPERS}

int main() {
    auto result = ${functionName}(${argList});
    cout << toJson(result);
    return 0;
}
`,
            },
        ],
    };
}

function buildHarness(language, { userCode, functionName, args }) {
    switch (language) {
        case "javascript":
            return buildJavascriptHarness(userCode, functionName, args);
        case "python":
            return buildPythonHarness(userCode, functionName, args);
        case "java":
            return buildJavaHarness(userCode, functionName, args);
        case "cpp":
            return buildCppHarness(userCode, functionName, args);
        default:
            throw new Error(`Unsupported Language: ${language}`);
    }
}

module.exports = {
    buildHarness,
    valueToJavaLiteral,
    valueToCppLiteral,
};
