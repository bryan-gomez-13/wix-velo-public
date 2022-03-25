$w.onReady(function () {
	init();
});

async function init(){
	let i = 1;
	while (i == 1) {
		$w('#1').expand();
		$w('#2').collapse();
		$w('#3').collapse();
		await delay(2);

		$w('#2').expand();
		$w('#1').collapse();
		$w('#3').collapse();
		await delay(2);

		$w('#3').expand();
		$w('#2').collapse();
		$w('#1').collapse();
		await delay(2);
	}
}

function delay(time){
	return new Promise(function(resolve){
        setTimeout(resolve,time*1000);
    });
}