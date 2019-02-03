const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/concat')
const grabin = require('./fun/grab')
//
const dataobj = {}
dataobj.mycmd = 'show-objects'
dataobj.type = 'object'
const apiget = {}
apiget.pub = 'show-last-published-session'
apiget.pkg = 'show-package'
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var dl = require('datalib');
var groupBy = require('json-groupby')
var nestBy = require('nest-by')
var myobjs = []
var sorted = []
var allobjs = {}
var localdat = require('./backup.json')

//runtime()
//.then(sortkeys)
//.then(console.dir)
sortkeys(localdat)
.then(keyarr)
//.then(setarr)
.then(keytype)
//.then(console.dir)

async function runtime () {
	try {
		let mycred = await myCredentials()
		const mytoken = await myAuth(mycred)
		console.dir(await mytoken)
		let inobjs = await pagein(mytoken, dataobj.mycmd)
		//console.log(await typeof myobjs)
		const myend = await myClose(mytoken)
		console.log(await myend)
		dump('backup', await inobjs)
		return await inobjs
	} catch (error) {
		console.log(error.response)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}

async function sortkeys(x) {
	try {
		for (var key in x) {
			let mykobj = x[key].objects
			sorted = sorted.concat(groupBy(mykobj, ['type']))

		}
		//let myshit = keyarr(sorted)
		dump('sort', await sorted)
		return await sorted
	} catch (err) {
		console.log(err.message)
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}

async function keyarr(x) {
	try {
		//myobjs.unique = dl.unique(x)
		//myobjs.named = dl.vals(x)
		Object.keys(x).forEach(function(key) {
			//myobjs.unique = dl.unique(x)
			myobjs = myobjs.concat(dl.keys(x[key]))
		});
		var myresp = dl.unique(await myobjs)
		myresp = myresp.filter(Boolean)
		//dump('tt', await myresp)
		return await myresp
	} catch (err) {
		console.log(err)
	}
}

async function setarr(x) {
	try {
		for (var i in x) {
			allobjs[x[i]] = []
		}
		return await allobjs
	} catch (err) {
		console.log(err.message)
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}

async function keytype(x) {
	try {
		for(let i = 0, l = sorted.length; i < l; i++) {
			let myot = await sorted[i]
			Object.keys(myot).forEach(function(prop) {
				//console.log(myot[prop])
				console.log(' SORTING ON ' + prop)
				//console.log(prop)
			});
			console.log(i)
		}
		return 
	} catch (err) {
		console.log(err.message)
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}
