import { currentMember } from 'wix-members';
import { authentication } from 'wix-members';
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    getUrl();
    authentication.onLogin(async (member) => {
        getUrl()
    });
});

function role() {
    currentMember.getRoles()
        .then((roles) => {
            let role = false;
            for (let i = 0; i < roles.length; i++) {
                let element = roles[i]._id;
                if (element == "482c3182-b38f-4897-9f33-e34c7173bfe3") {
                    role = true;
                    break
                }
            }
            if (!role) {
                $w('#challengePage1').collapse();
                $w('#text2').expand();
                //wixLocation.to('/velo')
            } else {
                $w('#text2').collapse();
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

async function getUrl() {
    let program = wixLocation.url.split('/');
    await wixData.query("Programs")
    .eq('courseId',program[(program.length - 1)])
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                role();
            }
        })
        .catch((err) => {
            console.log(err)
        });
}