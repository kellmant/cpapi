// destroy.js to remove objects in cpapi
// load keystore tools to use etcd as a var cache
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
var mytypes = {}

const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const postobj = require('./fun/post')
const delobj = require('./fun/delobj')
const grabin = require('./fun/grab')
//
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
var myobjs = {}
var change = {}
myobjs.change = change
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'obj/'

startsession()
.then(gettype)
.then(setit)
.then(proctype)
.then(postcmd)
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
		console.log('startsession EXIT')
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

async function gettype() {
	let showtype = await etcd.getSync('obj')
	console.log(await showtype.body.node.nodes)
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
	for (var key in inkey) {
		let a = inkey[key]
		mycmd = 'delete-' + a
		console.log(await mycmd)
		console.log(await a)
		mytypes[mycmd] = await needkeys('obj/' + a)
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
}

async function postcmd(x) {
	var mypubsess = {}
	var count = 0
	for (var key in x) {
		for (var vals in x[key]) {
			console.log(await key + ' ' + x[key][vals].name)
			await delobj(mytoken, key, x[key][vals])
			await sleep(260)
			count++
			if (count > 63) {
				mypubsess = await pubchange()
				console.log(await mypubsess)
				count = 0
			}
		}
		mypubsess = await pubchange()
		console.log(await key)
	}
	return await mypubsess
}

async function pubchange() {
		let mypubres = {}
		var myApi = new CpApi(mytoken)
		myApi.setCmd('publish')
		myApi.rmData()
		//myApi.print()
		mypubres = await myApi.apiPost()
		await sleep(4400)
		return await mypubres
}

