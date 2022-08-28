import wixData from 'wix-data';
import { session } from 'wix-storage';

$w.onReady(async function () {
    await dropdownCategory();
    await search();
    init();
    filter();
});

function init() {
    $w('#Option1').onChange(() => filter());
    $w('#subFTTX').onChange(() => filter());
    $w('#Option2').onChange(() => filter());
    $w('#subFibras').onChange(() => filter());
    $w('#search').onInput(() => filter());
    $w('#delete').onClick(() => filter());
}

function filter() {
    let filter = wixData.filter();
    //Option FTTx = true - Habilitada el subFTTx - Filtro x Categoria
    if ($w('#Option1').checked && !($w('#Option2').checked)) {
        filter = filter.and(wixData.filter().hasSome("categoriaOp2", [$w('#Option1').value]))
        $w('#subFTTX').expand()
    } else $w('#subFTTX').collapse()

    //Option Fibras = true - Habilitada el subFibras - Filtro x Categoria
    if ($w('#Option2').checked && !($w('#Option1').checked)) {
        filter = filter.and(wixData.filter().hasSome("categoriaOp2", [$w('#Option2').value]))
        $w('#subFibras').expand()
    } else $w('#subFibras').collapse()

    //Filtro por subCategoria
    if ($w('#subFTTX').value.length > 0 && $w('#Option1').checked && !($w('#Option2').checked)) filter = filter.and(wixData.filter().hasSome("subCategorasOp2", $w('#subFTTX').value))
    if ($w('#subFibras').value.length > 0 && $w('#Option2').checked && !($w('#Option1').checked)) filter = filter.and(wixData.filter().hasSome("subCategorasOp2", $w('#subFibras').value))
    if (session.getItem("query") || $w('#search').value !== '') {
        filter = filter.and(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("sku", $w('#search').value)).or(wixData.filter().contains("CodFabricante", $w('#search').value)))
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
            //console.log("Categorias",results)
            $w('#Option1').label = results.items[0].title;
            $w('#Option1').value = results.items[0]._id;
            await dropdownSubCategory(results.items[0]._id, 0)

            $w('#Option2').label = results.items[1].title;
            $w('#Option2').value = results.items[1]._id;
            await dropdownSubCategory(results.items[1]._id, 1)
        })
        .catch((err) => {
            console.log(err);
        });
}

function dropdownSubCategory(id, index) {
    wixData.query("SubCategorias")
        .hasSome('categora', [id])
        .ascending('title')
        .find()
        .then(async (results) => {
            let arraySub = []
            for (let i = 0; i < results.items.length; i++) {
                let x = await wixData.query('CATALOGODEPRODUCTOS').hasSome('categoriaOp2', [id]).and(wixData.query('CATALOGODEPRODUCTOS').hasSome('subCategorasOp2', [results.items[i]._id])).find().then((results) => {return results})
                arraySub.push({ label: results.items[i].title+' ('+ x.totalCount+')', value: results.items[i]._id })
            }
            if(index == 0) $w('#subFTTX').options = arraySub;
            else $w('#subFibras').options = arraySub;
           
        })
        .catch((err) => {
            console.log(err);
        });
}