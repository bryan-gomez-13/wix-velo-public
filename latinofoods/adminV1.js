import wixData from 'wix-data';

$w.onReady(function () {
	
});

export async function getItems(){
	let results = await wixData.query("Stores/Products").limit(100).find().then();
	checkList(results);
	while(results.hasNext()) {
		results = await results.next();
		checkList(results);
	}
}

export function consult_click(event) {
	getItems();
}

export function checkList(results){
	//console.log(results.items.length);
	for(let i=0; i < results.items.length; i++){
		if(results.items[i].additionalInfoSections != ''){
			if(results.items[i].additionalInfoSections[0].description != "N/A"){
				if(results.items[i].additionalInfoSections[0].description != 'N.A.'){
					let dateProduct = new Date(results.items[i].additionalInfoSections[0].description).valueOf();
					let dateNow = Date.now();
					if(dateProduct-dateNow < 2629750000){
						let days = (dateProduct-dateNow)/(1000*60*60*24);
						let name = results.items[i].name;
						let sku = results.items[i].sku;
						let date = results.items[i].additionalInfoSections[0].description;
						let inventory = results.items[i].quantityInStock;

						let toInsert = {
							name,
							sku,
							date,
							days,
							inventory
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
}

export function saveProduct(toInsert){
	wixData.insert('BestBefore', toInsert)
	.then(() => {
		console.log("ready");
	}).catch((error) => {
		console.error(error)
	});
}

/*
name = result.name
sku = result.sku
date = result.additionalInfoSections[0].description
days = result.sku
inventory = result.inStock
*/