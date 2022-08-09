//Limitar elementos en un text
export function x() {
	let size = 80;
	$w('#rep').onItemReady(($product, product) => {
		if (product.description.length > size) {
			$product('#text4').text = `${product.description.substr(0, size)}...`;
		} else {
			$product('#text4').text = product.description;
		}
	})
}

// TIME
cart.showMiniCart();
setTimeout(() => cart.hideMiniCart(), 3000);

// Dropdown
function dropdowns() {
	wixData.query("NameCollection")
		.ascending('title')
		.find()
		.then((results) => {
			let array = [{ "label": "All", "value": "All" }];
			for (let i = 0; i < results.items.length; i++) {
				array.push({ label: results.items[i].title, value: results.items[i].title })
			}
			$w('#NameDropdown').options = array;
		});
}

//FILTER
function filter(){
	let filter = wixData.filter();
    let sort = wixData.sort();
    //Name of the field
    if ($w('#search').value !== '') filter = filter.and(wixData.filter().eq("title", $w('#search').value));

	if ($w('#search').value !== '') filter = filter.and(wixData.filter().contains("title", $w('#search').value));

    if ($w('#sort').value == "A-Z") sort = sort.ascending("title");
    else sort = sort.descending("title");

    $w('#dynamicDataset').setFilter(filter);
    $w("#dynamicDataset").setSort(sort);
}