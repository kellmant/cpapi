const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
var dl = require('datalib');
var data = require('./mychange.json')
var groupBy = require('json-groupby')
var diff = require('variable-diff')
//const ddiff = require("deep-object-diff").diff
const changesets = require("diff-json")
//const rebuild = require('./last.json')
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const dump = require('./fun/writefile')
const netroot = 'net/'
var mykeys = []
const mychanges = {}

runtime(data)
.then(parsein)
.then(getvals)
//.then(console.dir)

async function runtime (x) {
	try {
		var toparr = dl.isArray(x)
		//console.log(' var ' + x + ' is array: ' + toparr + ' \n')
		for (var o in x) {
			var myobj = dl.isObject(x[o])
			var myarr = dl.isArray(x[o])
			//console.log(' key ' + o + ' is object: ' + myobj)
			//console.log(' key ' + o + ' is array: ' + myarr + ' \n')
			//console.log(x[o])
			mykeys = mykeys.concat(x[o])
		}
		//await dump('pdmp', mykeys)
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
		var myobjarr = []
		//myobjarr = groupBy(x, ['uid'])
		//let kname = x[keys].type
		for (var ops in x) {
			//myobjarr = x.concat(dl.vals(x[keys]))
			//console.log(x[ops].operations['modified-objects'])
			myobjarr = myobjarr.concat(x[ops].operations['modified-objects'])
		}
		console.log('\n')
		//myobjarr = groupBy(myobjarr, ['uid'])
		//await dump('prr', myobjarr)
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
		var mydiffs = []
		for (var obj in x) {
			//myvals.push(x[obj])
			//myvals[obj] = []
			let newobj = x[obj]['new-object']
			let oldobj = x[obj]['old-object']
			var nameobj = newobj['name']
			mychanges[nameobj] = []
			let nameit = 'ddd_' + obj
			//await dump(nameit + 'new', newobj)
			//await dump(nameit + 'old', oldobj)
			//myvals = myvals.concat(ddiff(oldobj, newobj))
			delete oldobj['meta-info']
			delete newobj['meta-info']
			mychanges[nameobj] = mychanges[nameobj].concat(changesets.diff(oldobj, newobj))
			let shdiff = diff(oldobj, newobj)
			console.log(nameobj)
			console.log(shdiff.text + ' \n')
		}
		await dump('ddd_', mychanges)
		return await mychanges
	} catch (err) {
		return
		//console.log(err.message)
		//console.log('GETVALS ERROR')
	} finally {
		//console.log('GETVALS EXIT')
	}
}

async function dumpout (x) {
	await dump('out', x)
	return x
}

