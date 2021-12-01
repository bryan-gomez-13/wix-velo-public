import wixData from 'wix-data';

$w.onReady(function () {
	$w('#Question2').disable();
	$w('#BOne').disable();
	$w('#BNTwo').disable();
});

export function Question1_change(event) {
	//test();
	change();
}

export function Question2_change(event) {
	//test();
	change();
}

//================================== Questions ==================================
export function change(){
	let first = $w('#Question1').value;
	let Second = $w('#Question2').value;
	
	if(first == "Yes"){
		FormYes();
		$w('#L0').collapse();
		$w('#L1').collapse();

	}else{
		$w('#Question2').enable();
		$w('#BOne').disable();
		$w('#L0').expand();
		$w('#L1').expand();

		if(Second == "Yes"){
			FormNoYes();
		}else if (Second == "No"){
			FormNoNo();
		}
	}
}
//================================== Yes ==================================
export function FormYes(){
	//First screen
	$w('#BOne').enable();
	$w('#Question2').disable();

	//Second screen
	$w('#2SRadioButton1').text = "Please select, are you:*"
	radioB("Yes");

	//Third screen
	dogs();

	//Four screen
	check("Yes");
}
//================================== No - Yes ==================================
export function FormNoYes(){
	//First screen
	$w('#BOne').enable();

	//Second screen
	$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
	radioB("No");

	//Third screen
	dogs();

	//Four screen
	check("No");
}
//================================== No - No ==================================
export function FormNoNo(){
	//First screen
	$w('#BOne').enable();

	//Second screen
	$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
	radioB("No");

	//Third screen
	dogs();

	//Four screen
	check("No");
}
//================================== Test ==================================
export function test(){
	let first = $w('#Question1').value;
	let Second = $w('#Question2').value;
	//console.log(first + " " + Second)
}
//================================== Radio Button ==================================
export function radioB(value){
	wixData.query("RadioButton")
	.ascending("_createdDate")
	.find()
	.then( (results) => {
		//console.log(results);
		let op = [];
		if(value == "Yes"){
			op.push({ label: results.items[0].title, value: results.items[0].title })
			op.push({ label: results.items[1].title, value: results.items[1].title })
		}else{
			op.push({ label: results.items[0].title, value: results.items[0].title })
			op.push({ label: results.items[2].title, value: results.items[2].title })
		}
		
		$w('#2SRButton1').options = op;
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

//================================== Email ==================================
export function confirmEmail(){
	let Email_1 = $w('#2SEmail1').value;
	let Email_2 = $w('#2SEmail2').value;

	if(Email_1 == Email_2){
		$w('#BNTwo').enable();
	}else{
		$w('#BNTwo').disable();
	}
}

//================================== Dog's activities ==================================
export function dogs(){
	wixData.query("Activities")
	.ascending("title")
	.find()
	.then( (results) => {
		//console.log(results);
		let activities = [];
		for (let i = 0; i < results.items.length; i++) {
			activities.push({ label: results.items[i].title, value: results.items[i].title })
		}
		$w('#D1Activities').options = activities;
		$w('#D2Activities').options = activities;
		$w('#D3Activities').options = activities;
		$w('#D4Activities').options = activities;
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

//================================== The agreement ==================================
export function check(value){
	if(value == "Yes"){
		$w('#Tfirst').text = "- I understand that membership is for a calendar year; that it is non-refundable and non-transferable unless for any reason the application is rejected by the committee in which case any payment will be refunded in full.*";
		$w('#Tthird').text = "- I accept and agree that North Shore Dog Training Club Inc. (Club), any representative of the Club, or person acting on behalf of the Club, has no responsibility or liability for anything that may happen to me, my dog or my property either directly or indirectly as a result of us attending this programme,*";
	}else{
		$w('#Tfirst').text = "- I understand that membership payment is for a calendar year; that it is non-refundable and non-transferable unless for any reason the application is rejected by the committee in which case payment will be refunded in full.*";
		$w('#Tthird').text = "- I accept and agree that North Shore Dog Training Club Inc. ('Club'), any representative of the Club, or person acting on behalf of the Club, has no responsibility or liability for anything that may happen to me, my dog or my property either directly or indirectly as a result of us attending the Club or related activities.*";
	}
}