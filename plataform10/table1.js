import wixData from 'wix-data';

$w.onReady(function () {
    let current = $w("#dynamicDataset").getCurrentItem();
    let currentReference = current.reference;
    console.log("reference", currentReference);
    getSameReference(currentReference);
});

export async function getSameReference(reference) {
    await wixData.query("NICO")
        .eq("reference", reference)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                console.log("items with same reference", results.items);
                $w('#text317').text = results.items[0].productName;
                let columns = $w("#table1").columns;
                columns = [columns[0]];
                console.log("columns", columns);
                let data = [{
                    "dimension": "Code:"
                }, {
                    "dimension": "Width:"
                }, {
                    "dimension": "Heigth:"
                }, {
                    "dimension": "Depth:"
                }];
                for (let i = 1; i < (results.items.length + 1); i++) {
                    columns.push({
                        "id": results.items[i - 1]._id,
                        "label": results.items[i - 1].label, //cambiar a .label
                        "dataPath": (i - 1).toString(), //cambiar a label
                        "type": "string",
                        "width": 100,
                        "visible": true
                    });
                    data[0][(i - 1).toString()] = results.items[i - 1].code; //code
                    data[1][(i - 1).toString()] = results.items[i - 1].width; //width
                    data[2][(i - 1).toString()] = results.items[i - 1].height; //height
                    data[3][(i - 1).toString()] = results.items[i - 1].depth; //depth
                    console.log("data", data);
                }
                console.log("columns", columns);
                $w("#table1").columns = columns;
                console.log("data", data);
                $w("#table1").rows = data;

            } else {
                // handle case where no matching items found
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}