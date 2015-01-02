#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	program = require('commander');

var csvStringify = require('csv-stringify');

program
	.version(require('../package.json').version)
	.usage('[usernames | urls]')
	.option('--color', 'print with color')
	.option('-c, --csv', 'return in comma seperated values')
	.option('-o, --output <file>', 'output to a file')
	.option('-s, --select <field>', 'select only one type of contact')
	.option('-D, --debug', 'show requests and other details')
	.parse(process.argv);

if(program.debug) {
	process.env.DEBUG = 'hoo*';
}

var kLeft = '[';
var kRight = ']';

if(program.select) {
	var s = program.select;
	if(kLeft === s.charAt(0) && s.charAt(s.length - 1) === kRight) {
		program.select = s.slice(1).split(kRight)[0].split(',');
	} else {
		program.select = [s];
	}
}

var Hoo = require('../'),
	Default = Hoo.DefaultScrapper,
	Github = Hoo.GithubScrapper,
	Twitter = Hoo.TwitterScrapper;

var hoo = new Hoo()
	.use(Twitter)
	.use(Github)
	.use(Default);

hoo.run(program.args, function(error, records) {
	if(error) throw error;

	var people = records.map(function(record) {
		return record.toJSON();
	});

	if(program.select) {
		var fields = program.select.concat('fullname');
		people = people.map(function(person) {
			var obj = {};
			fields.forEach(function(field) {
				var values = person[field] || [];
				obj[field] = typeof values === 'string' ? values : values[0]; 
			});
			return obj;
		});
	}

	if(program.output) {
		program.outputFile = path.join(process.cwd(), program.output);
	}

	return program.csv 
		? outputCSV(people)
		: outputJSON(people);
});

function outputJSON(people) {
	if(program.output) {
		var dest = program.outputFile;
		var text = JSON.stringify({people: people}, undefined, 2);
		return fs.writeFileSync(dest, text);
	}
	
	if(people.length === 1) people = people[0];
	var inspectOptions = {depth: 3, colors: program.color};
	var outputString = util.inspect(people, inspectOptions);
	console.log(outputString);
}

function outputCSV(people) {
	csv(people, function(error, text) {
		if(error) throw error;
		if(program.output) {
			var dest = program.outputFile;
			return fs.writeFileSync(dest, text);
		}
		console.log('\n'+text);
	});
}

function csv(people, next) {
	var fields = [];
	people.forEach(function(person) {
		Object.keys(person).forEach(function(key) {
			if(!~fields.indexOf(key)) fields.push(key);
		});
	});
	fields = fields.sort(function(a,b) {
		if(a === 'fullname') return -1;
		return 1;
	});

	var rowEntries = new Array(people.length);
	people.forEach(function(person, index) {
		var row = []
		fields.forEach(function(name, index) {
			var values = person[name]
			row[index] = typeof values === 'string'
				? values
				: values ? values[0] : null;
		});
		rowEntries[index] = row;
	});

	var table = [fields].concat(rowEntries);

	csvStringify(table, next);
}

