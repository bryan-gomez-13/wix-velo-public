import wixData from 'wix-data';
import { session } from 'wix-storage';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';

$w.onReady(function () {
    currentMember.getMember().then((member) => {
        if (member == undefined) $w('#button2').show();
        else $w('#button2').hide();
    }).catch((error) => console.log(error));

    filter();

    $w('#listRepeater').onItemReady(() => {
        $w('#listRepeater').forEachItem(($item, itemData) => {
            let city, state, value = false
            if ($item('#city').text !== 'Message') city = $item('#city').text + " ", value = true
            if ($item('#state').text !== 'Message') state = $item('#state').text, value = true
            if (value) $item('#infoR').text = itemData.firstName + " - " + itemData.role + "\n" + city + state
            else $item('#infoR').text = itemData.firstName + " - " + itemData.role
        })
    })
    $w('#filter').onClick(() => {
        session.setItem("filter", "High School Student-Parents")
        wixLocation.to('/users')
    })
});

function filter() {
    let filter = wixData.filter();
    filter = filter.or(wixData.filter().hasSome("role", ["High School Student", "Parents"]));
    filter = filter.and(wixData.filter().eq('show', true))
    $w('#dataset1').setFilter(filter)
}