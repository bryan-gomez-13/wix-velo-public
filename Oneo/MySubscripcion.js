import { getMySubscriptions, getPlanInfo } from 'backend/data.jsw'
import { currentMember, authentication } from 'wix-members';
import wixWindow from 'wix-window';

var member

$w.onReady(function () {
    init();
});

async function init() {
    await getCurrentMember();
    await getMembershipUser();
}

async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (memberInfo) => {
        member = memberInfo
    })
}

async function getMembershipUser() {
    //contactID = await getContact(member.loginEmail, false)
    let array = await getMySubscriptions(member._id)
    for (let i = 0; i < array.length; i++) {
        array[i].planInfo = await getPlanInfo(array[i].plan)
    }
    repPlans(array)
}

async function repPlans(plans) {
    $w('#repPlans').data = plans
    $w('#repPlans').onItemReady(($item, itemData) => {
        $item('#planName').text = itemData.planInfo.name
        let date = new Date(itemData.startDate)
        $item('#date').text = date.toDateString();

        $item('#planRemaining').html = '<p class="p1 wixui-rich-text__text" style="font-size:15px;"><span class="color_12 wixui-rich-text__text"><span style="font-size:15px;" class="wixui-rich-text__text">Sessions remaining this month:</span></span></p><p class="p1 wixui-rich-text__text" style="font-size:15px;"><span style="font-weight:bold;" class="wixui-rich-text__text"><span class="color_23 wixui-rich-text__text"><span style="font-size:15px;" class="wixui-rich-text__text">' + itemData.remindSessions + "/" + itemData.sessions + '&nbsp;</span></span></span></p>'
        $item('#planBTCancel').onClick(async () => {
            wixWindow.openLightbox("CancelSubscription", itemData).then(async (data) => {
                if (data.message == true) await getMembershipUser()
            });
        })
    })
    $w('#repPlans').show();
}