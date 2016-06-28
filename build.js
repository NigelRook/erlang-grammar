#!/usr/bin/env node
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var glob = Promise.promisify(require('glob'));

var out = path.join(__dirname, 'out');
var snippets;

var snippetsFile = path.join(__dirname, 'snippets.json');

fs.readFileAsync(snippetsFile, 'utf8').then(function(data) {
    snippets = JSON.parse(data);
}).then(function() {
    return fs.statAsync(out).then(function(stat) {
        if (stat.isDirectory) {
            return Promise.resolve();
        } else {
            return Promise.reject("Out exists but is not a directory")
        }
    }, function() {
        return fs.mkdirAsync(out, 0o777);
    })
}).then().then(function() {
    var inpath = path.join(__dirname, '*.json.in');
    return glob(inpath);
}).then(function(files) {
    return Promise.all(files.map(function(file) {
        return fs.readFileAsync(file, 'utf8').then(function(data) {
            var json = JSON.parse(data);
            var result = JSON.stringify(json, replacer, 4);
            var outfile = path.join(__dirname, 'out/', path.basename(file).replace(/\.in$/, ''));
            return fs.writeFileAsync(outfile, result, 'utf8');
        });
    }));
}).then(function(files) {
    console.log("Processed %d files", files.length);
    process.exit(0);
}).catch(function(err) {
    console.error(err);
    process.exit(1);
});

function replacer(key, value) {
    if (typeof value === 'string') {
        var match = value.match(/^\$\{inc:([^}]*)\}$/);
        if (match) {
            return replacer(key, snippets[match[1]]);
        } else {
            var newValue = value.replace(/\$\{([^}]*)\}/g, function(match, key) { return snippets[key]; })
            return newValue === value ? value : replacer(key, newValue);
        }
    }

    return value;
}
