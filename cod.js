//Limitar elementos en un text
export function x(){
	let size = 80;
	$w('#rep').onItemReady(($product, product)=>{
		if(product.description.length > size){
			$product('#text4').text = `${product.description.substr(0,size)}...`;
		}else{
			$product('#text4').text = product.description;
		}
	})
}

//Guardar info en una collection para el custom signup
$w("#dataset1").setFieldValues( 
	{
		"firstName": $w("#input4").value,
		"lastName":  $w("#input3").value,
		"email":  $w("#input2").value,
		"phone":   $w("#input5").value,
		"companyName":   $w("#input6").value
	});
$w("#dataset1").save();

//filter data

function filterData() {
	//valor predeterminado del filtro
	let filter = wixData.filter();
	//ordenar
	let sort = wixData.sort();
	//valore
	let searchValue = $w('#searchMovie').value;
	let searchKind = $w('#searchKind').value;
	let searchYear = $w('#searchYear').value;
	let sortValue = $w('#sort').value;

	switch (s) {
		case 1 :
			if (searchKind == 'All Movies' && searchYear.length > 0){
				filter = filter.eq('year',searchYear);
			}else if (searchYear.length > 0) {
				filter = filter.eq('kind',searchKind).and(filter.eq('year',searchYear));
			}else if (searchKind != 'All Movies') {
				filter = filter.eq('kind',searchKind);
			}else {
				filter = wixData.filter();
			}
			break;
		
		case 2:
			filter = filter.contains('name',searchValue);
			break;
	}
	
	switch (sortValue) {
		case 'a-z':
			//Sort : A-Z
			sort = sort.ascending('name');
			break;
		
		case 'z-a':
			//Sort : Z-A
			sort = sort.descending('name');
			break;

		case 'yearAse':
			sort = sort.ascending('year');
			break;

		case 'yearDse':
			sort = sort.descending('year');
			break;
	}
	$w('#ds').setFilter(filter).then(() => $w('#ds').setSort(sort));
	x();
}