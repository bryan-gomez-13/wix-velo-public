import wixData from 'wix-data';

$w.onReady(function () {
	init();
    teamItems();
});

function init(){
	// CLOSE BUTTONS
	$w('#TClose1').onClick(() => TClose(1));
	$w('#TClose2').onClick(() => TClose(2));
	$w('#TClose3').onClick(() => TClose(3));
	$w('#TClose4').onClick(() => TClose(4));
	$w('#TClose5').onClick(() => TClose(5));
	$w('#TClose6').onClick(() => TClose(6));
	$w('#TClose7').onClick(() => TClose(7));
	$w('#TClose8').onClick(() => TClose(8));

	//IMAGE BUTTONS
	$w('#TImage1').onClick(() => box(1));
	$w('#TImage2').onClick(() => box(2));
	$w('#TImage3').onClick(() => box(3));
	$w('#TImage4').onClick(() => box(4));
	$w('#TImage5').onClick(() => box(5));
	$w('#TImage6').onClick(() => box(6));
	$w('#TImage7').onClick(() => box(7));
	$w('#TImage8').onClick(() => box(8));
}

//Team
function teamItems() {
    wixData.query("team")
        .ascending("order")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                for (let i = 0; i < results.length; i++) {
                    let idName = "#TName" + (i + 1);
                    $w(idName).text = results.items[i].title;
                    let idRol = "#TRol" + (i + 1);
                    $w(idRol).text = results.items[i].rol;
                    let idImage = "#TImage" + (i + 1);
                    $w(idImage).src = results.items[i].image;
                    $w(idImage).tooltip = results.items[i].title;
                    $w(idImage).alt = results.items[i].title;
                    let idDescription = "#TDescription" + (i + 1);
                    $w(idDescription).text = results.items[i].description;
                    let idLindedin = "#TLinkedin" + (i + 1);
                    $w(idLindedin).link = results.items[i].linkedin;
                }
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

//OPEN BOX
function box(box) {
    for (let i = 1; i <= 8; i++) {
        if (box == i) {
            let idBox = '#TBox' + i;
            $w(idBox).expand();
        } else {
            let idBox = '#TBox' + i;
            $w(idBox).collapse()
        }
    }
}

// CLOSE BOX
function TClose(x) {
	let close = "#TBox"+x;
    $w(close).collapse();
}