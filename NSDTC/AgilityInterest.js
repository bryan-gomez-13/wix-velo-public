import { appendValuesWrapper } from 'backend/googlesheet-wrapper.jsw';

$w.onReady(function () {
	$w('#save').onClick(() => saveInterest());
});

async function saveInterest(){
	const fullName = $w('#fullName').value;
	const email = $w('#email').value;
	let values = [];
	values = [fullName, email];
	await appendValuesWrapper(values, 'SheetAgilityInterest');
}