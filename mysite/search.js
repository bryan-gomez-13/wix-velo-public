import wixLocation from 'wix-location';
import wixData from 'wix-data';
var s;
var searchValue;
var searchKind;
var searchYear;

$w.onReady(async function () {
	await x();
});

export async function x(){
	let query = wixLocation.query;
	console.log(query);
	console.log(query.kind + '	' + query.year + '	' +query.s);
	await filterData(query.s,query.kind,query.year,'');
}


function filterData(s,kind,year,value) {
	console.log('s:'+s+'kind:'+kind+'year:'+year+'value:'+value);
	let filter = wixData.filter();
	
	switch (s) {
		case 0:
			console.log('0')
			console.log('Igual cero');
			break;

		case 1 :
			console.log('1')
			if (kind == 'All Movies' && year.length > 0){
				filter = filter.eq('year',year);
			}else if (year.length > 0 && kind != 'All Movies') {
				filter = filter.eq('kind',kind).and(filter.eq('year',year));
			}else if (kind != 'All Movies' && year.length == 0) {
				filter = filter.eq('kind',kind);
			}
			break;
		
		case 2 :
			console.log('2')
			filter = filter.contains('name',value);
			break;

		case '3' :
			console.log('3')
			if (kind == 'All Movies' && year.length > 0){
				filter = filter.eq('year',year);
			}else if (year.length > 0 && kind != 'All Movies') {
				filter = filter.eq('kind',kind).and(filter.eq('year',year));
			}else if (kind != 'All Movies' && year.length == 0) {
				filter = filter.eq('kind',kind);
			}
			console.log('filter3:'+filter)
			break;
	}
	console.log(filter);
	$w('#dataset1').setFilter(filter);
}

export function searchKind_change(event) {
	//searchValue = $w('#searchMovie').value;
	searchKind = $w('#searchKind').value;
	searchYear = $w('#searchYear').value;
	s=1;
	filterData(s,searchKind,searchYear,'');
}

export function searchMovie_input(event) {
	searchValue = $w('#searchMovie').value;

	s=2;
	filterData(s,'','',searchValue);
}

export function searchYear_input(event) {
	searchKind = $w('#searchKind').value;
	searchYear = $w('#searchYear').value;
	s=1
	filterData(s,searchKind,searchYear,'');
}