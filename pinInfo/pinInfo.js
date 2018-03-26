var pinData;


$(document).ready(function() {
	
	generateLongList();
	
	$('#optionShowSelect').change(function() {
		var val = $(this).val();
		if (val == 'all') {
			showSearch();
			$('.pinNotIO').show();						
		}
		else
		if (val == 'io') {
			showSearch();
			$('.pinNotIO').hide();			
		}
		else {
			var pat = /[0-9]+/;
			showSearch(parseInt(pat.exec(val)));
		}
	});	
});

function showSearch(which) {
	var numRows = $(pinData).find('detail').size();
	if (which != undefined) {
		for(var ii = 0; ii < numRows; ii++) {
			var detail = $(pinData).find('detail').get(ii);
			var detailSearchable = ($(detail).find('detailSearchable').text() == 'true');
			
			$('.search' + ii).hide();
			$('.searchRow' + ii).hide();
		}
		$('.pinNotIO').hide();			
	}
	
	for(var ii = 0; ii < numRows; ii++) {
		if ((which == ii) || (which == undefined)) {
			$('.search' + ii).show();
			$('.searchRow' + ii).show();
		}
	}	
	
}

function generateLongList() {
	$.ajax({
		  type: 'GET',
		  url: 'pinData.xml',
		  dataType: 'xml',
		  success: getPinDataCallback,
		  error: mainError
		});	
}

function getPinDataCallback(pinDataIn, textStatus, errorThrown) {
	
	pinData = pinDataIn;
	
	$(pinData).find('pin').each(function(index, elem) {
		var pinNumber = parseInt($(elem).find('pinNumber').text());
		var pinName = $(elem).find('pinName').text();
		
		
		var ebDiv = new ElementBuilder().withName("div");
		
		var pinIsIO = ($(elem).find('pinIsIO').text() == 'true');
		if (!pinIsIO) {
			ebDiv.withClass('pinNotIO');
		}
		
		var eb = new ElementBuilder().withName("h2");
		eb.appendText(pinName);
		ebDiv.appendElementBuilder(eb);	
		
		var numRows = $(pinData).find('detail').size();
		
		var tb = new TableBuilder(2, numRows, false);
		
		for(var ii = 0; ii < numRows; ii++) {
			var detail = $(pinData).find('detail').get(ii);
			var detailLabel = $(detail).find('detailLabel').text();
			var detailTag = $(detail).find('detailTag').text();
			var detailTrue = $(detail).find('detailTrue').text();
			var detailFalse = $(detail).find('detailFalse').text();
			var detailEmpty = $(detail).find('detailEmpty').text();
			var detailSearchable = ($(detail).find('detailSearchable').text() == 'true');
					
			tb.cell(0, ii).withClass('label0').appendText(detailLabel);

			var showInSearch = false;
			
			var value = '';
			if ($(elem).find(detailTag) != undefined) {
				value = $(elem).find(detailTag).text();
				if (detailSearchable && value != '' && value != 'false') {
					showInSearch = true;
				}
			}
			
			if (value == '') {
				value = detailEmpty;
			}
			if (value == 'true' && detailTrue != '') {
				value = detailTrue;
			}
			if (value == 'false' && detailFalse != '') {
				value = detailFalse;
			}
			
			if (value != '') {
				if (showInSearch) {
					ebDiv.withClass('search' + ii);
				}
				tb.cell(1, ii).appendText(value);
				if (detailSearchable) {
					tb.row(ii).withClass('searchRow' + ii);
				}
			}
			else {
				tb.row(ii).withClass('hidden');
			}
		}
				
		ebDiv.appendTable(tb);
		
		$('#longList').append(ebDiv.elem);


	});
	
	// Build the search popup
	$(pinData).find('detail').each(function(index, elem) {
		var detailSearchable = ($(elem).find('detailSearchable').text() == 'true');
		if (detailSearchable) {
			var detailLabel = $(elem).find('detailLabel').text();
			
			var eb = new ElementBuilder().withName('option');
			
			eb.withAttr('value', 'search' + index);
			eb.appendText(detailLabel);
			
			$('#optionShowSelect').append(eb.elem);
		}
	});
	
	
	
}

function mainError(jqXHR, textStatus, errorThrown) {
	
}
