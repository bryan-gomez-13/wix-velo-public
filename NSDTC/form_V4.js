//V4 with post in google sheet
import { appendValuesWrapper } from 'backend/googlesheet-wrapper.jsw';
import wixData from 'wix-data';
import {createMyPayment} from 'backend/pay';
import wixPay from 'wix-pay';
import wixLocation from 'wix-location';

var total = null;
let name = "";

$w.onReady(function () {
	$w('#BOne').disable();
	$w('#BNTwo').disable();
});

export function Question1_change(event) {
	change();
}

export function Question2_change(event) {
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
		$w('#button29').expand();
		$w('#Question2').collapse();

		//Five screen
		$w('#boxNo').collapse();
		//$w('#text22').text = "Thanks for submitting. Our representatives will get in touch with you.";

		$w('#input12').value = "";
		//$w('#text29').expand();
		$w('#text27').collapse();
		$w('#button29').collapse();
		$w('#button30').collapse();
		$w('#text31').collapse();
		$w('#text32').collapse();
		$w('#text32').collapse();

		$w('#button31').label = 'Send Form';

	}else{
		$w('#Question2').expand();
		$w('#BOne').disable();
		$w('#L0').expand();
		$w('#L1').expand();

		//Five screen
		$w('#boxNo').expand();
		//$w('#text22').text = "The last step is pay your subscription for finish";

		$w('#text29').collapse();
		$w('#button29').collapse();

		$w('#text31').expand();
		$w('#text32').collapse();

		$w('#button31').label = 'Next >';

		$w('#input12').value = "";

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
	//$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
	radioB("Yes");

	//Third screen
	dogs();

}
//================================== No - Yes ==================================
export function FormNoYes(){
	//First screen
	$w('#BOne').enable();

	//Second screen
	//$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
	radioB("No");

	//Third screen
	dogs();
}
//================================== No - No ==================================
export function FormNoNo(){
	//First screen
	$w('#BOne').enable();

	//Second screen
	//$w('#2SRadioButton1').text = "Please indicate if this membership is for:*"
	radioB("No");

	//Third screen
	dogs();
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
	.ascending("order")
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
		$w('#D5Activities').options = activities;
		$w('#D6Activities').options = activities;
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

/// ==================== Dogs form ====================
export function add2_click(event) {
	$w('#add2').collapse();
	$w('#remove2').expand();
	$w('#D2Name').expand();
	$w('#D2Activities').expand();

	if($w('#D3Name').isVisible == false){
		$w('#add3').expand();
	}
}

export function remove2_click(event) {
	$w('#add2').expand();
	$w('#remove2').collapse();
	$w('#D2Name').collapse();
	$w('#D2Activities').collapse();

	$w('#D2Name').value = "";
	dog2Field();
}

export function add3_click(event) {
	$w('#add3').collapse();
	$w('#remove3').expand();
	$w('#D3Name').expand();
	$w('#D3Activities').expand();

	if($w('#D4Name').isVisible == false){
		$w('#add4').expand();
	}
}

export function remove3_click(event) {
	$w('#add3').expand();
	$w('#remove3').collapse();
	$w('#D3Name').collapse();
	$w('#D3Activities').collapse();

	$w('#D3Name').value = "";
	dog3Field();
}

export function add4_click(event) {
	$w('#add4').collapse();
	$w('#remove4').expand();
	$w('#D4Name').expand();
	$w('#D4Activities').expand();
	//Get field of the radio button 
	let x = $w('#2SRButton1').value;

	if($w('#D5Name').isVisible == false && x.includes("Family")){
		$w('#add5').expand();
	}
}

export function remove4_click(event) {
	$w('#add4').expand();
	$w('#remove4').collapse();
	$w('#D4Name').collapse();
	$w('#D4Activities').collapse();

	$w('#D4Name').value = "";
	dog4Field();
}

export function add5_click(event) {
	$w('#add5').collapse();
	$w('#remove5').expand();
	$w('#D5Name').expand();
	$w('#D5Activities').expand();

	if($w('#D6Name').isVisible == false ){
		$w('#add6').expand();
	}
}

export function remove5_click(event) {
	$w('#add5').expand();
	$w('#remove5').collapse();
	$w('#D5Name').collapse();
	$w('#D5Activities').collapse();

	$w('#D5Name').value = "";
	dog5Field();
}

export function add6_click(event) {
	$w('#add6').collapse();
	$w('#remove6').expand();
	$w('#D6Name').expand();
	$w('#D6Activities').expand();
}

export function remove6_click(event) {
	$w('#add6').expand();
	$w('#remove6').collapse();
	$w('#D6Name').collapse();
	$w('#D6Activities').collapse();

	$w('#D6Name').value = "";
	dog6Field();
}

/// ==================== Dogs Field ====================
// Dog1
export function dog1Field(){
	let name = $w('#D1Name').value;
	let activities = $w('#D1Activities').value;
	$w('#Dog1').value = name + " - " + activities;
	console.log($w('#Dog1').value);
}

//Dog2
export function dog2Field(){
	$w('#Dog2').value = "";
	if($w('#D2Name').value != ""){
		$w('#Dog2').value = $w('#D2Name').value + " - " + $w('#D2Activities').value;
	}
	console.log($w('#Dog2').value);
}

//Dog3
export function dog3Field(){
	$w('#Dog3').value = "";
	if($w('#D3Name').value != ""){
		$w('#Dog3').value = $w('#D3Name').value + " - " + $w('#D3Activities').value;
	}
	console.log($w('#Dog3').value);
}

//Dog4
export function dog4Field(){
	$w('#Dog4').value = "";
	if($w('#D4Name').value != ""){
		$w('#Dog4').value = $w('#D4Name').value + " - " + $w('#D4Activities').value;
	}
	console.log($w('#Dog4').value);
}

//Dog5
export function dog5Field(){
	$w('#Dog5').value = "";
	if($w('#D5Name').value != ""){
		$w('#Dog5').value = $w('#D5Name').value + " - " + $w('#D5Activities').value;
	}
	console.log($w('#Dog5').value);
}

//Dog6
export function dog6Field(){
	$w('#Dog6').value = "";
	if($w('#D6Name').value != ""){
		$w('#Dog6').value = $w('#D6Name').value + " - " + $w('#D6Activities').value;
	}
	console.log($w('#Dog6').value);
}


/// ==================== Date ====================

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
		"showThankYouPage": true,
		//"termsAndConditionsLink": "https://davidcamachob.wixsite.com/nsdt/contact-nsdtc"
	})
	// Step 6 - Visitor enters the payment information.
	// When the payment form is completed:
		.then( (result) => {
		// Step 7 - Handle the payment result.
		// (Next, see step 8 in the backend code below.)
		//$w('#button26').enable();
		if (result.status === "Successful") {
			$w('#button29').expand();
			$w('#text32').expand();
			$w('#bookButton').collapse();
			$w('#input12').value = "Paid";

			$w('#text31').collapse();
		} else if (result.status === "Pending") {
			$w('#button29').collapse();
			$w('#input12').value = "Error";

			$w('#text31').expand();
		}
	} );
	} );
}
/// ==================== SEND FORM ====================
export function sendForm(event) {
	let first = $w('#Question1').value;
	if(first == "Yes"){
		wixLocation.to('/');
	}
	saveValuesToSheet();
}

async function saveValuesToSheet() { 
    const Payment = $w('#input12').value;

    const Question1 = $w('#Question1').value;
	const Question2 = $w('#Question2').value;

	const IndicateMembership = $w('#2SRButton1').value;
	const FullName = $w('#input6').value;
	const Phone = $w('#input11').value;
	const Email = $w('#2SEmail1').value;
	const EmailConfirm = $w('#2SEmail2').value;
	const FullAdress = $w('#input10').value;

	const Dog1 = $w('#Dog1').value;
	const Dog2 = $w('#Dog2').value;
	const Dog3 = $w('#Dog3').value;
	const Dog4 = $w('#Dog4').value;
	const Dog5 = $w('#Dog5').value;
	const Dog6 = $w('#Dog6').value;

	const check1 = $w('#checkbox2').value;
	const check2 = $w('#checkbox3').value;
	const check3 = $w('#checkbox4').value;

    const values = [Payment, Question1, Question2, IndicateMembership, FullName, Phone, Email, EmailConfirm, FullAdress, Dog1, Dog2, Dog3, Dog4, Dog5, Dog6, check1, check2, check3];
	const res = await appendValuesWrapper(values);
	console.log(res);
}