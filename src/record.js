
class Record {
	constructor(arg) {
		this.arg = arg;
		this.data = {
			fullname: ""
		};
	}

	setFullname(name) {
		// assume a longer name is more accurate
		if(this.data.fullname.length > name.length) return;
		this.data.fullname = name;
	}

	addContact(type, value) {
		var contacts = this.data;
		if(!Array.isArray(contacts[type])) {
			contacts[type] = [value];
		} else {
			if(!~contacts[type].indexOf(value)) {
				contacts[type].push(value);
			}
		}
	}

	toJSON() {
		return this.data;
	}
}

module.exports = Record;
