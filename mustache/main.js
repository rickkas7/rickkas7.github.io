

$(document).ready(function() {
	$('#jsonText').on('keyup blur', handleInputChange);
	$('#templateText').on('keyup blur', handleInputChange);
	$('#showJsonDataCheckbox').on('click', handleShowJsonDataCheckbox);
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
			
			$('#jsonDataFormattedText').val(formatter.formatJson($('#jsonText').val()));				
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

