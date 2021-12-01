import wixData from 'wix-data';
var dnow = new Date();
var plan3;
var plan4;
var change = 0;
var size = 0;

$w.onReady(async function () {
	$w("#dropdown1").options.push({
		"value": '',
		"label": 'All'
	})
	filterData();
	await getDataPlan3();
	getDataPlan4();
	if(size > 2){
		time();
	}
});

export function button30_click(event) {
	let category = $w('#dropdown1').value;
	let keywork = $w('#input1').value;
	let dnow = new Date();
	var filter = wixData.filter();
	if(category.length !== 0){
		filter = filter.eq("category", category).and(filter.ge("dateFinalCourse", dnow));
	}
	if( keywork.length !== 0){
		filter = filter.contains("title", keywork).and(filter.ge("dateFinalCourse", dnow));
	}

	$w("#dataset17").setFilter(filter)
	itemDateRepeater();
}

function filterData() {
	let filter = wixData.filter();
	let sort = wixData.sort();
	filter = filter.eq('active',true).and(filter.ge('dateFinalCourse', dnow));
	$w('#dataset17').setFilter(filter);
	itemDateRepeater();
}

function getDataPlan3() {
	
	let filterPlan3 = wixData.query("AllCourses");
	return filterPlan3.eq('plan','13b985c8-bef6-454e-90bf-7fb562ff6cb3').and(filterPlan3.ge('dateFinalCourse', dnow)).and(filterPlan3.eq('active',true)).find().then(results => {
		plan3 = results.items;
		size = plan3.length;
		
		if(size > 2){
			$w('#sImage0').src = plan3[change].image;
			$w('#sTitle0').text = plan3[change].title;
			$w('#sShortDescription0').text = plan3[change].shortDescription;
			$w('#sButton0').link = plan3[change]['link-allcourses-title'];
			change++
			$w('#sImage1').src = plan3[change].image;
			$w('#sTitle1').text = plan3[change].title;
			$w('#sShortDescription1').text = plan3[change].shortDescription;
			$w('#sButton1').link = plan3[change]['link-allcourses-title'];
		}else{
			switch (size){
				case 0:
					$w('#boxPlan3').collapse();
					$w('#left').collapse();
					$w('#right').collapse();
					$w('#boxLeft').collapse();
					$w('#boxRight').collapse();
					break;
				case 1:
					$w('#boxRight').hide();
					$w('#right').hide();
					$w('#left').hide();
					$w('#sImage0').src = plan3[change].image;
					$w('#sTitle0').text = plan3[change].title;
					$w('#sShortDescription0').text = plan3[change].shortDescription;
					$w('#sButton0').link = plan3[change]['link-allcourses-title'];
					break;
				case 2:
					$w('#right').hide();
					$w('#left').hide();

					$w('#sImage0').src = plan3[change].image;
					$w('#sTitle0').text = plan3[change].title;
					$w('#sShortDescription0').text = plan3[change].shortDescription;
					$w('#sButton0').link = plan3[change]['link-allcourses-title'];
					change++

					$w('#sImage1').src = plan3[change].image;
					$w('#sTitle1').text = plan3[change].title;
					$w('#sShortDescription1').text = plan3[change].shortDescription;
					$w('#sButton1').link = plan3[change]['link-allcourses-title'];
					break;
			}
		}
		return plan3;
	})
}

export function right_click(event) {
	right1();
}

export function right1(){
	if(change >= size-1){
		//$w('#right').hide();
	}else{
		$w('#sImage0').src = plan3[change].image;
		$w('#sTitle0').text = plan3[change].title;
		$w('#sShortDescription0').text = plan3[change].shortDescription;
		$w('#sButton0').link = plan3[change]['link-allcourses-title'];
		change++
		if(change >= size-1){
			//$w('#right').hide();
			$w('#sImage1').src = plan3[change].image;
			$w('#sTitle1').text = plan3[change].title;
			$w('#sShortDescription1').text = plan3[change].shortDescription;
			$w('#sButton1').link = plan3[change]['link-allcourses-title'];
		}else{
			$w('#sImage1').src = plan3[change].image;
			$w('#sTitle1').text = plan3[change].title;
			$w('#sShortDescription1').text = plan3[change].shortDescription;
			$w('#sButton1').link = plan3[change]['link-allcourses-title'];
		}
	}
}

export function left_click(event) {
	left();
}

export function left(){
	console.log(change);
	change--
	if(change < 1){
		//$w('#left').hide();
		change = 1;
	}else{
		$w('#sImage1').src = plan3[change].image;
		$w('#sTitle1').text = plan3[change].title;
		$w('#sShortDescription1').text = plan3[change].shortDescription;
		$w('#sButton1').link = plan3[change]['link-allcourses-title'];
		change--
		if(change <= 1){
			//$w('#left').hide();
			$w('#sImage0').src = plan3[change].image;
			$w('#sTitle0').text = plan3[change].title;
			$w('#sShortDescription0').text = plan3[change].shortDescription;
			$w('#sButton0').link = plan3[change]['link-allcourses-title'];
		} else{
			$w('#sImage0').src = plan3[change].image;
			$w('#sTitle0').text = plan3[change].title;
			$w('#sShortDescription0').text = plan3[change].shortDescription;
			$w('#sButton0').link = plan3[change]['link-allcourses-title'];
		}
	}
	change++;
	console.log(change);
}

function getDataPlan4() {
	let filterPlan4 = wixData.query("Banner");
	return filterPlan4.eq('active',true).and(filterPlan4.ge('dateFinal',dnow)).find().then(results => {
		plan4 = results.items;
		let sizePlan4 = plan4.length;

		switch (sizePlan4){
			case 0:
				$w('#slideshow1').collapse();
				$w('#slideshow4').collapse();
				break;
			
			case 1:
				$w('#slideshow1').collapse();
				$w('#imageOne').alt = plan4[0].title;
				$w('#imageOne').src = plan4[0].image;
				$w('#imageOne').link = plan4[0].link;
				break;

			case 2:
				//banner 1
				$w('#imageOne').alt = plan4[0].title;
				$w('#imageOne').src = plan4[0].image;
				$w('#imageOne').link = plan4[0].link;
				//banner 2
				$w('#imageTwo').alt = plan4[1].title;
				$w('#imageTwo').src = plan4[1].image;
				$w('#imageTwo').link = plan4[1].link;
				break;
		}
	})
}

export async function time(){
	if(change === size-1){
		change = 0;
		await delay(4);
		right2();
	}else{
		await delay(4);
		right2();
	}
}

export function right2(){
	if(change >= size-1){
		//$w('#right').hide();
	}else{
		$w('#sImage0').src = plan3[change].image;
		$w('#sTitle0').text = plan3[change].title;
		$w('#sShortDescription0').text = plan3[change].shortDescription;
		$w('#sButton0').link = plan3[change]['link-allcourses-title'];
		change++
		if(change >= size-1){
			//$w('#right').hide();
			$w('#sImage1').src = plan3[change].image;
			$w('#sTitle1').text = plan3[change].title;
			$w('#sShortDescription1').text = plan3[change].shortDescription;
			$w('#sButton1').link = plan3[change]['link-allcourses-title'];
		}else{
			$w('#sImage1').src = plan3[change].image;
			$w('#sTitle1').text = plan3[change].title;
			$w('#sShortDescription1').text = plan3[change].shortDescription;
			$w('#sButton1').link = plan3[change]['link-allcourses-title'];
		}
	}
	time();
}

export function delay(time){
	return new Promise(function(resolve){
        setTimeout(resolve,time*1000);
    });
}

export function itemDateRepeater(){
	$w('#dataset17').onReady(() => {
		$w("#repeater1").forEachItem( ($item, itemData, index) => {
			let repeaterData = $w("#repeater1").data;
			if(repeaterData[index].checkBoxDate == true){
				$item('#group1').show();
				$item('#group2').hide();
			}else{
				$item('#group2').show();
				$item('#group1').hide();
			}
		});
	})
}