import {session} from 'wix-storage';

$w.onReady(function () {
	if(session.getItem("enquire")) $w('#enquire').value = session.getItem("enquire")
	$w('#enquire').onInput(() => session.setItem("enquire", $w('#enquire').value))
	$w('#submit').onClick(() => session.clear())
});