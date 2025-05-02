// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

$w.onReady(function () {

    $w('#dataset1').onReady(() => {
        if ($w('#dataset1').getTotalCount() == 0) $w('#secTestimonies').collapse(), $w('#section9').collapse();
    })

});