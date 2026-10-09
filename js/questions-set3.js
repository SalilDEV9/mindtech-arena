/**
 * MIND//MIND Cyber Arena - Question Set 3 (SET 3 (GAMMA))
 * Stage 1: 4 Puzzles (Tough lengthy logical puzzles: 270s; Easy code traces: 150s)
 * Stage 2: 8 Error Hunting Traps (Easy fresher bugs: 160s-180s)
 * Stage 3: 8 Buzzer Blitz Questions (Easy fundamentals: 45s-50s read, 10s lockout)
 */

const QUESTION_SET_3 = {
  "id": "set3",
  "name": "SET 3 (GAMMA)",
  "description": "Truth-Tellers & Liars Island, Multi-Pipe Reservoir Rates, C Single Pointers, Python Range Lengths & Easy Syntax Traps",
  "round1": [
    {
      "id": "v3_1",
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
      "id": "v3_2",
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
      "id": "v3_3",
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
      "id": "v3_4",
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
    }
  ],
  "round2": [
    {
      "id": "b3_1",
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
      "id": "b3_2",
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
      "id": "b3_3",
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
      "id": "b3_4",
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
      "id": "b3_5",
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
      "id": "b3_6",
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
      "id": "b3_7",
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
      "id": "b3_8",
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
    {
      "id": "z3_1",
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
      "id": "z3_2",
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
      "id": "z3_3",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to insert a line break without starting a new paragraph?",
      "options": [
        "<hr>",
        "<lb>",
        "<br>",
        "<break>"
      ],
      "correctIndex": 2,
      "hint": "'br' stands for break.",
      "explanation": "<br> inserts a single line break in HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z3_4",
      "category": "Logical Reasoning",
      "question": "If a fair coin is flipped 3 times and lands on Heads every time, what is the probability that the 4th flip will also be Heads?",
      "options": [
        "1/16 (6.25%)",
        "1/8 (12.5%)",
        "1/4 (25%)",
        "1/2 (50%)"
      ],
      "correctIndex": 3,
      "hint": "Each coin flip is an independent event.",
      "explanation": "Coin flips are independent events. Past outcomes have zero effect on future flips, so the probability remains 1/2 (50%).",
      "readTime": 50,
      "buzzTime": 10
    },
    {
      "id": "z3_5",
      "category": "Python",
      "question": "In Python, what is the boolean evaluation of an empty list: bool([]) ?",
      "options": [
        "False",
        "True",
        "None",
        "TypeError"
      ],
      "correctIndex": 0,
      "hint": "In Python, empty collections are falsy.",
      "explanation": "Empty collections (like [], {}, '') evaluate to False in boolean contexts.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z3_6",
      "category": "C Programming",
      "question": "In C, what is the index of the first element in any array?",
      "options": [
        "1",
        "0",
        "-1",
        "Depends on compiler"
      ],
      "correctIndex": 1,
      "hint": "C uses zero-based indexing.",
      "explanation": "Arrays in C are zero-indexed; the very first element is at index 0.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z3_7",
      "category": "Basic HTML",
      "question": "Which HTML tag is used to create a single row inside a table?",
      "options": [
        "<td>",
        "<th>",
        "<tr>",
        "<row>"
      ],
      "correctIndex": 2,
      "hint": "tr stands for Table Row.",
      "explanation": "<tr> defines a table row in HTML. Cells inside are defined by <td> or <th>.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z3_8",
      "category": "Logical Reasoning",
      "question": "Complete the word analogy: Pen is to Writer as Brush is to _______?",
      "options": [
        "Sculptor",
        "Canvas",
        "Book",
        "Painter"
      ],
      "correctIndex": 3,
      "hint": "A pen is the primary tool of a writer.",
      "explanation": "A writer uses a pen to create works of writing, just as a painter uses a brush to create paintings.",
      "readTime": 45,
      "buzzTime": 10
    }
  ]
};

if (typeof window !== "undefined") {
  window.QUESTION_SET_3 = QUESTION_SET_3;
  if (!window.QUESTION_SETS) window.QUESTION_SETS = {};
  window.QUESTION_SETS["set3"] = QUESTION_SET_3;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = QUESTION_SET_3;
}
