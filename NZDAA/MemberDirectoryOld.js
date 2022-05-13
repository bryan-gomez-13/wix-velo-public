// Para obtener la documentación completa sobre las funciones API, incluidos ejemplos para programa con código, visita http://wix.to/94BuAAs
import wixData from "wix-data";
import { getMemberProfiles, loadLocations, filterBy } from 'backend/data';

$w.onReady(async function () {
    // TODO: write your page related code here...
    $w("#textNoFound").hide();
    $w("#imageLoading").hide();

    $w("#dataset2").setSort(wixData.sort()
        .ascending("company")
    );
    //$w('#table2').hide();

    await $w("#dataset2").setFilter(wixData.filter().eq("status", true));
    var members;
    await getMemberProfiles().then(function (freeData) {
        members = freeData;
    });

    //Function job sector
    wixData.query('CategoriesMembers')
        .find()
        .then(res => {
            let options = [{ "value": '', 'label': 'All Categories' }];
            options.push(...res.items.map(category => {
                return { 'value': category.idCategory, 'label': category.category }
            }));
            //order alphabetic
            options.sort(function compare(a, b) {
                if (a.label < b.label) {
                    return -1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                return 0;
            });
            //end order
            $w("#dropdownJobs").options = options;
        })
    //end function job sector

    //Function job sector
    wixData.query('Cities')
        .find()
        .then(res => {
            let options = [{ "value": '', 'label': 'All Cities' }];
            options.push(...res.items.map(city => {
                return { 'value': city.idCity, 'label': city.city }
            }));
            options.sort(function compare(a, b) {
                if (a.label < b.label) {
                    return -1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                return 0;
            });
            $w("#dropdownCity").options = options;
        })
    //end function job sector

    //function button

    //end function button search
});

export async function buttonSearch_click(event) {
    // Add your code for this event here: 
    $w("#textNoFound").hide()
    $w("#imageLoading").show();
    $w('#table2').hide();
    await getMemberProfiles().then(function (freeData) {
        membersLocal = freeData;
    });
    let job = $w("#dropdownJobs").value;
    let city = $w("#dropdownCity").value;
    var membersOk;
    var membersLocal;
    //filter(job, city);
    if (job === "" && city === "") {
        membersOk = membersLocal;
    } else {
        membersOk = await filterBy($w("#dropdownJobs").value, $w("#dropdownCity").value);
    }
    $w("#table2").show();

    await membersOk.sort(function compare(a, b) {
        if (a.company < b.company) {
            return -1;
        }
        if (a.company > b.company) {
            return 1;
        }
        return 0;
    });

    $w('#table2').rows = membersOk;
    $w("#imageLoading").hide();
    $w('#table2').show();
    if (membersOk.length <= 0) {
        $w("#textNoFound").show();
    }
    /*console.log($w("#dropdownJobs").value);
    console.log($w("#dropdownCity").value);*/
}

/*export function filter(members,job, city){
	console.log("entra a filter");
	let localJob = [job];
	console.log(localJob);
	let newFilter = wixData.filter();
	if(job){
		//newFilter = newFilter.contains("lo", title)
	}
	if(city){
		newFilter = newFilter.contains("locations", localJob)
	}
	
	$w('#dataset2').setFilter(newFilter);
}*/