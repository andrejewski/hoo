
class Scrapper {
	constructor() {
		// @override
	}

	expandArg(arg) {
		// @override
		return arg;
	}

	processWebpage(webpage, record, next) {
		// @override
		next(null);
	}
}

module.exports = Scrapper;


