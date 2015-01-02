
var request = require('request'),
	cheerio = require('cheerio'),
	debug = require('debug')('hoo:req');

function getWebpage(url, next) {
	debug(url);
	request(url, function(error, response, body) {
		if(error) next(error);
		var webpage = cheerio.load(body);
		webpage.url = response.request.uri.href; // cuz redirects
		next(error, webpage);
	});
}

module.exports.getWebpage = getWebpage;
