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
apishow.objects = 'show-objects'
const apiget = {}
apiget.pub = 'show-last-published-session'
apiget.pkg = 'show-package'
const dump = require('./fun/writefile')
const myClose = require('./bin/close')
var myobjs = {}


async function runtime (x) {
	try {
		let mycred = await myCredentials(x)
		const mytoken = await myAuth(mycred)
		console.dir(await mytoken)
		myobjs = await pagein(mytoken, apishow.objects)
		dump('backup', myobjs.objects)
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

