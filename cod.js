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

//EMAIL
import { triggeredEmails } from 'wix-crm-backend';
export function email(User) {
    let emailId = "";
    if(User.systemStatus == "Aprobado") emailId = "aprobado"
    else if(User.systemStatus == "Pendiente") emailId = "pendiente"
    else if(User.systemStatus == "Negado") emailId = "negado"
    
    //Yourweb
    const memberYourweb = "62bed798-b3b1-484e-a1b0-d2f8ec07de90";
    //Other
    //const LinkAndLearn = "bb267783-8633-4b06-8687-8e18f840f62b";
    const options = {
        variables: {
            user: User["1ErNombre"] + " " + User["1ErApellido"],
            criminal: User.criminalRecord,
            legal: User.legalRecords,
            credit: User.creditScore,
        }
    }

    triggeredEmails.emailMember(emailId, memberYourweb, options)
        .then(() => {
            console.log("Email Done")
        })
        .catch((error) => {
            console.error(error);
        });
}