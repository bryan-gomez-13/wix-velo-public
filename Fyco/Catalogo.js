import wixData from 'wix-data';
import { session } from 'wix-storage';

$w.onReady(async function () {
    await dropdownCategory();
    await search();
    init();
    filter();
    //console.log($w('#repeater9').data)
});

function init() {
    $w('#Option1').onChange(() => filter());
    $w('#Option2').onChange(() => filter());
    $w('#Option3').onChange(() => filter());
    $w('#Option4').onChange(() => filter());

    $w('#search').onInput(() => filter());
    $w('#delete').onClick(() => filter());

    //REPEATER FIBRA
    $w('#RFibra').onItemReady(($item, itemData, index) => {
        $item('#FOSub').onChange(async (event) => {
            //filter
            await filter();
            if (!($item('#FOSubSub').isVisible)) {
                $item('#FOSub').disable()
                wixData.query("FibraOpticaSubSub")
                    .hasSome('sub', [$item('#FOSub').value])
                    .ascending('subSub')
                    .find()
                    .then(async (results) => {
                        //console.log(results.items)
                        let arraySub = []
                        for (let i = 0; i < results.items.length; i++) {
                            let x = await wixData.query('CATALOGODEPRODUCTOS').hasSome('categoriaOp2', [$w('#Option1').value]).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subCategoria', [$item('#FOSub').value])).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subSubCategoria', [results.items[i]._id])).find().then((results) => { return results })
                            if(results.items[i].subSub.includes('(FO)')) results.items[i].subSub = results.items[i].subSub.replace('(FO)','')
                            arraySub.push({ label: results.items[i].subSub + ' (' + x.totalCount + ')', value: results.items[i]._id })
                        }
                        $item('#FOSubSub').options = arraySub;
                        $item('#FOSubSub').expand();
                        $item('#FOSub').enable();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                $item('#FOSubSub').collapse();
            }
            $item('#FOSubSub').onChange(() => filter())
        })
    })
    //REPEATER REDES
    $w('#RRedesHFC').onItemReady(($item, itemData, index) => {
        $item('#redesSub').onChange(async (event) => {
            //filter
            await filter();
            if (!($item('#redesSubSub').isVisible)) {
                $item('#redesSub').disable()
                wixData.query("FibraOpticaSubSub")
                    .hasSome('sub', [$item('#redesSub').value])
                    .ascending('subSub')
                    .find()
                    .then(async (results) => {
                        //console.log(results.items)
                        let arraySub = []
                        for (let i = 0; i < results.items.length; i++) {
                            let x = await wixData.query('CATALOGODEPRODUCTOS').hasSome('categoriaOp2', [$w('#Option2').value]).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subCategoria', [$item('#redesSub').value])).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subSubCategoria', [results.items[i]._id])).find().then((results) => { return results })
                            if(results.items[i].subSub.includes('(RHFC)')) results.items[i].subSub = results.items[i].subSub.replace('(RHFC)','')
                            arraySub.push({ label: results.items[i].subSub + ' (' + x.totalCount + ')', value: results.items[i]._id })
                        }
                        $item('#redesSubSub').options = arraySub;
                        $item('#redesSubSub').expand();
                        $item('#redesSub').enable();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                $item('#redesSubSub').collapse();
            }
            $item('#redesSubSub').onChange(() => filter())
        })
    })
    //EQUIPOS ACTIVOS
    $w('#REquiposActivos').onItemReady(($item, itemData, index) => {
        $item('#equiposSub').onChange(async (event) => {
            //filter
            await filter();
            if (!($item('#equiposSubSub').isVisible)) {
                $item('#equiposSub').disable()
                wixData.query("FibraOpticaSubSub")
                    .hasSome('sub', [$item('#equiposSub').value])
                    .ascending('subSub')
                    .find()
                    .then(async (results) => {
                        //console.log(results.items)
                        let arraySub = []
                        for (let i = 0; i < results.items.length; i++) {
                            let x = await wixData.query('CATALOGODEPRODUCTOS').hasSome('categoriaOp2', [$w('#Option3').value]).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subCategoria', [$item('#equiposSub').value])).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subSubCategoria', [results.items[i]._id])).find().then((results) => { return results })
                            if(results.items[i].subSub.includes('(EA)')) results.items[i].subSub = results.items[i].subSub.replace('(EA)','')
                            arraySub.push({ label: results.items[i].subSub + ' (' + x.totalCount + ')', value: results.items[i]._id })
                        }
                        $item('#equiposSubSub').options = arraySub;
                        $item('#equiposSubSub').expand();
                        $item('#equiposSub').enable();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                $item('#equiposSubSub').collapse();
            }
            $item('#equiposSubSub').onChange(() => filter())
        })
    })
    //REPEATER DATECENTER
    $w('#RDatacenter').onItemReady(($item, itemData, index) => {
        $item('#datacenterSub').onChange(async (event) => {
            //filter
            await filter();
            if (!($item('#datacenterSubSub').isVisible)) {
                $item('#datacenterSub').disable()
                wixData.query("FibraOpticaSubSub")
                    .hasSome('sub', [$item('#datacenterSub').value])
                    .ascending('subSub')
                    .find()
                    .then(async (results) => {
                        //console.log(results.items)
                        let arraySub = []
                        for (let i = 0; i < results.items.length; i++) {
                            let x = await wixData.query('CATALOGODEPRODUCTOS').hasSome('categoriaOp2', [$w('#Option4').value]).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subCategoria', [$item('#datacenterSub').value])).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subSubCategoria', [results.items[i]._id])).find().then((results) => { return results })
                            if(results.items[i].subSub.includes('(DATA)')) results.items[i].subSub = results.items[i].subSub.replace('(DATA)','')
                            arraySub.push({ label: results.items[i].subSub + ' (' + x.totalCount + ')', value: results.items[i]._id })
                        }
                        $item('#datacenterSubSub').options = arraySub;
                        $item('#datacenterSubSub').expand();
                        $item('#datacenterSub').enable();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                $item('#datacenterSubSub').collapse();
            }
            $item('#datacenterSubSub').onChange(() => filter())
        })
    })
}

function filter() {
    let filter = wixData.filter();
    //Option Fibra = true
    if ($w('#Option1').checked) {
        let filter2 = wixData.filter().hasSome("categoriaOp2", [$w('#Option1').value])
        $w('#RFibra').expand();

        $w('#RFibra').forEachItem(($itemF, itemDataF, indexF) => {
            if ($itemF('#FOSub').checked) {
                filter2 = filter2.and(wixData.filter().hasSome("subCategoria", [itemDataF.value]))
                if ($itemF('#FOSubSub').value.length > 0) {
                    filter2 = filter2.and(wixData.filter().hasSome("subSubCategoria", $itemF('#FOSubSub').value))
                }
            }
        })

        filter = filter.or(filter2)
    } else $w('#RFibra').collapse()

    //Option Redes HFC = true
    if ($w('#Option2').checked) {
        let filter2 = wixData.filter().hasSome("categoriaOp2", [$w('#Option2').value])
        $w('#RRedesHFC').expand();

        $w('#RRedesHFC').forEachItem(($itemR, itemDataR, indexR) => {
            if ($itemR('#redesSub').checked) {
                filter2 = filter2.and(wixData.filter().hasSome("subCategoria", [itemDataR.value]))
                if ($itemR('#redesSubSub').value.length > 0) {
                    filter2 = filter2.and(wixData.filter().hasSome("subSubCategoria", $itemR('#redesSubSub').value))
                }
            }
        })
        filter = filter.or(filter2)
    } else $w('#RRedesHFC').collapse()

    //Option Equipos activos = true
    if ($w('#Option3').checked) {
        let filter2 = wixData.filter().hasSome("categoriaOp2", [$w('#Option3').value])
        $w('#REquiposActivos').expand();

        $w('#REquiposActivos').forEachItem(($itemE, itemDataE, indexE) => {
            if ($itemE('#equiposSub').checked) {
                filter2 = filter2.and(wixData.filter().hasSome("subCategoria", [itemDataE.value]))
                if ($itemE('#equiposSubSub').value.length > 0) {
                    filter2 = filter2.and(wixData.filter().hasSome("subSubCategoria", $itemE('#equiposSubSub').value))
                }
            }
        })
        filter = filter.or(filter2)
    } else $w('#REquiposActivos').collapse()

    //Option Data center = true
    if ($w('#Option4').checked) {
        let filter2 = wixData.filter().hasSome("categoriaOp2", [$w('#Option4').value])
        $w('#RDatacenter').expand();

        $w('#RDatacenter').forEachItem(($itemD, itemDataD, indexF) => {
            if ($itemD('#datacenterSub').checked) {
                filter2 = filter2.and(wixData.filter().hasSome("subCategoria", [itemDataD.value]))
                if ($itemD('#datacenterSubSub').value.length > 0) {
                    filter2 = filter2.and(wixData.filter().hasSome("subSubCategoria", $itemD('#datacenterSubSub').value))
                }
            }
        })
        filter = filter.or(filter2)
    } else $w('#RDatacenter').collapse()

    if (session.getItem("query") || $w('#search').value !== '') {
        filter = filter.or(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("sku", $w('#search').value)).or(wixData.filter().contains("CodFabricante", $w('#search').value)))
    }

    $w('#dynamicDataset').setFilter(filter).then(() => $w('#items').text = $w('#dynamicDataset').getTotalCount() + " Items")
}

async function search() {
    if (session.getItem("multiCheck")) {
        if (session.getItem("multiCheck") == 'Fibras') $w('#Option2').checked = true
        else if (session.getItem("multiCheck") == 'FTTx') $w('#Option1').checked = true
    }
    if (session.getItem("query")) $w('#search').value = session.getItem("query");
    session.clear();
}

async function dropdownCategory() {
    await wixData.query("Categorias")
        .ascending('title')
        .find()
        .then(async (results) => {
            //console.log(results.items)
            for (let i = 0; i < results.items.length; i++) {
                //console.log(results.items[i].title)
                switch (results.items[i].title) {
                case "DATA CENTER":
                    $w('#Option4').label = results.items[i].title;
                    $w('#Option4').value = results.items[i]._id;
                    await dropdownSubCategory(results.items[i]._id, "datacenter")
                    break;
                case "EQUIPOS ACTIVOS":
                    $w('#Option3').label = results.items[i].title;
                    $w('#Option3').value = results.items[i]._id;
                    await dropdownSubCategory(results.items[i]._id, "equiposActivos")
                    break;

                case "FIBRA ÓPTICA":
                    $w('#Option1').label = results.items[i].title;
                    $w('#Option1').value = results.items[i]._id;
                    await dropdownSubCategory(results.items[i]._id, "fibraOptica")
                    break;

                case "REDES HFC":
                    $w('#Option2').label = results.items[i].title;
                    $w('#Option2').value = results.items[i]._id;
                    await dropdownSubCategory(results.items[i]._id, "redesHFC")
                    break;
                }
            }
            $w('#Box').expand();
        })
        .catch((err) => {
            console.log(err);
        });
}

function dropdownSubCategory(id, item) {
    wixData.query("FibraOpticaSub")
        .hasSome('categoria', [id])
        .ascending('title')
        .find()
        .then(async (results) => {
            //console.log(results.items)
            let arraySub = []
            for (let i = 0; i < results.items.length; i++) {
                let x = await wixData.query('CATALOGODEPRODUCTOS').hasSome('categoriaOp2', [id]).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subCategoria', [results.items[i]._id])).find().then((results) => { return results })
                if (item == "fibraOptica") arraySub.push({ _id: results.items[i]._id, label: results.items[i].title + ' (' + x.totalCount + ')', value: results.items[i]._id })
                else if (item == "redesHFC") arraySub.push({ _id: results.items[i]._id, label: results.items[i].title + ' (' + x.totalCount + ')', value: results.items[i]._id })
                else if (item == "equiposActivos") arraySub.push({ _id: results.items[i]._id, label: results.items[i].title + ' (' + x.totalCount + ')', value: results.items[i]._id })
                else if (item == "datacenter") arraySub.push({ _id: results.items[i]._id, label: results.items[i].title + ' (' + x.totalCount + ')', value: results.items[i]._id })
            }
            if (item == "fibraOptica") await dropFibra(arraySub, "fibraOptica")
            else if (item == "redesHFC") await dropFibra(arraySub, "redesHFC")
            else if (item == "equiposActivos") await dropFibra(arraySub, "equiposActivos")
            else if (item == "datacenter") await dropFibra(arraySub, "datacenter")
        })
        .catch((err) => {
            console.log(err);
        });
}

function dropFibra(array, repeater) {
    //console.log(array)
    switch (repeater) {
    case "fibraOptica":
        $w("#RFibra").data = array;
        //console.log('Array rep', $w("#RFibra").data)
        $w("#RFibra").forEachItem(($item, itemData, index) => {
            //console.log(itemData)
            if(itemData.label.includes('(FO)')) itemData.label = itemData.label.replace('(FO)','')
            $item("#FOSub").label = itemData.label;
            $item("#FOSub").value = itemData.value;
        });
        break;
    case "redesHFC":
        $w("#RRedesHFC").data = array;
        //console.log('Array rep', $w("#RFibra").data)
        $w("#RRedesHFC").forEachItem(($item, itemData, index) => {
            //console.log(itemData)
            if(itemData.label.includes('(RHFC)')) itemData.label = itemData.label.replace('(RHFC)','')
            $item("#redesSub").label = itemData.label;
            $item("#redesSub").value = itemData.value;
        });
        break;
    case "equiposActivos":
        $w("#REquiposActivos").data = array;
        //console.log('Array rep', $w("#RFibra").data)
        $w("#REquiposActivos").forEachItem(($item, itemData, index) => {
            //console.log(itemData)
            if(itemData.label.includes('(EA)')) itemData.label = itemData.label.replace('(EA)','')
            $item("#equiposSub").label = itemData.label;
            $item("#equiposSub").value = itemData.value;
        });
        break;
    case "datacenter":
        $w("#RDatacenter").data = array;
        //console.log('Array rep', $w("#RFibra").data)
        $w("#RDatacenter").forEachItem(($item, itemData, index) => {
            //console.log(itemData)
            if(itemData.label.includes('(DATA)')) itemData.label = itemData.label.replace('(DATA)','')
            $item("#datacenterSub").label = itemData.label;
            $item("#datacenterSub").value = itemData.value;
        });
        break;
    }
}