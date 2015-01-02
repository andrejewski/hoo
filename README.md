Hoo
===

A contact information scrapping tool for programmatic and command-line use. Hoo will scrape webpages looking for personal websites, email addresses, Twitter handles, and Github usernames and returns completed user profiles in JSON or CSV.

```bash
npm install -g hoo
```

## Command-line Usage

This is a tool for quick contact information. Just provide a Twitter handle `@compooter` or Github username `^andrejewski` or even just a plain website url `chrisandrejewski.com`, and Hoo will try figure out the remaining details.

```bash
# these all do the same thing
hoo @compooter
hoo ^andrejewski
hoo chrisandrejewski.com
```

```js
{ fullname: 'Chris Andrejewski',
  github: [ 'andrejewski' ],
  url: [ 'http://chrisandrejewski.com' ],
  email: [ 'christopher.andrejewski@gmail.com' ],
  twitter: [ 'compooter' ] }
```

Hoo works fine with multiple names, although too many will take longer.

```bash
hoo @compooter ^tj @iamdevloper
```

### Output as JSON or CSV

By default, all output is in JSON. Passing the `--csv` flag will change all output to CSV.

```bash
hoo @compooter --csv
hoo @compooter -c
```

```
fullname,twitter,email,url,github
Chris Andrejewski,compooter,christopher.andrejewski@gmail.com,http://chrisandrejewski.com,andrejewski
```

### Writing to a file

Pass `--output <filename>` and Hoo will save output to a file instead. It works how you would expect passing the CSV flag as well.

```bash
hoo @compooter ^tj --output output.json
hoo @compooter ^tj -o output.json
```

For JSON, the results array is grouped into the "people" key.

```js
{
  "people": [
    {
      "fullname": "Chris Andrejewski",
      "twitter": [
        "compooter"
      ],
      "url": [
        "http://chrisandrejewski.com"
      ],
      "email": [
        "christopher.andrejewski@gmail.com"
      ],
      "github": [
        "andrejewski"
      ]
    },
    {
      "fullname": "TJ Holowaychuk",
      "github": [
        "tj"
      ],
      "url": [
        "http://tjholowaychuk.com"
      ],
      "email": [
        "tj@vision-media.ca"
      ]
    }
  ]
}
```

### More options

See `hoo --help` for more options including colored output, debugging activity, and selecting only certain fields.

## Programmatic Usage

Hoo is designed to be entirely configurable. The command-line interface uses some default scrappers but an instance of the `Hoo` class initially has none. Any scrappers are added just as you would add Express/Connect middleware.

```js
var Hoo = require('hoo');
var hoo = new Hoo()
	.use(Hoo.TwitterScrapper)
	.use(Hoo.GithubScrapper)
	.use(Hoo.DefaultScrapper);

var names = ['@compooter', '^tj'];
hoo.run(names, function(error, records) {
	// do something awesome
});
```

## Scrappers

Hoo includes Email (Default), Twitter, and Github web scrappers, but that doesn't mean new ones cannot be made. In fact that is why they all extend the same base `Scrapper` class. Building a new scrapper is easy.

```js
var Scrapper = require('hoo').Scrapper;

class MyScrapper extends Scrapper {
	constructor(options) {
		/* options passed to new Hoo() are passed to each Scrapper added to it */
	}

	expandArg(arg) {
		/* this allows the twitter/github scrappers to expand usernames to urls */
		return arg;
	}

	processWebpage(webpage, record, next) {
		/* 
			take any webpage and extract contact information to put on the record
			find new webpage urls to call
			calling next when done
		*/
		/*
			Process `webpage` like it's jQuery like:
				var $ = webpage; $('#myElement').text();
			(See https://github.com/cheeriojs/cheerio)
		*/
		next(err, [optional urls])
	}
}
```

Note that while ES6 classes are used, you do not need to extend the Scrapper class for your own scrapper. Just be sure to implement the methods in your prototyped class.

## Contributing

If you like Hoo enough to contribute, sweet. As the markup of scrapped webpages change, Hoo will need to be updated to match, so open a issue/pull if a scrapper is broken. If you have scrapper you would like to add to Hoo, pull request. Any other issues are welcome too.

```bash
npm install # dependencies
npm run build # to build
npm run pre-publish # to pre-publish for pull requests
```

Follow me on [Twitter](https://twitter.com/compooter) for updates or just for the lolz and please check out my other [repositories](https://github.com/andrejewski) if I have earned it. I thank you for reading.


