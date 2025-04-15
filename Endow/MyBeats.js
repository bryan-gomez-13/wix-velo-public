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
        generalQuery("Beats", "investor", member._id).then(async (results) => {
            if (results.length > 0) {
                const beats = results;
                $w('#repBeats').data = beats;

                // Total
                let globalTotalAmount = 0;
                let globalTotalRevenue = 0;

                // Function to update text fields dynamically
                const updateTextField = (elementId, value) => {
                    $w(elementId).text = value;
                };

                $w('#repBeats').onItemReady(async ($item, itemData) => {
                    // Set beat name and artist
                    $item('#beatName').text = itemData.title;
                    $item('#beatArtist').text = itemData.producer;

                    // Level Color
                    // const levelColors = { BRONZE: "#CD7F32", SILVER: "#C0C0C0", GOLD: "#FFD700" };
                    // const level = itemData.registrationLevel[0];
                    // if (levelColors[level]) $item("#lvl").html = `<p class="wixui-rich-text__text"><span style="color:${levelColors[level]}; font-weight:bold;">${level}</span></p>`;

                    if (itemData.buyers) {
                        // Filter buyers for the current member
                        const buyers = itemData.buyers.filter(item => item.investorId == member._id);

                        if (buyers.length > 0) {
                            // Get summarized data for each item type (BRONZE, SILVER, GOLD)
                            const buyersInfo = await sumPricesByItem(buyers, itemData.commission);
                            console.log(itemData.title, buyersInfo)
                            const bronze = buyersInfo.items.find(item => item.item == "BRONZE") || { count: 0, totalPrice: "0.0", revenue: "0.0" };
                            const silver = buyersInfo.items.find(item => item.item == "SILVER") || { count: 0, totalPrice: "0.0", revenue: "0.0" };
                            const gold = buyersInfo.items.find(item => item.item == "GOLD") || { count: 0, totalPrice: "0.0", revenue: "0.0" };

                            // Add current item's values to the global totals
                            globalTotalAmount += parseFloat(bronze.totalPrice) + parseFloat(silver.totalPrice) + parseFloat(gold.totalPrice);
                            globalTotalRevenue += parseFloat(bronze.revenue) + parseFloat(silver.revenue) + parseFloat(gold.revenue);

                            // Function to update each category display
                            const updateCategory = (elementId, color, data) => {
                                if (data.count > 0) {
                                    $item(elementId).html = `
  <p class="wixui-rich-text__text"><span style="color:${color}; font-weight:bold;">${data.item}</span></p>
  <p class="wixui-rich-text__text"><span style="color:white; font-weight:bold;">Quantity:</span> <span style="color:white;">${data.count}</span></p>
  <p class="wixui-rich-text__text"><span style="color:white; font-weight:bold;">Amount:</span> <span style="color:white;">$${data.totalPrice}</span></p>
  <p class="wixui-rich-text__text"><span style="color:white; font-weight:bold;">Commission:</span> <span style="color:white;">$${data.revenue}</span></p>`;

                                    $item(elementId).expand();
                                } else {
                                    $item(elementId).collapse();
                                }
                            };

                            // Update BRONZE, SILVER, and GOLD categories
                            updateCategory('#txtBronze', '#CD7F32', bronze);
                            updateCategory('#txtSilver', '#C0C0C0', silver);
                            updateCategory('#txtGold', '#FFD700', gold);
                        }
                    } else {
                        // Collapse all elements if there are no buyers
                        $item('#txtBronze').collapse();
                        $item('#txtSilver').collapse();
                        $item('#txtGold').collapse();
                    }

                    // Update global total values **each time** an item is processed
                    //updateTextField('#txtTotalAmount', `Total Amount: $${globalTotalAmount.toFixed(2)}`);
                    updateTextField('#nextCommissionPayment', `Next Commission Payment: $${globalTotalRevenue.toFixed(2)}`);
                });

                $w('#nextCommissionPayment').show();
                $w('#repBeats').show();

            } else {
                $w('#repBeats').hide();
            }
        })

        generalQuery("Payouts", "memberId", member._id).then(async (results) => {
            if (results.length > 0) {
                console.log(results)
                if (results[0].history) {
                    const history = results[0].history;
                    $w('#repPayouts').data = history;
                    $w('#repPayouts').onItemReady(async ($item, itemData, index) => {
                        let date = new Date(itemData.lastUpdate);
                        $item('#txtSong').text = `Date\n${date.toDateString()}`;
                        $item('#txtPayout').text = `Commission Paid: ${itemData.lastCommission}`;
                    })

                    let totalSales = 0;
                    let commissionEarned = 0;

                    // Sum commissions and total sales
                    history.forEach(({ lastCommission, lastTotal }) => {
                        const numericCommission = parseFloat(lastCommission.replace(/[^0-9.-]+/g, ""));
                        const numericSales = parseFloat(lastTotal.replace(/[^0-9.-]+/g, ""));

                        commissionEarned += numericCommission;
                        totalSales += numericSales;
                    });

                    // Currency formatter for AUD
                    const formatAsAUD = (value) =>
                        new Intl.NumberFormat('en-AU', {
                            style: 'currency',
                            currency: 'AUD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(value);

                    // Apply to elements
                    $w('#totalSales').text = `Total Sales: ${formatAsAUD(totalSales)}`;
                    $w('#commissionEarned').text = `Total Commission Earned: ${formatAsAUD(commissionEarned)}`;

                    // Show the elements
                    $w('#totalSales').show();
                    $w('#commissionEarned').show();

                } else {
                    $w('#message').expand();
                    $w('#repPayouts').hide();
                }
            } //else $w('#btPayouts').collapse();

        })
    }).catch((error) => { console.error(error); });
}

function sumPricesByItem(data, lvl) {
    const result = {
        BRONZE: { totalPrice: 0, count: 0 },
        SILVER: { totalPrice: 0, count: 0 },
        GOLD: { totalPrice: 0, count: 0 }
    };

    let totalAmount = 0; // Total global
    let totalRevenue = 0; // Revenue global

    data.forEach(({ item, price }) => {
        if (result[item]) {
            const priceValue = parseFloat(price);
            result[item].totalPrice += priceValue;
            result[item].count += 1;

            totalAmount += priceValue;
            totalRevenue += priceValue * (lvl / 100);
        }
    });

    return {
        items: Object.keys(result).map(key => ({
            item: key,
            totalPrice: result[key].totalPrice.toFixed(2),
            count: result[key].count,
            revenue: (result[key].totalPrice * (lvl / 100)).toFixed(2)
        })),
        totalAmount: totalAmount.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2)
    };
}