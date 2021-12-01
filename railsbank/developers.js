$w.onReady(function () {
	$w('#TScroll').text = "Developers";
});

// Scroll
export function enter(){
	$w('#boxDown').show();
	$w('#boxUp').hide();

	$w('#slider1').value = 2.39;
	$w('#slider2').value = 2.39;
}

export function leave(){
	$w('#boxUp').show();
	$w('#boxDown').hide();
}
// Scroll menu
export function One(event) {
	$w('#ScrollMenu').hide()
}

export function Two(event) {
	$w('#ScrollMenu').show();
}
//Slider
export function get_started(event){
	$w('#slider1').value = 2.39;
}

export function guides(event){
	$w('#slider1').value = 7.4;
}

export function Api_Documentation(event){
	$w('#slider1').value = 4.9;
}

export function events(event) {
	$w('#slider1').value = 10;
}