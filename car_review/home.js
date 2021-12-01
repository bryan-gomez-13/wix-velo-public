import wixData from 'wix-data'

var moonLanding, thisYear, minimunYear;

var model = [];
var array = [];

$w.onReady(function () {
	$w('#model').disable();
	getMake();
	getYears();
});

export function getMake(){
	wixData.query("Make")
	.ascending("make")
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			let make = [{"label": "All", "value": "All"}];
			for(let i=0; i < results.items.length; i++){
				make.push({ label: results.items[i].make, value: results.items[i].make })
			}
			$w('#make').options = make;
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

export function getYears(){
	moonLanding = new Date();
	thisYear = moonLanding.getFullYear();
	minimunYear = 1960;

	var years = [{"label": "All", "value": "All"}];
	for(let a = thisYear; a >= minimunYear; a--){
		years.push({"label": a.toString(), "value": a.toString()});
	}
	$w("#fromYear").options = years;
	//var newYear = $w("#fromYear").options;
	$w("#toYear").options = years;
}

export async function getModels(){
	$w('#model').disable();
	let results = await wixData.query('Cars').contains('make',$w('#make').value).limit(1000).ascending("model").find().then();
	if(results.items.length > 0) {
		model = [{"label": "All", "value": "All"}];
		dropDownModel(results, model, array);
		while(results.hasNext()) {
			results = await results.next();
			dropDownModel(results, model, array);
		}
		$w('#model').enable();
		$w('#model').options = model;
		$w('#model').updateValidityIndication();
		model = [];
		array = [];
	}
	let filter = wixData.filter().hasSome("make", $w('#make').value);
	$w('#dataset1').setFilter(filter);
}

export function dropDownModel(results, model, array){
	if(results.items.length > 0) {
		array = getArray(results, array);
		for (let i = 0; i < array.length; i++) {
			model.push({ label: array[i], value: array[i] })
		}
	}
}

export function getArray(results, array){
	for (let i = 0; i < results.items.length; i++) {
		if(array.includes(results.items[i].model) == false){
			array.push(results.items[i].model)
		}
	}
	return array;
}

//FILTERS
export function filterMake(){
	let filter = wixData.filter().hasSome("make", $w('#make').value);
	if($w('#model').value != 'All') 
		filter = filter.and(wixData.filter().hasSome("model", $w('#model').value));
	$w('#dataset1').setFilter(filter);
}

export function filterButton(event) {
	let filter = wixData.filter();

	let buttonMake = $w('#make').value;
	let buttonModel = $w('#model').value;
	let buttonFromYear = $w('#fromYear').value;
	let buttonToYear = $w('#toYear').value;
	//console.log(buttonMake + " " +buttonFromYear +" " +buttonToYear)

	if( (buttonMake == "All" || buttonMake == "" ) && ( buttonFromYear == "" ) && ( buttonToYear == "" ) ){
		filter = filter.between('fromYear', parseInt(minimunYear), parseInt(thisYear));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake == "All" || buttonMake == "" ) && ( buttonFromYear == "" ) && ( buttonToYear != "" ) ){
		filter = filter.between('fromYear', parseInt(minimunYear), parseInt(buttonToYear));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake == "All" || buttonMake == "" ) && ( buttonFromYear != "" ) && ( buttonToYear == "" ) ){
		filter = filter.between('fromYear', parseInt(buttonFromYear), parseInt(thisYear));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake == "All" || buttonMake == "" ) && ( buttonFromYear != "" ) && ( buttonToYear != "" ) ){
		filter = filter.between('fromYear', parseInt(buttonFromYear), parseInt(buttonToYear));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake != "All" && buttonMake != "" ) && ( buttonFromYear == "" ) && ( buttonToYear == "" ) ){
		filter = filter.hasSome('make',buttonMake).and(filter.between('fromYear', parseInt(minimunYear), parseInt(thisYear)));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake != "All" && buttonMake != "" ) && ( buttonFromYear == "" ) && ( buttonToYear != "" ) ){
		filter = filter = filter.hasSome('make',buttonMake).and(filter.between('fromYear', parseInt(minimunYear), parseInt(buttonToYear)));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake != "All" && buttonMake != "" ) && ( buttonFromYear != "" ) && ( buttonToYear == "" ) ){
		filter = filter = filter.hasSome('make',buttonMake).and(filter.between('fromYear', parseInt(buttonFromYear), parseInt(thisYear)));
		$w('#dataset1').setFilter(filter);

	}else if( (buttonMake != "All" && buttonMake != "" ) && ( buttonFromYear != "" ) && ( buttonToYear != "" ) ){
		filter = filter.hasSome('make',buttonMake).and(filter.between('fromYear', parseInt(buttonFromYear), parseInt(buttonToYear)));
		$w('#dataset1').setFilter(filter);

	}
}