#!/usr/bin/env node
var Registry = require('vscode-textmate').Registry;
var registry = new Registry();
var grammar = registry.loadGrammarFromPathSync(process.argv[2]);
var readline = require('readline');
var util = require('util');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var ruleStack = null;
var line = 1;

rl.on('line', function(line) {
    var r = grammar.tokenizeLine(line, ruleStack);
    console.log('Line: #' + line + ', tokens:\n' + util.inspect(r.tokens));
    ruleStack = r.ruleStack;
});

rl.on('close', function() {
    process.exit(0);
});

