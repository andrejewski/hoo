
var Scrapper = require('./');

var urlRoot = 'https://github.com/';

class DefaultScrapper extends Scrapper {
	expandArg(arg) {
		if(arg.indexOf('http') !== 0) {
			return 'http://'+arg.slice(0);
		}
		return arg;
	}

	processWebpage(webpage, record, next) {

		webpage('a').each(function(i, link) {
			var mailto = 'mailto:';
			var href = link.attribs.href;
			if(href && href.indexOf(mailto) === 0) {
				var email = href.slice(mailto.length);
				record.addContact('email', email);
			}
		});

		// console.log('default done', record.toJSON());

		next(null);
	}
}

module.exports = DefaultScrapper;
