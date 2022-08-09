import {session} from 'wix-storage';

$w.onReady(function () {
	$w('#columnStrip25').collapse();
	
	let value = session.getItem("web"); // "value"
	if(value) {
		$w('#web').value = value
		session.clear();
	}else{
		$w('#web').value = 'CONTACT'
	}
});