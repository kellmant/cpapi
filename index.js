const myCredentials = require('./bin/credentials')
const myAuth = require('./bin/auth')
const pagein = require('./fun/page')
const grabin = require('./fun/grab')
//
const apishow = {}
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


async function runtime (x) {
	try {
		console.log(' logging into api')
		let mycred = await myCredentials(x)
		const mytoken = await myAuth(mycred)
		console.log(' Starting session: ' + await mytoken.uid)
		console.log('Collecting policy packages . . . ')
		myobjs.policy = await pagein(mytoken, apishow.pkgs)
		console.log('Collecting gateways and servers info . . . ')
		myobjs.gateway = await pagein(mytoken, apishow.gws)
		console.log('Collecting network objects . . . ')
		myobjs.network = await pagein(mytoken, apishow.networks)
		//myobjs.range = await pagein(mytoken, apishow.ranges)
		console.log('Collecting host objects . . . ')
		myobjs.host = await pagein(mytoken, apishow.hosts)
		var lastpub = await grabin(mytoken, apiget.pub)
		let tstamp = await lastpub['publish-time'].posix
		myobjs.change[tstamp] = await lastpub
		dump('last', myobjs)
		console.log('api session ' + mytoken.uid + ' COMPLETED object extraction: ' + myobjs.length)
		const myend = await myClose(mytoken)
		console.log('Logout')
		console.log(await myend)
	} catch (error) {
		console.log(error.response.data)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}


runtime('opb')

