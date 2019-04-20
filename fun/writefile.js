var fs = require('fs');

module.exports = (d,x) => {
	return new Promise(function(resolve, reject) {
		const newfile = d + '.json'
		fs.writeFile(newfile, JSON.stringify(x, undefined, 2), function(err, response) {
			if (err) {
				reject(err)
			} else {
				console.log('Object data saved to ' + newfile)
				resolve(response)
			}
		})
	})
}
