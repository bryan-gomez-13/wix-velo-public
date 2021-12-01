import wixData from 'wix-data';

$w.onReady(function () {
	filterData();
});

export async function filterData() {
	let filter = wixData.filter();
	let dnow = new Date();
	filter = filter.eq('active',true).and(filter.eq('category','Arts and Crafts')).and(filter.ge('dateFinalCourse', dnow));
	await $w('#dataset17').setFilter(filter);
	itemDateRepeater();
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