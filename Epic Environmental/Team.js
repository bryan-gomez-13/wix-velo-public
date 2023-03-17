import wixData from 'wix-data';
import { dropsTeam } from 'backend/Team.jsw'

var team = true,
    speciality = true

$w.onReady(function () {
    init();
    drops();

});
// ================================== INIT ==================================
function init() {
    //Buttons
    /*
    $w('#bTeam').onClick(() => filterSelect('Team'));
    $w('#bSpeciality').onClick(() => filterSelect('Speciality'));
    */
    $w('#clear').onClick(() => {
        /*
        team = true
        speciality = true
        $w('#fTeam').collapse();
        $w('#fTeam').value = [];
        $w('#fSpeciality').collapse();
        $w('#fSpeciality').value = [];
        */
        $w('#fTeam').value = ""
        $w('#fSpeciality').value = ""
        filter();
    })
    //Filter
    $w('#fTeam').onChange(() => filter());
    $w('#fSpeciality').onChange(() => filter());
}
// ================================== DROP ==================================
async function drops() {
    let json = await dropsTeam();
    $w('#fTeam').options = json.teamA;
    $w('#fSpeciality').options = json.specialityA;
}

// ================================== FILTER BTS ==================================
/*
function filterSelect(Select) {
    if (Select == 'Team') {
        if (team) team = false, $w('#fTeam').expand();
        else team = true, $w('#fTeam').collapse();
    } else {
        if (speciality) speciality = false, $w('#fSpeciality').expand();
        else speciality = true, $w('#fSpeciality').collapse();
    }
}*/
// ================================== FILTER ==================================
function filter() {
    let filter = wixData.filter();
    let sort = wixData.sort().ascending('order');

    if ($w('#fTeam').value.length > 0 && $w('#fTeam').value !== '') filter = filter.and(wixData.filter().hasSome("teamFilter", $w('#fTeam').value));
    if ($w('#fSpeciality').value.length > 0 && $w('#fSpeciality').value !== '') {
        filter = filter.and(
            wixData.filter().hasSome("specialtyFilterCategory1", $w('#fSpeciality').value)
            .or(wixData.filter().hasSome("specialtyFilterCategory2", $w('#fSpeciality').value))
            .or(wixData.filter().hasSome("specialtyFilterCategory3", $w('#fSpeciality').value))
            .or(wixData.filter().hasSome("specialtyFilterCategory4", $w('#fSpeciality').value)))
    }

    $w('#data').setFilter(filter);
    $w("#data").setSort(sort);
}