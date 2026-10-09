/**
 * MIND//MIND Cyber Arena - Master Question Set 2 (SET 2 (BETA))
 * Round 1: 15 Visual / Logical / Code Decoding Puzzles (Original Set 2 + Merged Set 4 + 7 Added High-Yield Questions)
 * Round 2: 16 Bug Hunting Error Traps (Original Set 2 + Merged Set 3)
 * Round 3: 16 Buzzer Blitz Speed Questions (Original Set 2 + Merged Set 3)
 */

const QUESTION_SET_2 = {
  "id": "set2",
  "name": "SET 2 (BETA)",
  "description": "15 Visual Puzzles, 16 Syntax Bug Traps, and 16 Blitz Buzzer Challenges across C, Python, HTML & Logic",
  "round1": [
    // 1 to 4: Original Set 2
    {
      "id": "v2_1",
      "category": "Logical Reasoning",
      "title": "Five-Floor Apartment Residency Deduction",
      "instruction": "Five software engineers—Rohan, Priya, Sameer, Tanvi, and Varun—live on five different floors of an apartment building numbered 1 (bottom) to 5 (topmost).\n\nClues:\n1. Rohan lives on Floor 2.\n2. Exactly two floors separate Rohan and Tanvi (Tanvi lives on Floor 5).\n3. Sameer lives on an odd-numbered floor.\n4. Priya lives on the floor immediately above Sameer.\n5. Varun occupies the remaining floor.\n\nOn which floor does Priya live?",
      "options": [
        "Floor 4",
        "Floor 3",
        "Floor 1",
        "Floor 5"
      ],
      "correctIndex": 0,
      "hint": "Check which odd floor Sameer can live on such that the floor directly above him is empty for Priya.",
      "explanation": "Rohan is on Floor 2 and Tanvi is on Floor 5. Sameer lives on an odd floor. If Sameer lived on Floor 1, Priya would need Floor 2, which is already occupied by Rohan. Thus Sameer must live on Floor 3, placing Priya on Floor 4.",
      "timeLimit": 270
    },
    {
      "id": "v2_2",
      "category": "C Programming",
      "title": "Integer Division Truncation Trace",
      "instruction": "Trace the integer division below in C. What value does printf(\"%d\", result) display?",
      "steps": [
        "int a = 9;",
        "int b = 2;",
        "int result = a / b;",
        "printf(\"%d\", result);"
      ],
      "options": [
        "4.5",
        "4",
        "5",
        "0"
      ],
      "correctIndex": 1,
      "hint": "In C, dividing two integers produces an integer result (truncating towards zero).",
      "explanation": "9 divided by 2 is 4.5. Since both operands are integers, C truncates the decimal part .5, leaving 4.",
      "timeLimit": 150
    },
    {
      "id": "v2_3",
      "category": "Python",
      "title": "List Append & Length Trace",
      "instruction": "Trace the Python list operations below. What does print(len(items)) display?",
      "steps": [
        "items = [\"pen\", \"notebook\"]",
        "items.append(\"eraser\")",
        "print(len(items))"
      ],
      "options": [
        "2",
        "4",
        "3",
        "1"
      ],
      "correctIndex": 2,
      "hint": "The list initially has 2 elements, and append() adds 1 more item.",
      "explanation": "Initially items has 2 elements. Calling items.append(\"eraser\") adds a 3rd element. len(items) returns 3.",
      "timeLimit": 150
    },
    {
      "id": "v2_4",
      "category": "Logical Reasoning",
      "title": "Two Trains Crossing & Distance Calculation",
      "instruction": "Two train stations, Station X and Station Y, are located exactly 300 km apart along a straight rail line.\n\nEvents:\n1. At 8:00 AM, Train A departs from Station X toward Station Y at a constant speed of 60 km/h.\n2. At 9:00 AM (exactly 1 hour later), Train B departs from Station Y toward Station X at a constant speed of 90 km/h.\n\nAt what exact time will the two trains pass each other, and how far from Station X will they be when they meet?",
      "options": [
        "10:30 AM, at 150 km from Station X",
        "11:00 AM, at 180 km from Station X",
        "10:45 AM, at 165 km from Station X",
        "10:36 AM, at 156 km from Station X"
      ],
      "correctIndex": 3,
      "hint": "Calculate how far Train A travels in the first hour before Train B starts, then divide the remaining distance by the combined relative speed.",
      "explanation": "In the first hour (8:00 to 9:00 AM), Train A covers 60 km. The remaining 240 km is closed at a combined speed of 150 km/h, taking 1.6 hours (1 hr 36 min). Meeting time is 10:36 AM, at 60 + (60 * 1.6) = 156 km from Station X.",
      "timeLimit": 300
    },

    // 5 to 8: Merged from Set 4
    {
      "id": "v2_5",
      "category": "Logical Reasoning",
      "title": "Six-Officer Circular Table Seating Arrangement",
      "instruction": "Six cyber intelligence officers—K, L, M, N, O, and P—are seated symmetrically around a circular conference table, all facing the center of the table.\n\nClues:\n1. K sits directly opposite to N.\n2. M sits to the immediate left of K.\n3. O sits directly opposite to M.\n4. P sits to the immediate right of K.\n5. L occupies the remaining seat adjacent to both M and N.\n\nWho sits directly opposite to officer P?",
      "options": [
        "L",
        "M",
        "O",
        "K"
      ],
      "correctIndex": 0,
      "hint": "Map the 6 positions around the circle. K is at the top, N is at the bottom, and M and P are on either side of K.",
      "explanation": "With K at Seat 1 and N opposite at Seat 4, M is at Seat 2 and P is at Seat 6. O is opposite M at Seat 5, leaving Seat 3 for L. Seat 3 (L) is directly opposite Seat 6 (P).",
      "timeLimit": 270
    },
    {
      "id": "v2_6",
      "category": "C Programming",
      "title": "Post-Increment Operator Trace",
      "instruction": "Trace the basic increment operation in C below. What value does printf(\"%d\", count) output?",
      "steps": [
        "int count = 5;",
        "count++;",
        "printf(\"%d\", count);"
      ],
      "options": [
        "5",
        "6",
        "7",
        "4"
      ],
      "correctIndex": 1,
      "hint": "The '++' operator adds 1 to the variable.",
      "explanation": "count starts at 5. 'count++' increments count by 1, making it 6. printf prints 6.",
      "timeLimit": 150
    },
    {
      "id": "v2_7",
      "category": "Python",
      "title": "String Repetition Operator Trace",
      "instruction": "Trace the Python string multiplication below. What does print(greeting) display?",
      "steps": [
        "greeting = \"Hi\" * 3",
        "print(greeting)"
      ],
      "options": [
        "\"Hi 3\"",
        "\"Hi3\"",
        "\"HiHiHi\"",
        "\"Hi, Hi, Hi\""
      ],
      "correctIndex": 2,
      "hint": "In Python, multiplying a string by an integer repeats that string.",
      "explanation": "\"Hi\" * 3 duplicates the string 3 times, producing \"HiHiHi\".",
      "timeLimit": 150
    },
    {
      "id": "v2_8",
      "category": "Logical Reasoning",
      "title": "15th August 1947 Day of the Week Deduction",
      "instruction": "Determine the exact day of the week on which India's Independence Day (15th August 1947) fell, using standard calendar odd-days deduction.\n\nRules & Information:\n- 1600 completed years contain 0 odd days.\n- 300 years (1601 to 1900) contain 1 odd day.\n- In the remaining 46 completed years (1901 to 1946): there are 11 leap years and 35 ordinary years.\n- Days in 1947 up to 15th August: Jan (31) + Feb (28) + Mar (31) + Apr (30) + May (31) + Jun (30) + Jul (31) + Aug (15).\n\nWhat day of the week was 15th August 1947?",
      "options": [
        "Thursday",
        "Saturday",
        "Wednesday",
        "Friday"
      ],
      "correctIndex": 3,
      "hint": "Sum the odd days: 1600 yrs (0) + 300 yrs (1) + 46 yrs (1) + 1947 months up to Aug 15 (3) = 5 odd days.",
      "explanation": "The total number of odd days is 0 + 1 + 1 + 3 = 5 odd days. Day 5 corresponds to Friday.",
      "timeLimit": 300
    },

    // 9 & 10: Med-High Difficulty Questions (Identical standard)
    {
      "id": "v2_9",
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
      "id": "v2_10",
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

    // 11 to 15: Easy-Med Difficulty Questions (Identical standard)
    {
      "id": "v2_11",
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
      "id": "v2_12",
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
      "id": "v2_13",
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
      "id": "v2_14",
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
      "id": "v2_15",
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
    // 1 to 8: Original Set 2 Bugs
    {
      "id": "b2_1",
      "category": "C Programming",
      "title": "Standard Output Logger",
      "scenario": "The C compiler produces 'error: expected \";\" before \"}\" token'. Identify the defective line.",
      "codeLines": [
        "#include <stdio.h>",
        "int main() {",
        "    printf(\"Hello, World!\\n\")",
        "    return 0;",
        "}"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "Every statement in C must conclude with a semicolon ';'. The printf line has no terminating semicolon.",
      "fixOptions": [
        "Add a semicolon: 'printf(\"Hello, World!\\n\");'",
        "Change 'printf' to 'print'",
        "Remove '#include <stdio.h>'",
        "Change 'return 0;' to 'return 1;'"
      ],
      "correctFixIndex": 0,
      "hint": "Check the end of statement lines for missing C punctuation.",
      "timeLimit": 160
    },
    {
      "id": "b2_2",
      "category": "Python",
      "title": "Coordinate Point Updater",
      "scenario": "Running this script triggers 'TypeError: object does not support item assignment'. Identify the defective line.",
      "codeLines": [
        "point = (10, 20)",
        "point[0] = 50",
        "print(point)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "Tuples in Python are immutable; once instantiated, their elements cannot be changed in-place.",
      "fixOptions": [
        "Wrap 50 in quotes: 'point[0] = \"50\"'",
        "Use a mutable list instead of a tuple: 'point = [10, 20]'",
        "Change point = (10, 20) to point = (10)",
        "Use point.append(50)"
      ],
      "correctFixIndex": 1,
      "hint": "Tuples cannot be altered. What data type uses square brackets and allows item assignment?",
      "timeLimit": 160
    },
    {
      "id": "b2_3",
      "category": "Basic HTML",
      "title": "Top Navigation Bar Component",
      "scenario": "Clicking the navigation link fails to route to the destination page. Identify the invalid line.",
      "codeLines": [
        "<nav>",
        "    <a src=\"home.html\">Home</a>",
        "</nav>"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In HTML, the anchor tag <a> specifies target web pages using the 'href' attribute, not 'src'.",
      "fixOptions": [
        "Change '<a' to '<link'",
        "Remove the closing '</a>' tag",
        "Change 'src' to 'href': '<a href=\"home.html\">Home</a>'",
        "Change 'home.html' to '#home.html'"
      ],
      "correctFixIndex": 2,
      "hint": "Which attribute sets the target URL on an <a> tag?",
      "timeLimit": 160
    },
    {
      "id": "b2_4",
      "category": "C Programming",
      "title": "Conditional Grant Checker",
      "scenario": "The system prints 'Granted' unconditionally even when level is 0. Identify the defective line.",
      "codeLines": [
        "int level = 0;",
        "if (level = 10) {",
        "    printf(\"Granted\\n\");",
        "}"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "'level = 10' assigns 10 (true). Comparison requires '=='.",
      "fixOptions": [
        "Change level = 0 to level = 10",
        "Add a semicolon after (level = 10)",
        "Use equality comparison: 'if (level == 10)'",
        "Replace 'Granted' with 'Denied'"
      ],
      "correctFixIndex": 2,
      "hint": "Use '==' for comparison rather than '=' for assignment.",
      "timeLimit": 160
    },
    {
      "id": "b2_5",
      "category": "Python",
      "title": "Loop Iteration Utility",
      "scenario": "The script aborts on launch with 'SyntaxError: expected \":\"'. Identify the defective line.",
      "codeLines": [
        "items = [1, 2, 3]",
        "for item in items",
        "    print(item)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, 'for' loop headers must conclude with a colon ':'.",
      "fixOptions": [
        "Add a colon at the end: 'for item in items:'",
        "Change 'in' to 'of'",
        "Wrap print(item) in curly braces",
        "Change 'items' to 'range(items)'"
      ],
      "correctFixIndex": 0,
      "hint": "What character must always end a for loop line in Python?",
      "timeLimit": 160
    },
    {
      "id": "b2_6",
      "category": "Basic HTML",
      "title": "Section Card Header",
      "scenario": "Text inside the paragraph tag is rendering as an oversized header. Identify the defective line.",
      "codeLines": [
        "<div class=\"card\">",
        "    <h2>Welcome",
        "    <p>Get started today.</p>",
        "</div>"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "The <h2> opening tag is never closed with </h2>.",
      "fixOptions": [
        "Change 'div' to 'main'",
        "Remove the <p> tag",
        "Properly close heading: '<h2>Welcome</h2>'",
        "Change '<h2>' to '<header>'"
      ],
      "correctFixIndex": 2,
      "hint": "Every <h2> must be closed with </h2>.",
      "timeLimit": 160
    },
    {
      "id": "b2_7",
      "category": "C Programming",
      "title": "Value Capture Console Prompt",
      "scenario": "The program encounters a segmentation fault immediately when input is provided. Identify the defective line.",
      "codeLines": [
        "int score;",
        "printf(\"Enter score: \");",
        "scanf(\"%d\", score);"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "scanf expects the memory address of the target variable. Passing 'score' instead of '&score' causes memory violation.",
      "fixOptions": [
        "Change '%d' to '%f'",
        "Pass address with ampersand: 'scanf(\"%d\", &score);'",
        "Initialize score to 0",
        "Replace scanf with gets()"
      ],
      "correctFixIndex": 1,
      "hint": "Which operator provides the memory address of a variable in C?",
      "timeLimit": 160
    },
    {
      "id": "b2_8",
      "category": "Python",
      "title": "Conditional Action Evaluator",
      "scenario": "Running this code triggers 'IndentationError: expected an indented block'. Identify the unindented line.",
      "codeLines": [
        "active = True",
        "if active:",
        "print(\"System Online\")"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "In Python, the suite inside an 'if' branch must be indented.",
      "fixOptions": [
        "Add a semicolon after 'if active:'",
        "Wrap print in { }",
        "Indent the conditional body: '    print(\"System Online\")'",
        "Change 'True' to '1'"
      ],
      "correctFixIndex": 2,
      "hint": "Statements inside an if block in Python must be indented.",
      "timeLimit": 160
    },

    // 9 to 16: Merged from Set 3 Bugs
    {
      "id": "b2_9",
      "category": "C Programming",
      "title": "Accumulator Initialization Routine",
      "scenario": "The compiler halts compilation with 'error: expected declaration before \"return\"'. Identify the un-terminated line.",
      "codeLines": [
        "int main() {",
        "    int total = 50",
        "    return 0;",
        "}"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In C, each variable initialization must be terminated with a semicolon ';'.",
      "fixOptions": [
        "Add a terminating semicolon: 'int total = 50;'",
        "Change 'int' to 'float'",
        "Remove 'return 0;'",
        "Put curly braces around total = 50"
      ],
      "correctFixIndex": 0,
      "hint": "Check the punctuation mark at the end of line 2.",
      "timeLimit": 160
    },
    {
      "id": "b2_10",
      "category": "Python",
      "title": "Summation Math Function",
      "scenario": "The script aborts on launch with 'SyntaxError: expected \":\"'. Identify the defective line.",
      "codeLines": [
        "def calculate_total(a, b)",
        "    return a + b",
        "print(calculate_total(3, 4))"
      ],
      "errorLineIndex": 0,
      "errorExplanation": "In Python, function definitions with 'def' must conclude with a colon ':'.",
      "fixOptions": [
        "Change 'def' to 'func'",
        "Add a colon at the end: 'def calculate_total(a, b):'",
        "Wrap parameters in brackets [a, b]",
        "Add semicolons to every line"
      ],
      "correctFixIndex": 1,
      "hint": "What character must always appear at the end of a 'def' line in Python?",
      "timeLimit": 160
    },
    {
      "id": "b2_11",
      "category": "Basic HTML",
      "title": "Hero Banner Component",
      "scenario": "The webpage fails to display the banner image asset properly. Identify the defective line.",
      "codeLines": [
        "<div class=\"banner\">",
        "    <h1>Welcome</h1>",
        "    <img srcc=\"banner.png\" alt=\"Banner Image\">",
        "</div>"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "The HTML image element uses the 'src' attribute for the image file path. 'srcc' is an invalid attribute.",
      "fixOptions": [
        "Change '<img' to '<picture'",
        "Remove the 'alt' attribute",
        "Correct the attribute name: '<img src=\"banner.png\" alt=\"Banner Image\">'",
        "Change 'banner.png' to '#banner.png'"
      ],
      "correctFixIndex": 2,
      "hint": "The attribute for the image source is 'src', not 'srcc'.",
      "timeLimit": 160
    },
    {
      "id": "b2_12",
      "category": "C Programming",
      "title": "Player Score Terminal Output",
      "scenario": "The output buffer prints corrupted memory characters instead of numeric score data. Identify the defective line.",
      "codeLines": [
        "#include <stdio.h>",
        "int main() {",
        "    printf(\"Score: %s\\n\", 100);",
        "    return 0;",
        "}"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "%s expects a pointer to a null-terminated char array (string). Passing the integer 100 causes undefined behavior.",
      "fixOptions": [
        "Change 'printf' to 'puts'",
        "Change 'main()' to 'void main()'",
        "Remove 'Score: ' from the string",
        "Use integer specifier: 'printf(\"Score: %d\\n\", 100);'"
      ],
      "correctFixIndex": 3,
      "hint": "Which format specifier is used for integers in C?",
      "timeLimit": 160
    },
    {
      "id": "b2_13",
      "category": "Python",
      "title": "String Mutation Helper",
      "scenario": "Executing this script causes 'TypeError: object does not support item assignment'. Identify the defective line.",
      "codeLines": [
        "word = \"cat\"",
        "word[0] = \"b\"",
        "print(word)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "Strings in Python are immutable. You cannot modify their individual characters using bracket assignment.",
      "fixOptions": [
        "Create a new string: 'word = \"b\" + word[1:]'",
        "Change word = \"cat\" to word = ('c', 'a', 't')",
        "Enclose word in curly brackets",
        "Change 'print(word)' to 'echo word'"
      ],
      "correctFixIndex": 0,
      "hint": "Python strings cannot be modified in-place.",
      "timeLimit": 160
    },
    {
      "id": "b2_14",
      "category": "Basic HTML",
      "title": "Content Layout Block",
      "scenario": "The browser fails to render standard spacing because an invalid non-standard tag is used. Identify the defective line.",
      "codeLines": [
        "<div class=\"content\">",
        "    <paragraph>This is the main introduction.</paragraph>",
        "</div>"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "<paragraph> is not a standard HTML element. The standard tag for a paragraph is <p>.",
      "fixOptions": [
        "Change '<div>' to '<main>'",
        "Replace with standard paragraph tag: '<p>This is the main introduction.</p>'",
        "Remove all tags and keep raw text",
        "Change '<paragraph>' to '<header>'"
      ],
      "correctFixIndex": 1,
      "hint": "What is the standard single-letter HTML tag for a paragraph?",
      "timeLimit": 160
    },
    {
      "id": "b2_15",
      "category": "C Programming",
      "title": "Server Status Validator",
      "scenario": "The system prints 'Active' unconditionally regardless of the actual system status. Identify the defective line.",
      "codeLines": [
        "int status = 0;",
        "if (status = 5) {",
        "    printf(\"Active\\n\");",
        "}"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "'status = 5' is an assignment expression that evaluates to 5 (true). Comparison requires '=='.",
      "fixOptions": [
        "Change status = 0 to status = 5",
        "Add a semicolon after (status = 5)",
        "Use equality operator: 'if (status == 5)'",
        "Replace 'Active' with 'Inactive'"
      ],
      "correctFixIndex": 2,
      "hint": "In C, '=' is assignment while '==' is equality comparison.",
      "timeLimit": 160
    },
    {
      "id": "b2_16",
      "category": "Python",
      "title": "Sequential Counter Loop",
      "scenario": "The Python interpreter throws 'IndentationError: expected an indented block'. Identify the unindented line.",
      "codeLines": [
        "for i in range(3):",
        "print(i)"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, code blocks inside loops must be indented (typically with 4 spaces).",
      "fixOptions": [
        "Add a semicolon after print(i)",
        "Change range(3) to [0, 1, 2]",
        "Remove the for loop",
        "Indent the loop body: '    print(i)'"
      ],
      "correctFixIndex": 3,
      "hint": "Statements inside a for loop in Python must be indented.",
      "timeLimit": 160
    }
  ],
  "round3": [
    // 1 to 8: Original Set 2 Buzzer Blitz
    {
      "id": "z2_1",
      "category": "Python",
      "question": "In Python, which keyword is used to define an anonymous inline function?",
      "options": [
        "func",
        "def",
        "lambda",
        "inline"
      ],
      "correctIndex": 2,
      "hint": "Starts with 'l' and comes from lambda calculus.",
      "explanation": "lambda creates anonymous inline functions in Python.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_2",
      "category": "C Programming",
      "question": "In C, which character represents the string termination null-character in memory?",
      "options": [
        "\\0",
        "\\n",
        "\\t",
        "EOF"
      ],
      "correctIndex": 0,
      "hint": "It is backslash followed by zero.",
      "explanation": "'\\0' is the null terminator marking the end of strings in C.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_3",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to create an unordered (bulleted) list?",
      "options": [
        "<ol>",
        "<ul>",
        "<list>",
        "<bullet>"
      ],
      "correctIndex": 1,
      "hint": "'ul' stands for Unordered List.",
      "explanation": "<ul> creates an unordered bulleted list, whereas <ol> creates an ordered numbered list.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_4",
      "category": "Logical Reasoning",
      "question": "If you overtake the runner who is in second place in a race, what place are you in now?",
      "options": [
        "First place",
        "Second place",
        "Third place",
        "Fourth place"
      ],
      "correctIndex": 1,
      "hint": "You just took the position of the person who was second.",
      "explanation": "When you pass the person in second place, you take their spot. The leader is still in first place, so you are in second place.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_5",
      "category": "Python",
      "question": "In Python, which method removes and returns the last element from a list?",
      "options": [
        "remove()",
        "pop()",
        "delete()",
        "discard()"
      ],
      "correctIndex": 1,
      "hint": "It pops the element off the top of the stack.",
      "explanation": "list.pop() removes and returns the element at the given index (defaulting to the last item).",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_6",
      "category": "C Programming",
      "question": "What is the result of the integer division 7 / 2 in standard C?",
      "options": [
        "3.5",
        "3",
        "4",
        "0"
      ],
      "correctIndex": 1,
      "hint": "Integer division truncates decimals.",
      "explanation": "In C, dividing two integers yields an integer with decimal parts truncated: 7 / 2 = 3.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_7",
      "category": "Basic HTML",
      "question": "Which HTML attribute is used to provide alternate text when an image fails to render?",
      "options": [
        "title",
        "desc",
        "alt",
        "src"
      ],
      "correctIndex": 2,
      "hint": "'alt' stands for alternate text.",
      "explanation": "The 'alt' attribute provides fallback descriptive text for images in HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_8",
      "category": "Logical Reasoning",
      "question": "Find the next number in the sequence: 2, 6, 12, 20, 30, ?",
      "options": [
        "40",
        "42",
        "36",
        "44"
      ],
      "correctIndex": 1,
      "hint": "The differences between numbers are +4, +6, +8, +10, +12...",
      "explanation": "The differences increase by 2: +4, +6, +8, +10, so the next difference is +12. 30 + 12 = 42.",
      "readTime": 45,
      "buzzTime": 10
    },

    // 9 to 16: Merged from Set 3 Buzzer Blitz
    {
      "id": "z2_9",
      "category": "Python",
      "question": "In Python, which operator performs integer floor division (discarding decimals)?",
      "options": [
        "//",
        "/",
        "%",
        "div"
      ],
      "correctIndex": 0,
      "hint": "In Python, 7 // 2 evaluates to 3.",
      "explanation": "The '//' operator in Python performs floor division, rounding down to the nearest integer.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_10",
      "category": "C Programming",
      "question": "In C, which printf format specifier is used to display a single char character?",
      "options": [
        "%s",
        "%c",
        "%d",
        "%ch"
      ],
      "correctIndex": 1,
      "hint": "%c stands for character.",
      "explanation": "%c is the format specifier for a single character in printf.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_11",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to define an item inside an ordered or unordered list?",
      "options": [
        "<item>",
        "<li>",
        "<list-item>",
        "<ul>"
      ],
      "correctIndex": 1,
      "hint": "'li' stands for List Item.",
      "explanation": "<li> defines individual list items inside either <ol> or <ul> elements.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_12",
      "category": "Logical Reasoning",
      "question": "Some cats are black. All black animals are fast. Which conclusion must follow?",
      "options": [
        "All cats are fast",
        "Some cats are fast",
        "No cats are fast",
        "All fast animals are cats"
      ],
      "correctIndex": 1,
      "hint": "The cats that are black must also be fast.",
      "explanation": "Since some cats are black, and all black animals are fast, those particular cats must be fast. Thus, some cats are fast.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_13",
      "category": "Python",
      "question": "In Python, what is the output of bool([]) when evaluating an empty list?",
      "options": [
        "True",
        "False",
        "None",
        "Error"
      ],
      "correctIndex": 1,
      "hint": "Empty sequences and collections evaluate to falsy values.",
      "explanation": "In Python, empty lists, strings, and tuples evaluate to False in a boolean context.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_14",
      "category": "C Programming",
      "question": "In C, which operator is used to obtain the memory address of a variable?",
      "options": [
        "*",
        "&",
        "->",
        "#"
      ],
      "correctIndex": 1,
      "hint": "Ampersand '&' is the address-of operator.",
      "explanation": "The '&' operator retrieves the memory address of a variable in C.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_15",
      "category": "Basic HTML",
      "question": "Which HTML tag represents the largest (highest-level) heading?",
      "options": [
        "<h6>",
        "<heading>",
        "<h1>",
        "<head>"
      ],
      "correctIndex": 2,
      "hint": "Heading levels go from 1 (largest) to 6 (smallest).",
      "explanation": "<h1> defines the top-level and most prominent heading in standard HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_16",
      "category": "Logical Reasoning",
      "question": "Complete the letter series: B, D, G, K, ?",
      "options": [
        "P",
        "O",
        "N",
        "Q"
      ],
      "correctIndex": 0,
      "hint": "Positions in alphabet: 2, 4, 7, 11 (increments are +2, +3, +4, +5...).",
      "explanation": "B(2) + 2 = D(4); D(4) + 3 = G(7); G(7) + 4 = K(11); K(11) + 5 = P(16). The next letter is P.",
      "readTime": 45,
      "buzzTime": 10
    }
  ]
};

if (typeof window !== "undefined") {
  window.QUESTION_SET_2 = QUESTION_SET_2;
  if (!window.QUESTION_SETS) window.QUESTION_SETS = {};
  window.QUESTION_SETS["set2"] = QUESTION_SET_2;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = QUESTION_SET_2;
}
