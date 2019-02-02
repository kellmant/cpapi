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
//
var dl = require('datalib');
const Cpclass = require('./class/cpobj')
const CpApi = require('./class/cpapi')
const setKey = require('./fun/writekey')
const netroot = 'net/'

//const myapidom = process.env.APIDOM
const loadlocal = require('./last.json')
//getdata()
savekeys(loadlocal)
//.then(savekeys)

async function getdata() {
	try {
		console.log(' logging into api')
		let mycred = await myCredentials()
		const mytoken = await myAuth(mycred)
		console.log(' Starting session: ' + await mytoken.uid)
		console.log('Collecting network objects . . . ')
		myobjs.network = await pagein(mytoken, apishow.networks)
		console.log('Collecting host objects . . . ')
		myobjs.host = await pagein(mytoken, apishow.hosts)
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



async function savekeys(x) {
	try {
		var cpRes = []
		let netops = x.network.objects
		let hostops = x.host.objects
		for (var key in netops) {
			const Cpobj = new Cpclass(netops[key])
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			let myname = Cpobj.name
			let mynet = Cpobj.network(netops[key])
			let mykey = {}
			let netip = mynet.subnet4
			if (mynet.subnet4) {
				let netdir = netip.replace(/\./g, '/')
				//let hostdir = '/' + mytype + '/' + myuid
				mykey.key = netroot + netdir
				mykey.value = Cpobj
				await setKey(mykey)
			}
		}
		for (var key in hostops) {
			const Cpobj = new Cpclass(hostops[key])
			let mytype = Cpobj.type
			let myuid = Cpobj.uid
			let myname = Cpobj.name
			let myhost = Cpobj.host(hostops[key])
			let mykey = {}
			let hostip = myhost['ipv4-address']
			if (myhost['ipv4-address']) {
				let netdir = hostip.replace(/\./g, '/')
				//let hostdir = '/' + mytype + '/' + myuid
				mykey.key = netroot + netdir
				mykey.value = Cpobj
				await setKey(mykey)
			}
		}
	} catch (err) {
		console.log(err.message)
		console.log('savekeys ERROR')
	} finally {
		console.log('savekeys EXIT')
	}
}


