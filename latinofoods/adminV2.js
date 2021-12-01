import wixData from 'wix-data';

$w.onReady(function () {

});

export async function getItems(){
	$w('#bSearch').disable();
	let results = await wixData.query("Stores/Products").limit(100).find().then();
	checkList(results);
	while(results.hasNext()) {
		results = await results.next();
		checkList(results);
	}
	$w('#bSearch').enable();
}

export function consult_click(event) {
	getItems();
}

export function checkList(results){
	//console.log(results.items);
	for(let i=0; i < results.items.length; i++){
		if(results.items[i].additionalInfoSections != ''){
			if(results.items[i].additionalInfoSections[0].description != "N/A"){
				if(results.items[i].additionalInfoSections[0].description != 'N.A.'){
					let dateProduct;
					let date;

					if(((results.items[i].additionalInfoSections[0].description).includes('<p>') == true) || ((results.items[i].additionalInfoSections[0].description).includes('</p>') == true)){
						date = results.items[i].additionalInfoSections[0].description;
						let newDate =date.slice(3, date.length-5)
						dateProduct = new Date(newDate).valueOf();
						date = newDate;
					}else{
						dateProduct = new Date(results.items[i].additionalInfoSections[0].description).valueOf();
						date = results.items[i].additionalInfoSections[0].description;
					}

					let dateNow = Date.now();
					
					let days = parseInt((dateProduct-dateNow)/(1000*60*60*24), 10);
					let name = results.items[i].name;
					let sku = results.items[i].sku;
					let inventory = results.items[i].quantityInStock;
					let inStock = results.items[i].inStock;

					let toInsert = {
						name,
						sku,
						date,
						days,
						inventory,
						inStock
					}

					wixData.query("BestBefore")
					.eq('name',name)
					.find()
					.then( (results) => {
						if(results.items.length > 0) {
							console.log("update");
							results.items[0].date = date;
							results.items[0].days = days;
							results.items[0].inventory = inventory;
							results.items[0].inStock = inStock;
							wixData.update("BestBefore", results.items[0]);
						} else {
							saveProduct(toInsert);
						}
					} )
					.catch( (err) => {
						let errorMsg = err;
					} );
				}					
			}
		}
	}
}

export function saveProduct(toInsert){
	wixData.insert('BestBefore', toInsert)
	.then(() => {
		console.log("ready");
	}).catch((error) => {
		console.error(error)
	});
}

export function searchDays(event) {
	let filter = wixData.filter();
	let sort = wixData.sort();
	let x = $w('#inputSearch').value;
	filter = filter.ge('days',0).and(filter.le("days", parseInt(x, 10)));
	$w('#dataset1').setFilter(filter).then(() => $w('#dataset1').setSort(sort.ascending('days')));
	$w('#table1').expand();
}