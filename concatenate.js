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

    //create array from contents of source directory
    _fs.readdir(source, function (err, contents) {
        for (var file in contents) {
            if (contents[file].indexOf('.' + extension) > -1) {
                files.push(source+ contents[file]);
            }
        }

        concat(destination, files);
    });
};

concatenate('js', '../../public/js/concat.js', '../');

exports.concatenate = concatenate;