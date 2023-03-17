import wixData from 'wix-data';
import { session } from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
    filter();

    $w('#listRepeater').onItemReady(() => {
        $w('#listRepeater').forEachItem(($item, itemData) => {
            let city, state, value = false
            if ($item('#city').text !== 'Message') city = $item('#city').text + " ", value = true
            if ($item('#state').text !== 'Message') state = $item('#state').text, value = true
            if (value) $item('#infoR').text = itemData.firstName + " - " + itemData.major + "\n" + city + state
            else $item('#infoR').text = itemData.firstName + " - " + itemData.major
        })
    })
    $w('#filter').onClick(() => {
        session.setItem("filter", "College Student-College Graduate-Counselor")
        wixLocation.to('/users')
    })
});

function filter() {
    let filter = wixData.filter();
    filter = filter.or(wixData.filter().hasSome("role", ["College Student", "College Graduate", "Counselor"]));
    filter = filter.and(wixData.filter().eq('show', true))
    $w('#dataset1').setFilter(filter)
}