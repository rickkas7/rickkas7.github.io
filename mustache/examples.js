
var examples = [
	{
		"title":"Simple number",
		"data":{"a":123},
		"template":"{\"apple\":{{a}} }"
	},
	{
		"title":"Accessing an array element",
		"data":{
			"a": {
				"aa":"testing",
				"ab":1234
			},
			"b": "xxx",
			"c": [
				{
					"ca":"first",
					"cb":123
				},
				{
					"ca":"second",
					"cb":456
				}
			]
		},
		"template":"{{c.0.ca}}"
	},
	{
		"title":"Triple curly brackets",
		"data":{"a":"<x>"},
		"template":"{ \"a\":\"{{{a}}}\" }"
	},
	{
		"title":"Expanding key names",
		"data":{"i":1234,"l":567,"c":890,"n":765},
		"template":"{\"cellId\":{{i}},\"locationAreaCode\":{{l}},\"mobileCountryCode\":{{c}},\"mobileNetworkCode\":{{n}} }"
	},
	{
		"title":"Preformatted object",
		"data":"{\"a\":[123,456,789]}",
		"template":"{\"anArray\":[{{a}}], \"id\":\"{{PARTICLE_DEVICE_ID}}\"}"
	},
	{
		"title":"Conditional block",
		"data":{"a":123,"b":{"c":"hello","d":false}},
		"template":"{\n\t{{#b}}\n\t\t\"cat\":\"{{c}}\", \n\t\t\"dog\":{{d}}, \n\t{{/b}}\n\t\"apple\":{{a}} \n}"
	},
	{
		"title":"Body with array",
		"data":{"a":[{"b":123,"c":true},{"b":456,"c":false}] },
		"template":"{\n\t\"array\":[\n\t\t{{#a}}\n\t\t{\n\t\t\t\"banana\":{{b}},\n\t\t\t\"capybara\":{{c}}\n\t\t},\n\t\t{{/a}}\n\t\t{}\n\t]\n}"
	}
	
];


