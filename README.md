JSB
=========

### fast lexical analyser ###

Fast lexical analyser done for fun, this take a JSON lexical grammar as input, produce a finite state automaton data structure which can be used to do fast lexical analysis of a string input.

The original goal was to do the simplest & fastest lexical analyser.

The JSON lexical grammar is made of a "token" array containing a list of tokens and a "syntax" object containing regular expression rules with associated token identifier (the position of the token in the "token" array), rules can contain sub-rules.

You can find grammar examples for C and Pure Basic in the "json" folder.

The demo let you load the examples and/or change source-code/grammar and see the complete ouput of the lexer along with benchmarking result.

The REGEX system is custom and does not use any libraries.

How to use :

`var lexer = new JSB.Lexer(json_lexical_grammar); // build the finite state automaton`

`var result = lexer.perform(string_to_analyse); // use it`

**result** will contain an array of lexeme objects which will contain **value**, **token**, **line**, **column** properties

All the lexer code is contained in the **lexer.js** file.

### License ###

Do what you want.


