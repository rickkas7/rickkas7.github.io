
var settings = [
	{
		"name":"No Sleep",
		"idleCurrent":0.0567,
		"publishCurrent":0.1617,
		"publishTime":12.0,
		"publishData":126
	},
	{
		"name":"Stop + Standby",
		"idleCurrent":0.00653,
		"publishCurrent":0.0557,
		"publishTime":3.19,
		"publishData":250
	},
	{
		"name":"Deep Sleep",
		"idleCurrent":0.000161,
		"publishCurrent":0.107,
		"publishTime":44.0,
		"publishData":1748
	}	
];


$(document).ready(function() {
	$("input[type='text']").on('change blur keyup', updateValues);
	$("select").on('change', updateValues);
	
	updateValues();
});

function updateValues() {

	var dataAdjustment = 1.05;
	var energyAdjustment = 1.05;

	var battery = parseInt($('#battery').val());
	var reserve = parseInt($('#reserve').val()) / 1000;
	var publishValue = parseInt($('#publishValue').val());
	var publishUnit = $('#publishUnit').val();
	var publishSize = parseInt($('#publishSize').val());
	
	// console.log("battery=" + battery + " reserve=" + reserve + " publishValue=" + publishValue + " publishUnit=" + publishUnit + " publishSize=" + publishSize);
	
	var publishSecs = publishValue;
	if (publishUnit == 'm') {
		publishSecs *= 60;
	}
	else
	if (publishUnit == 'h') {
		publishSecs *= 3600;		
	}
	// console.log("publishSecs=" + publishSecs);
	
	var tb = new TableBuilder(settings.length + 2, 12, true);

	// Row labels and units
	var nextRow = 0;
	
	var rowIdleCurrent = nextRow++;
	tb.cell(0, rowIdleCurrent).appendText("Idle Current");
	tb.cell(settings.length + 1, rowIdleCurrent).appendText("amps");
	
	var rowPublishCurrent = nextRow++;
	tb.cell(0, rowPublishCurrent).appendText("Publish Current");
	tb.cell(settings.length + 1, rowPublishCurrent).appendText("amps");

	var rowPublishTime = nextRow++;
	tb.cell(0, rowPublishTime).appendText("Publish Time");
	tb.cell(settings.length + 1, rowPublishTime).appendText("seconds");

	var rowPublishData = nextRow++;
	tb.cell(0, rowPublishData).appendText("Publish Data");
	tb.cell(settings.length + 1, rowPublishData).appendText("bytes");

	var rowEnergyPerPublish = nextRow++;
	tb.cell(0, rowEnergyPerPublish).appendText("Energy per publish");
	tb.cell(settings.length + 1, rowEnergyPerPublish).appendText("amp-seconds");

	var rowDataPerPublish = nextRow++;
	tb.cell(0, rowDataPerPublish).appendText("Data per publish");
	tb.cell(settings.length + 1, rowDataPerPublish).appendText("bytes");

	var rowPublishesPerDay = nextRow++;
	tb.cell(0, rowPublishesPerDay).appendText("Publishes per day");

	var rowEnergyPerDay = nextRow++;
	tb.cell(0, rowEnergyPerDay).appendText("Energy per day");
	tb.cell(settings.length + 1, rowEnergyPerDay).appendText("amp-hours");

	var rowDataPerDay = nextRow++;
	tb.cell(0, rowDataPerDay).appendText("Data per day");
	tb.cell(settings.length + 1, rowDataPerDay).appendText("bytes");

	var rowEnergyPerMonth = nextRow++;
	tb.cell(0, rowEnergyPerMonth).appendText("Energy per month");
	tb.cell(settings.length + 1, rowEnergyPerMonth).appendText("amp-hours");

	var rowDataPerMonth = nextRow++;
	tb.cell(0, rowDataPerMonth).appendText("Data per month");
	tb.cell(settings.length + 1, rowDataPerMonth).appendText("bytes");

	var batteryLifeDays = nextRow++;
	tb.cell(0, batteryLifeDays).appendText("Battery life days");
	tb.cell(settings.length + 1, batteryLifeDays).appendText("days");

	for(var ii = 0; ii < settings.length; ii++) {
		// Header
		tb.headerCell(ii + 1).appendText(settings[ii].name);
		
		tb.cell(ii + 1, rowIdleCurrent).appendText(settings[ii].idleCurrent);
		tb.cell(ii + 1, rowPublishCurrent).appendText(settings[ii].publishCurrent);
		tb.cell(ii + 1, rowPublishTime).appendText(settings[ii].publishTime);
		tb.cell(ii + 1, rowPublishData).appendText(settings[ii].publishData);
		
		// Values
		if (publishSecs >= settings[ii].publishTime) {
			// Energy per publish
			var energyPerPublish = settings[ii].publishCurrent * settings[ii].publishTime; // publish part
			energyPerPublish += settings[ii].idleCurrent * (publishSecs - settings[ii].publishTime); // idle part
			energyPerPublish *= energyAdjustment;
			tb.cell(ii + 1, rowEnergyPerPublish).appendText(round2(energyPerPublish));
			
			// Data per publish
			var dataPerPublish = Math.round((settings[ii].publishData + publishSize) * dataAdjustment);
			tb.cell(ii + 1, rowDataPerPublish).appendText(dataPerPublish);
			
			var periodsPerDay = (24 * 3600) / publishSecs;
			var periodsPerMonth = (30.416 * 24 * 3600) / publishSecs;

			if (periodsPerDay >= 1) {
				tb.cell(ii + 1, rowPublishesPerDay).appendText(round2(periodsPerDay));
				
				// Can do daily stats 
				var ampHoursPerDay = energyPerPublish * periodsPerDay  / 3600;
				tb.cell(ii + 1, rowEnergyPerDay).appendText(round2(ampHoursPerDay));

				value = dataPerPublish * periodsPerDay;
				tb.cell(ii + 1, rowDataPerDay).appendText(Math.round(value));

			}
			
			if (periodsPerMonth >= 1) {
				var value = energyPerPublish * periodsPerMonth / 3600;
				tb.cell(ii + 1, rowEnergyPerMonth).appendText(round2(value));

				value = dataPerPublish * periodsPerMonth;
				tb.cell(ii + 1, rowDataPerMonth).appendText(Math.round(value));
				
			}
			
			// Battery life days battery is amp hours
			value = (battery - reserve) / ampHoursPerDay;
			if (value > 0) {
				tb.cell(ii + 1, batteryLifeDays).appendText(round2(value));
			}
			
		} 
		else {
			// Time interval is too short for this setting
		}
		
		tb.withColumnClass(ii + 1, 'dataCol');
	}
	
	$('#results').html('');
	$('#results').append(tb.table.elem);
		
	
}

function round2(value) {
	
	return Math.round(value * 100) / 100;
}


