const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
var dl = require('datalib');
const rebuild = require('./last.json')
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'net/'

async function runtime () {
	try {
		var myobj = await dl.isObject(rebuild)
		var myarr = await dl.isArray(rebuild)
		console.log(await myobj)
		console.log(await myarr)
		var mykeys = await dl.keys(rebuild)
		var myvals = await dl.accessor('name', rebuild)
		console.log(await myvals)
		console.log(await mykeys)
	} catch (err) {
		console.log(err.message)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}


runtime()

