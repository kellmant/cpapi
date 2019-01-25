const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
// load keystore tools to use etcd as a var cache
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
//
var mytoken = {}
var mytypes = {}
var myaccess = {}
var mypol = 'access'
myaccess[mypol] = []
const apishow = {}
apishow.grps = 'show-groups'
apishow.pkgs = 'show-packages'
apishow.gws = 'show-gateways-and-servers'
apishow.networks = 'show-networks'
apishow.ranges = 'show-address-ranges'
apishow.hosts = 'show-hosts'
apishow.layers = 'show-access-layers'
const apiget = {}
apiget.pub = 'show-last-published-session'
apiget.pkg = 'show-package'
apiget.access = 'show-access-rulebase'
apiget.layer = 'show-access-layer'
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var myobjs = {}
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
var netroot = 'policy/'


apidata(apishow.pkgs)
.then(saveaccess)
.then(savethreat)
.then(startsession)
.then(getlayers)
.then(proctype)
.then(apicall)
.then(objcheck)
.then(rulecheck)
//.then(JSON.stringify)
//.then(console.log)
.then(endsession)

async function apidata(cmd) {
	try {
		console.log(' logging into api')
		let mycred = await myCredentials()
		mytoken = await myAuth(mycred)
		console.log(' Starting session: ' + await mytoken.uid)
		console.log('running api call: ' + cmd + ' . . . ')
		myobjs[cmd] = await pagein(mytoken, cmd)
		dump('last', myobjs)
		console.log('api session ' + mytoken.uid + ' COMPLETED object extraction ')
		const myend = await myClose(mytoken)
		console.log('Logout')
		console.log(await myend)
		return await myobjs[cmd]
	} catch (error) {
		console.log(error.response.data)
		console.log('api get data ERROR')
	} finally {
		console.log('api data retrival DONE')
	}
}


async function savepkgs(pkg) {
	try {
		Object.keys(pkg.packages).forEach(function(key) {
				let laykey = pkg.packages[key]
				const Cpobj = new Cpclass(laykey)
				let mytype = Cpobj.type
				let myuid = Cpobj.uid
				let mykey = {}
				if (myuid) {
				netroot = 'policy/' + mytype + '/' + myuid + '/'
				//	delete Cpobj.type
				//	delete Cpobj.uid
				//mykey.key = netroot + netdir 
				//mykey.value = Cpobj
				//setKey(mykey)
				}
		});
		return await pkg
	} catch (err) {
		console.log(err.message)
		console.log('save access ERROR')
	} finally {
		console.log('save access DONE')
	}
}


async function saveaccess(pkg) {
	try {
		Object.keys(pkg.packages).forEach(function(key) {
			let rtype = pkg.packages[key].type
			let ruid = pkg.packages[key].uid
			netroot = 'policy/'
			for (var g in pkg.packages[key]['access-layers']) {
				let laykey = pkg.packages[key]['access-layers'][g]
				const Cpobj = new Cpclass(laykey)
				let mytype = Cpobj.type
				let myuid = Cpobj.uid
				let mykey = {}
				if (myuid) {
				let netdir = mytype + '/' + myuid
					delete Cpobj.type
					delete Cpobj.uid
					delete Cpobj.color
					Cpobj['show-hits'] = true
				mykey.key = netroot + netdir 
				mykey.value = Cpobj
				setKey(mykey)
				}
			}
		});
		return await pkg
	} catch (err) {
		console.log(err.message)
		console.log('save access ERROR')
	} finally {
		console.log('save access DONE')
	}
}


async function savethreat(pkg) {
	try {
		Object.keys(pkg.packages).forEach(function(key) {
			let rtype = pkg.packages[key].type
			let ruid = pkg.packages[key].uid
			netroot = 'policy/'
			for (var g in pkg.packages[key]['threat-layers']) {
				let laykey = pkg.packages[key]['threat-layers'][g]
				const Cpobj = new Cpclass(laykey)
				let mytype = Cpobj.type
				let myuid = Cpobj.uid
				let mykey = {}
				if (myuid) {
				let netdir = mytype + '/' + myuid
					delete Cpobj.type
					delete Cpobj.uid
					delete Cpobj.color
				mykey.key = netroot + netdir 
				mykey.value = Cpobj
				setKey(mykey)
				}
			}
		});
		return await pkg
	} catch (err) {
		console.log(err.message)
		console.log('save threat ERROR')
	} finally {
		console.log('save threat DONE')
	}
}


async function getlayers() {
	let showtype = await etcd.getSync('policy/access-layer')
	return await showtype.body.node.nodes
}

async function proctype (inkey) {
	for (var key in inkey) {
		let a = inkey[key].key
		let b = a.split('/')
		let myid = b[3]
		mytypes[myid] = JSON.parse(inkey[key].value)
	}
	return await mytypes
}

async function needkeys(getem) {
	var mydata = await etcd.getSync(getem, { recursive: true })
	var myrepo = []
	for (var membr in mydata.body.node.nodes) {
		myrepo.push(JSON.parse(mydata.body.node.nodes[membr].value))
	}
	return await myrepo 
}

async function getuid(getem) {
	var mydata = await etcd.getSync('dict/' + getem)
	let mydataback = await JSON.parse(mydata.body.node.value)
	return await mydataback.name
}

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
		console.log('startsession API')
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

async function apicall(x) {
		for (var d in x) {
			//console.log(x[d])
			myaccess[mypol].push(await pagein(mytoken, apiget.access, x[d]))
			console.log(await ' processing ' + d)
		}
		dump('last', myaccess)
		return await myaccess
}

async function objcheck(x) {
	Object.keys(x.access).forEach(function(key) {
		var cpobj = {}
		var dict = x.access[key]['objects-dictionary']
		for (var p in dict) {
			let mykey = {}
			cpobj.type = dict[p].type
			cpobj.name = dict[p].name
			mykey.key = 'dict/' + dict[p].uid
			mykey.value = cpobj
			setKey(mykey)
		}
	});
	return await x
}

async function rulecheck(x) {
	for (var key in x.access) {
		var cpobj = {}
		var layer = x.access[key].name
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
			cpobj.position = rulenum
			cpobj.name = rules[p].name
			cpobj.source = source
			cpobj.destination = destination
			cpobj.service = service
			cpobj.vpn = vpn
			cpobj.action = action
			cpobj.content = content
			cpobj.track = track
			mykey.key = 'access/' + policy + '/' + rulenum
			mykey.value = cpobj
			setKey(mykey)
		}
	}
}
