import wixData from 'wix-data';
$w.onReady(function () {
	console.log(2)
});

export async function go(event) {
	let associationArray = [];
	let stateArray = [];

	wixData.query("1000")
	.limit(1000)
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for (let i = 0; i < results.items.length; i++) {
				if(associationArray.includes(results.items[i].associationName)){
					//nothing
				}else{
					associationArray.push(results.items[i].associationName);
					stateArray.push(results.items[i].stateName);
				}
			}
			console.log(associationArray.length);
			console.log(stateArray.length);
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );

	wixData.query("2000")
	.limit(1000)
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for (let i = 0; i < results.items.length; i++) {
				if(associationArray.includes(results.items[i].associationName)){
					//nothing
				}else{
					associationArray.push(results.items[i].associationName);
					stateArray.push(results.items[i].stateName);
				}
			}
			console.log(associationArray.length);
			console.log(stateArray.length);
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );

	wixData.query("3000")
	.limit(1000)
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for (let i = 0; i < results.items.length; i++) {
				if(associationArray.includes(results.items[i].associationName)){
					//nothing
				}else{
					associationArray.push(results.items[i].associationName);
					stateArray.push(results.items[i].stateName);
				}
			}
			console.log(associationArray.length);
			console.log(stateArray.length);
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );

	wixData.query("300")
	.limit(1000)
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for (let i = 0; i < results.items.length; i++) {
				if(associationArray.includes(results.items[i].associationName)){
					//nothing
				}else{
					associationArray.push(results.items[i].associationName);
					stateArray.push(results.items[i].stateName);
				}
			}
			console.log(associationArray.length);
			console.log(stateArray.length);
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
	
	save(associationArray,stateArray);
}

export function save(associationArray,stateArray){
	console.log(13)
	for (let i = 0; i < associationArray.length; i++) {
		console.log(associationArray[i]);
		console.log(stateArray[i]);

		let state = stateArray[i];
		let association = associationArray[i];

		let toInsert = {
            state,
			association
        };

		console.log(toInsert);
		
		wixData.insert('all', toInsert)
		.then(() => {
			console.log(1);
		}).catch((error) => {
			console.error(error)
		});
	}
}