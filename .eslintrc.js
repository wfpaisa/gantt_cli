// FOR VUE
module.exports = {
  "root": true,
  "extends": [
    "plugin:vue/recommended", // ver-> https://alligator.io/vuejs/vue-eslint-plugin/
  //   "plugin:prettier/recommended",
    "eslint:recommended"
  ],
  parserOptions: {
    "parser": "babel-eslint"
  },
  "rules": {
      // Disallow the use of debugger
      "no-debugger": 0,

      // Disallow the use of alert, confirm, and prompt
      "no-alert": 0,
      
      // Disallow unused variables
      "no-unused-vars": [
          1,
          {
              "ignoreSiblings": true,
              "argsIgnorePattern": "res|next|^err"
          }
      ],
      
      // Require const declarations for variables that are never reassigned after declared
      // "prefer-const": [
      //     "error",
      //     {
      //         "destructuring": "all"
      //     }
      // ],

      // Require destructuring from arrays and/or objects
      "prefer-destructuring": ["error", {
          "object": false,
          "array": false
      }],

      // require braces around arrow function bodies
      "arrow-body-style": [
          2,
          "as-needed"
      ],

      // disallow unused expressions
      "no-unused-expressions": [
          2,
          {
              "allowTaggedTemplates": true
          }
      ],

      // disallow reassigning function parameters
      "no-param-reassign": [
          2,
          {
              "props": false
          }
      ],

      // disallow the use of console
      "no-console": 0,

      // require or disallow named function expressions
      "func-names": 0,

      // enforce consistent spacing before function definition opening parenthesis
      "space-before-function-paren": 0,

      // require or disallow trailing commas
      "comma-dangle": 0,

      // enforce a maximum line length (80)
      "max-len": 0,

      // disallow dangling underscores in identifiers
      "no-underscore-dangle": 0,

      // require return statements to either always or never specify values
      "consistent-return": 0,
      
      // enforce the consistent use of the radix argument when using parseInt()
      "radix": 0,

      // disallow variable declarations from shadowing variables declared in the outer scope
      "no-shadow": [
          2,
          {
              "hoist": "all",
              "allow": [
                  "resolve",
                  "reject",
                  "done",
                  "next",
                  "err",
                  "error"
              ]
          }
      ],

      // enforce the consistent use of either backticks, double, or single quotes
      "quotes": [
          2,
          "single",
          {
              "avoidEscape": true,
              "allowTemplateLiterals": true
          }
      ],

      //'no-use-before-define': 0, //disallow the use of variables before they are defined

      //  support linting of ES2015+ (ES6+) import/export syntax, 
      "import": 0,

      // When there is only a single export from a module, prefer using default export over named export.
      "import/prefer-default-export": 0,

      // A list of file extensions that will be parsed as modules and inspected for exports.
      "import/extensions": 0,

  }
}