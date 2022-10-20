// Para obtener la documentación completa sobre las funciones API, incluidos ejemplos para programa con código, visita http://wix.to/94BuAAs
import wixData from 'wix-data';
var datesFree;
$w.onReady(async function () {
    // TODO: write your page related code here...
    var firstDate;
    var columnName;
    var options = {
        "suppressAuth": true
    };

    await wixData.query("2023ProductionDates")
        .limit(1000)
        .ascending("weeks")
        .find()
        .then((results) => {
            datesFree = results.items;
        });

    for (var m = 0; m < datesFree.length; m++) {
        if (datesFree[m].l === '' || typeof datesFree[m].l === 'undefined') {
            //console.log("encontre undefined en l");
            firstDate = datesFree[m];
            columnName = "l";
            break;
        }
        if (datesFree[m].m === '' || typeof datesFree[m].m === 'undefined') {
            //console.log("encontre undefined en m");
            firstDate = datesFree[m];
            columnName = "m";
            break;
        }
        if (datesFree[m].x === '' || typeof datesFree[m].x === 'undefined') {
            //console.log("encontre undefined en x");
            firstDate = datesFree[m];
            columnName = "x";
            break;
        }
        if (datesFree[m].j === '' || typeof datesFree[m].j === 'undefined') {
            //console.log("encontre undefined en j");
            firstDate = datesFree[m];
            columnName = "j";
            break;
        }
        if (datesFree[m].v === '' || typeof datesFree[m].v === 'undefined') {
            //console.log("encontre undefined en v");
            firstDate = datesFree[m];
            columnName = "v";
            break;
        }
        if (datesFree[m].s === '' || typeof datesFree[m].s === 'undefined') {
            //console.log("encontre undefined en s");
            firstDate = datesFree[m];
            columnName = "s";
            break;
        }
        if (datesFree[m].d === '' || typeof datesFree[m].d === 'undefined') {
            //console.log("encontre undefined en d");
            firstDate = datesFree[m];
            columnName = "d";
            break;
        }
    }
    //console.log("first date", firstDate.title);
    $w("#textNextDate").text = firstDate.title;
    $w('#check').label = "I accept next production date " + firstDate.title
    $w("#shoppingCart1").hide();
    $w('#check').onChange(() => {
        if ($w('#check').checked) {
            $w("#shoppingCart1").show();
            $w('#Arrow').expand()
        } else {
            $w("#shoppingCart1").hide();
            $w('#Arrow').collapse()
        }
    })

});