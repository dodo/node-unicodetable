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
systemfiles = [
    "/usr/share/unicode/UnicodeData.txt", // debian
    "/usr/share/unicode-data/UnicodeData.txt", // gentoo
    "UnicodeData.txt", // manually downloaded
],
unicodedatafile = {
    host: "unicode.org",
    path: "/Public/UNIDATA/UnicodeData.txt",
    method: 'GET',
    port:80,
},

refs = 0,

stringFromCharCode = String.fromCharCode,

// Based on http://mths.be/punycode
encode = function (codePoint) {
    var output = '';
    if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
    }
    output += stringFromCharCode(codePoint);
    return output;
},

stringify = function (key, value) {
    return key + ":" + JSON.stringify(value);
},

newFile = function (name, callback) {
    var filename = path.join(__dirname, "category", name + ".js"),
        file = fs.createWriteStream(filename, {encoding:'utf8'});
    file.once('close', function () {
        if (!--refs) {
            console.log("done.");
            callback();
        }
    });
    refs++;
    return file;
},

parser = function (callback) {
    var data = {},
        buffer = new BufferStream({encoding:'utf8', size:'flexible'}),
        resume = buffer.resume.bind(buffer);

    buffer.split('\n', function (line) {
        var v, c, char = {},
            values = line.toString().split(';');
        for(var i = 0 ; i < 15 ; i++)
            char[keys[i]] = values[i];
        v = parseInt(char.value, 16);
        char.symbol = encode(v);
        c = char.category;
        if (!data[c]) {
            data[c] = newFile(c, callback)
                .on('drain', resume)
                .once('open', function () {
                    console.log("saving data as %s.js …", c);
                    this.write('module.exports={' + stringify(v, char));
                    buffer.resume();
                });
            buffer.pause();
        } else if (!data[c].write("," + stringify(v, char))) {
            buffer.pause();
        }
    });


    buffer.on('end', function () {
        var cat, categories = Object.keys(data),
            len = categories.length;
        for(var i = 0 ; i < len ; i++) {
            cat = categories[i];
            data[cat].end("};");
        }
    });

    buffer.on('error', function (err) {
        if (typeof err === 'string')
            err = new Error(err);
        throw err;
    });

    return buffer;
},

read_file = function (success_cb, error_cb) {
    var systemfile, sysfiles = systemfiles.slice(),
    try_reading = function (success, error) {
        systemfile = sysfiles.shift();
        if (!systemfile) return error_cb();
        console.log("try to read file %s …", systemfile);
        fs.exists(systemfile, function (exists) {
            if (!exists) {
                console.error("%s not found.", systemfile);
                return try_reading(success_cb, error_cb);
            }
            console.log("parsing …");
            fs.createReadStream(systemfile, {encoding:'utf8'}).pipe(parser(success_cb));
        });

    };
    try_reading(success_cb, error_cb);
},

download_file = function (callback) {
    console.log("%s %s:%d%s", unicodedatafile.method, unicodedatafile.host,
                unicodedatafile.port, unicodedatafile.path);
    http.get(unicodedatafile, function (res) {
        console.log("fetching …");

        res.setEncoding('utf8');
        res.pipe(parser(callback));
    }).on('error', function (err) {
        console.error("Error while downloading %s: %s",
                      path.basename(unicodedatafile.path), err);
        console.log("Please download file manually,",
                    "put it next to the install.js file and",
                    "run `node install.js` again.");
        callback();
    });
    setTimeout(function () {
        console.error("request timed out.");
        callback();
    }, 30 * 1000);
};


// run

read_file(process.exit, function () {
    console.log("try to download …");
    download_file(process.exit);
});

