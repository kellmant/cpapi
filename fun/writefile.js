var fs = require('fs');

module.exports = (d,x) => {
	return new Promise(function(resolve, reject) {
		const newfile = d + '.json'
		console.log('Writing ' + d + ' output to ' + newfile)
		fs.writeFile(newfile, JSON.stringify(x, undefined, 2), function(err, response) {
			if (err) {
				reject(err)
			} else {
				console.log(d + ' saved to ' + newfile)
				resolve(response)
			}
		})
	})
}
