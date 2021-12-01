$w.onReady(function () {
	$w('#TScroll').text = "Products";
});

export function enter(){
	$w('#boxDown').show();
	$w('#boxUp').hide();
}

export function leave(){
	$w('#boxUp').show();
	$w('#boxDown').hide();
}