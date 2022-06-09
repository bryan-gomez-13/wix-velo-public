import wixPaidPlans from 'wix-paid-plans';
import wixUsers from 'wix-users';
import { getUserBadges, cancelAllUserOrders, getUserPlan } from 'backend/member.jsw';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { signup, createOrder } from 'backend/signup.jsw';
import { local } from 'wix-storage';

let user = wixUsers.currentUser;
let plan = {};
let selectedPlan = {};
let captcha = { verified: false, token: null }
let membership;

$w.onReady(async function () {
    $w('#page1').scrollTo();
    membership = await getUserBadges();
    console.log(membership)

    if (!membership) {
        console.log("No membership found")
        await initializePage();
    } else {
        if (user.loggedIn) {
            console.log("Membership found")
            wixLocation.to('/account/membership');
        }
    }

});

function pageOnReady() {
    $w('#plansDaaset').onReady(() => {
        console.log("Plans dataset ready")
        $w('#plansRep').onItemReady(($item, data, index) => {
            console.log("Repeater ready")
            $item('#planPrice').html = '<h4 style="font-size:43px; text-align:center"><span style="color:#F2A007"><span style="font-size:43px"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif">$' + data.price + '</span></span></span><span style="font-size:15px;"><span style="font-weight:bold"><span style="font-family:arial,ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica,sans-serif"> USD/mo</span></span></span></span></h4>'

            let unit = data.periodUnit;
            if (unit === 'MONTH') {
                if (data.periodAmount > 1) { unit = 'Months' } else { unit = 'Month' }
            } else {
                if (data.periodAmount > 1) { unit = 'Years' } else { unit = 'Year' }
            }
            console.log("Step1")

            if (data.recurring) {
                $item('#validFor').text = `Recurring every ${unit.toLowerCase()}`;
            } else {
                $item('#validFor').text = `Valid for ${data.periodAmount} ${unit}`;
            }
            console.log("Step2")

            $item('#selectPlanBtn').label = `Signup as ${data.name}`;
            $item('#selectPlanBtn').enable();

            console.log("Step3")

            if (data.benefits.length > 0) {
                console.log("Data:")
                console.log(data)
                console.log(data.benefits)

                let newItems = []
                for (let j = 0; j < data.benefits.length; j++) {
                    let item = data.benefits[j];
                    let tag = {
                        label: item,
                        value: item
                    }
                    newItems.push(tag)
                }

                $item('#tags').options = newItems;
                $item('#tags').expand();
            }
            console.log("Step4")
            $w('#joinusBox').changeState('plans');

            $item('#selectPlanBtn').onClick(async () => {
                selectedPlan = data;
                if (user.loggedIn) {

                    $w('#signupProcess').text = "Loading..";
                    $w('#joinusBox').changeState('submitting').then(async () => {
                        local.setItem('signupData', JSON.stringify(selectedPlan));

                        // Check if is any order and cancel it if any order was found.
                        await cancelAllUserOrders(user.id).then(async (result) => {
                            if (result.type === 'success') {
                                createPlanOrder();
                            } else {
                                console.log('Here1')
                                console.error(`${result.type} error occurred. Error message: ${result.message}`);
                                $w('#errorMsg').text = `${result.type} error occurred.`;
                                $w('#errorMsg').expand();
                                $w('#joinusBox').changeState('details');
                            }
                        }).catch(err => {
                            console.error(err);
                            $w('#errorMsg').text = err;
                            $w('#errorMsg').expand();
                            $w('#joinusBox').changeState('details');
                        })
                    })

                } else {
                    $w('#membershipType').value = selectedPlan.name;
                    $w('#joinusBox').changeState('details');
                }
            })

        })
    })

    $w('#changePlan').onClick(() => {
        $w('#joinusBox').changeState('plans');
    })

    $w('#signupBtn').onClick(async () => {
        let fieldsAreValid = await checkFields();

        if (fieldsAreValid) {
            //if (captcha.verified) {
            $w('#joinusBox').changeState('submitting').then(async () => {
                let userData = {
                    firstName: $w('#firstName').value,
                    lastName: $w('#lastName').value,
                    company: $w('#bussiness').value,
                    email: $w('#email').value,
                    password: $w('#password').value,
                    locale: wixWindow.locale
                }

                await signup(userData, selectedPlan /*, captcha.token*/ ).then(async (result) => {
                    if (result.type === 'success') {
                        await wixUsers.applySessionToken(result.sessionToken).then(() => {
                            createPlanOrder(wixUsers.currentUser.id);
                        }).catch(err => {
                            console.error(err)
                            $w('#joinusBox').changeState('error');
                            $w('#globalError').text = `An error occurred! - Please give this error to the site admin: ${err}`;
                        })

                    } else {
                        console.log()
                        console.error(`${result.type} error occurred. Error message: ${result.message}`);
                        $w('#signupBtn').disable();
                        $w('#errorMsg').text = `${result.type} error occurred.`;
                        $w('#errorMsg').expand();
                        $w('#joinusBox').changeState('details');
                    }

                }).catch(err => {
                    $w('#signupBtn').disable();
                    $w('#joinusBox').changeState('error');
                    $w('#globalError').text = `An error occurred! - Please give this error to the site admin: ${err}`;
                })
            })

            //$w("#captcha").reset();
            /*
            } else {
                $w('#errorMsg').text = "Please do the do the captcha challenge.";
                $w('#errorMsg').expand();

            }
            */
        }
    })

    let passwordSignupTimer
    $w('#password').onInput((passwordSignupInputEvent) => {
        if (passwordSignupTimer) {
            clearTimeout(passwordSignupTimer)
            passwordSignupTimer = undefined;
        }

        passwordSignupTimer = setTimeout(() => {
            passwordSignupInputEvent.target.value = passwordSignupInputEvent.target.value;

            if ($w('#password').valid) {
                if (!$w('#passwordSignupError').collapsed) { $w('#passwordSignupError').collapse() }
            } else {
                if ($w('#passwordSignupError').collapsed) { $w('#passwordSignupError').expand() }
            }
        }, 500)

    })

    // Captcha Section ===============================================
    /*
    $w("#captcha").onVerified(() => {
        if ($w("#errorMsg").text === "The CAPTCHA has timed out. Please redo the CAPTCHA challenge.") { $w("#errorMsg").collapse(); }
        $w("#signupBtn").enable();
        captcha.token = $w("#captcha").token;
        captcha.verified = true;
    });
    

    $w("#captcha").onTimeout(() => {
        $w("#signupBtn").disable();
        $w("#errorMsg").text = "The CAPTCHA has timed out. Please redo the CAPTCHA challenge.";
        $w("#errorMsg").expand();
    });
    */
}

async function createPlanOrder(newUserId) {
    $w('#signupProcess').text = "Preparing membership..";
    let userId;
    if (typeof newUserId === 'string') { userId = newUserId } else { userId = wixUsers.currentUser.id }

    return wixPaidPlans.orderPlan(selectedPlan._id).then(async (purchasedPlan) => {

        return createOrder(purchasedPlan, selectedPlan._id).then((result) => {
            $w('#signupProcess').text = "Redirecting you to checkout..";
            setTimeout(() => { wixLocation.to('/account-check') }, 500)
        }).catch(err => {
            console.error(err);
            $w('#signupProcess').text = "An Error occurred, Saving error..";
            setTimeout(() => { wixLocation.to(wixLocation.baseUrl) }, 1000)
        })

    }).catch(err => {
        console.error(err);
        $w('#signupProcess').text = "Aborting.. Failed to create membership order.";
        setTimeout(() => { wixLocation.to(wixLocation.baseUrl) }, 1000)
    })
}

function checkFields() {
    if (!$w('#errorMsg').collapsed) { $w('#errorMsg').collapse() }

    if ($w('#firstName').valid && $w('#firstName').value !== '') {

        if ($w('#lastName').valid && $w('#lastName').value !== '') {

            if ($w('#bussiness').valid && $w('#bussiness').value !== '') {

                if ($w('#email').value !== '') {

                    if ($w('#email').valid) {

                        if ($w('#password').valid && $w('#password').value.length >= 8) {
                            return true;
                        } else {
                            $w('#errorMsg').text = "Please enter a valid password.";
                            $w('#errorMsg').expand();
                            $w('#password').updateValidityIndication();
                            $w('#password').focus();
                            return false;
                        }
                    } else {
                        $w('#errorMsg').text = "Please enter a valid email address.";
                        $w('#errorMsg').expand();
                        $w('#email').updateValidityIndication();
                        $w('#email').focus();
                        return false;
                    }

                } else {
                    $w('#errorMsg').text = "Please enter your email address.";
                    $w('#errorMsg').expand();
                    $w('#email').updateValidityIndication();
                    $w('#email').focus();
                    return false;
                }

            } else {
                $w('#errorMsg').text = "Please enter your bussiness name.";
                $w('#errorMsg').expand();
                $w('#bussiness').updateValidityIndication();
                $w('#bussiness').focus();
                return false;
            }

        } else {
            $w('#errorMsg').text = "Please enter your last name.";
            $w('#errorMsg').expand();
            $w('#lastName').updateValidityIndication();
            $w('#lastName').focus();
            return false;
        }

    } else {
        $w('#errorMsg').text = "Please enter your first name.";
        $w('#errorMsg').expand();
        $w('#firstName').updateValidityIndication();
        $w('#firstName').focus();
        return false;
    }
}

async function initializePage() {
    await getPlans().then(async (x) => {
        console.log("X:")
        console.log(x)
        if (x.type === 'success') {
            plan = x;
            console.log("Has plan")
            if (plan.active && plan.paid) {
                wixLocation.to('/account/membership');
            } else {
                console.log("No plan")
                await pageOnReady();
                $w('#joinusBox').changeState('plans');
            }
        } else {
            console.log("No plan")
            await pageOnReady();
            $w('#joinusBox').changeState('plans');
        }

    }).catch(async err => {
        console.log("Error - No plan")
        await pageOnReady();
        $w('#joinusBox').changeState('plans');
    });
}

function getPlans() {
    console.log("getPlans triggered")
    if (user.loggedIn) {
        return getUserPlan(user.id).then((x) => {
            return Promise.resolve(x);
        }).catch(err => {
            return Promise.reject(err);
        })
    } else {
        return Promise.reject(null);
    }
}