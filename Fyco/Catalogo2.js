import wixData from 'wix-data';
import { session } from 'wix-storage';

$w.onReady(async function () {
    await search();
    filter();

    //Option2
    dropdowns();

    init();
});

function init() {
    $w('#fibrasTroncales').onChange(() => filter());
    $w('#fttx').onChange(() => filter());
    $w('#categorias').onChange(() => filter());

    //option2
    $w('#options').onChange((event) => {
        if($w('#options').value == 'Option1') $w('#option1').expand(), $w('#option2').collapse()
        else $w('#option2').expand(), $w('#option1').collapse()
    })
    $w('#categorias2').onChange(() => filter2());
    $w('#subCategorias2').onChange(() => filter2());
    $w('#search').onInput(() => filter())
}

function filter() {
    //console.log($w('#fibrasTroncales').value)
    //console.log($w('#fttx').value)
    let filter = wixData.filter();
    if ($w('#categorias').value.length > 0) {
        filter = filter.and(wixData.filter().hasSome("Categoria", $w('#categorias').value))
        //console.log($w('#categorias').selectedIndices)
        let x = $w('#categorias').selectedIndices.toString()
        switch (x) {
        case '0':
            $w('#fibrasTroncales').expand()
            $w('#fttx').collapse()
            break;
        case '1':
            $w('#fttx').expand()
            $w('#fibrasTroncales').collapse()
            break;
        case '0,1':
            $w('#fibrasTroncales').expand()
            $w('#fttx').expand()
            break;
        }
    } else {
        $w('#fttx').collapse()
        $w('#fibrasTroncales').collapse()
    }
    if ($w('#fibrasTroncales').value.length > 0) filter = filter.and(wixData.filter().hasSome("SubCategoria", $w('#fibrasTroncales').value))
    if ($w('#fttx').value.length > 0) filter = filter.and(wixData.filter().hasSome("SubCategoria", $w('#fttx').value))
    if (session.getItem("query") || $w('#search').value !== '') {
        filter = filter.and(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("sku", $w('#search').value)).or(wixData.filter().contains("CodFabricante", $w('#search').value)))
    }

    $w('#dynamicDataset').setFilter(filter).then(() => $w('#items').text = $w('#dynamicDataset').getTotalCount() + " Items")
}

function search() {
    if (session.getItem("multiCheck")) {
        if (session.getItem("multiCheck") == 'Fibras') $w('#categorias').selectedIndices = [0], $w('#fibrasTroncales').expand()
        else if (session.getItem("multiCheck") == 'FTTx') $w('#categorias').selectedIndices = [1], $w('#fttx').expand()
    }
    if (session.getItem("query")) $w('#search').value = session.getItem("query");
    session.clear();
}

//Option2
function dropdowns() {
    wixData.query("Categorias")
        .ascending('title')
        .find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i]._id })
            }
            $w('#categorias2').options = array;
        })
        .catch((err) => {
            console.log(err);
        });

    wixData.query("SubCategorias")
        .ascending('title')
        .find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i]._id })
            }
            $w('#subCategorias2').options = array;
        })
        .catch((err) => {
            console.log(err);
        });
}

function filter2() {
    let filter = wixData.filter();
    console.log($w('#categorias2').value, $w('#subCategorias2').value)

    if ($w('#categorias2').value.length > 0) filter = filter.and(wixData.filter().hasSome("categoriaOp2", $w('#categorias2').value))
    if ($w('#subCategorias2').value.length > 0) filter = filter.and(wixData.filter().hasSome("subCategorasOp2", $w('#subCategorias2').value))
    if (session.getItem("query") || $w('#search').value !== '') {
        filter = filter.and(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("sku", $w('#search').value)).or(wixData.filter().contains("CodFabricante", $w('#search').value)))
    }

    $w('#dynamicDataset').setFilter(filter).then(() => $w('#items').text = $w('#dynamicDataset').getTotalCount() + " Items")
}