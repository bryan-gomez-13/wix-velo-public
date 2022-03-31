// API Reference: https://www.wix.com/corvid/reference
// Code Examples: https://www.wix.com/corvid/examples
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
var locationsToSave = [];
var servicesToSave = [];
$w.onReady(async function () {
    // Write your JavaScript here

    // To select an element by ID use: $w("#elementID")
    var company = $w('#inputCompany').value;
    var phone = $w('#inputPhone').value;
    var email = $w('#inputEmail').value;
    var website = $w('#inputWebsite').value;
    var blurb = $w('#inputBlurb').value;

    //Function job sector
    var allCities;
    var citiesList = [];
    await wixData.query('Cities')
        .find()
        .then(res => {
            allCities = res.items;

        })
    for (let a = 0; a < allCities.length; a++) {
        await citiesList.push({ "label": allCities[a].city, "value": allCities[a].idCity });
    }
    //end function job sector

    //order cities list
    citiesList.sort(function compare(a, b) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    });
    //end order
    $w("#checkboxGroup1").options = citiesList;

    //services
    //Function job sector
    var allServices;
    var servicesList = [];
    await wixData.query('CategoriesMembers')
        .find()
        .then(res => {
            allServices = res.items;

        })

    for (let a = 0; a < allServices.length; a++) {
        await servicesList.push({ "label": allServices[a].category, "value": allServices[a].idCategory });
    }
    //end function job sector

    //order cities list
    servicesList.sort(function compare(a, b) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    });
    //end order
    $w("#checkboxGroup2").options = servicesList;
    // Click "Preview" to run your code

    $w('#dataset1').onBeforeSave(() => {
        //let selectedLocations = [];
        //let testLocations = '["0","1"]';
        $w('#dataset1').setFieldValue('locations', locationsToSave);
        $w('#dataset1').setFieldValue('demolitionServices', servicesToSave);
        //console.log($w('#checkboxGroup1').selectedIndices);
    })

});

export function checkboxGroup1_change(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    locationsToSave = [];
    let selected = $w('#checkboxGroup1').selectedIndices;
    let options = $w('#checkboxGroup1').options;
    let optionsSelected = [];
    for (let b = 0; b < selected.length; b++) {
        let indexItem = selected[b];
        optionsSelected.push(options[indexItem]);
    }
    for (let a = 0; a < optionsSelected.length; a++) {
        //locationsToSave.push('"'+optionsSelected[a].value+'"');
        locationsToSave.push(optionsSelected[a].value.toString());
    }
}

export function checkboxGroup2_change(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    servicesToSave = [];
    let selectedServices = $w('#checkboxGroup2').selectedIndices;
    let optionsServices = $w('#checkboxGroup2').options;
    let optionsSelectedServices = [];
    for (let b = 0; b < selectedServices.length; b++) {
        let indexItem = selectedServices[b];
        optionsSelectedServices.push(optionsServices[indexItem])
    }
    for (let a = 0; a < optionsSelectedServices.length; a++) {
        //locationsToSave.push('"'+optionsSelected[a].value+'"');
        servicesToSave.push(optionsSelectedServices[a].value.toString());
    }
}

export async function button6_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    $w('#button6').disable();
    $w('#text317').expand();
    await $w("#dataset1").save();
    wixLocation.to('/join-us');
}