"use strict";
//
// ID:v1.0 102318
// fun/concat.js
// loop call to get all cpapi objects returned, regardless of how many
// will page through however many are there of the objects requested
// needs a session token and api command to run
// against cpapi
// testing a version that concats the object together

const myoffset = 0
var inoffset = 0
const pglimit = 500
const detail = 'full'
const Cpapi = require('../class/cpapi')
const path = require('path');
const scriptname = path.basename(__filename);

module.exports = async (cpSession, mycmd) => {
	try {
		var myres = []
		var myarr = {}
		var myobj = []
		const myApi = new Cpapi(cpSession)
		if (mycmd.data) {
			myApi.setData(mycmd.data)
		}
		myApi.setCnt(myoffset, pglimit)
		myApi.setDetail(detail)
		myApi.setCmd(mycmd.cmd)
		myarr = await myApi.apiPost()
		myobj = myobj.concat(myarr)
		return await myobj
	} catch (error) {
		//console.log(error.response.data)
		return
	}
}
