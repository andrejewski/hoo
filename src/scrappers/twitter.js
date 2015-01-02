
var Scrapper = require('./');

var urlRoot = 'https://twitter.com/';

class TwitterScrapper extends Scrapper {
	expandArg(arg) {
		if(arg.charAt(0) === '@') {
			return urlRoot+arg.slice(1);
		}
		return arg;
	}

	processWebpage(webpage, record, next) {
		if(!~webpage.url.indexOf(urlRoot)) {
			// links to twitter
			var urls = [];
			webpage('a').each(function(i, link) {
				var href = link.attribs.href;
				if(href && href.indexOf(urlRoot) === 0) {
					var frags = href.slice(urlRoot.length).split('/');
					var twitter = frags[0];
					if(~twitter.indexOf('?')) return;
					if(frags.length === 1 && twitter) {
						urls.push(href);
					}
				}
			});
			return next(null, urls);
		}

		// set twitter
		var twitter = (
			webpage.url.slice(urlRoot.length).split('/')[0] ||
			webpage('.ProfileHeaderCard-screenname').text().trim().slice(1)
		);
		record.addContact('twitter', twitter);

		// set fullname
		var fullname = webpage('.ProfileHeaderCard-name .ProfileHeaderCard-nameLink').text().trim();
		if(fullname) record.setFullname(fullname);

		// add website (optional)
		var websiteEl = webpage('.ProfileHeaderCard-url a').attr('title');
		if(websiteEl) {
			var website = websiteEl.trim();
			if(website) record.addContact('url', website);
		}

		// console.log('twitter done', record.toJSON(), website);

		if(website) return next(null, [website]);
		next(null);
	}
}

module.exports = TwitterScrapper;
