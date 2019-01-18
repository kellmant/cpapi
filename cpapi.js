// ID:v0.9 102318
// simple function to represent the retrival or 
// loading of api credentials
// replace in production with appropriate function
//
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//
const axios = require('axios')
var Etcd = require('node-etcd');
const myKeystore = process.env.ETCDCTL_ENDPOINTS
var etcd = new Etcd(myKeystore)
const cpapi = {}
const cpres = []
//auth.domain = 'System Data'
var gname = 'mgmt_admin_name'
var gpass = 'mgmt_admin_passwd'
var ghost = 'hostname'

async function getcred(x) {
	let keydir = `ctrl/cfg/mg/${x}/config_system/`
	let credentials = {}
	let myname = await etcd.getSync(keydir + gname)
	let mypasswd = await etcd.getSync(keydir + gpass)
	credentials.user = myname.body.node.value
	credentials.password = mypasswd.body.node.value
	return await credentials
}

async function gethost(x) {
	let keydir = `ctrl/cfg/mg/${x}/config_system/`
	let myhost = await etcd.getSync(keydir + ghost)
	let apihost = 'https://' + myhost.body.node.value + '/web_api/'
	return await apihost
}

async function callout (x) {
	axios.defaults.headers.common['Accept'] = 'application/json'
	let myres = await axios(x)
	return await myres
}

function showme (x) {
	console.log(JSON.stringify(cpres))
	return x
}

function buildobj(x) {
	cntobj(x)
	cpres.push(x.data)
	return cpres
}

function cntobj(x) {
	cpapi.data.from = x.data.from
	cpapi.data.to = x.data.to
	cpapi.data.total = x.data.total
	return cpapi
}

async function login(x) {
	let mycall = await newsession(x)
	let mytoken = await callout(cpapi)
	cpapi.headers = await returnsid(mytoken)
	return await cpapi
}

function returnsid (x) {
	let token = { 'X-chkp-sid': x.data.sid }
	return token
}

async function newsession(apidom) {
	cpapi.data = await getcred(apidom)
	cpapi.baseURL = await gethost(apidom)
	cpapi.url = 'login'
	cpapi.method = 'post'
	return await cpapi
}

async function endsession() {
	cpapi.url = 'logout'
	cpapi.data = {}
	//console.log('end of session')
	let myobjects = await callout(cpapi)
	return myobjects
}

async function shownet() {
	cpapi.url = 'show-networks'
	cpapi.data = {}
	let myobjects = await callout(cpapi)
	return myobjects
}

async function showhost() {
	cpapi.url = 'show-hosts'
	cpapi.data = {}
	let myobjects = await callout(cpapi)
	return myobjects
}

login('opb')
.then(shownet)
.then(buildobj)
.then(showhost)
.then(buildobj)
.then(showme)
.then(endsession)
//.then(showme)
