"use strict";
//
// ID:v1.0 102318
// fun/grab.js
// single call to get all cpapi objects returned without paging
// needs a session token and api command to run
// against cpapi

const detail = 'standard'
const Cpapi = require('../class/cpapi')
const path = require('path');
const scriptname = path.basename(__filename);

module.exports = async (cpSession, mycmd) => {
	try {
		var myarr = {}
		const myApi = new Cpapi(cpSession)
		if (mycmd.data) {
			myApi.setData(mycmd.data)
		}
		myApi.setCmd(mycmd.cmd)
		myarr = await myApi.apiPost()
		return await myarr
	} catch (err) {
		console.log(err.message)
		throw new Error(err)
	}
}
