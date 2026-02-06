import { currentMember, authentication } from "wix-members-frontend";
import wixData from "wix-data";

$w.onReady(function () {
    getMember();
    authentication.onLogin(() => getMember());
    authentication.onLogout(() => getMember())

});

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        if (member) {
            $w('#dataMember').setFilter(wixData.filter().eq('memberId', member._id)).then(() => {
                $w('#dataMember').onReady(() => {
                    if ($w('#dataMember').getTotalCount() > 0) {
                        const memberInfo = $w('#dataMember').getCurrentItem();

                        $w('#title').text = `Welcome ${memberInfo.firstName} to the AFC Academic Centre of Excellence`;
                        $w('#name').text = `${memberInfo.firstName} ${memberInfo.surname}`
                        const memberSince = getMemberSinceText(memberInfo?._createdDate);
                        $w('#date').text = memberSince;
                        setTimeout(() => { $w('#state').changeState('member'); }, 500);
                    } else {
                        $w('#state').changeState('home');
                    }
                })
            });
        } else {
            $w('#state').changeState('home');
        }
    }).catch((error) => { console.error(error); });
}

function getMemberSinceText(dateValue) {
    if (!dateValue) return "Member since —";

    const dateObj = new Date(dateValue);

    if (isNaN(dateObj)) return "Member since —";

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `Member since ${month} ${year}`;
}