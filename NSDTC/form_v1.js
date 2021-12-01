import wixData from 'wix-data';
import {createMyPayment} from 'backend/pay';
import wixPay from 'wix-pay';
import wixWindow from 'wix-window';

var total = null;
let name = "";

$w.onReady(function () {
	$w('#BOne').disable();
	$w('#BNTwo').disable();
});

export function Question1_change(event) {
	test();
	change();
}

export function Question2_change(event) {
	test();
	change();

	if($w('#2SRButton1').value != ""){
		dateRadioNoNo();
	}
}

//================================== Questions ==================================
export function change(){
	let first = $w('#Question1').value;
	let Second = $w('#Question2').value;
	
	if(first == "Yes"){
		FormYes();
		$w('#L0').collapse();
		$w('#L1').collapse();
		$w('#button26').enable();
		$w('#Question2').collapse();

		//Five screen
		$w('#boxNo').collapse();
		$w('#boxYes').expand();

	}else{
		$w('#Question2').expand();
		$w('#BOne').disable();
		$w('#L0').expand();
		$w('#L1').expand();
		$w('#button26').disable();

		//Five screen
		$w('#boxYes').collapse();
		$w('#boxNo').expand();

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
	console.log(first + " " + Second)
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

export function add2_click(event) {
	$w('#add2').collapse();
	$w('#remove2').expand();
	$w('#D2Name').expand();
	$w('#D2Activities').expand();
}

export function remove2_click(event) {
	$w('#add2').expand();
	$w('#remove2').collapse();
	$w('#D2Name').collapse();
	$w('#D2Activities').collapse();
}

export function add3_click(event) {
	$w('#add3').collapse();
	$w('#remove3').expand();
	$w('#D3Name').expand();
	$w('#D3Activities').expand();
}

export function remove3_click(event) {
	$w('#add3').expand();
	$w('#remove3').collapse();
	$w('#D3Name').collapse();
	$w('#D3Activities').collapse();
}

export function add4_click(event) {
	$w('#add4').collapse();
	$w('#remove4').expand();
	$w('#D4Name').expand();
	$w('#D4Activities').expand();
}

export function remove4_click(event) {
	$w('#add4').expand();
	$w('#remove4').collapse();
	$w('#D4Name').collapse();
	$w('#D4Activities').collapse();
}

export async function dateSubscription(){
	let dnow = new Date().getMonth();
	//console.log('MONTH')
	//console.log(dnow);
	let total = null;
	let radioButton = $w('#2SRButton1').value;
	await wixData.query("Fees")
	.ascending('_createdDate')
	.find()
	.then( async (results) => {
		for(let i = 0; i < results.length; i++){

			let firstMonth = await results.items[i].startOfDate.getMonth();
			let secondMonth = await results.items[i].endOfDate.getMonth();
			//console.log(results.items[i].startOfDate + '	'+results.items[i].endOfDate)
			//console.log(firstMonth + '	'+ secondMonth);

			if(dnow >= firstMonth && dnow <= secondMonth){
				if(radioButton == "Individual"){
					total = results.items[i].individual;
					let text = "Individual $"+total;
					name = "Individual";
					$w('#pricingDetails').text = text;
				}else{
					total = results.items[i].family;
					let text = "Family $"+total;
					name = "Family";
					$w('#pricingDetails').text = text;
				}
				break;
			}			
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
	return total;
}

export async function dateRadioNoNo(event) {
	let question1 = $w('#Question1').value;
	let question2 = $w('#Question2').value;
	let radioB = $w('#2SRButton1').value;
	let text = "";

	if(question1 == "No"){
		if(question2 == "No"){
			total = await dateSubscription();
		}else{
			if(radioB == "Individual"){
				total = 95;
				text = "Individual $"+total;
				name = "Individual";
			}else{
				total = 140;
				text = "Family $"+total;
				name = "Family";
			}
			$w('#pricingDetails').text = text;
		}
	}
	$w('#totalPrice').text = "$"+total;
	console.log(total);
}

export function pay(event) {
	// Step 2 - Call backend function. 
	// (Next, see step 3 in the backend code below.)
	createMyPayment(name,total)
	// When the payment has been created and a paymentId has been returned:
	.then( (payment) => {
	// Step 5 - Call the startPayment() function with the paymentId.
	// Include PaymentOptions to customize the payment experience.
	wixPay.startPayment(payment.id, {
		"showThankYouPage": false,
		"termsAndConditionsLink": "https://davidcamachob.wixsite.com/nsdt/contact-nsdtc"
	})
	// Step 6 - Visitor enters the payment information.
	// When the payment form is completed:
		.then( (result) => {
		// Step 7 - Handle the payment result.
		// (Next, see step 8 in the backend code below.)
		if (result.status === "Successful") {
			$w('#button26').enable();
			wixWindow.openLightbox("Success Box");
		} else if (result.status === "Pending") {
			$w('#button26').disable();
			wixWindow.openLightbox("Pending Box");
		}
	} );
	} );
}