import { currentMember } from "wix-members-frontend";
import { generalQuery } from 'backend/collections.web.js';

$w.onReady(function () {
    getMemberInfo();
    $w('#btMyBeats').onClick(() => {
        $w('#btMyBeats').disable();
        $w('#btPayouts').enable();
        $w('#secMyBeats').expand();
        $w('#secPayouts').collapse();
    })

    $w('#btPayouts').onClick(() => {
        $w('#btMyBeats').enable();
        $w('#btPayouts').disable();
        $w('#secMyBeats').collapse();
        $w('#secPayouts').expand();
    })
});

function getMemberInfo() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
        generalQuery("Payouts", "memberId", member._id).then(async (results) => {
            if (results.length > 0) {
                const beatInfo = results[0];
                // VIEW MY BEATS
                $w('#totalSales').text = `Total Sales: ${beatInfo.totalSales}`;
                $w('#commissionEarned').text = `Total Commission Earned: ${beatInfo.totalCommissionEarned}`;
                $w('#nextCommissionPayment').text = `Next Commission Payment: ${beatInfo.nextCommissionPayment}`;

                $w('#totalSales').show();
                $w('#commissionEarned').show();
                $w('#nextCommissionPayment').show();

                $w('#repBeats').data = beatInfo.history.myBeatsInfo;
                $w('#repBeats').onItemReady(async ($item, itemData) => {
                    $item('#beatName').text = itemData.beatName;
                    const producer = await generalQuery('Beats', 'title', itemData.beatName)
                    $item('#producer').text = producer[0].producer;

                    // BRONZE
                    $item('#bronzeQty').text = itemData['BRONZE']['count'];
                    $item('#bronzeSales').text = itemData['BRONZE']['total'];
                    $item('#bronzeCommission').text = itemData['BRONZE']['commission'];

                    // SILVER
                    $item('#silverQty').text = itemData['SILVER']['count'];
                    $item('#silverSales').text = itemData['SILVER']['total'];
                    $item('#silverCommission').text = itemData['SILVER']['commission'];

                    // GOLD
                    $item('#goldQty').text = itemData['GOLD']['count'];
                    $item('#goldSales').text = itemData['GOLD']['total'];
                    $item('#goldCommission').text = itemData['GOLD']['commission'];
                })

                $w('#repBeats').show();

                $w('#repPayouts').data = beatInfo.paymentHistory;
                $w('#repPayouts').onItemReady(async ($item, itemData) => {
                    $item('#date').text = `Date: ${itemData.date}`;
                    $item('#payment').text = `Payment: ${itemData.commission}`;
                })
            }
        })
    }).catch((error) => { console.error(error); });
}