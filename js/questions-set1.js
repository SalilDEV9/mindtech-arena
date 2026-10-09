/**
 * MIND//MIND Cyber Arena - Question Set 1 (SET 1 (ALPHA))
 * Stage 1: 4 Puzzles (Tough lengthy logical puzzles: 270s-300s; Easy code traces: 150s)
 * Stage 2: 8 Error Hunting Traps (Easy fresher bugs: 160s-180s)
 * Stage 3: 8 Buzzer Blitz Questions (Easy fundamentals: 50s-55s read, 10s lockout)
 */

const QUESTION_SET_1 = {
  "id": "set1",
  "name": "SET 1 (ALPHA)",
  "description": "5-Person Seating Deduction, Torch Bridge Crossing, C Variable Swaps, Python String Indexing & Easy Syntax Traps",
  "round1": [
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
    }
  ],
  "round2": [
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
    }
  ],
  "round3": [
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
