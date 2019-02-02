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

module.exports = async (cpSession, mycmd, mydata) => {
	try {
		var myres = []
		var myarr = {}
		var myobj = []
		const myApi = new Cpapi(cpSession)
		if (mydata) {
			myApi.setData(mydata)
		}
		myApi.setCnt(myoffset, pglimit)
		myApi.setDetail(detail)
		myApi.setCmd(mycmd)
		myarr = await myApi.apiPost()
		if (myarr.total > myarr.to) {
			//myobj.push(myarr)
			myobj = myobj.concat(myarr)
			while (myarr.total >= inoffset) {
				console.log('From ' + myarr.from + ' to ' + myarr.to + ' of ' + myarr.total + ' indexed')
				inoffset = Number(myarr.to)
				myApi.setCnt(inoffset, pglimit)
				myarr = await myApi.apiPost()
				//myobj.push(myarr)
				myobj = myobj.concat(myarr)
			}
			return await myobj
		} else {
		return await myarr
		}
	} catch (error) {
		//console.log(error.response.data)
		return
	}
}
