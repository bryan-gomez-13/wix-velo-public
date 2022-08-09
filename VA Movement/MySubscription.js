import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixPaidPlans from 'wix-paid-plans';
import { getMemberMembership, cancelMembership } from 'backend/member.jsw';
import { currentMember } from 'wix-members';

let user
let membership = {};

$w.onReady(async function () {
    await currentUser();

    membership = await getMemberMembership();
    console.log(membership)
    membership.validUntil = await dateUntilFunction();
    //console.log(membership.validUntil)

    if (membership) {
        if (membership.plan) {
            $w('#tagline').text = membership.plan.tagline;
            let purchaseDate = membership.validFrom.toLocaleDateString(wixWindow.browserLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            let validUntil
            if (membership.validUntil && membership.validUntil !== undefined) validUntil = membership.validUntil.toLocaleDateString(wixWindow.browserLocale, { year: 'numeric', month: 'long', day: 'numeric' }), $w('#validUntil').show();

            if (wixWindow.formFactor === 'Desktop') {
                $w('#currentPlan').html = '<p class="p1"><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif;">Current Plan:&nbsp;</span></span><span style="color:#FF4040;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif;">' + membership.plan.name + '</span></span><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif;">.</span></span></p>'
                $w('#purchasedOn').html = '<p style="font-size:15px"><span style="font-size:15px"><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Purchased on: </span></span><span style="color:#3D9BE9;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">' + purchaseDate + '</span></span><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">.</span></span></span></p>'
                if (membership.validUntil !== null && membership.validUntil !== undefined) $w('#validUntil').html = '<p style="font-size:15px"><span style="font-size:15px"><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Valid Until: </span></span><span style="color:#3D9BE9;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">' + validUntil + '</span></span><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">.</span></span></span></p>'

                if (membership.active) {
                    $w('#planStatus').html = '<p style="font-size: 15px; text-align: right;"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Plan Status: </span></span><span style="color:#04CF48"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Active</span></span></span></span></p>'
                } else {
                    $w('#planStatus').html = '<p style="font-size:15px; text-align:right"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Plan Status: </span></span><span style="color:#FF4040;"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Inactive</span></span></span></span></p>'
                    $w('#cancelPlan').disable();
                    $w('#cancelPlan').label = 'Inactive';
                }

                if (membership.paid) {
                    $w('#paiedAmount').html = '<p style="font-size:15px; text-align:right"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Total Paid: </span></span><span style="color:#04CF48"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">' + `${membership.plan.price} ${membership.plan.currency}` + '</span></span></span></span></p>';
                } else {
                    $w('#paiedAmount').html = '<p style="font-size:15px; text-align:right"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Total Paid: </span></span><span style="color:#FF4040"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Unpaid</span></span></span></span></p>';
                }
            } else {
                // Mobile styling
                $w('#currentPlan').html = '<p class="p1" style="text-align:center"><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif;">Current Plan:&nbsp;</span></span><span style="color:#FF4040;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif;"><br> ' + membership.plan.name + '</span></span><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif;">.</br></span></span></p>'
                $w('#purchasedOn').html = '<p style="font-size:15px"><span style="font-size:15px"><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Purchased on: <br></span></span><span style="color:#3D9BE9;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">' + purchaseDate + '</span></span><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">.</br></span></span></span></p>'
                if (membership.validUntil !== null && membership.validUntil !== undefined) $w('#validUntil').html = '<p style="font-size:15px"><span style="font-size:15px"><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Valid Until: <br></span></span><span style="color:#3D9BE9;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">' + validUntil + '</span></span><span style="color:#324158;"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">.</br></span></span></span></p>'

                if (membership.active) {
                    $w('#planStatus').html = '<p style="font-size: 15px; text-align: center;"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Plan Status: </span></span><span style="color:#04CF48"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Active</span></span></span></span></p>'
                } else {
                    $w('#planStatus').html = '<p style="font-size:15px; text-align:center"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Plan Status: </span></span><span style="color:#FF4040;"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Inactive</span></span></span></span></p>'
                    $w('#cancelPlan').disable();
                    $w('#cancelPlan').label = 'Inactive';
                }

                if (membership.paid) {
                    $w('#paiedAmount').html = '<p style="font-size:15px; text-align:center"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Total Paid: </span></span><span style="color:#04CF48;"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">' + `${membership.plan.price} ${membership.plan.currency}` + '</span></span></span></span></p>';
                } else {
                    $w('#paiedAmount').html = '<p style="font-size:15px; text-align:center"><span style="font-size:15px"><span style="color:#324158"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Total Paid: </span></span><span style="color:#FF4040;"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">Unpaid</span></span></span></span></p>';
                }
            }

            // ========================================================================================================
            $w('#membershipWidget').changeState('myPlan');
        } else {
            $w('#membershipWidget').changeState('noMembership');
        }

    } else {
        $w('#membershipWidget').changeState('noMembership');
    }

    $w('#cancelPlan').onClick(() => {
        wixWindow.openLightbox('Cancel Membership').then((answer) => {
            if (answer === 'yes') {
                $w('#membershipWidget').changeState('cancelling').then(async () => {
                    wixPaidPlans.getCurrentMemberOrders()
                        .then(async orders => {
                            console.log(orders)
                            for (let i = 0; i < orders.length; i++) {
                                console.log(i, orders[i].id)
                                if (orders[i].status == 'ACTIVE') {
                                    await cancelMembership(user).then(async (result) => {
                                        if (result.type === 'success') {
                                            await wixPaidPlans.cancelOrder(orders[i].id).then(() => {
                                                $w('#cancellingMsg').text = 'Success! Redirecting you..';
                                                wixLocation.to('/signup')
                                            }).catch(err => {
                                                console.error(err);
                                                console.log(err)
                                                $w('#errorMsg').text = `A serious error occurred! Please contact us and provide us with this error code - Error Code: (500-9). - Error Message: (${err}).`;
                                                $w('#membershipWidget').changeState('error');
                                            })
                                        } else {
                                            $w('#errorMsg').text = `${$w('#errorMsg').text} - ${result.message} - Error Code: (${result.code}).`
                                            $w('#membershipWidget').changeState('error');
                                        }
                                    }).catch(err => {
                                        console.error(err);
                                        $w('#errorMsg').text = `${$w('#errorMsg').text} - An error occurred! - Error Details: (${err}).`
                                        $w('#membershipWidget').changeState('error');
                                    })
                                }
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
            }
        })
    })

});

async function currentUser() {
    await currentMember.getMember()
        .then((member) => {
            user = member._id;
        })
        .catch((error) => {
            console.error(error);
        });
}

async function dateUntilFunction() {
    let DateUntil;
    await wixPaidPlans.getCurrentMemberOrders()
        .then(async orders => {
            for (let i = 0; i < orders.length; i++) {
                if (orders[i].status == 'ACTIVE') {
                    let dateNow = new Date();
                    let datePlan = orders[i].dateCreated

                    if (dateNow.getDate() == datePlan.getDate()) {
                        if (dateNow.toDateString() == datePlan.toDateString()) {
                            dateNow.setMonth(dateNow.getMonth() + 1)
                            DateUntil = dateNow
                        } else {
                            DateUntil = dateNow;
                        }
                    } else if (dateNow.getDate() > datePlan.getDate()) {
                        dateNow.setMonth(dateNow.getMonth() + 1);
                        dateNow.setDate(datePlan.getDate());
                        DateUntil = dateNow;
                    } else {
                        dateNow.setDate(datePlan.getDate());
                        DateUntil = dateNow
                    }
                    
                    break;
                }
            }
        })
    return DateUntil;
}