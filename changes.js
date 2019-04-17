// load keystore tools to use etcd as a var cache
// changes.js check for policy and object changes from 
// day to day (or set timeframe tbd)
//
// NOTE USES NEW CONCAT function (fun/concat2.js)
//
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
var mytypes = {}

const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagearr = require('./fun/concat')
const pagein = require('./fun/concat2')
const postobj = require('./fun/post')
const grabin = require('./fun/grab2')
//
const apishow = {}
var mytoken = {}
var myaccess = {}
var mytaskid = {}
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
var dateobj = new Date(); 
var uptodate = dateobj.toISOString().slice(0, 19)
var mychange = {}
mychange.cmd = 'show-changes'
mychange.data = { 'from-date': '2019-04-12',
		  'to-date': uptodate }
var mytask = {}
mytask.cmd = 'show-task'
mytask.data = {}
var mypush = {}
mypush.cmd = 'show-gateways-and-servers'
mypush.data = {}
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var myobjs = {}
var change = {}
//myobjs.change = change
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'change/'

startsession()
.then(lastpush)
.then(reqdata)
.then(showtask)
.then(endsession)
.catch(endsession)

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
		await sleep(2000)
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

async function lastpush () {
	let objarr = []
	objarr = objarr.concat(await pagearr(mytoken, mypush.cmd))
	//console.dir(await objarr[0].objects)
	let secgw = await objarr[0].objects
	//console.dir(await objarr[0].objects.policy['access-policy-installation-date']['iso-8601'])
	for (var x in secgw) {
		if (secgw[x].policy['cluster-members-access-policy-revision']) {
			await dump('mylastpush', secgw[x].policy)
			console.dir(secgw[x].policy['access-policy-installation-date']['iso-8601'])
			let lastinstall = secgw[x].policy['access-policy-installation-date']['iso-8601']
			mychange.data = { 'from-date': lastinstall.slice(0, 16), 'to-date': uptodate }
		}
	}
	return await mychange.data
}

async function reqdata () {
	let taskarr = await pagein(mytoken, mychange)
	mytask.data = await taskarr[0]
	await dump('mytaskid', mytask.data)
	return await mytask
}

async function showtask () {
	let checkit = {}
	console.log(' ')
	do {
		checkit = await grabin(mytoken, mytask)
		//process.stdout.write('\033c');
		process.stdout.write(checkit.tasks[0].status + ' ' + checkit.tasks[0]['progress-percentage'] + '% COMPLETE ' + checkit.tasks[0]['progress-description'] + '                    \r')
		await sleep(1000)
	}
	while (checkit.tasks[0].status !== 'succeeded') 
	console.log(checkit.tasks[0].status + ' ' + checkit.tasks[0]['progress-percentage'] + '% COMPLETE ' + checkit.tasks[0]['progress-description'])
	await sleep(2000)
	change = await grabin(mytoken, mytask)
	await dump('mychange', change)
	console.dir(change.tasks[0])
	return await change
}

