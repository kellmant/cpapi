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
const fs = require('fs')
var addcnt = 0
var delcnt = 0
var modcnt = 0
const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagearr = require('./fun/concat')
const pagein = require('./fun/concat2')
const postobj = require('./fun/post')
const grabin = require('./fun/grab2')
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
const dl = require('datalib');
const diff = require('variable-diff')
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
//const ddiff = require("deep-object-diff").diff
const changesets = require("diff-json")
//
const mychanges = {}
const changedata = {}
var add = 'create'
changedata[add] = []
var mod = 'UPDATE'
changedata[mod] = []
var del = 'destroy'
changedata[del] = []
var mytoken = {}
var mytaskid = {}

var dateobj = new Date() 
var pastobj = new Date() 
var uptodate = dateobj.toISOString().slice(0, 19)
pastobj.setDate(pastobj.getDate() - 7)
var lastweek = pastobj.toISOString().slice(0, 19)
var myreport = []
var reportfile = '/web/report'

var mychange = {}
mychange.cmd = 'show-changes'
mychange.data = { 'from-date': lastweek, 'to-date': uptodate }
var mytask = {}
mytask.cmd = 'show-task'
mytask.data = {}
var mypush = {}
mypush.cmd = 'show-gateways-and-servers'
mypush.data = {}
var myrev = {}
myrev.cmd = 'show-last-published-session'
myrev.data = {}

var change = {}
var mykeys = []
//
var netroot = 'pub/'
var backupfilename = '/web/changes'
const backupdir = 'backup/install'
const backupstat = 'backup/status'
const backuptrig = 'needed'
const backuprev = 'backup/rev'
var myrevid = {}

/* start by establishing a session token with the api
 * this uses single session for the whole script, but can be 
 * ended and started as new sessions by calling the start and end
 * functions
 * */
startsession()

/* first thing to check is the last time a policy
 * was pushed, and compare that with our local
 * cache from the last check
 * */
.then(lastpush)

/* once we establish our timeframe from the policy install
 * status, we can request our change data from the api
 * */
.then(reqdata)

/* because this is an async task to build the change data
 * we have to query against a task id until the job is done
 * and our data is ready
 * */
.then(checktask)

/* once the change data is ready, we pull all the json objects
 * into an array, and start building our change data records 
 * from the operations that have been completed since the last
 * time a policy was installed
 * */
.then(getchanges)

/* close out the session with the api and 
 * deauth the token to complete the operation
 * closing early since we won't need to callback
 * to the api service again
 * */
.then(endsession)

/* process and save added objects and rules
 * */
.then(showadds)

/* process and save deleted objects and rules
 * */
.then(showdels)

/* process and save modified objects and rules
 * */
.then(showmods)

/* dump the json change data to file locally
 * the default is to write current changes
 * to /web/changes.json and changes_<date>.json
 * for archive of changes between policy installs
 * */
.then(dumpout)
.then(savereport)


/* just in case our program errors mid stream
 * try to close the existing session to avoid
 * ghosts in the api
 * */
.catch(endsession)

/* all functions are defined and managed below
 * here
 * */

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


async function lastpush () {
	let objarr = []
	objarr = objarr.concat(await pagearr(mytoken, mypush.cmd))
	await dump('lastgw', objarr)
	let secgw = await objarr[0].objects
	for (var x in secgw) {
		if (secgw[x].policy['cluster-members-access-policy-revision']) {
			var lastinstall = secgw[x].policy['access-policy-installation-date']['iso-8601']
			myrevid = secgw[x].policy['cluster-members-access-policy-revision'][0].revision.uid
			var lastrev = await getval(backuprev)
			if (myrevid !== lastrev) {
				console.log(myrevid + ' <= ' + lastrev)
				await setkey(backuprev, myrevid)
			}
			lastinstall = lastinstall.slice(0, 16)
			let lastbackup = await getval(backupdir)
			if (lastinstall === lastbackup) {
				console.log('no new install to backup')
				console.log(myrevid + 'showing published changes from last install at ' + lastinstall)
				mychange.data = { 'from-date': lastinstall, 'to-date': uptodate }
				//myreport[lastinstall] = []
				//myreport.push(myout)
				return mychange
			}
			mychange.data = { 'from-date': lastbackup, 'to-date': lastinstall }
			console.log(' PUBLISHED CHANGES NOW IN ACTIVE POLICY at ' + lastinstall)
			//let myout = lastinstall + ' SHOW INSTALLED CHANGES' 
			//myreport.push(myout)
			//myreport[lastinstall] = []
			await delkey(netroot)
			netroot = 'change/'
			backupfilename = backupfilename + '_' + lastinstall
			await setkey(backupdir, lastinstall)
			await setkey(backupstat, backuptrig)
		}
	}
	return await mychange
}

async function reqdata () {
	let taskarr = await pagein(mytoken, mychange)
	mytask.data = await taskarr[0]
	return await mytask
}

async function checktask () {
	let checkit = {}
	var chkcnt = 1000
	do {
		await sleep(chkcnt)
		//chkcnt = Number(chkcnt) + 143
		checkit = await grabin(mytoken, mytask)
		let humantime = Number(chkcnt) / 1000
		process.stdout.write(checkit.tasks[0].status + ' ' + checkit.tasks[0]['progress-percentage'] + '% COMPLETE ' + checkit.tasks[0]['progress-description'] + ' waiting  (' + humantime + ')sec' + '                    \r')
		chkcnt = Number(chkcnt) + Number(chkcnt)
		if (chkcnt > 120000) {
			console.log(chkcnt + ' Exceeded timeout waiting for task to complete on the manager!')
			checkit.tasks[0].status = 'succeeded'
		}
	}
	while (checkit.tasks[0].status !== 'succeeded') 
	console.log(checkit.tasks[0].status + ' ' + checkit.tasks[0]['progress-percentage'] + '% COMPLETE ' + checkit.tasks[0]['progress-description'])
	await sleep(1600)
	let getchange = await grabin(mytoken, mytask)
	let retchange = sortchange(getchange.tasks[0]['task-details'])
	change = sortchange(retchange[0].changes)
	//await dump('mychange', change)
	//console.dir(change)
	return await change
}

function sortchange (inchange) {
	var keyreturn = []
	Object.keys(inchange).forEach(function(key) {
		keyreturn.push(inchange[key])
	});
	return keyreturn
}

async function getchanges (x) {
	try {
		for (var o in x) {
			mykeys = mykeys.concat(x[o])
		}
		return mykeys
	} catch (err) {
		console.log(err.message)
	}
}

async function showmods () {
	try {
		var mycall = 'modified-objects'
		var mydat = await parsein(mycall)
		var myvals = []
		var mydiffs = []
		for (var obj in mydat) {
			(( modcnt++ ))
			changedata[mod] = changedata[mod].concat(mydat[obj])
			var newobj = mydat[obj]['new-object']
			var oldobj = mydat[obj]['old-object']
			var nameobj = newobj['name']
			var uidobj = newobj['uid']
			var typeobj = newobj['type']
			var modobj = newobj['meta-info']['last-modifier']
			var tstamp = newobj['meta-info']['last-modify-time']['posix']
			var isotime = newobj['meta-info']['last-modify-time']['iso-8601']
			isotime = isotime.slice(0, 16)
			let timedir = isotime.split('T')
			timedir[0] = timedir[0].replace(/-/g, '/')
			let localroot = netroot + timedir[0] + '/' + timedir[1] + '/'
			mychanges[nameobj] = []
			delete newobj['meta-info']['last-modify-time']
			delete oldobj['meta-info']['last-modify-time']
			mychanges[nameobj] = mychanges[nameobj].concat(changesets.diff(oldobj, newobj))
			let shdiff = diff(oldobj, newobj)
			//let myout = isotime + ' ' + modobj + ' MODIFIED ' + typeobj + ' ' + uidobj + ' ' + nameobj + ' ' + JSON.stringify(shdiff)
			let myout = { 'date': isotime, 'revision': myrevid, 'admin': modobj, 'action': mycall, 'type': typeobj, 'uid': uidobj, 'name': nameobj, 'changed': shdiff.changed, 'ops': mychanges[nameobj] }
			myreport.push(myout)
			console.log(modobj + ' MODIFIED ' + typeobj + ' ' + uidobj)
			console.log(nameobj + ': ' + shdiff.text)
			let keyroot = localroot + modobj + '/UPDATE/' + typeobj + '/' + nameobj
			let keydat = JSON.stringify(mychanges[nameobj])
			setkey(keyroot, keydat)
		}
		return await changedata
	} catch (err) {
		return
	}
}


async function showadds () {
	try {
		var mycall = 'added-objects'
		var mydat = await parsein(mycall)
		var myvals = []
		for (var obj in mydat) {
			(( addcnt++ ))
			changedata[add] = changedata[add].concat(mydat[obj])
			var nameobj = mydat[obj]['name']
			var uidobj = mydat[obj]['uid']
			var typeobj = mydat[obj]['type']
			var modobj = mydat[obj]['meta-info']['last-modifier']
			var tstamp = mydat[obj]['meta-info']['last-modify-time']['posix']
			var isotime = mydat[obj]['meta-info']['last-modify-time']['iso-8601']
			isotime = isotime.slice(0, 16)
			let timedir = isotime.split('T')
			timedir[0] = timedir[0].replace(/-/g, '/')
			let localroot = netroot + timedir[0] + '/' + timedir[1] + '/'
			//let myout = isotime + ' ' + modobj + ' CREATED ' + typeobj + ' ' + uidobj + ' ' + nameobj
			let myout = { 'date': isotime, 'revision': myrevid, 'admin': modobj, 'action': mycall, 'type': typeobj, 'uid': uidobj, 'name': nameobj }
			myreport.push(myout)
			console.log(modobj + ' CREATED ' + typeobj + ' ' + nameobj + ' ' + uidobj) 
			delete mydat[obj]['domain']
			delete mydat[obj]['meta-info']
			let keyroot = localroot + modobj + '/create/' + typeobj + '/' + nameobj
			let keydat = JSON.stringify(mydat[obj])
			setkey(keyroot, keydat)
		}
		return await changedata
	} catch (err) {
		return err
	}
}

async function showdels (x) {
	try {
		var mycall = 'deleted-objects'
		var myvals = []
		var mydat = await parsein(mycall)
		for (var obj in mydat) {
			(( delcnt++ ))
			var nameobj = mydat[obj]['name']
			changedata[del] = changedata[del].concat(mydat[obj])
			var uidobj = mydat[obj]['uid']
			var typeobj = mydat[obj]['type']
			var modobj = mydat[obj]['meta-info']['last-modifier']
			var tstamp = mydat[obj]['meta-info']['last-modify-time']['posix']
			var isotime = mydat[obj]['meta-info']['last-modify-time']['iso-8601']
			isotime = isotime.slice(0, 16)
			let timedir = isotime.split('T')
			timedir[0] = timedir[0].replace(/-/g, '/')
			let localroot = netroot + timedir[0] + '/' + timedir[1] + '/'
			//let myout = isotime + ' ' + modobj + ' DELETED ' + typeobj + ' ' + uidobj + ' ' + nameobj
			let myout = { 'date': isotime, 'revision': myrevid, 'admin': modobj, 'action': mycall, 'type': typeobj, 'uid': uidobj, 'name': nameobj }
			myreport.push(myout)
			console.log(modobj + ' DELETED ' + typeobj + ' ' + nameobj + ' ' + uidobj) 
			delete mydat[obj]['domain']
			delete mydat[obj]['meta-info']
			let keyroot = localroot + modobj + '/delete/' + typeobj + '/' + nameobj
			let keydat = JSON.stringify(mydat[obj])
			setkey(keyroot, keydat)
		}
		return await changedata
	} catch (err) {
		return
	}
}

/* these functions are more plumbing and assistance
 * for the heavy lifting done above
 * */

/* a simple function called by the show functions 
 * to extract the particular operation as sent
 * by the calling function. this exepcts the var
 * mykeys to exist and container the collected change
 * data json from the api server
 * */
async function parsein (x) {
	try {
		var myobjarr = []
		for (var ops in mykeys) {
			myobjarr = myobjarr.concat(mykeys[ops].operations[x])
		}
		return await myobjarr
	} catch (err) {
		return
	}
}

/* just a function call for the json data
 * write to local file for debug and backup
 * returns the data in case you want to 
 * continue using it in other functions
 * */
async function dumpout(jsondata) {
	await dump(backupfilename, jsondata)
	console.log(' Published Changes: ')
	console.log(addcnt + ' created ; ' + modcnt + ' modified ; ' + delcnt + ' deleted ;')
	console.log('=====================================')
	return await jsondata
}

//async function sortreport() {
	//myreport.sort(function(a, b) {
	 //   a = a.date
	  //  b = b.date
	   // return a>b ? -1 : a<b ? 1 : 0;
	//myreport.sort(function(a,b){return a.date.getTime() - b.date.getTime()});
	//myreport.sort( (a,b) => a.date.localeCompare(b.date) )
//	});
//}

async function savereport () {
	try {
	//await fs.unlinkSync('report.json')
	//for (var obj in myreport[lastinstall]) {
	//	console.log(JSON.stringify(myreport[lastinstall][obj]))
	//	writereport(JSON.stringify(myreport[lastinstall][obj]))
	//}
		await dump(reportfile, myreport)
	return await myreport
	} catch (err) {
		return
	}
}

async function writereport(myline) {
	await fs.appendFileSync('report.txt', myline, "UTF-8",{'flags': 'a+'})
	await fs.appendFileSync('report.txt', '\n', "UTF-8",{'flags': 'a+'})
	return
}

/* keystore functions for interacting with
 * etcd in a central way
 * */

async function getkey(key) {
	let showkey = await etcd.getSync(key)
	if (showkey.body.node.nodes) {
		return await showkey.body.node.nodes
	} else {
		//console.log(typeof showkey.body.node)
		return await showkey.body.node
	}

}

async function getval(key) {
	try {
		let showkey = await etcd.getSync(key)
		return await showkey.body.node.value
	} catch (err) {
		return (err)
	}
}

async function setkey (key, value) {
	let makekey = await etcd.setSync(key, value)
	return await makekey.body.node.value
}

async function delkey (key) {
	etcd.rmdirSync("dir/", { recursive: true });
	let makekey = await etcd.rmdirSync(key, { recursive: true })
	return await makekey.body.node.value
}

/* just what it says, puts the action to sleep
 * */
function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
}
