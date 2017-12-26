
$(document).ready(function() {
	$('#jsonTextArea').on('change blur keyup', handleJsonTextAreaChange);
	
	$('#exampleSelect').on('change', exampleSelectChange);
});


function handleJsonTextAreaChange() {
	var jsonText = $('#jsonTextArea').val();

	$('#decodedDiv').html('');
	$('#decodedDiv').hide();
	$('#invalidDiv').hide();
	$('#codeDiv').html('');

	var jsonObj = null;
	try {
		if (jsonText !== '') { 
			jsonObj = JSON.parse(jsonText);
		}
		$('#decodedDiv').show();
	}
	catch(e) {
		$('#invalidDiv').show();
	}
	
	if (jsonObj != null) {
		decode(jsonObj, 0, false, 'parser.getReference()');
	}
}

function decode(obj, indent, addCommaSeparator, decoder) {
	if (Array.isArray(obj)) {
		$('#decodedDiv').append('<div>' + indentSpan(indent) + '[</div>');
		for(var ii = 0; ii < obj.length; ii++) {
			decodeValue(obj[ii], indent + 1, null, (ii < (obj.length - 1)), decoder + '.index(' + ii + ')');
		}
		$('#decodedDiv').append('<div>' + indentSpan(indent) + ']' + (addCommaSeparator ? "," : "") + '</div>');
	}
	else {
		$('#decodedDiv').append('<div>' + indentSpan(indent) + '{</div>');
		var keys = Object.keys(obj);
		for(var ii = 0; ii < keys.length; ii++) {
			decodeValue(obj[keys[ii]], indent + 1, keys[ii], (ii < (keys.length - 1)), decoder + '.key(' + quoteString(keys[ii]) +')');
		}
		$('#decodedDiv').append('<div>' + indentSpan(indent) + '}' + (addCommaSeparator ? "," : "") + '</div>');
	}
	
}

function decodeValue(val, indent, key, addCommaSeparator, decoder) {
	var html = '';
	
	html += indentSpan(indent);
	if (key) {
		html += '<span>' + quoteString(key) + ':' + '</span>';		
	}

	
	if ((val !== null) && (Array.isArray(val) || typeof val === 'object')) {
		// Array or object
		$('#decodedDiv').append(generateCodeDiv(decoder, html));
		html = '';
		
		decode(val, indent + 1, addCommaSeparator, decoder);
	}
	else {
		// Primitive
		if (typeof val == 'number') {
			html += '<span>' + val + '</span>';
			if (Number.isInteger(val)) {
				decoder += '.valueInt()';	
			}
			else {
				decoder += '.valueFloat()';
			}
		}
		else
		if (typeof val == 'string') {
			html += '<span>' + quoteString(val) + '</span>';
			decoder += '.valueString()';
		}
		else
		if (typeof val == 'boolean') {
			if (val == true) {
				html += '<span>true</span>';
			}
			else {
				html += '<span>false</span>';
			}
			decoder += '.valueBoolean()';
		}
		if (addCommaSeparator) {
			html += ',';
		}
	}
	
	if (html != '') {
		$('#decodedDiv').append(generateCodeDiv(decoder, html));
	}
}

function generateCodeDiv(decoder, html) {
	return '<div data-code="' + decoder.replace(/"/g, '&quot;') + '" onclick="updateCodeDiv(this)">' + html + '</div>';
}

function quoteString(s) {
	return '"' + s.replace(/\\/g, '\\\\').replace(/"/g,'\\"') + '"';
}

function indentSpan(indent) {
	var result = '<span>';
	
	for(var ii = 0; ii < indent; ii++) {
		result += ' &nbsp; &nbsp;';
	}
	
	result += '</span>';
	
	return result;
}

function updateCodeDiv(obj) {
	$('.highlight').removeClass('highlight');
	$(obj).addClass('highlight');
	
	$('#codeDiv').html($(obj).attr("data-code"));
}

function exampleSelectChange() {
	if ($('#exampleSelect').val() != 'none') {
		$.ajax( 'examples/' + $('#exampleSelect').val() + '.json' )
		.done(function(data, status) {
			$('#jsonTextArea').val(JSON.stringify(data));
			handleJsonTextAreaChange();
		})
		.fail(function() {
			// console.log( "error" );
		})

	}
}
