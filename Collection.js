function Collection(type = Object, items = []) {
	var self = this;

	self.init = function() {
		if (type instanceof Object === false) {
			console.log(type);
			throw "Unsupported type given";
		}

		if (items instanceof Array === false) {
			console.log(items);
			throw "Only Arrays are supported " + typeof items + " given";
		}

		items.forEach(function(item) {
			if (item instanceof type === false) {
				console.log(item);
				throw "Unsupported item type " + typeof item;
			}
		});

		self.items = items != null ? items : [];
		self.currentValue =
			items != null
				? {
						value: items[0],
						key: 0
					}
				: {};
	};

	self.init();

	/**
	 * @return int
	 */
	self.count = function() {
		return self.items.length;
	};

	/**
	 * @return Array
	 */
	self.toArray = function() {
		return self.items;
	};

	/**
	 * @return mixed
	 */
	self.first = function() {
		return self.items[0];
	};

	self.last = function() {
		return self.items[self.count() - 1];
	};

	self.add = function() {
		for (key in arguments) {
			if (arguments[key] instanceof type === false) {
				console.log(arguments[key]);
				throw "Unsupported item type " + typeof arguments[key];
			}
			self.items.push(arguments[key]);
		}
		return self;
	};

	self.get = function(key) {
		return self.items[key];
	};

	self.isEmpty = function() {
		return self.items.length === 0;
	};

	self.forAll = function(callback) {
		var result = [];
		self.items.forEach(function(item) {
			if (!callback(item)) {
				result.push(false);
			} else {
				result.push(true);
			}
		});

		return result;
	};

	self.filter = function(callback = null) {
		var result = [];

		self.items.forEach(function(item) {
			if (callback(item)) {
				result.push(item);
			}
		});

		self.items = result;
		return self.normalize();
	};

	self.merge = function(array) {

		//This should not be happening
		// @FixMe
		if (array instanceof type) {
			console.log(
				"Warning : You would use the add function to push an object"
			);
			self.add(array);
		} else if (array instanceof Array) {			
			array.forEach(function(element) {
				self.add(element);
			});
		} else {
			throw 'Unsupported type ' + typeof array;
		}

		return self;
	};

	self.getKeys = function(needle) {
		var pos = -1;
		var result = [];
		self.items.forEach(function(item) {
			if (needle === item) {
				pos += 1;
				result.push(pos);
			}
		});

		if (result.length === 0) {
			return [pos];
		} else {
			return result;
		}
	};

	self.getKey = function(needle) {
		var keys = self.getKeys(needle);

		if (keys instanceof Array) {
			return keys[0];
		}

		return keys;
	};

	self.find = function(criteria = {}) {
		if (criteria instanceof Object === false) {
			throw "This Criteria Is Not Supported";
		}

		if (criteria === {}) {
			return self.toArray();
		}

		var data = self.clone();

		var result = data.filter(function(item) {
			for (key in criteria) {
				if (item[key] !== criteria[key]) {
					return false;
				}
			}

			return true;
		});

		switch (result.count()) {
			case 0:
				return null;
			case 1:
				return result.first();
			default:
				return result.toArray();
		}
	};

	self.findOne = function(criteria) {
		var result = self.find(criteria);
		if (result instanceof Array) {
			return result[0];
		}

		return {};
	};

	self.removeElement = function(element) {
		for (key in self.items) {
			if (self.items[key] === element) {
				delete self.items[key];
			}
		}

		self.normalize();

		return self;
	};

	self.remove = function(key) {
		if (typeof key !== "number") {
			throw "Unsupported Key Type";
		}

		delete self.items[key];

		self.normalize();

		return self;
	};

	self.update = function(key, element) {
		if (typeof key !== "number" || element instanceof type === false) {
			throw "Unsupported Key Type Or element type";
		}

		self.items[key] = element;
	};

	self.clear = function() {
		self.items = [];
		return true;
	};

	self.normalize = function() {
		for (var index = 0; index < self.items.length; index++) {
			var item = self.items[index];
			if (item === undefined) {
				for (var key = index; key < self.items.length; key++) {
					if (self.items.hasOwnProperty(key + 1)) {
						self.items[key] = self.items[key + 1];
					}
				}

				self.items.length -= 1;
			}
		}

		return self;
	};

	self.key = function() {
		return self.currentValue.key;
	};

	self.current = function() {
		return self.currentValue.value;
	};

	self.next = function() {
		if (self.key() === self.count() - 1) {
			return self.first();
		} else {
			return self.get(self.key() + 1);
		}
	};

	self.previous = function() {
		if (self.key() === 0) {
			return self.last();
		} else {
			return self.get(self.key() - 1);
		}
	};

	self.forward = function() {
		if (self.key() === self.count() - 1) {
			self.currentValue = {
				value: self.first(),
				key: 0
			};
		} else {
			self.currentValue = {
				value: self.get(self.key() + 1),
				key: self.key() + 1
			};
		}

		return self;
	};

	self.back = function() {
		if (self.key() === 0) {
			self.currentValue = {
				value: self.last(),
				key: self.count() - 1
			};
		} else {
			self.currentValue = {
				value: self.get(self.key() - 1),
				key: self.key() - 1
			};
		}

		return self;
	};

	self.goto = function(key) {
		if (self.count() <= key) {
			throw "Key out of range";
		}

		self.currentValue = {
			value: self.get(key),
			key: key
		};

		return self;
	};

	self.reverse = function(flush = false) {
		var result = [];
		for (var i = self.items.length - 1; i >= 0; i--) {
			result.push(self.items[i]);
		}

		if (flush === true) {
			self.items = result;
			return self;
		}

		return result;
	};

	self.clone = function() {
		var copy = [];
		self.items.forEach(function(item) {
			copy.push(item);
		});
		return new Collection(self.type, copy);
	};

	self.unique = function() {
		self.items.forEach(function(item) {
			var result = self.find(item);
			if (result instanceof Array) {
				result.forEach(function(element) {
					self.removeElement(element);
				});

				self.add(item);
			}
		});

		return self;
	};
}
