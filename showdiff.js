
const diff = require('variable-diff')

var oldy = require('/web/changes_2019-04-20T02:36.json')
var goody = require('/web/changes.json')

showdiffs(oldy, goody)


async function showdiffs (oldobj, newobj) {
	let shdiff = diff(oldobj, newobj)
	console.log(shdiff.text)
	return
}
