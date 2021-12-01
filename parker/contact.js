import {session} from 'wix-storage';

$w.onReady(function () {
	code();
});

export function code(){
	let value = session.getItem("code"); // "value"
	if (value.length > 0){
		console.log(value);
		$w('#input1').value = value;
		$w('#input1').disable();
	}
}