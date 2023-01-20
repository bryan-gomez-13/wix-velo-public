import { session } from 'wix-storage';

$w.onReady(function () {
	$w('#enquire').onClick(() => session.setItem("centres", "Kelvin Road"))
});