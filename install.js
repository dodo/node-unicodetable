#!/usr/bin/env node

var fs  = require('fs'),
    path = require('path'),
    http = require('http'),
    BufferStream = require('bufferstream'),

// http://www.ksu.ru/eng/departments/ktk/test/perl/lib/unicode/UCDFF301.html
keys =  ['value', 'name', 'category', 'class',
    'bidirectional_category', 'mapping', 'decimal_digit_value', 'digit_value',
    'numeric_value', 'mirrored', 'unicode_name', 'comment', 'uppercase_mapping',
    'lowercase_mapping', 'titlecase_mapping'],
unicodedatafile = {
    host: "unicode.org",
    path: "/Public/UNIDATA/UnicodeData.txt",
    method: 'GET',
    port:80,
},

counter = 0,
save = function (filename, object) {
    var filename = path.join(__dirname, "category", filename);
    var data = "module.exports=" + JSON.stringify(object);
    fs.writeFile(filename, data, 'utf8', function (err) {
        if (err) throw err;
        if (!--counter) console.log("done.");
    });
};

http.get(unicodedatafile, function (res) {
    var data = {},
        buffer = new BufferStream('utf8');

    console.log("fetching %s%s …", unicodedatafile.host, unicodedatafile.path);

    res.setEncoding('utf8');
    res.pipe(buffer);

    buffer.split('\n', function (line) {
        var v, c, char = {},
            values = line.toString().split(';');
        for(var i = 0 ; i < 15 ; i++)
            char[keys[i]] = values[i];
        v = parseInt(char.value, 16);
        c = char.category;
        if (!data[c])
            data[c] = {};
        data[c][v] = char;
    });

    buffer.on('end', function () {
        var cat, categories = Object.keys(data),
            len = counter = categories.length;
        for(var i = 0 ; i < len ; i++) {
            cat = categories[i];
            console.log("saving data as %s.js …", cat);
            save(cat + ".js", data[cat]);
        }
    });

    buffer.on('error', function (err) {
        if (typeof err === 'string')
            err = new Error(err);
        throw err;
    });

});

