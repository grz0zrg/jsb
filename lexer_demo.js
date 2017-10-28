/*jslint browser: true*/
/*continue: true*/
/*global JSB,$,performance*/

$(document).ready(function () {
    "use strict";
    
    var grammar_id = 0,
        grammar_list = [],
        do_demo = function (with_output) { // the demo core
            var lexer, result, grammar,
                lexer_init_time, scan_time,
                start, end,
                output_html = "", i = 0,
                lexeme_obj;

            try {
                grammar = JSON.parse($("#lexer_grammar").val());
            } catch (e) {
                $("#stderr").text("JSON grammar error: " + e);
                return;
            }

            $("#stderr").text("");

            start = performance.now();

            // lexer init
            lexer = new JSB.Lexer(grammar);

            lexer_init_time = performance.now() - start;
            start = performance.now();

            // lexer scan
            result  = lexer.perform($("#lexer_input").val());

            scan_time = performance.now() - start;

            // format all output
            if (with_output) {
                for (i = 0; i < result.length; i += 1) {
                    lexeme_obj = result[i];
                    lexeme_obj.value = lexeme_obj.value.replace(/</g, "&lt;");
                    lexeme_obj.value = lexeme_obj.value.replace(/>/g, "&gt;");
                    output_html += "<tr><th>" + lexeme_obj.value + "</th><td>" + lexeme_obj.token + "</td><td>" + lexeme_obj.line + ", " + lexeme_obj.column + "</td></tr>";
                }

                $("#lexer_output_tbody").html(output_html);
            }

            $("#bench_output").html("</br><div style=\"color: black;\">Benchmark (ms)</div><div style=\"display: inline-block;color: black;\">lexer init time: </div><div style=\"display: inline-block; margin-left: 12px;\">" + lexer_init_time + "</div></br><div style=\"display: inline-block; color: black;\">lexer scan time: </div><div style=\"display: inline-block; margin-left: 12px; \">" + scan_time + "</div>");
        },
        load_grammar = function (id) {
            $("#lexer_grammar").val(JSON.stringify(grammar_list[id].grammar, undefined, 3));
            $("#lexer_input").val(grammar_list[id].sample);
        };
    
    // fix mal-formed JSON warnings
    $.ajaxSetup({beforeSend: function (xhr) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/json");
        }
    }});
    
    // this load all availables JSON grammar and associated examples
    $.getJSON("json/grammar_list.json").done(function (data) {
        var i = 0, j = 0, key;
        
        $("#grammar_select").html("");

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                $("#grammar_select").append("<option value=\"" + j + "\">" + data[key].name + "</option>");

                $.getJSON("json/" + key, (function (obj) {
                    return function (grammar_data) {
                        grammar_list.push({grammar: grammar_data, sample: obj.sample});
                        if (i === grammar_id) { // default grammar
                            load_grammar(grammar_id);
                        }
                        i += 1;
                    };
                }(data[key])));
                
                j += 1;
            }
        }
    });
    
    $("#grammar_select").on('change', function () {
        grammar_id = this.value;
        
        load_grammar(grammar_id);
        
        do_demo(true);
    });
    
    $("#no_output_button").click(function () {
        do_demo(false);
        
        $("#lexer_output").html("");
    });
        
    $("#scan_button").click(function () {
        $("#lexer_output").html("<table class=\"lexer_output\"><caption>The lexer output</caption><thead><tr><th>Value</th><th>Token</th><th>Line and column</th></tr></thead><tbody id=\"lexer_output_tbody\"></tbody></table>");
        
        do_demo(true);
    });
});