/**
 * MIND//MIND Cyber Arena - Master Question Set 1 (SET 1 (ALPHA))
 * Round 1: 15 Visual / Logical / Code Decoding Puzzles (Original Set 1 + Merged Set 3 + 7 Added High-Yield Questions)
 * Round 2: 16 Bug Hunting Error Traps (Original Set 1 + Merged Set 4)
 * Round 3: 16 Buzzer Blitz Speed Questions (Original Set 1 + Merged Set 4)
 */

const QUESTION_SET_1 = {
  "id": "set1",
  "name": "SET 1 (ALPHA)",
  "description": "15 Visual Puzzles, 16 Syntax Bug Traps, and 16 Blitz Buzzer Challenges across C, Python, HTML & Logic",
  "round1": [
    // 1 to 4: Original Set 1
    {
      "id": "v1_1",
      "category": "Logical Reasoning",
      "title": "Five-Chair Linear Seating Arrangement",
      "instruction": "Five colleagues—Aaron, Blake, Chloe, Dylan, and Elena—are seated in a straight row of 5 consecutive chairs numbered 1 to 5 from left to right, facing the presenter.\n\nClues:\n1. Aaron is seated at Chair 2.\n2. Chloe is seated immediately to the right of Aaron.\n3. Dylan is seated on an odd-numbered chair.\n4. Elena is not seated at either extreme end of the row (neither Chair 1 nor Chair 5).\n5. Blake is seated somewhere to the left of Elena, but not adjacent to her.\n\nWhich chair is Dylan seated on?",
      "options": [
        "Chair 5",
        "Chair 1",
        "Chair 3",
        "Chair 4"
      ],
      "correctIndex": 0,
      "hint": "Start with Aaron at Chair 2, place Chloe next to him at Chair 3, then see where Elena can sit without being on Chair 1 or 5.",
      "explanation": "Aaron is at Chair 2 and Chloe is at Chair 3. Elena cannot sit at Chair 1 or 5, so she must sit at Chair 4. Blake must sit to Elena's left without being adjacent, leaving Blake at Chair 1. Dylan takes the remaining Chair 5.",
      "timeLimit": 270
    },
    {
      "id": "v1_2",
      "category": "C Programming",
      "title": "Variable Value Swapping Trace",
      "instruction": "Trace the variable swapping code below in C. What value does printf(\"%d\", a) display at the end of execution?",
      "steps": [
        "int a = 10;",
        "int b = 25;",
        "int temp = a;",
        "a = b;",
        "b = temp;",
        "printf(\"%d\", a);"
      ],
      "options": [
        "10",
        "25",
        "35",
        "0"
      ],
      "correctIndex": 1,
      "hint": "'a' receives the value of 'b' during the swap.",
      "explanation": "Variable 'temp' saves the initial value of 'a' (10). Then 'a = b' updates 'a' to 25. Thus, printf('%d', a) prints 25.",
      "timeLimit": 150
    },
    {
      "id": "v1_3",
      "category": "Python",
      "title": "First & Last Character Concatenation",
      "instruction": "Trace the Python string indexing below. What does print(result) display?",
      "steps": [
        "word = \"PYTHON\"",
        "first_char = word[0]",
        "last_char = word[-1]",
        "result = first_char + last_char",
        "print(result)"
      ],
      "options": [
        "\"PY\"",
        "\"PO\"",
        "\"PN\"",
        "\"ON\""
      ],
      "correctIndex": 2,
      "hint": "word[0] is the very first letter; word[-1] is the very last letter.",
      "explanation": "word[0] extracts 'P' and word[-1] extracts 'N'. Concatenating them produces 'PN'.",
      "timeLimit": 150
    },
    {
      "id": "v1_4",
      "category": "Logical Reasoning",
      "title": "Night Bridge & Flashlight Crossing Puzzle",
      "instruction": "Four engineers—Alpha, Beta, Gamma, and Delta—must cross a narrow suspension bridge at night.\n\nConstraints:\n1. The bridge can support at most two people at a time.\n2. Any group crossing the bridge must carry the single shared flashlight.\n3. Two people crossing together always walk at the speed of the slower person.\n\nCrossing times for each individual:\n- Alpha: 1 minute\n- Beta: 2 minutes\n- Gamma: 7 minutes\n- Delta: 10 minutes\n\nWhat is the minimum total time required for all four engineers to reach the other side?",
      "options": [
        "19 minutes",
        "20 minutes",
        "15 minutes",
        "17 minutes"
      ],
      "correctIndex": 3,
      "hint": "Sending the two slowest people (Gamma and Delta) together saves time, but Beta must return with the torch instead of Alpha.",
      "explanation": "The optimal strategy crosses Alpha & Beta (2 min), returns Alpha (1 min), crosses Gamma & Delta together (10 min), returns Beta (2 min), and finally crosses Alpha & Beta again (2 min). Total: 2 + 1 + 10 + 2 + 2 = 17 minutes.",
      "timeLimit": 300
    },

    // 5 to 8: Merged from Set 3
    {
      "id": "v1_5",
      "category": "Logical Reasoning",
      "title": "Knights & Knaves Truth-Tellers Island Puzzle",
      "instruction": "On a mysterious island, every native inhabitant is either a Knight (who always tells the truth) or a Knave (who always lies).\n\nYou meet three inhabitants: Alex, Ben, and Cole.\n\nStatements:\n1. Alex makes the statement: 'All three of us are Knaves.'\n2. Ben then makes the statement: 'Exactly one of us is a Knight.'\n\nWhat are the true identities of Alex, Ben, and Cole?",
      "options": [
        "Alex is a Knave, Ben is a Knight, Cole is a Knave",
        "Alex is a Knight, Ben is a Knave, Cole is a Knave",
        "All three are Knaves",
        "Alex is a Knave, Ben is a Knave, Cole is a Knight"
      ],
      "correctIndex": 0,
      "hint": "Can a Knight ever say 'I am a Knave' or 'All of us are Knaves'?",
      "explanation": "Alex cannot be a Knight because a Knight cannot truthfully claim all are Knaves. So Alex is a Knave, meaning at least one inhabitant is a Knight. If Ben is that Knight, his statement that exactly one is a Knight holds true, leaving Cole as a Knave.",
      "timeLimit": 270
    },
    {
      "id": "v1_6",
      "category": "C Programming",
      "title": "Pointer Dereference Value Assignment",
      "instruction": "Trace the pointer dereference below in C. What value does printf(\"%d\", num) output?",
      "steps": [
        "int num = 10;",
        "int *p = &num;",
        "*p = 50;",
        "printf(\"%d\", num);"
      ],
      "options": [
        "10",
        "50",
        "0",
        "Garbage value"
      ],
      "correctIndex": 1,
      "hint": "Dereferencing *p directly accesses and modifies the memory location of num.",
      "explanation": "'*p = 50' writes the value 50 directly into the memory location of 'num'. Therefore, num becomes 50.",
      "timeLimit": 150
    },
    {
      "id": "v1_7",
      "category": "Python",
      "title": "Range Generation & List Length Trace",
      "instruction": "Trace the Python range() function below. What does print(len(numbers)) display?",
      "steps": [
        "numbers = list(range(1, 5))",
        "print(len(numbers))"
      ],
      "options": [
        "5",
        "3",
        "4",
        "1"
      ],
      "correctIndex": 2,
      "hint": "range(1, 5) generates values 1, 2, 3, and 4 (stopping strictly before 5).",
      "explanation": "range(1, 5) produces the four numbers: 1, 2, 3, 4. Converting to a list yields [1, 2, 3, 4], which has a length of 4.",
      "timeLimit": 150
    },
    {
      "id": "v1_8",
      "category": "Logical Reasoning",
      "title": "Multi-Inlet Reservoir Filling & Drain Rates",
      "instruction": "A large water reservoir is equipped with two inlet pipes (Pipe A and Pipe B) and one bottom drain valve (Drain C).\n\nFlow characteristics:\n- Pipe A alone can fill the empty reservoir in 12 hours.\n- Pipe B alone can fill the empty reservoir in 15 hours.\n- Drain C alone can completely empty a full reservoir in 20 hours.\n\nIf the reservoir is initially completely empty and all three—Pipe A, Pipe B, and Drain C—are opened simultaneously, how many hours will it take to fill the reservoir completely?",
      "options": [
        "12 hours",
        "8 hours",
        "14 hours",
        "10 hours"
      ],
      "correctIndex": 3,
      "hint": "Find the net rate per hour by adding the filling rates of Pipes A and B, then subtracting the drain rate of C.",
      "explanation": "Assuming a capacity of 60 units: Pipe A fills 5 units/hr, Pipe B fills 4 units/hr, and Drain C empties 3 units/hr. Net rate = 5 + 4 - 3 = 6 units/hr. Total time = 60 / 6 = 10 hours.",
      "timeLimit": 270
    },

    // 9 & 10: Med-High Difficulty Questions
    {
      "id": "v1_9",
      "category": "C Programming",
      "title": "Recursive State Accumulator & Modulo Decision Tree",
      "instruction": "Analyze the recursive C function mystery() below. Trace the function execution for mystery(12, 3). What integer value does printf(\"%d\", result) output to the terminal?",
      "steps": [
        "int mystery(int n, int k) {",
        "    if (n <= 0) return 0;",
        "    if (n % 2 == 0) {",
        "        return k + mystery(n / 2, k * 2);",
        "    } else {",
        "        return mystery(n - 1, k) - k;",
        "    }",
        "}",
        "int result = mystery(12, 3);",
        "printf(\"%d\", result);"
      ],
      "options": [
        "-15",
        "18",
        "-24",
        "9"
      ],
      "correctIndex": 0,
      "hint": "Unwind the call stack: n=12 (even), n=6 (even), n=3 (odd), n=2 (even), n=1 (odd), n=0 (base).",
      "explanation": "Stack trace: mystery(12,3) = 3 + mystery(6,6); mystery(6,6) = 6 + mystery(3,12); mystery(3,12) = mystery(2,12) - 12; mystery(2,12) = 12 + mystery(1,24); mystery(1,24) = mystery(0,24) - 24 = -24. Returning up: 12 + (-24) = -12; -12 - 12 = -24; 6 + (-24) = -18; 3 + (-18) = -15.",
      "timeLimit": 210
    },
    {
      "id": "v1_10",
      "category": "Python",
      "title": "Late-Binding Closure Scope & Multiplier List Evaluation",
      "instruction": "In Python, anonymous functions created in loops bind variables from the enclosing scope by reference. What value does print(sum(output)) display?",
      "steps": [
        "def build_multipliers():",
        "    return [lambda x: i * x for i in range(4)]",
        "",
        "multipliers = build_multipliers()",
        "output = [func(2) for func in multipliers]",
        "print(sum(output))"
      ],
      "options": [
        "24",
        "12",
        "6",
        "16"
      ],
      "correctIndex": 0,
      "hint": "What is the final value of variable 'i' after the loop completes when each lambda is called?",
      "explanation": "Python's closures are late-binding: 'i' is looked up when each lambda is invoked, at which point i = 3 for all 4 functions. Each func(2) evaluates to 3 * 2 = 6. The list output is [6, 6, 6, 6], whose sum is 6 * 4 = 24.",
      "timeLimit": 180
    },

    // 11 to 15: Easy-Med Difficulty Questions
    {
      "id": "v1_11",
      "category": "Python",
      "title": "Reversed Substring Slice Traversal with Negative Step",
      "instruction": "Trace Python string slicing with a negative step below. What does print(slice_result) display?",
      "steps": [
        "text = \"PLACEMENT2026\"",
        "slice_result = text[8:2:-2]",
        "print(slice_result)"
      ],
      "options": [
        "\"TEE\"",
        "\"TEN\"",
        "\"TME\"",
        "\"TEEA\""
      ],
      "correctIndex": 0,
      "hint": "text[8] is 'T', stepping backward by 2 takes index 6 ('E') and index 4 ('E'). Stop index 2 is excluded.",
      "explanation": "text[8:2:-2] starts at index 8 ('T'), decrements by 2 collecting index 6 ('E') and index 4 ('E'), stopping strictly before index 2. Result is 'TEE'.",
      "timeLimit": 150
    },
    {
      "id": "v1_12",
      "category": "C Programming",
      "title": "Bitwise XOR Difference & Arithmetic Left-Shift",
      "instruction": "Trace the bitwise logic manipulation in C below. What value does printf(\"%d\", z) display?",
      "steps": [
        "int x = 12; // Binary: 0000 1100",
        "int y = 5;  // Binary: 0000 0101",
        "int z = (x ^ y) << 1;",
        "printf(\"%d\", z);"
      ],
      "options": [
        "18",
        "9",
        "24",
        "14"
      ],
      "correctIndex": 0,
      "hint": "12 ^ 5 computes bitwise XOR. Then << 1 multiplies by 2.",
      "explanation": "12 ^ 5 in binary is 1100 ^ 0101 = 1001 (decimal 9). 9 << 1 shifts bits left by 1 position, multiplying 9 by 2 to yield 18.",
      "timeLimit": 150
    },
    {
      "id": "v1_13",
      "category": "Logical Reasoning",
      "title": "Drone Waypoint Flight Path & Pythagorean Displacement",
      "instruction": "An autonomous surveillance drone departs from Launch Station O and follows three successive straight-line flight legs:\n\nFlight Legs:\n1. Leg 1: Flies 15 km directly North to Waypoint Alpha.\n2. Leg 2: Makes a 90° right turn and flies 9 km directly East to Waypoint Bravo.\n3. Leg 3: Makes another 90° right turn and flies 3 km directly South to Final Waypoint Charlie.\n\nWhat is the shortest straight-line Euclidean distance (displacement) from Launch Station O to Final Waypoint Charlie?",
      "options": [
        "15 km",
        "21 km",
        "17 km",
        "12 km"
      ],
      "correctIndex": 0,
      "hint": "Calculate the net North-South displacement and East-West displacement, then apply the Pythagorean theorem.",
      "explanation": "Net North displacement = 15 - 3 = 12 km North. Net East displacement = 9 km East. By the Pythagorean theorem: sqrt(12^2 + 9^2) = sqrt(144 + 81) = sqrt(225) = 15 km.",
      "timeLimit": 180
    },
    {
      "id": "v1_14",
      "category": "C Programming",
      "title": "Contiguous Array Pointer Offset Differential",
      "instruction": "Trace pointer arithmetic on contiguous memory in C below. What value does printf(\"%d\", ans) display?",
      "steps": [
        "int arr[] = {10, 20, 30, 40, 50};",
        "int *ptr = arr + 2;",
        "int forward_val = *(ptr + 1);",
        "int backward_val = *(ptr - 1);",
        "int ans = forward_val - backward_val;",
        "printf(\"%d\", ans);"
      ],
      "options": [
        "20",
        "10",
        "30",
        "0"
      ],
      "correctIndex": 0,
      "hint": "ptr points to arr[2] (value 30). *(ptr + 1) is arr[3] and *(ptr - 1) is arr[1].",
      "explanation": "ptr points to arr[2]. ptr + 1 references arr[3] (40). ptr - 1 references arr[1] (20). ans = 40 - 20 = 20.",
      "timeLimit": 150
    },
    {
      "id": "v1_15",
      "category": "Python",
      "title": "Dictionary Inversion & Filtered Key Lookup",
      "instruction": "Trace the dictionary comprehension and fallback lookup below. What does print(result) display?",
      "steps": [
        "items = {\"a\": 2, \"b\": 3, \"c\": 4}",
        "lookup = {v: k for k, v in items.items() if v % 2 == 0}",
        "result = lookup.get(4, \"NA\") + lookup.get(3, \"NA\")",
        "print(result)"
      ],
      "options": [
        "\"cNA\"",
        "\"cb\"",
        "\"NA\"",
        "\"c3\""
      ],
      "correctIndex": 0,
      "hint": "Only even values (2 and 4) enter lookup: {2: 'a', 4: 'c'}. Key 3 is not found so get() returns 'NA'.",
      "explanation": "lookup filters for even values (2 and 4), creating {2: 'a', 4: 'c'}. lookup.get(4) returns 'c'. lookup.get(3) fails to find key 3 and returns 'NA'. Concatenating 'c' + 'NA' produces 'cNA'.",
      "timeLimit": 150
    }
  ],
  "round2": [
    // 1 to 8: Original Set 1 Bugs
    {
      "id": "b1_1",
      "category": "C Programming",
      "title": "Variable Initialization Module",
      "scenario": "The C compiler aborts build with 'expected ; before return'. Identify the defective line.",
      "codeLines": [
        "int main() {",
        "    int score = 100",
        "    return 0;",
        "}"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "Every variable declaration and statement in C must end with a semicolon ';'. Line 2 is missing ';'.",
      "fixOptions": [
        "Add a semicolon: 'int score = 100;'",
        "Change 'main()' to 'void main'",
        "Remove 'return 0;'",
        "Change 'int' to 'var'"
      ],
      "correctFixIndex": 0,
      "hint": "Check the end of statement lines for required C punctuation.",
      "timeLimit": 160
    },
    {
      "id": "b1_2",
      "category": "Python",
      "title": "User Message Formatter",
      "scenario": "Running this code crashes with 'TypeError: can only concatenate str to str'. Locate the defective line.",
      "codeLines": [
        "age = 20",
        "message = \"Age: \" + age",
        "print(message)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, you cannot directly concatenate a string and an integer using '+'. The integer must be converted using str(age).",
      "fixOptions": [
        "Change age = 20 to age = [20]",
        "Convert age to string: 'message = \"Age: \" + str(age)'",
        "Use minus instead: 'message = \"Age: \" - age'",
        "Remove quotes around 'Age: '"
      ],
      "correctFixIndex": 1,
      "hint": "Python will not implicitly convert an integer to a string when using '+'.",
      "timeLimit": 160
    },
    {
      "id": "b1_3",
      "category": "C Programming",
      "title": "Security Access Gatekeeper",
      "scenario": "The system prints 'Unlocked' unconditionally even when passkey is 0. Locate the defective line.",
      "codeLines": [
        "int passkey = 0;",
        "if (passkey = 1) {",
        "    printf(\"Unlocked\\n\");",
        "}"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "'passkey = 1' is an assignment that sets passkey to 1 (true). Comparison requires double equals '=='.",
      "fixOptions": [
        "Change passkey = 0 to passkey = 1",
        "Wrap passkey in double quotes",
        "Use comparison operator: 'if (passkey == 1)'",
        "Replace '1' with 'true'"
      ],
      "correctFixIndex": 2,
      "hint": "In C, '=' assigns a value while '==' checks for equality.",
      "timeLimit": 160
    },
    {
      "id": "b1_4",
      "category": "Basic HTML",
      "title": "Profile Avatar Card Component",
      "scenario": "The profile image fails to load and display in the browser. Identify the defective line.",
      "codeLines": [
        "<div class=\"card\">",
        "    <h2>Profile</h2>",
        "    <img href=\"photo.jpg\" alt=\"Profile Photo\">",
        "</div>"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "In HTML, <img> elements specify the file path via the 'src' (source) attribute, not 'href'.",
      "fixOptions": [
        "Change '<img' to '<picture'",
        "Remove the 'alt' attribute",
        "Wrap the image in a <span> tag",
        "Change 'href' to 'src': '<img src=\"photo.jpg\" alt=\"Profile Photo\">'"
      ],
      "correctFixIndex": 3,
      "hint": "Which attribute points to the image file source?",
      "timeLimit": 160
    },
    {
      "id": "b1_5",
      "category": "Python",
      "title": "Exam Score Assessment Script",
      "scenario": "The Python interpreter halts execution with 'SyntaxError: expected \":\"'. Identify the defective line.",
      "codeLines": [
        "score = 85",
        "if score >= 50",
        "    print(\"Passed\")"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, header statements like 'if', 'for', 'while', and 'def' must end with a colon ':'.",
      "fixOptions": [
        "Add a colon at the end: 'if score >= 50:'",
        "Add curly braces around 'print(\"Passed\")'",
        "Change 'if' to 'when'",
        "Wrap score >= 50 in square brackets"
      ],
      "correctFixIndex": 0,
      "hint": "What character must always end an if condition line in Python?",
      "timeLimit": 160
    },
    {
      "id": "b1_6",
      "category": "C Programming",
      "title": "Terminal Age Input Routine",
      "scenario": "The program encounters an unexpected segmentation fault when capturing terminal input. Identify the defective line.",
      "codeLines": [
        "int age;",
        "printf(\"Enter your age: \");",
        "scanf(\"%d\", age);"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "scanf requires a pointer to store the user input. Passing 'age' instead of '&age' causes undefined behavior or a crash.",
      "fixOptions": [
        "Change '%d' to '%s'",
        "Pass address with ampersand: 'scanf(\"%d\", &age);'",
        "Initialize age to 100",
        "Replace scanf with gets()"
      ],
      "correctFixIndex": 1,
      "hint": "Which operator provides the memory address of a variable in C?",
      "timeLimit": 160
    },
    {
      "id": "b1_7",
      "category": "Basic HTML",
      "title": "Arena Hero Banner Section",
      "scenario": "Paragraph text is unexpectedly inheriting large header font styling across the layout. Identify the defective line.",
      "codeLines": [
        "<div class=\"header\">",
        "    <h1>Welcome to Cyber Arena",
        "    <p>Please enter your credentials to begin.</p>",
        "</div>"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "The <h1> opening tag is missing its matching </h1> closing tag.",
      "fixOptions": [
        "Change 'div' to 'section'",
        "Remove the <p> paragraph tag",
        "Close the heading: '<h1>Welcome to Cyber Arena</h1>'",
        "Change '<h1>' to '<header>'"
      ],
      "correctFixIndex": 2,
      "hint": "Every opened <h1> tag must be closed with </h1>.",
      "timeLimit": 160
    },
    {
      "id": "b1_8",
      "category": "Python",
      "title": "Greeting Dispatcher Utility",
      "scenario": "Running this code triggers 'IndentationError: expected an indented block'. Identify the unindented line.",
      "codeLines": [
        "def greet(name):",
        "print(\"Hello, \" + name)",
        "greet(\"Alex\")"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, the body of a function must be indented (typically with 4 spaces).",
      "fixOptions": [
        "Add a semicolon after greet(name):",
        "Wrap the function in curly brackets { }",
        "Change 'def' to 'function'",
        "Indent the function body: '    print(\"Hello, \" + name)'"
      ],
      "correctFixIndex": 3,
      "hint": "Python uses indentation to define code blocks inside functions.",
      "timeLimit": 160
    },

    // 9 to 16: Merged from Set 4 Bugs
    {
      "id": "b1_9",
      "category": "C Programming",
      "title": "Conditional Pass Status Checker",
      "scenario": "The passing message prints unconditionally even when the score is below the threshold. Identify the defective line.",
      "codeLines": [
        "int score = 20;",
        "if (score >= 50);",
        "    printf(\"Passed\\n\");"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "A semicolon placed immediately after the if condition creates an empty statement, causing the following printf to run unconditionally.",
      "fixOptions": [
        "Remove the stray semicolon: 'if (score >= 50)'",
        "Change score = 20 to score = 50",
        "Add a semicolon after printf",
        "Change 'printf' to 'scanf'"
      ],
      "correctFixIndex": 0,
      "hint": "Does an if condition header in C end with a semicolon?",
      "timeLimit": 160
    },
    {
      "id": "b1_10",
      "category": "Python",
      "title": "Player Profile Registry",
      "scenario": "The Python interpreter throws 'SyntaxError: invalid decimal literal'. Identify the line violating syntax rules.",
      "codeLines": [
        "total = 10",
        "1st_name = \"Alex\"",
        "print(1st_name)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, variable names cannot start with a number. '1st_name' is an invalid identifier.",
      "fixOptions": [
        "Wrap 10 in quotes: '10'",
        "Rename variable to start with a letter: 'first_name = \"Alex\"'",
        "Add semicolons to every line",
        "Change double quotes to single quotes"
      ],
      "correctFixIndex": 1,
      "hint": "Can a variable name in Python start with a number?",
      "timeLimit": 160
    },
    {
      "id": "b1_11",
      "category": "Basic HTML",
      "title": "Dashboard Navigation Link",
      "scenario": "The DOM parser encounters an unmatched closing tag during document tree construction. Identify the defective line.",
      "codeLines": [
        "<div class=\"nav\">",
        "    <a href=\"/dashboard\">Dashboard</p>",
        "</div>"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "The tag begins with <a> but ends with </p>. Closing tags must match their opening tag.",
      "fixOptions": [
        "Change 'div' to 'main'",
        "Remove '/dashboard'",
        "Match the closing tag: '<a href=\"/dashboard\">Dashboard</a>'",
        "Change 'href' to 'src'"
      ],
      "correctFixIndex": 2,
      "hint": "An opening <a> tag must be closed with </a>.",
      "timeLimit": 160
    },
    {
      "id": "b1_12",
      "category": "C Programming",
      "title": "Numeric Input Prompt",
      "scenario": "The program crashes with a segmentation fault immediately upon terminal input submission. Identify the defective line.",
      "codeLines": [
        "int num;",
        "printf(\"Enter a number: \");",
        "scanf(\"%d\", num);"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "scanf expects a memory address to write into. Passing 'num' instead of '&num' causes a memory fault.",
      "fixOptions": [
        "Change '%d' to '%f'",
        "Change 'int num;' to 'char num;'",
        "Remove the printf prompt",
        "Pass address with ampersand: 'scanf(\"%d\", &num);'"
      ],
      "correctFixIndex": 3,
      "hint": "What operator gives the address of a variable in C?",
      "timeLimit": 160
    },
    {
      "id": "b1_13",
      "category": "Python",
      "title": "List Ordering Routine",
      "scenario": "The list data unexpectedly becomes None, causing subsequent length queries to fail. Identify the defective line.",
      "codeLines": [
        "nums = [3, 1, 2]",
        "nums = nums.sort()",
        "print(len(nums))"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "list.sort() mutates the list in-place and returns None. Reassigning 'nums = nums.sort()' destroys the list.",
      "fixOptions": [
        "Call sort without reassignment: 'nums.sort()' or 'nums = sorted(nums)'",
        "Change nums = [3, 1, 2] to a string",
        "Remove line 3",
        "Change len(nums) to nums.size()"
      ],
      "correctFixIndex": 0,
      "hint": "Does list.sort() return a new list, or does it sort in-place and return None?",
      "timeLimit": 160
    },
    {
      "id": "b1_14",
      "category": "Basic HTML",
      "title": "User Roster Table Grid",
      "scenario": "The tabular data structure fails to render legitimate cell contents in the second row. Identify the defective line.",
      "codeLines": [
        "<tr>",
        "    <th>Name</th>",
        "</tr>",
        "<tr>",
        "    <tc>Alice</tc>",
        "</tr>"
      ],
      "errorLineIndex": 4,
      "errorExplanation": "<tc> is not a standard HTML tag. Standard table data cells are created with <td>.",
      "fixOptions": [
        "Change <th> to <h1>",
        "Replace '<tc>' with standard cell tag: '<td>Alice</td>'",
        "Remove all <tr> tags",
        "Change 'Alice' to 'Name'"
      ],
      "correctFixIndex": 1,
      "hint": "What is the standard HTML tag for a table data cell?",
      "timeLimit": 160
    },
    {
      "id": "b1_15",
      "category": "C Programming",
      "title": "Running Total Counter",
      "scenario": "The computed total outputs unexpected random or garbage numbers upon execution. Identify the defective line.",
      "codeLines": [
        "int total;",
        "total += 10;",
        "printf(\"%d\\n\", total);"
      ],
      "errorLineIndex": 0,
      "errorExplanation": "Local variables in C contain unpredictable garbage values until explicitly initialized.",
      "fixOptions": [
        "Remove line 2",
        "Change 'total += 10;' to 'total -= 10;'",
        "Initialize total to zero: 'int total = 0;'",
        "Change printf to scanf"
      ],
      "correctFixIndex": 2,
      "hint": "Local variables in C are not automatically initialized to zero.",
      "timeLimit": 160
    },
    {
      "id": "b1_16",
      "category": "Python",
      "title": "User Role Authorization",
      "scenario": "The server script crashes with 'KeyError: \"role\"' when processing standard user records. Identify the defective line.",
      "codeLines": [
        "user = {\"name\": \"Jordan\"}",
        "role = user[\"role\"]",
        "print(role)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "Direct dictionary indexing dict[key] raises a KeyError if the key is not in the dictionary. Using user.get(\"role\", \"default\") is safe.",
      "fixOptions": [
        "Change user = {...} to a list",
        "Enclose role in curly brackets",
        "Remove line 3",
        "Use safe get method: 'role = user.get(\"role\", \"Guest\")'"
      ],
      "correctFixIndex": 3,
      "hint": "What dictionary method safely retrieves a value without crashing if the key is missing?",
      "timeLimit": 160
    }
  ],
  "round3": [
    // 1 to 8: Original Set 1 Buzzer Blitz
    {
      "id": "z1_1",
      "category": "Python",
      "question": "In Python, which built-in function returns the number of items in a list or characters in a string?",
      "options": [
        "len()",
        "count()",
        "size()",
        "length()"
      ],
      "correctIndex": 0,
      "hint": "It is short for 'length'.",
      "explanation": "len() is the standard Python built-in function to find the length of collections and strings.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_2",
      "category": "C Programming",
      "question": "In C, which format specifier is used with printf() to display an integer value?",
      "options": [
        "%c",
        "%d",
        "%f",
        "%s"
      ],
      "correctIndex": 1,
      "hint": "%d stands for decimal integer.",
      "explanation": "%d (or %i) is used in printf() to format and display integer values.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_3",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to create a clickable hyperlink to another web page?",
      "options": [
        "<link>",
        "<href>",
        "<a>",
        "<url>"
      ],
      "correctIndex": 2,
      "hint": "'a' stands for anchor.",
      "explanation": "The <a> (anchor) tag with the 'href' attribute creates hyperlinks in HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_4",
      "category": "Logical Reasoning",
      "question": "If 5 machines can produce 5 widgets in 5 minutes, how many minutes will it take 100 machines to produce 100 widgets?",
      "options": [
        "100 minutes",
        "20 minutes",
        "1 minute",
        "5 minutes"
      ],
      "correctIndex": 3,
      "hint": "Each machine produces 1 widget in 5 minutes.",
      "explanation": "Since 1 machine makes 1 widget in 5 minutes, 100 machines working in parallel will make 100 widgets in exactly 5 minutes.",
      "readTime": 50,
      "buzzTime": 10
    },
    {
      "id": "z1_5",
      "category": "Python",
      "question": "In Python, what is the output of the arithmetic modulo operation: 14 % 4 ?",
      "options": [
        "2",
        "3",
        "3.5",
        "0"
      ],
      "correctIndex": 0,
      "hint": "Modulo returns the remainder after integer division: 14 = (4 * 3) + remainder.",
      "explanation": "14 divided by 4 is 3 with a remainder of 2. So 14 % 4 evaluates to 2.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_6",
      "category": "C Programming",
      "question": "In standard C, which header file must be included to use printf() and scanf()?",
      "options": [
        "<stdlib.h>",
        "<stdio.h>",
        "<string.h>",
        "<math.h>"
      ],
      "correctIndex": 1,
      "hint": "stdio stands for Standard Input / Output.",
      "explanation": "<stdio.h> provides declarations for standard I/O functions including printf() and scanf().",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_7",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to create a clickable button on a web form?",
      "options": [
        "<click>",
        "<press>",
        "<button>",
        "<submit>"
      ],
      "correctIndex": 2,
      "hint": "It is named after the standard physical push-button.",
      "explanation": "The <button> tag defines a clickable button in HTML forms.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_8",
      "category": "Logical Reasoning",
      "question": "A clock shows 3:00. What is the angle between the hour hand and the minute hand?",
      "options": [
        "45 degrees",
        "60 degrees",
        "120 degrees",
        "90 degrees"
      ],
      "correctIndex": 3,
      "hint": "The minute hand points to 12 and the hour hand points to 3 (a right angle).",
      "explanation": "Each hour tick represents 30 degrees (360 / 12). At 3:00, the hands are 3 marks apart: 3 * 30 = 90 degrees.",
      "readTime": 45,
      "buzzTime": 10
    },

    // 9 to 16: Merged from Set 4 Buzzer Blitz
    {
      "id": "z1_9",
      "category": "Python",
      "question": "In Python, which function converts a string or number into an integer data type?",
      "options": [
        "to_int()",
        "int()",
        "parse_int()",
        "number()"
      ],
      "correctIndex": 1,
      "hint": "It shares its name with the standard integer type keyword.",
      "explanation": "int() converts valid string representations or floats into standard integer values.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_10",
      "category": "C Programming",
      "question": "What is the return type of the main() function in standard C?",
      "options": [
        "void",
        "char",
        "int",
        "float"
      ],
      "correctIndex": 2,
      "hint": "main() returns an exit status code (0 for success) back to the OS.",
      "explanation": "In standard modern C (C99/C11), main() must return an integer ('int').",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_11",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to create an ordered (numbered) list?",
      "options": [
        "<ul>",
        "<ol>",
        "<list>",
        "<nl>"
      ],
      "correctIndex": 1,
      "hint": "'ol' stands for Ordered List.",
      "explanation": "<ol> creates an ordered (numbered) list, whereas <ul> creates an unordered (bulleted) list.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_12",
      "category": "Logical Reasoning",
      "question": "Which of the following years was a Leap Year?",
      "options": [
        "1900",
        "2000",
        "2100",
        "2018"
      ],
      "correctIndex": 1,
      "hint": "Century years are leap years only if divisible by 400.",
      "explanation": "Century years must be divisible by 400. 2000 is divisible by 400 (Leap Year), whereas 1900 and 2100 are not.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_13",
      "category": "Python",
      "question": "In Python, which keyword is used to handle exceptions caught in a 'try' block?",
      "options": [
        "catch",
        "except",
        "finally",
        "handle"
      ],
      "correctIndex": 1,
      "hint": "Unlike Java and C++, Python uses 'try ... except'.",
      "explanation": "Python uses the 'except' keyword to catch and handle exceptions originating from a try block.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_14",
      "category": "C Programming",
      "question": "In C, which unary operator returns the size in bytes of a data type or variable?",
      "options": [
        "bytes()",
        "sizeof",
        "length",
        "size"
      ],
      "correctIndex": 1,
      "hint": "It is a compile-time operator with 'size' and 'of' combined.",
      "explanation": "'sizeof' is a compile-time operator in C that returns the memory footprint size in bytes.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_15",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to embed client-side JavaScript code into a webpage?",
      "options": [
        "<javascript>",
        "<js>",
        "<script>",
        "<code>"
      ],
      "correctIndex": 2,
      "hint": "The tag name is <script>.",
      "explanation": "The <script> tag is standard for embedding or linking executable JavaScript code.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z1_16",
      "category": "Logical Reasoning",
      "question": "If SOUTH-EAST becomes NORTH, and NORTH-EAST becomes WEST, what will WEST become?",
      "options": [
        "SOUTH-EAST",
        "SOUTH-WEST",
        "NORTH-WEST",
        "NORTH-EAST"
      ],
      "correctIndex": 0,
      "hint": "Every direction is rotated 135 degrees counter-clockwise.",
      "explanation": "Rotating 135 degrees counter-clockwise: South-East (135°) becomes North (0°). Rotating West (270°) by 135° counter-clockwise leads to 135° (South-East).",
      "readTime": 50,
      "buzzTime": 10
    }
  ]
};

if (typeof window !== "undefined") {
  window.QUESTION_SET_1 = QUESTION_SET_1;
  if (!window.QUESTION_SETS) window.QUESTION_SETS = {};
  window.QUESTION_SETS["set1"] = QUESTION_SET_1;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = QUESTION_SET_1;
}
