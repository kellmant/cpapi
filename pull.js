const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
const apishow = {}
apishow.grps = 'show-groups'
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

//const myapidom = process.env.APIDOM

getdata()
.then(savekeys)

async function getdata() {
	try {
		console.log(' logging into api')
		let mycred = await myCredentials()
		const mytoken = await myAuth(mycred)
		console.log(' Starting session: ' + await mytoken.uid)
		console.log('Collecting policy packages . . . ')
		myobjs.policy = await pagein(mytoken, apishow.pkgs)
		console.log('Collecting gateways and servers info . . . ')
		myobjs.gateway = await pagein(mytoken, apishow.gws)
		console.log('Collecting group info . . . ')
		myobjs.group = await pagein(mytoken, apishow.grps)
		console.log('Collecting network objects . . . ')
		myobjs.network = await pagein(mytoken, apishow.networks)
		//myobjs.range = await pagein(mytoken, apishow.ranges)
		console.log('Collecting host objects . . . ')
		myobjs.host = await pagein(mytoken, apishow.hosts)
		var lastpub = await grabin(mytoken, apiget.pub)
		let tstamp = await lastpub['publish-time'].posix
		myobjs.change[tstamp] = await lastpub
		dump('last', myobjs)
		console.log('api session ' + mytoken.uid + ' COMPLETED object extraction ')
		const myend = await myClose(mytoken)
		console.log('Logout')
		console.log(await myend)
		return await myobjs
	} catch (error) {
		console.log(error.response.data)
		console.log('getdata ERROR')
	} finally {
		console.log('getdata EXIT')
	}
}



async function savekeys(rebuild) {
	try {
		var cpRes = []
		var myCpdb = Object.keys(rebuild)
		let netops = rebuild.network.objects
		let hostops = rebuild.host.objects
		let grpops = rebuild.group.objects
		Object.keys(netops).forEach(function(key) {
			const Cpobj = new Cpclass(netops[key])
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			let mynet = Cpobj.network(netops[key])
			let mykey = {}
			let netip = mynet.subnet4
			if (mynet.subnet4) {
			//let netdir = netip.replace(/\./g, '/')
			let netdir = mytype + '/' + myuid
			mykey.key = netroot + netdir 
			mykey.value = mynet
			setKey(mykey)
			}
		});
		Object.keys(hostops).forEach(function(key) {
			const Cpobj = new Cpclass(hostops[key])
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			let myhost = Cpobj.host(hostops[key])
			let mykey = {}
			let hostip = myhost['ipv4-address']
			if (myhost['ipv4-address']) {
			//let hostdir = hostip.replace(/\./g, '/')
			let hostdir = mytype + '/' + myuid
			mykey.key = netroot + hostdir 
			mykey.value = myhost
			setKey(mykey)
			}
		});
		Object.keys(grpops).forEach(function(key) {
			const Cpobj = new Cpclass(grpops[key])
			var mygrp = {}
			var arrmembers = []
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			var arrstring = Cpobj.group(grpops[key])
			for (var g in arrstring.members) {
				for (var h in arrstring.members[g]) {
					arrmembers.push(arrstring.members[g][h].name)
					//console.log(arrstring.members[g][h].name)
				}
			}
			let mykey = {}
			let grpdir = mytype + '/' + myuid
			mykey.key = netroot + grpdir 
			Cpobj.groupArr(arrmembers)
			delete Cpobj.uid
			delete Cpobj.type
			mykey.value = Cpobj
			setKey(mykey)
			//console.dir(Cpobj)
		});
		console.log(' ')
	} catch (err) {
		console.log(err.message)
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}


