import wixSite from 'wix-site';

$w.onReady(function () {
    switch (wixSite.currentPage.url) {
    case "/kelvin-road":
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_103f4b0862ab49cfa1ef28693bbacfc8~mv2.png"
        $w('#faceIcon').link = "https://www.facebook.com/kidscountkelvinroad"
        $w('#faceIcon').show();
        break;

    case "/lenore-road":
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_356a489b9ae64d679196adf492cffc7e~mv2.png"
        $w('#faceIcon').link = "https://www.facebook.com/kidscountlenoreroadmangere"
        $w('#faceIcon').show();
        break;

    case "/marne-road":
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_329b566343114bdabfda0b465aba3a81~mv2.png"
        $w('#faceIcon').link = "https://www.facebook.com/kidscountmarne"
        $w('#faceIcon').show();
        break;

    case "/tawa-the-griffin-school":
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_4ff617ed2e354277b3cd31e347b41638~mv2.png"
        $w('#faceIcon').link = "https://www.facebook.com/kidscounttawa"
        $w('#faceIcon').show();
        break;

    case "/pukekohe":
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_2a10cfbf092f447e860492d300d35a36~mv2.png"
        $w('#faceIcon').link = "https://www.facebook.com/Pukekohe-Kids-Count-1315847881867882/"
        $w('#faceIcon').show();
        break;

    case "/weymouth":
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_dad16d81bfe14d599e6ac5f498fc82e0~mv2.png"
        $w('#faceIcon').link = "https://www.facebook.com/kidscountwey"
        $w('#faceIcon').show();
        break;

    default:
        $w('#logo').src = "https://static.wixstatic.com/media/1ab691_c56712e046ad41b2b6f6b9fcd1b49b67~mv2.png"
        $w('#faceIcon').hide()
        break;
    }
});