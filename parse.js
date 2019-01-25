const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
var dl = require('datalib');
var data = dl.json('./last.json')
//const rebuild = require('./last.json')
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'net/'

runtime(data)
.then(parsein)
.then(JSON.stringify)
.then(console.log)

async function runtime (x) {
	try {
		//var myobj = dl.isObject(x)
		//var myarr = dl.isArray(x)
		//console.log(x + ' is object: ' + myobj)
		//console.log(x + ' is array: ' + myarr)
		var mykeys = dl.keys(x)
		return mykeys
	} catch (err) {
		console.log(err.message)
		//console.log('PROGRAM ERROR')
	} finally {
		//console.log('PROGRAM EXIT')
	}
}

async function parsein (x) {
	try {
		var myobjarr = {}
		for (var keys in x) {
			//console.log(x[keys])
			let kname = x[keys]
			myobjarr[kname] = []
			myobjarr[kname].push(await dl.vals(data[x[keys]]))
		}
		return await myobjarr
	} catch (err) {
		//console.log('PARSEIN ERROR')
		return
	}
}

async function getvals (x) {
	try {
		//console.log(x)
		var myvals = []
		for (var objs in x) {
			myvals.push(dl.vals(x[objs]))
			//myvals.objects = dl.vals(x[objs])
		}
		return myvals
	} catch (err) {
		return
		//console.log(err.message)
		//console.log('GETVALS ERROR')
	} finally {
		//console.log('GETVALS EXIT')
	}
}
