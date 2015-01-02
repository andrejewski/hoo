
var Scrapper = require('./');

var urlRoot = 'https://github.com/';

class GithubScrapper extends Scrapper {
	expandArg(arg) {
		if(arg.charAt(0) === '^') {
			return urlRoot+arg.slice(1);
		}
		return arg;
	}

	processWebpage(webpage, record, next) {
		if(!~webpage.url.indexOf(urlRoot)) {
			// links to github
			var urls = [];
			webpage('a').each(function(i, link) {
				var href = link.attribs.href;
				if(href && href.indexOf(urlRoot) === 0) {
					var frags = href.slice(urlRoot.length).split('/');
					var github = frags[0];
					if(frags.length === 1 && github) {
						urls.push(href);
					}
				}
			});
			return next(null, urls);
		}

		// set github
		var github = (
			webpage.url.slice(urlRoot.length).split('/')[0] ||
			webpage('.vcard-names .vcard-username').text()
		);
		record.addContact('github', github);

		// set fullname
		var fullname = webpage('.vcard-names .vcard-fullname').text();
		if(fullname) record.setFullname(fullname);

		// add website
		var website = webpage('.vcard-detail .url').text();
		if(website) record.addContact('url', website);

		// add email
		var email = webpage('.vcard-detail .email').text();
		if(email) record.addContact('email', email);

		if(website) return next(null, [website]);
		next(null);
	}
}

module.exports = GithubScrapper;
