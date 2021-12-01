$w.onReady(function () {
	$w('#TScroll').text = "Home";
});

//Functionwhen the scroll pass the anchor
export function enter(){
	$w('#boxUp').show();
	$w('#boxDown').hide();
}

export function leave(){
	$w('#boxDown').show();
	$w('#boxUp').hide();
}

//Slider function
export function change_Slider(event) {
	let sliderValue = $w("#sliderProducts").value;
	$w('#slideshow1').changeSlide(sliderValue)
}