/**
 * MIND//MIND Cyber Arena - Question Set 2 (SET 2 (BETA))
 * Stage 1: 4 Puzzles (Tough lengthy logical puzzles: 270s-300s; Easy code traces: 150s)
 * Stage 2: 8 Error Hunting Traps (Easy fresher bugs: 160s-180s)
 * Stage 3: 8 Buzzer Blitz Questions (Easy fundamentals: 45s-50s read, 10s lockout)
 */

const QUESTION_SET_2 = {
  "id": "set2",
  "name": "SET 2 (BETA)",
  "description": "5-Floor Residency Deduction, Two Trains Crossing Time, C Integer Division, Python List Appends & Easy Syntax Traps",
  "round1": [
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
    }
  ],
  "round2": [
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
      "title": "Telemetry Array Reader",
      "scenario": "The routine reads unexpected garbage memory during array element inspection. Identify the defective line.",
      "codeLines": [
        "int nums[3] = {10, 20, 30};",
        "int val = nums[3];",
        "printf(\"%d\\n\", val);"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In C, arrays use 0-based indexing. An array of size 3 has valid indices 0, 1, and 2. Index 3 is out of bounds.",
      "fixOptions": [
        "Change nums[3] to nums[4]",
        "Change int nums[3] to float nums[3]",
        "Change printf to scanf",
        "Access valid last index: 'int val = nums[2];'"
      ],
      "correctFixIndex": 3,
      "hint": "If an array has 3 elements, what is the index of the last element?",
      "timeLimit": 160
    },
    {
      "id": "b2_5",
      "category": "Python",
      "title": "Invoice Total Display",
      "scenario": "Running this code crashes with 'NameError: name \"total\" is not defined'. Locate the defective line.",
      "codeLines": [
        "print(total)",
        "total = 100"
      ],
      "errorLineIndex": 0,
      "errorExplanation": "Python executes code sequentially from top to bottom. You cannot read variable 'total' before assigning it.",
      "fixOptions": [
        "Define the variable before printing: swap lines so 'total = 100' comes first",
        "Change total = 100 to total == 100",
        "Put quotes around 'print(total)'",
        "Change 'print' to 'echo'"
      ],
      "correctFixIndex": 0,
      "hint": "Variables must be assigned a value before they can be printed.",
      "timeLimit": 160
    },
    {
      "id": "b2_6",
      "category": "Basic HTML",
      "title": "Tabular Data Grid Structure",
      "scenario": "The table layout fails semantic validation and breaks table rendering. Identify the defective line.",
      "codeLines": [
        "<table>",
        "    <td>User Data</td>",
        "</table>"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In HTML, <td> table data cells must always reside inside a <tr> (table row) element.",
      "fixOptions": [
        "Change '<table>' to '<tablerow>'",
        "Wrap cell inside a table row: '<tr><td>User Data</td></tr>'",
        "Change '<td>' to '<cell>'",
        "Replace '<table>' with '<form>'"
      ],
      "correctFixIndex": 1,
      "hint": "What HTML tag defines a table row?",
      "timeLimit": 160
    },
    {
      "id": "b2_7",
      "category": "C Programming",
      "title": "Quota Calculation Engine",
      "scenario": "The process crashes immediately with a fatal floating point exception (SIGFPE). Locate the fatal line.",
      "codeLines": [
        "int total = 50;",
        "int divisor = 0;",
        "int result = total / divisor;",
        "printf(\"%d\", result);"
      ],
      "errorLineIndex": 2,
      "errorExplanation": "Dividing an integer by zero is undefined in C and causes the operating system to immediately terminate the process.",
      "fixOptions": [
        "Change total = 50 to total = 0",
        "Replace printf with puts",
        "Ensure divisor is non-zero before dividing: 'if (divisor != 0) result = total / divisor;'",
        "Change 'total / divisor' to 'total * 0'"
      ],
      "correctFixIndex": 2,
      "hint": "Can an integer be divided by 0 in C?",
      "timeLimit": 160
    },
    {
      "id": "b2_8",
      "category": "Python",
      "title": "System Status Health Checker",
      "scenario": "The Python interpreter throws 'SyntaxError: invalid syntax' during conditional check. Identify the defective line.",
      "codeLines": [
        "status = 1",
        "if status = 1:",
        "    print(\"Active\")"
      ],
      "errorLineIndex": 1,
      "errorExplanation": "In Python, '=' is an assignment operator and cannot be used in a standard if condition. Equality comparison requires '=='.",
      "fixOptions": [
        "Change status = 1 to status = [1]",
        "Remove the colon ':' after 1",
        "Indent line 2",
        "Use equality operator: 'if status == 1:'"
      ],
      "correctFixIndex": 3,
      "hint": "Which operator compares two values for equality in Python?",
      "timeLimit": 160
    }
  ],
  "round3": [
    {
      "id": "z2_1",
      "category": "Python",
      "question": "In Python, which operator is used to calculate powers (e.g., 2 raised to 3)?",
      "options": [
        "**",
        "^",
        "//",
        "%%"
      ],
      "correctIndex": 0,
      "hint": "In Python, 2 ** 3 evaluates to 8.",
      "explanation": "The '**' operator represents exponentiation in Python: 2 ** 3 = 8.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_2",
      "category": "C Programming",
      "question": "In standard C, what integer value does main() typically return to signal successful execution?",
      "options": [
        "1",
        "0",
        "-1",
        "100"
      ],
      "correctIndex": 1,
      "hint": "'return 0;' signals that the program finished without errors.",
      "explanation": "Returning 0 from main() indicates to the operating system that the program terminated successfully.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_3",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to define a regular paragraph of text?",
      "options": [
        "<para>",
        "<text>",
        "<p>",
        "<pg>"
      ],
      "correctIndex": 2,
      "hint": "'p' stands for paragraph.",
      "explanation": "The <p> tag defines a paragraph in HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_4",
      "category": "Logical Reasoning",
      "question": "A farmer has 15 sheep. All but 8 of them run away. How many sheep does the farmer have left?",
      "options": [
        "7 sheep",
        "15 sheep",
        "0 sheep",
        "8 sheep"
      ],
      "correctIndex": 3,
      "hint": "Read carefully: 'all BUT 8' ran away.",
      "explanation": "'All but 8' ran away means that exactly 8 sheep remained with the farmer.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_5",
      "category": "Python",
      "question": "In Python, what is the output of type(3.14)?",
      "options": [
        "<class 'float'>",
        "<class 'int'>",
        "<class 'double'>",
        "<class 'decimal'>"
      ],
      "correctIndex": 0,
      "hint": "Numbers with decimal points belong to the float class in Python.",
      "explanation": "In Python, numbers with decimal fractions are instances of the 'float' type.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_6",
      "category": "C Programming",
      "question": "In C, given int x = 5; what value is printed by printf(\"%d\", ++x); ?",
      "options": [
        "5",
        "6",
        "7",
        "4"
      ],
      "correctIndex": 1,
      "hint": "Pre-increment (++x) increments x before its value is used.",
      "explanation": "Pre-increment (++x) increments x from 5 to 6 immediately, so printf prints 6.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_7",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to create an unordered (bulleted) list?",
      "options": [
        "<ol>",
        "<li>",
        "<ul>",
        "<list>"
      ],
      "correctIndex": 2,
      "hint": "ul stands for Unordered List.",
      "explanation": "The <ul> tag defines an unordered (bulleted) list in HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z2_8",
      "category": "Logical Reasoning",
      "question": "If you are running a race and you overtake the person in second place, what position are you in now?",
      "options": [
        "First place",
        "Third place",
        "Last place",
        "Second place"
      ],
      "correctIndex": 3,
      "hint": "You took the place of the person who was second.",
      "explanation": "By overtaking the person in second place, you take their spot and become second yourself. The person in first place is still ahead of you.",
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
