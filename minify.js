var minify = (function(undefined) {

	var exec = require('child_process').exec,
		_fs = require('fs'),
		out;

	var minify = function(options) {

		this.type = options.type;
		this.tempFile = (options.tempPath || '') + new Date().getTime().toString();

		//prepare input file format
		if (options.type == 'gcc' && typeof options.fileIn === 'string') {
			this.fileIn = [options.fileIn];
		} else if(typeof options.fileIn === 'string') {
			this.fileIn = options.fileIn;
		}

		//read the file contents
		if (typeof options.fileIn === 'object' && options.fileIn instanceof Array && options.type != 'gcc') {
			out = options.fileIn.map(function(path) {
				return _fs.readFileSync(path, 'utf8');
			});

			_fs.writeFileSync(this.tempFile, out.join('\n'), 'utf8');

			this.fileIn = this.tempFile;
		} else if(typeof options.fileIn === 'object' && options.fileIn instanceof Array && options.type == 'gcc') {
			this.fileIn = options.fileIn;
		}

		//set options
		this.fileOut = options.fileOut;
		this.options = options.options || [];

		//with larger files you will need a bigger buffer for closure compiler
		this.buffer = options.buffer || 1000 * 1024;

		if (typeof options.callback !== 'undefined') {
			this.callback = options.callback;
		}

		//compress file
		this.compress();
	};

	minify.prototype = minify.fn = {
		type 		: null,
		fileIn 		: null,
		fileOut 	: null,
		callback 	: null,
		buffer 		: null,
		compress	: function () {
			var minify = this, command, fileInCommand;

			switch (this.type) {
				case 'yui':
				case 'yui-css':
					command = 'java -jar -Xss2048k "' +
								__dirname +
								'/yuicompressor-2.4.7.jar" "' +
								this.fileIn +
								'" -o "' +
								this.fileOut +
								'" --type css ' +
								this.options.join(' ');
					break;
				case 'yui-js':
					command = 'java -jar -Xss2048k "' +
								__dirname +
								'/yuicompressor-2.4.7.jar" "' +
								this.fileIn + '" -o "' +
								this.fileOut +
								'" --type js '
								+ this.options.join(' ');
					break;
				case 'gcc':
					fileInCommand = this.fileIn.map(function(file) {
						return '--js="' + file + '"';
					});
					command = 'java -jar "' +
								__dirname +
								'/google_closure_compiler-r1918.jar" ' +
								fileInCommand.join(' ') +
								' --js_output_file="' +
								this.fileOut +
								'" ' +
								this.options.join(' ');
					break;
				case 'uglifyjs':
					command = '"' + __dirname  +
								'/node_modules/uglify-js/bin/uglifyjs" --output "' +
								this.fileOut +
								'" --no-copyright "' +
								this.fileIn + '" ' +
								this.options.join(' ');
					break;
			}

			exec(command, { maxBuffer: this.buffer }, function (err, stdout, stderr) {

				if (minify.fileIn === minify.tempFile) {
					// remove the temp concat file here
					_fs.unlinkSync(minify.tempFile);
				}

				if (minify.callback) {
					minify.callback(err || null);
				}
			});
		}
	};

	return minify;
}());

exports.minify = minify;

// EXAMPLE USAGE

// var compressor = require('minify');

// new compressor.minify({
//     type: 'gcc',
//     fileIn: 'example.js',
//     fileOut: 'gcc.js',
//     callback: function (err) {
//         console.log(err ? 'Error: ' + err : 'minification successful using google closure compiler');
//     }
// });