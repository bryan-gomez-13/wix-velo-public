$w.onReady(function () {
	$w('#TScroll').text = "Experiences";
	$w('#slider1').value = 1.25;
});

export function enter(){
	$w('#boxDown').show();
	$w('#boxUp').hide();
	hideM();
}

export function leave(){
	$w('#boxUp').show();
	$w('#boxDown').hide();
}

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export async function more2(event) {
	let option = {
		 "direction": "bottom"
	}
	$w('#small').hide(); 
	$w('#more2').hide();
	await $w('#big').show("slide",option).then(() => {
		$w('#less2').show();
	})
}

export async function less2(event) {
	let option = {
		 "direction": "bottom"
	}
	$w('#less2').hide();
	await $w('#big').hide("slide",option).then(() => {
		$w('#small').show();
		$w('#more2').show();
	})	
}

//Menu
export function hideM(){
	$w('#ScroolM').hide();
}

export function showM(){
	$w('#ScroolM').show();
}

export function one(){
	$w('#slider2').value = 4.45;
	$w('#slider1').value = 1.25;
}

export function two(){
	$w('#slider2').value =4.45;
}

export function three(){
	$w('#slider2').value = 7.3;
}

export function four(){
	$w('#slider2').value = 9.5;
}