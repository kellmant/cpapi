"use strict";
//
// ID:v1.0 102318
// fun/pub.js
// loop call to get all cpapi objects published, regardless of how many
// will page through however many are there of the objects requested
// needs a session token and api command to run
// against cpapi

const Cpapi = require('../class/cpapi')
const path = require('path');
const scriptname = path.basename(__filename);

module.exports = async (cpSession, mycmd, mydata) => {
	try {
		var myres = []
		var myarr = {}
		var myobj = []
		var myApi = new Cpapi(cpSession)
		myApi.setCmd(mycmd)
		myApi.setData(mydata)
		myarr = await myApi.apiPost()
		return await myarr
	} catch (error) {
		//return error.response.data
		//return
		console.log(error.response.data)
	}
}
