/**
 * MIND//MIND Cyber Arena - Question Set 4 (SET 4 (DELTA))
 * Stage 1: 4 Puzzles (Tough lengthy logical puzzles: 270s-300s; Easy code traces: 150s)
 * Stage 2: 8 Error Hunting Traps (Easy fresher bugs: 160s-180s)
 * Stage 3: 8 Buzzer Blitz Questions (Easy fundamentals: 45s-50s read, 10s lockout)
 */

const QUESTION_SET_4 = {
  "id": "set4",
  "name": "SET 4 (DELTA)",
  "description": "Circular Table Seating Logic, 1947 Calendar Deduction, C Increment Traces, Python String Repetition & Easy Syntax Traps",
  "round1": [
    {
      "id": "v4_1",
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
      "id": "v4_2",
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
      "id": "v4_3",
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
      "id": "v4_4",
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
    }
  ],
  "round2": [
    {
      "id": "b4_1",
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
      "id": "b4_2",
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
      "id": "b4_3",
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
      "id": "b4_4",
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
      "id": "b4_5",
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
      "id": "b4_6",
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
      "id": "b4_7",
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
      "id": "b4_8",
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
    {
      "id": "z4_1",
      "category": "Python",
      "question": "In Python, which data type is used to represent text wrapped in quotes (e.g. \"Hello\")?",
      "options": [
        "str",
        "txt",
        "char",
        "string"
      ],
      "correctIndex": 0,
      "hint": "Short for 'string'.",
      "explanation": "In Python, text data is represented by the 'str' (string) type.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z4_2",
      "category": "C Programming",
      "question": "In C, which printf format specifier is used to display a string of text?",
      "options": [
        "%c",
        "%s",
        "%d",
        "%text"
      ],
      "correctIndex": 1,
      "hint": "%s stands for string.",
      "explanation": "%s is the format specifier for null-terminated strings in C.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z4_3",
      "category": "Basic HTML",
      "question": "Which HTML tag, placed inside the <head> element, defines the browser tab title?",
      "options": [
        "<header>",
        "<h1>",
        "<title>",
        "<meta>"
      ],
      "correctIndex": 2,
      "hint": "It sets the title of the document.",
      "explanation": "The <title> tag sets the title displayed in the browser tab.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z4_4",
      "category": "Logical Reasoning",
      "question": "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
      "options": [
        "$0.10 (10 cents)",
        "$0.01 (1 cent)",
        "$0.02 (2 cents)",
        "$0.05 (5 cents)"
      ],
      "correctIndex": 3,
      "hint": "Let Ball = B, then Bat = B + 1.00. The sum B + (B + 1.00) = 1.10.",
      "explanation": "If the ball is $0.05, the bat is $1.05 ($1.00 more). Together they cost $0.05 + $1.05 = $1.10.",
      "readTime": 50,
      "buzzTime": 10
    },
    {
      "id": "z4_5",
      "category": "Python",
      "question": "In Python, what is the output of len(\"hello\")?",
      "options": [
        "5",
        "4",
        "6",
        "0"
      ],
      "correctIndex": 0,
      "hint": "Count the characters: h-e-l-l-o.",
      "explanation": "\"hello\" contains 5 characters, so len() returns 5.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z4_6",
      "category": "C Programming",
      "question": "In C, which keyword is used to immediately exit a loop or switch statement?",
      "options": [
        "exit",
        "break",
        "stop",
        "return"
      ],
      "correctIndex": 1,
      "hint": "Commonly used in switch cases and while/for loops.",
      "explanation": "The 'break' keyword terminates the innermost loop or switch statement immediately.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z4_7",
      "category": "Basic HTML",
      "question": "In standard HTML, which tag defines the largest heading by default?",
      "options": [
        "<h6>",
        "<header>",
        "<h1>",
        "<big>"
      ],
      "correctIndex": 2,
      "hint": "Heading levels range from 1 to 6.",
      "explanation": "<h1> defines the highest-level and largest heading in HTML.",
      "readTime": 45,
      "buzzTime": 10
    },
    {
      "id": "z4_8",
      "category": "Logical Reasoning",
      "question": "How many months in a standard calendar year have 28 days?",
      "options": [
        "1 month",
        "2 months",
        "4 months",
        "All 12 months"
      ],
      "correctIndex": 3,
      "hint": "Every month has AT LEAST 28 days.",
      "explanation": "Every single month of the year has at least 28 days (February has 28 or 29, and all other months have 30 or 31). So all 12 months have 28 days.",
      "readTime": 45,
      "buzzTime": 10
    }
  ]
};

if (typeof window !== "undefined") {
  window.QUESTION_SET_4 = QUESTION_SET_4;
  if (!window.QUESTION_SETS) window.QUESTION_SETS = {};
  window.QUESTION_SETS["set4"] = QUESTION_SET_4;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = QUESTION_SET_4;
}
