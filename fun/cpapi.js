process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require('axios')

module.exports = function (x) {
	//console.dir(x)
	return new Promise(function(resolve, reject) {
		axios.defaults.headers.common['Accept'] = 'application/json'
		axios(x)
		.then(response => {
			resolve(response)
		})
		.catch(error => {
	        	reject(error)
		})
	})
}

