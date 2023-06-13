import wixSite from 'wix-site';
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';
import { currentMember, authentication } from 'wix-members';

$w.onReady(async function () {
    await getUser();
    await getRole();
    await getPremium();
    authentication.onLogin(async () => {
        await getUser();
        await getRole();
        await getPremium();
        wixLocation.to('/')
    });

    authentication.onLogout(() => {
        session.clear();
    });
});

async function getPremium() {
    if (!(wixSite.currentPage.url == "/get-premium" || wixSite.currentPage.url == "/account/my-account")) {
        await currentMember.getRoles()
            .then((roles) => {
                if (roles.length == 0) {
                    $w('#premium').show()
                    $w('#complete').hide()
                } else {
                    if (!(roles[0]._id == 'c5de49b9-fcce-4853-b6d1-27f718ac357d')) {
                        currentMember.getMember()
                            .then((member) => {
                                wixData.query("users").eq('privateId', member._id).find()
                                    .then((results) => {
                                        if (!results.items[0].completeProfile && (wixSite.currentPage.url == "/get-premium" || wixSite.currentPage.url == "/account/my-account")) {
                                            /*if (wixWindow.formFactor == "Mobile") $w('#roleMM').text = results.items[0].role, $w('#roleMM').show();
                                            $w('#roleM').text = results.items[0].role
                                            $w('#roleM').show();*/
                                            $w('#complete').show()
                                            $w('#premium').hide()
                                        }
                                    }).catch((err) => console.log(err));
                            }).catch((error) => console.error(error));
                    }
                }

                return roles;
            }).catch((error) => console.error(error));
    }

}

function getUser() {
    currentMember.getMember().then((member) => {
        //console.log(member)
        if (member == undefined) $w('#signUp').show(), $w('#signUp2').show(), $w('#columnStrip16').expand();
        else $w('#signUp').hide(), $w('#signUp2').hide(), $w('#columnStrip16').collapse();

    }).catch((error) => console.log(0, error));
}

function getRole() {
    if (!(session.getItem("role"))) {
        currentMember.getRoles()
            .then((roles) => {
                if (!(roles.length == 0)) {
                    session.setItem("role", roles[0].title)
                    /*
                    if (wixWindow.formFactor == "Mobile") $w('#roleMM').text = roles[0].title, $w('#roleMM').show();
                    $w('#roleM').text = roles[0].title
                    $w('#roleM').show();*/
                }
            })
    } else {
        /*
        if (wixWindow.formFactor == "Mobile") $w('#roleMM').text = session.getItem("role"), $w('#roleMM').show();
        $w('#roleM').text = session.getItem("role")
        $w('#roleM').show();
        */
    }
}