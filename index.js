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
		let mycred = await myCredentials(x)
		const mytoken = await myAuth(mycred)
		console.dir(await mytoken)
		myobjs.policy = await pagein(mytoken, apishow.pkgs)
		myobjs.gateway = await pagein(mytoken, apishow.gws)
		myobjs.network = await pagein(mytoken, apishow.networks)
		//myobjs.range = await pagein(mytoken, apishow.ranges)
		myobjs.host = await pagein(mytoken, apishow.hosts)
		var lastpub = await grabin(mytoken, apiget.pub)
		let tstamp = lastpub['publish-time'].posix
		myobjs.change[tstamp] = await lastpub
		dump('last', myobjs)
		console.dir(await typeof myobjs)
		const myend = await myClose(mytoken)
		console.dir(await myend)
	} catch (err) {
		console.log(err.message)
		console.log('PROGRAM ERROR')
	} finally {
		console.log('PROGRAM EXIT')
	}
}


runtime('opb')

