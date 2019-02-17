//stage.js for staging changes through the api
//
// load keystore tools to use etcd as a var cache
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
var mytypes = {}

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
var alltypes = ['host', 'network', 'group']
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'stage/'
const mydat = require('./backup.json')

getallobjs()
.then(indexobjs)
.then(arrobjs)
.then(saveobjs)

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

async function indexobjs (x) {
	var myCpdb = Object.keys(x)
	for (var t in myCpdb) {
		myobjs = myobjs.concat(x[t].objects)
	}
	return await myobjs
}

async function arrobjs (x) {
	for (var t in x) {
		allobjs = allobjs.concat(x[t])
	}
	return await allobjs
}
async function saveobjs (rebuild) {
	try {
		Object.keys(rebuild).forEach(function(key) {
			const Cpobj = new Cpclass(rebuild[key])
			var mytype = Cpobj.type
			let myuid = Cpobj.uid
			let myname = Cpobj.name
			var arrmembers = []
			var garrmembers = []
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
				Cpobj[mytype](rebuild[key])
				if (mytype === 'group') {
					for (var g in Cpobj.members) {
						for (var h in Cpobj.members[g]) {
							garrmembers.push(Cpobj.members[g][h].name)
						}
					}
					Cpobj.groupArr(garrmembers)
				}
			let mykey = {}
			let netdir = mytype + '/' + myuid
			delete Cpobj.uid
			delete Cpobj.type
			mykey.key = netroot + netdir 
			mykey.value = Cpobj
			setKey(mykey)
			}
		});
		console.dir(' ')
	} catch (err) {
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}

async function gettype() {
	let showtype = await etcd.getSync(netroot)
	//console.log(await showtype.body.node.nodes)
	return await showtype.body.node.nodes
}

async function setit(x) {
	var thearr = []
	for (var key in x) {
		if (x[key].dir) {
			let a = x[key].key
			let b = a.split('/')
			thearr = thearr.concat(b[2])
		}
	}
	return await thearr.sort()
}


async function proctype (inkey) {
	for (var key in inkey.reverse()) {
		mycmd = 'set-' + inkey[key]
		//console.log(await mycmd)
		mytypes[mycmd] = await needkeys(netroot + inkey[key])
	}
	return await mytypes
}

async function needkeys(getem) {
	let mydata = await etcd.getSync(getem, { recursive: true })
	let myrepo = []
	for (var membr in mydata.body.node.nodes) {
		myrepo.push(JSON.parse(mydata.body.node.nodes[membr].value))
	}
	return await myrepo 
}

async function dumpout(x) {
	await dump('output', x)
	return x
}

async function postcmd (x) {
	var myout = {}
	var pubcnt = 0
	for (var key in x) {
		console.log(await key)
		for (var vals in x[key]) {
			//console.log(await key + ' ' + await x[key][vals].name)
			await postobj(mytoken, key, x[key][vals])
			await sleep(250)
			pubcnt++
			if (pubcnt > 39) {
				myout = await pubchange()
				console.log('publish ' + await JSON.stringify(myout))
				pubcnt = 0
			}
		}
		myout = await pubchange()
		console.log('completed ' + await key + ' ' + await JSON.stringify(myout))
	}
	return await myout
}

async function pubchange () {
		let mypubres = {}
		var myApi = new CpApi(mytoken)
		myApi.setCmd('publish')
		myApi.rmData()
		//myApi.print()
		mypubres = await myApi.apiPost()
		await sleep(4600)
		return await mypubres
}

