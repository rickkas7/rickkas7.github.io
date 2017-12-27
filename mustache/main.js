

$(document).ready(function() {
	$('#jsonText').on('keyup blur', handleInputChange);
	$('#templateText').on('keyup blur', handleInputChange);
	$('#showJsonDataCheckbox').on('click', handleShowJsonDataCheckbox);
	$('#copyToTemplateButton').on('click', handleCopyToTemplate);
	$('#removeLFCheckbox').on('click', handleTestButton);
	$('#exampleSelect').on('change', handleExampleSelect);
	
	
	// Initialize examples menu
	for(var ii = 0; ii < examples.length; ii++) {
		$('#exampleSelect').append('<option value="' + ii + '">' + examples[ii].title + '</option>');
	}
	
	$('#parseError').hide();
});

function handleExampleSelect() {
	var sel = $('#exampleSelect').val();
	if (sel != '-') {
		var item = parseInt(sel);
		
		if (examples[item].data instanceof Object) {
			$('#jsonText').val(JSON.stringify(examples[item].data));
		}
		else {
			$('#jsonText').val(examples[item].data);			
		}
		$('#templateText').val(examples[item].template);
		handleInputChange();
	}
	else {
		$('#jsonText').val('');
		$('#templateText').val('');
	}
}

function handleInputChange() {
	handleShowJsonDataCheckbox();
	handleTestButton();
}

function handleTestButton() {
	var context;
	
	try {
		context = JSON.parse($('#jsonText').val());
		$('#parseError').hide();	

		$('#decodedDiv').html('');
		decode(context, 0, false, '');
	}
	catch(e) {
		$('#parseError').show();
		return;
	}

	// Add in pre-defined variables to the context
	context.PARTICLE_EVENT_VALUE = $('#jsonText').val();
	context.PARTICLE_DEVICE_ID = '12345678901234567890abcd';
	context.PARTICLE_PUBLISHED_AT = new Date().toISOString();
	
	// String-escaped version of the template
	{
		var obj = {};
		obj.s = $('#templateText').val();
		
		if ($('#removeLFCheckbox').prop('checked')) {
			obj.s = obj.s.replace(/[\t\r\n]+/ig, ' ');
		}
		
		
		var s = JSON.stringify(obj);
		var start = s.indexOf(':"') + 2;
		var end = s.lastIndexOf('"');
		$('#escapedTemplateText').text(s.substr(start, end - start));
	}

	var template = Handlebars.compile($('#templateText').val());
	
	var out = template(context);
	
	$('#resultText').val(out);	

	try {
		var jsonOut = JSON.parse(out);

		$('#resultJsonFormattedText').val(formatter.formatJson(out));				
		$('#resultJsonFormattedDiv').show();		
	}
	catch(e) {
		$('#resultJsonFormattedDiv').hide();
	}

}

function handleShowJsonDataCheckbox() {
	var checked = $('#showJsonDataCheckbox').prop('checked');
	if (checked) {
		try {
			context = JSON.parse($('#jsonText').val());
			$('#parseError').hide();	
			$('#jsonDataFormattedDiv').show();
			
			$('#decodedDiv').html('');
			decode(context, 0, false, '');
		}
		catch(e) {
			$('#parseError').show();
			$('#jsonDataFormattedDiv').hide();
			return;
		}		
	}
	else {
		$('#jsonDataFormattedDiv').hide();
	}
}

function decode(obj, indent, addCommaSeparator, decoder) {
		
	if (Array.isArray(obj)) {
		$('#decodedDiv').append('<div>' + indentSpan(indent) + '[</div>');
		for(var ii = 0; ii < obj.length; ii++) {
			decodeValue(obj[ii], indent + 1, null, (ii < (obj.length - 1)), decoder + '.' + ii);
		}
		$('#decodedDiv').append('<div>' + indentSpan(indent) + ']' + (addCommaSeparator ? "," : "") + '</div>');
	}
	else {
		$('#decodedDiv').append('<div>' + indentSpan(indent) + '{</div>');
		var keys = Object.keys(obj);
		for(var ii = 0; ii < keys.length; ii++) {
			decodeValue(obj[keys[ii]], indent + 1, keys[ii], (ii < (keys.length - 1)), decoder + '.' + keys[ii]);
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
		}
		else
		if (typeof val == 'string') {
			html += '<span>' + quoteString(val) + '</span>';
		}
		else
		if (typeof val == 'boolean') {
			if (val == true) {
				html += '<span>true</span>';
			}
			else {
				html += '<span>false</span>';
			}
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
	if (decoder.startsWith('.')) {
		// Remove leading .; it's easier to do here than special case when adding it
		decoder = decoder.substr(1);
	}
	
	decoder = '{{' + decoder  + '}}';
	
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

function handleCopyToTemplate() {
	$('#templateText').val($('#templateText').val() + $('#codeDiv').text());
	handleInputChange();
	return false;
}

