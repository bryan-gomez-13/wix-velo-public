import {memory} from 'wix-storage';

$w.onReady(function () {
	let value = memory.getItem("product");
	if(value != null){
		$w('#product').value = value;
		$w('#product').expand();
	}else{
		$w('#product').collapse();
	}
});