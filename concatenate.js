var concatenate = function (extension, destination, source) {

    // settings
    var FILE_ENCODING = 'utf-8',
        EOL = '\n',
        files = [],
        _fs = require('fs');

    //concatenate the files and write to destination
    function concat(destination, fileList) {

        var out = fileList.map(function (filePath) {
            return _fs.readFileSync(filePath, FILE_ENCODING);
        });

        _fs.writeFileSync(destination, out.join(EOL), FILE_ENCODING);

        console.log(destination + ' created from: ' + EOL + files);
    };

    var callback = function (err, contents) {
        for (var file in contents) {
            if (contents[file].indexOf('.' + extension) > -1) {
                files.push(source + contents[file]);
            }
        }
        concat(destination, files);
    };

    //create array from contents of source directory
    _fs.readdir(source, callback);
};

concatenate(process.argv[2], process.argv[3], process.argv[4]);

exports.concatenate = concatenate;