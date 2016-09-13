
$(document).ready(function() {
	$('#keyValue64').on('keyup blur', updateHex64);
	$('#keyNum64').on('change', updateHex64);

	$('#keyValue128').on('keyup blur', updateHex128);
	$('#keyNum128').on('change', updateHex128);
	
	$('#passphraseText').on('keyup blur', updatePassphrase);
	
});


function updateHex64() {
		
	var input = $('#keyValue64').val();
	var result = '';
	
	if (input.length >= 5) {
		result = '0' + $('#keyNum64').val() + '05';
		
		for(var ii = 0; ii < 5; ii++) {
			var n = input.charCodeAt(ii);
			
			var s = n.toString(16).toUpperCase();
			if (s.length == 1) {
				s = '0' + s;
			}
			result += s;
		}
		$('#keyEnter64').show();
		$('#keyShort64').hide();		
	}
	else {
		$('#keyEnter64').hide();
		$('#keyShort64').show();		
	}
	$('#keyResult64').html(result);		
}


function updateHex128() {
		
	var input = $('#keyValue128').val();
	var result = '';
	
	if (input.length >= 13) {
		result = '0' + $('#keyNum128').val() + '0D';
		
		for(var ii = 0; ii < 13; ii++) {
			var n = input.charCodeAt(ii);
			
			var s = n.toString(16).toUpperCase();
			if (s.length == 1) {
				s = '0' + s;
			}
			result += s;
		}
		$('#keyEnter128').show();
		$('#keyShort128').hide();		
	}
	else {
		$('#keyEnter128').hide();
		$('#keyShort128').show();		
	}
	$('#keyResult128').html(result);		
}

function updatePassphrase() {
	
	var input = $('#passphraseText').val();
	
	var pass64 = ['', '', '', ''];
	var pass128 = '';

	if (input.length > 0) {
		// Calculate 64-bit
		
		// Algorithm from here:
		// http://security.stackexchange.com/questions/35614/standard-algorithm-for-wep-key-generator-64-bit
		var pseed = [0,0,0,0];
		
		for(var ii = 0; ii < 4; ii++) {
			pass64[ii] = '0' + ii + '05';
		}
		
		for(var ii = 0; ii < input.length; ii++) {
			pseed[ii % 4] ^= input.charCodeAt(ii);
		}
		
		var randNumber = pseed[0] | (pseed[1] << 8) | (pseed[2] << 16) | (pseed[3] << 24);
		
		for(var ii = 0; ii < 4; ii++) {
			for(var jj = 0; jj < 5; jj++) {
	            randNumber = (randNumber * 0x343fd + 0x269ec3) & 0xffffffff;
	            var s = ((randNumber >> 16) & 0xff).toString(16);
	            if (s.length == 1) {
	            	s = '0' + s;
	            }
	           
				pass64[ii] += s.toUpperCase();
			}
		}
		
		// 128-bit
		
		// Algorithm from here:
		// http://www.frihost.com/forums/vt-34978.html
		var catInput = input;
		while(catInput.length < 64) {
			catInput += input;
		}
		catInput = catInput.substring(0, 64);
		
		var hash = md5(catInput); 
		
		pass128 = '000D' + hash.substring(0, 26).toUpperCase();
		
		
	}
	$('#passphase64_0').html(pass64[0]);
	$('#passphase64_1').html(pass64[1]);
	$('#passphase64_2').html(pass64[2]);
	$('#passphase64_3').html(pass64[3]);
	$('#passphase128').html(pass128);

}

