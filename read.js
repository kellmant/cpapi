const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
var dl = require('datalib');
const rebuild = require('./last.json')
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'net/'

async function runtime () {
	try {
		var cpRes = []
		var myCpdb = Object.keys(rebuild)
		let netops = rebuild.network.objects
		let hostops = rebuild.host.objects
		Object.keys(netops).forEach(function(key) {
			const Cpobj = new Cpclass(netops[key])
			let mynet = Cpobj.network(netops[key])
			let mykey = {}
			let netip = mynet.subnet4
			if (mynet.subnet4) {
			let netdir = netip.replace(/\./g, '/')
			mykey.key = netroot + netdir 
			mykey.value = mynet
			setKey(mykey)
			}
		});
		Object.keys(hostops).forEach(function(key) {
			const Cpobj = new Cpclass(hostops[key])
			let myhost = Cpobj.host(hostops[key])
			let mykey = {}
			let hostip = myhost['ipv4-address']
			if (myhost['ipv4-address']) {
			let hostdir = hostip.replace(/\./g, '/')
			mykey.key = netroot + hostdir 
			mykey.value = myhost
			setKey(mykey)
			}
		});
		console.dir(' ')
	} catch (err) {
		console.log(err.message)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}


runtime()

