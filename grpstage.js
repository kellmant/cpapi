var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
var mytypes = {}
var args = process.argv.slice(2);
var argkey = args[0];
var argname = args[1];

const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/concat')
const postobj = require('./fun/post')
const grabin = require('./fun/grab')
//
const dataobj = {}
dataobj.mycmd = 'show-objects'
dataobj.type = 'object'
const apishow = {}
var mytoken = {}
apishow.pkgs = 'show-packages'
apishow.gws = 'show-gateways-and-servers'
apishow.networks = 'show-networks'
apishow.ranges = 'show-address-ranges'
apishow.hosts = 'show-hosts'
const apiget = {}
apiget.pub = 'show-last-published-session'
apiget.pkg = 'show-package'
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var myobjs = []
var allobjs = []
var alltypes = ['host', 'network', 'group', 'address-range', 'service-tcp', 'service-udp', 'service-other', 'service-dce-rpc', 'service-rpc']
var doops = 'add-'
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
var netroot = argkey 

console.log(netroot)

/**
 * get objects from the cpapi host
getallobjs()
.then(indexobjs)
.then(arrobjs)
.then(dumpout)
.then(saveobjs)
*/

// read local dump file (for faster testing)
//const mydatfile = require('./backup.json')
//indexobjs(mydatfile)
//.then(dumpout)
//saveobjs(mydatfile)

/** 
 * get api calls from staging and
 * dump to <doops>-staged.json file for later processing
 *
*/
gettype()
.then(setit)
.then(proctype)
.then(console.dir)
/**
.then(setit)
.then(proctype)
.then(dumpnow)
.then(console.log)
*/

/**
 * post from local json data dump
 *
const mydatfile = require('./add-staged.json')
postcmd(mydatfile)
.then(myClose)
.then(console.log)
 * */

/**
 * @function getallobjs
 *
 * Get all objects from the Check Point API
 * 
 * @requires bin/credentials
 * @requires bin/auth
 * @requires bin/close
 * @requires fun/concat
 *
 */
async function getallobjs () {
	try {
		let getobjs = []
		let mycred = await myCredentials()
		const mytoken = await myAuth(mycred)
		console.dir(await mytoken)
		getobjs = getobjs.concat(await pagein(mytoken, dataobj.mycmd))
		const myend = await myClose(mytoken)
		console.log(await myend)
		return await getobjs
	} catch (error) {
		console.log(error.response)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}

function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @function indexobj
 *
 * collect and index returned objects
 *
 * @param from getobjs return
 *
 */

async function indexobjs (x) {
	//var myCpdb = Object.keys(x)
	for (var t in x) {
		myobjs = myobjs.concat(x[t].objects)
		//myobjs.push((x[t].objects))
	}
	return await myobjs
}

/**
 * @function arrobjs
 *
 * create an array of all objects at the top level
 *
 * @parm myobjs from indexobj
 *
 */

async function arrobjs (x) {
	for (var t in x) {
		allobjs = allobjs.concat(x[t])
	}
	return await allobjs
}

/**
 * @function saveobjs
 *
 * save the array of objects to keystore
 *
 */
 
async function saveobjs (rebuild) {
	try {
		Object.keys(rebuild).forEach(function(key) {
			const Cpobj = new Cpclass(rebuild[key])
			var mytype = Cpobj.type
			if (mytype === '') {
				mytype = 'nulltype'
			}
			let myuid = Cpobj.uid
			let myname = Cpobj.name
			let myowner = rebuild[key]['meta-info'].creator
			let mymoder = rebuild[key]['meta-info']['last-modifier']
			var arrmembers = []
			var garrmembers = []
			var mykey = {}
			var mytags = Cpobj.tagem(rebuild[key])
			for (var g in mytags.tags) {
				for (var h in mytags.tags[g]) {
					arrmembers.push(mytags.tags[g][h].name)
					}
				}
			if (mytags.tags[g].length >= 1) {
				Cpobj.tagArr(arrmembers)
			} else {
				delete Cpobj.tags
			}
			if (alltypes.indexOf(mytype) >= 0) {
				let mysvctype = mytype.split('-')
				if (mysvctype[0] === 'service') {
					Cpobj[mysvctype[0]](rebuild[key])
				} else {
					Cpobj[mytype](rebuild[key])
				}
				if (mytype === 'group') {
					for (var g in Cpobj.members) {
						for (var h in Cpobj.members[g]) {
							garrmembers.push(Cpobj.members[g][h].name)
						}
					}
					Cpobj.groupArr(garrmembers)
				}
				delete Cpobj.uid
				delete Cpobj.type
				if (mymoder === 'System') {
					mykey.key = netroot + 'cfg/' + mymoder + '/' + mytype + '/' + myuid
				} else {
					mykey.key = netroot + 'api/' + mytype + '/' + myuid
				}
				mykey.value = Cpobj
			} else {
				mykey.key = netroot + 'cfg/' + mymoder + '/' + mytype + '/' + myuid
				mykey.value = rebuild[key]
			}
			setKey(mykey)
		});
		console.dir(' ')
	} catch (err) {
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}


async function gettype() {
	let showtype = await etcd.getSync(argkey)
	console.log(showtype.body.node.nodes)
	return await showtype.body.node.nodes
}

async function setit(x) {
	var thearr = []
	for (var key in x) {
		if (x[key].dir) {
			let a = x[key].key
			thearr = thearr.concat(a)
		}
	}
	console.log(await thearr)
	return await thearr.sort()
}


async function proctype (inkey) {
	mytypes.name = argname
	var members = []
	for (var key in inkey.reverse()) {
		//console.log(await mycmd)
		mytypes['members'] = await needkeys(inkey[key])
	}
	return await mytypes
}

async function needkeys(getem) {
	var mydata = await etcd.getSync(getem, { recursive: true })
	var members = []
	for (var membr in mydata.body.node.nodes) {
		let thisname = JSON.parse(mydata.body.node.nodes[membr].value)
		console.dir(thisname)
		members.push(thisname.name)
	}
	return await members
}

async function dumpout(x) {
	await dump('dumpit', x)
	return x
}

async function dumpnow(x) {
	await dump(doops + 'staged', x)
	return x
}

async function postcmd (x) {
	let mycred = await myCredentials()
	const mytoken = await myAuth(mycred)
	var myout = {}
	var pubcnt = 0
	for (var key in x) {
		console.log(await key)
		for (var vals in x[key]) {
			console.log(await key + ' ' + await x[key][vals].name)
			await postobj(mytoken, key, x[key][vals])
			await sleep(250)
			pubcnt++
			if (pubcnt > 39) {
				myout = await pubchange(mytoken)
				console.log('publish ' + await JSON.stringify(myout))
				pubcnt = 0
			}
		}
		myout = await pubchange(mytoken)
		console.log('completed ' + await key + ' ' + await JSON.stringify(myout))
	}
	//const myend = await myClose(mytoken)
	return await mytoken
}

async function pubchange (mytoken) {
		let mypubres = {}
		var myApi = new CpApi(mytoken)
		myApi.setCmd('publish')
		myApi.rmData()
		//myApi.print()
		mypubres = await myApi.apiPost()
		await sleep(4600)
		return await mypubres
}

