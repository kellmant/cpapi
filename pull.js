const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
// load keystore tools to use etcd as a var cache
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
const apishow = {}
apishow.grps = 'show-groups'
apishow.pkgs = 'show-packages'
apishow.tags = 'show-tags'
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
		//console.log('cleaning last session ' + netroot)
		//await etcd.delSync(netroot)
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
		console.log('Collecting host objects . . . ')
		myobjs.host = await pagein(mytoken, apishow.hosts)
		console.log('Collecting tag info . . . ')
		myobjs.tags = await pagein(mytoken, apishow.tags)
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
		console.log('getdata complete')
	}
}



async function savekeys(rebuild) {
	try {
		var cpRes = []
		var myCpdb = Object.keys(rebuild)
		let netops = rebuild.network.objects
		let hostops = rebuild.host.objects
		let grpops = rebuild.group.objects
		let tagops = rebuild.tags.objects
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
			var arrmembers = []
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			let mytags = Cpobj.tagem(hostops[key])
			for (var g in mytags.tags) {
				for (var h in mytags.tags[g]) {
				arrmembers.push(mytags.tags[g][h].name)
				//console.log(mytags.tags[g][h])
				}
			}
			Cpobj.tagArr(arrmembers)
			let myhost = Cpobj.host(hostops[key])
			let mykey = {}
			let hostip = myhost['ipv4-address']
			if (myhost['ipv4-address']) {
			let hostdir = mytype + '/' + myuid
			mykey.key = netroot + hostdir 
			mykey.value = Cpobj
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
		Object.keys(tagops).forEach(function(key) {
			const Cpobj = new Cpclass(tagops[key])
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			let mytag = Cpobj.tag(tagops[key])
			let mykey = {}
			let tagdir = mytype + '/' + myuid
			mykey.key = tagdir 
			mykey.value = mytag
			setKey(mykey)
		});
		console.log(' ')
	} catch (err) {
		console.log(err.message)
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}


