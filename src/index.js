
var async = require('async');
var getWebpage = require('./webpage').getWebpage;
var Record = require('./record');

class Hoo {
	constructor(options) {
		this.options = options || {concurrency: 5};
		this.scrappers = [];
	}

	use(Scrapper) {
		this.scrappers.push(new Scrapper(this.options));
		return this;
	}

	run(args, next) {
		async.map(args, this.runArg.bind(this), next);
		return this;
	}

	runArg(arg, next) {
		var record = new Record(arg);
		// fully expand arg
		arg = this.scrappers.reduce(function(arg, scrapper) {
			return scrapper.expandArg(arg);
		}, arg);

		var _this = this;
		var visitedUrls = [];

		var queue = async.queue(function(url, next) {
			if(~visitedUrls.indexOf(url)) return next();
			visitedUrls.push(url);
			getWebpage(url, function(error, webpage) {
				if(error) return next(error);
				visitedUrls.push(webpage.url);
				_this.processWebpage(webpage, record, function(error, urls) {
					if(error) return next(error);
					urls.forEach(function(url) {
						queue.push(url);
					});
					next(error);
				});
			});
		}, this.options.concurrency);

		queue.push(arg);
		queue.drain = function(error) {
			if(error) return next(error);
			next(error, record);
		}
		return this;
	}

	expandArg(arg) {
		return this.scrappers.reduce(function(arg, scrapper) {
			return scrapper.expandArg(arg);
		}, arg);
	}

	processWebpage(webpage, record, next) {
		var newUrls = [];
		var processers = this.scrappers.map(function(scrapper) {
			return scrapper.processWebpage.bind(scrapper);
		});
		async.each(processers, function(processer, next) {
			processer(webpage, record, function(error, urls) {
				if(error) return next(error);
				if(Array.isArray(urls)) newUrls = newUrls.concat(urls);
				next(error);
			});
		}, function(error) {
			if(error) return next(error);
			next(error, newUrls);
		});
	}

}

module.exports = Hoo;
module.exports.Scrapper = require('./scrappers/');
module.exports.DefaultScrapper = require('./scrappers/default');
module.exports.TwitterScrapper = require('./scrappers/twitter');
module.exports.GithubScrapper = require('./scrappers/github');
