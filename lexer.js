/*jslint browser: true*/
/*continue: true*/

var JSB = {

};

JSB.Tools = {
    isDigit: function (c) {
        "use strict";

        return (c > 47 && c < 58);
    },

    isLetter: function (c) {
        "use strict";

        return ((c > 64 && c < 91) || (c > 96 && c < 123));
    },

    isNewLine: function (c) {
        "use strict";

        return (c === 10);
    },

    isSpace: function (c) {
        "use strict";

        return (c === 32);
    },

    isTab: function (c) {
        "use strict";

        return (c === 9);
    }
};

/**
 * Represent a lexical analyser.
 * @constructor
 * @param {object} grammar - An object representing the lexical grammar.
 */
JSB.Lexer = function (grammar) {
    "use strict";

    /*
     * this transform the "generic" grammar data structure into an optimized grammar data structure by grouping elements into dictionnaries-like data structure (finite state automaton)
     *
     * The result of this step could be saved to a file or whatever and then fed to the perform function, the result is : extremely fast lexical analysis! :)
     */

    var i           = 0,
        j           = 0,
        k           = 0,
        char_code   = 0,
        lchar_code  = 0,
        rchar_code  = 0,
        ckey        = "",
        gkey        = "",
        expr_arr    = null,
        grp_arr     = null,
        char_arr    = null,
        tmp         = null,
        jsb_grammar = {
            "token"  : [],
            "group"  : [],
            "sclass" : {},
            "eclass" : {},
            "syntax" : {}
        };

    for (ckey in grammar.syntax) {
        expr_arr = ckey.split(" ");

        tmp = { };

        //char_code = ckey.charCodeAt(0);

        j = 0;

        for (gkey in grammar.syntax[ckey]) {
            if (gkey !== "tk" &&
                    gkey !== "n") {
                grp_arr = gkey.split(" ");

                for (i = 0; i < grp_arr.length; i += 1) {
                    tmp[grp_arr[i]] = grammar.syntax[ckey][gkey];
                }
            }

            j += 1;
        }

        if (j === 1) {
            tmp[ckey] = { tk: grammar.syntax[ckey].tk };
        }

        grammar.syntax[ckey].gr = jsb_grammar.group.length;
        jsb_grammar.group.push(tmp);

        jsb_grammar.sclass[k] = {};
        jsb_grammar.eclass[k] = {};

        for (i = 0; i < expr_arr.length; i += 1) {
            char_arr = expr_arr[i].split("-");

            if (char_arr.length === 1) {
                var len = expr_arr[i].length;

                char_code = char_arr[0].charCodeAt(0);

                if (len > 1) {
                    if (expr_arr[i].indexOf("*") !== -1) {
                        for (j = 0; j < 176; j += 1) {
                            //if (j !== char_code) {
                                jsb_grammar.sclass[k][j] = { };
                            //}
                        }

                        char_arr = expr_arr[i].split(".");

                        if (char_arr.length > 1) {
                            var end_char = char_arr[char_arr.length - 1].charCodeAt(0);
                            jsb_grammar.eclass[k][end_char] = {};
                        }
                    } else if (expr_arr[i][len - 1] === "+") {
                        jsb_grammar.sclass[k][char_code] = {};
                    }
                } /*else {
                    jsb_grammar.sclass[k][char_code] = {};
                }*/

                jsb_grammar.syntax[char_code] = { tk: grammar.syntax[ckey].tk,
                                                  cl: k,
                                                  gr: k};

            } else if (char_arr.length === 2) {
                lchar_code = char_arr[0].charCodeAt(0);
                rchar_code = char_arr[1].charCodeAt(0);

                for (j = lchar_code; j <= rchar_code; j += 1) {
                    jsb_grammar.syntax[j] = { tk: grammar.syntax[ckey].tk,
                                              gr: grammar.syntax[ckey].gr,
                                              cl: k};

                    jsb_grammar.sclass[k][j] = {};
                }
            }
        }

        k += 1;
    }

    jsb_grammar.token = grammar.token;

    this.grammar = jsb_grammar;
    this.result  = null;
};

/**
 * Perform lexical analysis.
 * @param {String} input - The input string on which lexical analysis will be performed.
 * @return
 */
JSB.Lexer.prototype.perform = function (input) {
    "use strict";

    this.result = [];

    var i              = 0,
        char           = 0,
        char_code      = 0,
        column         = 0,
        line           = 1,
        lexeme         = "",
        input_length   = input.length,
        grammar        = this.grammar,
        grammar_syntax = grammar.syntax,
        grammar_sclass = grammar.sclass,
        grammar_eclass = grammar.eclass,
        grammar_token  = grammar.token,
        grammar_group  = grammar.group,
        tmp            = null,
        token          = "";

    if (input_length > 0) {
        do {
            char_code = input.charCodeAt(i);

            tmp = grammar_syntax[char_code];

            if (JSB.Tools.isNewLine(char_code)) {
                line   += 1;
                column  = 0;
            }

            if (tmp) {
                lexeme = "";

                do {
                    char = input.charAt(i);

                    lexeme += char;

                    i      += 1;
                    column += 1;

                    char_code = input.charCodeAt(i);

                    if (grammar_eclass[tmp.cl][char_code]) {
                        lexeme += input.charAt(i);
                        i += 1;
                        break;
                    }
                } while (grammar_sclass[tmp.cl][char_code]);

                token = grammar_token[tmp.tk];

                tmp = grammar_group[tmp.gr][lexeme];

                if (tmp) {
                    token = grammar_token[tmp.tk];
                }

                this.result.push({ token : token,
                                   value : lexeme,
                                   line  : line,
                                   column: column - lexeme.length + 1});
            } else {
                i      += 1;
                column += 1;
            }
        } while (i !== input_length);
    }

    return this.result;
};
