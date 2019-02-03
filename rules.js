// load keystore tools to use etcd as a var cache
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
var mytypes = {}

const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const postobj = require('./fun/post')
const grabin = require('./fun/grab')
//
const apishow = {}
var mytoken = {}
var myaccess = {}
var mypol = 'access'
myaccess[mypol] = []
apishow.pkgs = 'show-packages'
apishow.gws = 'show-gateways-and-servers'
apishow.networks = 'show-networks'
apishow.ranges = 'show-address-ranges'
apishow.hosts = 'show-hosts'
const apiget = {}
apiget.pub = 'show-last-published-session'
apiget.access = 'show-access-rulebase'
apiget.pkg = 'show-package'
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var myobjs = {}
var change = {}
myobjs.change = change
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'policy/access-layer/'

startsession()
.then(xtype)
.then(saveaccess)
//.then(proctype)
//.then(console.log)
.then(postcmd)
.then(showit)
.then(objcheck)
.then(rulecheck)
.then(endsession)

async function startsession() {
	try {
		console.log(' logging into api')
		let mycred = await myCredentials()
		mytoken = await myAuth(mycred)
		return await mytoken
	} catch (error) {
		console.log(error.response.data)
		console.log('startsession ERROR')
	} finally {
		console.log('startsession')
	}
}


async function endsession() {
	try {
		const myend = await myClose(mytoken)
		return await myend
	} catch (error) {
		console.log(error.response.data)
		console.log('endsession ERROR')
	} finally {
		console.log('endsession EXIT')
	}
}

function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
}

async function xtype () {
	myobjs[apishow.pkgs] = await pagein(mytoken, apishow.pkgs)
	return await myobjs[apishow.pkgs]
}

async function saveaccess(pkg) {
	try {
		var thearr = []
		var mycmd = 'add-package'
		for (var key in pkg.packages) {
			let rtype = pkg.packages[key].type
			let ruid = pkg.packages[key].uid
			for (var g in pkg.packages[key]['access-layers']) {
				let laykey = pkg.packages[key]['access-layers'][g]
				const Cpobj = new Cpclass(laykey)
				let mytype = Cpobj.type
				let myuid = Cpobj.uid
				let myname = Cpobj.name
				if (myname !== 'Network') {
					delete Cpobj.type
					delete Cpobj.uid
					thearr = thearr.concat(Cpobj)
				}
			}
		}
		mytypes[mycmd] = thearr
		return await mytypes
	} catch (err) {
		console.log(err.message)
		console.log('save access ERROR')
	} finally {
		console.log('save access DONE')
	}
}


async function dumpout(x) {
	await dump('output', x)
}

async function showit() {
	//console.dir(myaccess)
	return await myaccess
}

async function postcmd(x) {
	var myout = {}
	//var pubcnt = 0
	for (var key in x) {
		console.log(await key)
		for (var vals in x[key]) {
			var myname = x[key][vals].name
			if (myname !== 'Network') {
				//console.log(myname)
				let myrules = {}
				myrules.name = myname
				let mypkg = myname.split(' ')
				x[key][vals].name = mypkg[0]
				delete x[key][vals]['show-hits']
				//await postobj(mytoken, key, x[key][vals])
				//await sleep(250)
				await ruleget(myrules)
				//pubcnt++
				//if (pubcnt > 39) {
				//	myout = await pubchange()
				//	console.log('publish ' + await JSON.stringify(myout))
				//	pubcnt = 0
				//}
			}
		}
		//myout = await pubchange()
		console.log('completed ' + await key + ' ' + await JSON.stringify(myout))
	}
	return await myaccess
}

async function pubchange() {
		let mypubres = {}
		var myApi = new CpApi(mytoken)
		myApi.setCmd('publish')
		myApi.rmData()
		//myApi.print()
		mypubres = await myApi.apiPost()
		await sleep(4600)
		return await mypubres
}

async function ruleget(x) {
		//for (var d in x) {
			//console.log('ruleget of ' + JSON.stringify(x))
			myaccess[mypol].push(await pagein(mytoken, apiget.access, x))
			//console.log(apiget.access + ' processing ' + JSON.stringify(await x))
		//}
		//dump('last', myaccess)
		//console.log(JSON.stringify(await myaccess))
		return await myaccess
}

async function objcheck(x) {
	for (var key in x.access) {
		var cpobj = {}
		var dict = x.access[key]['objects-dictionary']
		for (var p in dict) {
			let mykey = {}
			cpobj.type = dict[p].type
			cpobj.name = dict[p].name
			mykey.key = 'dict/' + dict[p].uid
			mykey.value = cpobj
			await setKey(mykey)
		}
	}
	return await x
}

async function getuid(getem) {
	var mydata = await etcd.getSync('dict/' + getem)
	var mydataback = JSON.parse(await mydata.body.node.value)
	return await mydataback.name
}

async function rulecheck(x) {
	for (var key in x.access) {
		var cpobj = {}
		var layer = x.access[key].name
		var mypkg = layer.split(' ')
		var policy = x.access[key].uid
		var rules = x.access[key].rulebase
		for (var p in rules) {
			let mykey = {}
			let rulenum = rules[p]['rule-number']
			let track = await getuid(rules[p].track.type)
			let action = await getuid(rules[p].action)
			var source = []
			for (var i in rules[p].source) {
			source.push(await getuid(rules[p].source[i]))
			}
			var destination = []
			for (var i in rules[p].destination) {
			destination.push(await getuid(rules[p].destination[i]))
			}
			var service = []
			for (var i in rules[p].service) {
			service.push(await getuid(rules[p].service[i]))
			}
			var vpn = []
			for (var i in rules[p].vpn) {
			vpn.push(await getuid(rules[p].vpn[i]))
			}
			var content = []
			for (var i in rules[p].content) {
			content.push(await getuid(rules[p].content[i]))
			}
			cpobj.layer = layer
			cpobj.position = 'bottom'
			cpobj.name = rules[p].name
			cpobj.source = source
			cpobj.destination = destination
			cpobj.service = service
			cpobj.vpn = vpn
			cpobj.action = action
			cpobj.content = content
			cpobj.track = track
			mykey.key = 'pkg/' + mypkg[0] + '/' + rulenum
			mykey.value = cpobj
			await setKey(mykey)
		}
	}
	return await x
}

