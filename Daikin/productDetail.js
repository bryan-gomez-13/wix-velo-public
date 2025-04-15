import wixData from 'wix-data';
import { getPlattarIds, searchFile, searchFile2 } from 'backend/collections.jsw';
import { getFileInfo } from 'backend/collections.web.js';
import { getWixDataInfo } from 'backend/collections.web.js'
import wixWindowFrontend from 'wix-window-frontend';

var heightSpan = 10;
const maxHeight = 1000;
const minHeight = 200;

$w.onReady(async function () {
    $w('#dynamicDataset').onReady(async () => {
        let item = $w('#dynamicDataset').getCurrentItem();
        // console.log(item);
        $w('#tecName').text = item.title + " Technology";

        // Info
        let arrayMenu = [];
        if (item.menuFeatures) arrayMenu.push({ '_id': "0", "label": "Features", "section": "#boxSecFeature" })
        if (item.menuControllers) arrayMenu.push({ '_id': "1", "label": "Controllers", "section": "#secTabs" })
        if (item.menuTecnologies) arrayMenu.push({ '_id': "2", "label": "Technologies", "section": "#secTechnology" })
        if (item.menuBrochures) arrayMenu.push({ '_id': "3", "label": "Brochures", "section": "#shBrochureSection" })
        if (item.menuSpecifications) arrayMenu.push({ '_id': "4", "label": "Tech Specs", "section": "#shTechnicalSpecifications" })
        if (arrayMenu.length > 0) {
            $w('#repMenu').data = arrayMenu;
            $w('#repMenu').onItemReady(($item, itemData) => {
                $item('#btMenu').label = itemData.label;
                $item('#btMenu').onClick(() => $w(itemData.section).scrollTo())
            })
        }

        if (item.operationManual) {
            let linkManual = await searchFile2(item.operationManual);
            $w('#opManual').link = linkManual + "?index=true";
        } else $w('#opManual').collapse();

        // Get Brochure Info
        getWixDataInfo("SubCategory", "title", item.subCategory).then(async (subCategoryInfo) => {
            if (subCategoryInfo.brochure) {
                let linkManual = await searchFile2(subCategoryInfo.brochure);
                $w('#brochure').link = linkManual + "?index=true";
            } else $w('#brochure').collapse();
        })

        // Sections show and hide
        if (item.brochureSection) $w('#shBrochureSection').expand();
        else $w('#shBrochureSection').collapse();

        if (item.payWithZip) $w('#shpayWithZip').expand();
        else $w('#shpayWithZip').collapse();

        if (item.commonQuestions) $w('#shCommonQuestions').expand();
        else $w('#shCommonQuestions').collapse();

        if (item.whyChooseDaikin) $w('#shWhyChooseDaikin').expand();
        else $w('#shWhyChooseDaikin').collapse();

        if (item.whereToBuyDaikin) $w('#shWhereToBuyDaikin').expand();
        else $w('#shWhereToBuyDaikin').collapse();

        if (item.sensitiveSmartChoice) $w('#shSensitiveSmartChoice').expand();
        else $w('#shSensitiveSmartChoice').collapse();

        if (item.chooseAWinner) $w('#shChooseAWinner').expand();
        else $w('#shChooseAWinner').collapse();

        if (item.streamerTechnology) $w('#shStreamerTechnology').expand();
        else $w('#shStreamerTechnology').collapse();

        if (item["5YearWarranty"]) $w('#sh5YearWarranty').expand();
        else $w('#sh5YearWarranty').collapse();

        if (item.gallerySection) $w('#shGallerySection').expand();
        else $w('#shGallerySection').collapse();

        if (item.videoSection) $w('#shVideoSection').expand();
        else $w('#shVideoSection').collapse();

        if (item.mepsSection) $w('#shMEPSSection').expand();
        else $w('#shMEPSSection').collapse();

        if (item.r22RetrofitCapability) $w('#shR22RetrofitCapability').expand();
        else $w('#shR22RetrofitCapability').collapse();

        if (item.proudlyAustralianMade) $w('#shProudlyAustralianMade').expand();
        else $w('#shProudlyAustralianMade').collapse();

        if (item.r32Refrigerant) $w('#shR32Refrigerant').expand();
        else $w('#shR32Refrigerant').collapse();

        if (item.streamerTecnologyImg) $w('#shStreamerTecnologyImg').expand();
        else $w('#shStreamerTecnologyImg').collapse();

        if (item.buyOnlineNow) $w('#shBuyOnlineNow').expand();
        else $w('#shBuyOnlineNow').collapse();

        if (item.airPurifiersStreamerT) $w('#shAirPurifiersStreamerT').expand();
        else $w('#shAirPurifiersStreamerT').collapse();

        if (item.vrvSmartIIControl) $w('#vrvSmartIIControl').expand();
        else $w('#vrvSmartIIControl').collapse();

        if (item.vrtSmartControl) $w('#vrtSmartControl').expand();
        else $w('#vrtSmartControl').collapse();

        if (item.descriptionRc) $w('#descriptionRc').expand();
        else $w('#descriptionRc').collapse();

        if (item["3YearsWarranty"]) $w('#3YearsWarranty').expand();
        else $w('#3YearsWarranty').collapse();

        if (item.contactADaikinSalesEngineer) $w('#contactADaikinSalesEngineer').expand();
        else $w('#contactADaikinSalesEngineer').collapse();

        if (item.productInformation) $w('#productInformation').expand();
        else $w('#productInformation').collapse();

        if (item.aafInternational) $w('#aafInternational').expand();
        else $w('#aafInternational').collapse();

        if (item.contactDaikinApplied) $w('#contactDaikinApplied').expand();
        else $w('#contactDaikinApplied').collapse();

        if (item.contactDaikinRefrigeration) $w('#contactDaikinRefrigeration').expand();
        else $w('#contactDaikinRefrigeration').collapse();

        // Plattar
        await getIds(item._id, item.image);

        // Feature
        let arrayFeature = [];
        if (item.keyFeature1) arrayFeature.push({ '_id': "0", "label": item.keyFeature1, "image": item.image1 })
        if (item.keyFeature2) arrayFeature.push({ '_id': "1", "label": item.keyFeature2, "image": item.image2 })
        if (item.keyFeature3) arrayFeature.push({ '_id': "2", "label": item.keyFeature3, "image": item.image3 })
        if (item.keyFeature4) arrayFeature.push({ '_id': "3", "label": item.keyFeature4, "image": item.image4 })

        console.log(arrayFeature.length)
        if (arrayFeature.length > 0) {
            $w('#imgFeature').src = item.image1;
            $w('#imgFeature').alt = item.keyFeature1;
            $w('#imgFeature').tooltip = item.keyFeature1;

            $w('#repFeature').data = arrayFeature;
            $w('#repFeature').onItemReady(($item, itemData, index) => {
                $item('#btFeature').label = itemData.label;

                if (index == 0) {
                    $w('#repFeature').forEachItem(($item2, itemData2, index2) => {
                        if (itemData._id == itemData2._id) $item2('#btFeature').disable();
                        else $item2('#btFeature').enable();
                    })
                }

                $item('#btFeature').onClick(() => {
                    $w('#imgFeature').src = itemData.image;
                    $w('#imgFeature').alt = itemData.label;
                    $w('#imgFeature').tooltip = itemData.label;
                    $w('#repFeature').forEachItem(($item2, itemData2, index2) => {
                        if (itemData._id == itemData2._id) $item2('#btFeature').disable();
                        else $item2('#btFeature').enable();
                    })
                })
            })
        } else $w('#boxSecFeature').collapse();

        // Controller
        let arrayTabs = [];
        if (item.controller1) {
            arrayTabs.push({ '_id': "0", "label": item.controller1, "state": "Ourproductrange_mfController1", "src": item.imageController1, "itemId": item._id });
            applyFilter({ '_id': "0", "label": item.controller1, "state": "Ourproductrange_mfController1", "src": item.imageController1, "itemId": item._id });
        }
        if (item.controller2) {
            arrayTabs.push({ '_id': "1", "label": item.controller2, "state": "Ourproductrange_mfController2", "src": item.imageController2, "itemId": item._id });
        }

        if (arrayTabs.length > 0) {
            let variable = true;
            $w('#repTabs').data = arrayTabs;
            $w('#repTabs').onItemReady(($item, itemData, index) => {
                if (index == 0 && variable) variable = false, $item('#btTab').disable();
                $item('#btTab').label = itemData.label;
                $item('#btTab').onClick(() => {
                    applyFilter(itemData);
                    $w('#repTabs').forEachItem(($item2, itemData2, index2) => {
                        if (itemData._id == itemData2._id) $item2('#btTab').disable();
                        else $item2('#btTab').enable();
                    })
                })
            })
        } else $w('#secTabs').collapse();

        // Tecnical
        if (item.imageTechnology) $w('#secTechnology').expand();
        else $w('#secTechnology').collapse();

        // Tecnical Specfication
        if (item.secTechnicalSpecifications) $w('#shTechnicalSpecifications').expand();
        else $w('#shTechnicalSpecifications').collapse();

        if (item.downloadSpecs) {
            let linkManual = await searchFile2(item.downloadSpecs);
            $w('#vctFullTechSpecs').link = linkManual + "?index=true";
            $w('#btFullTechSpecs').link = linkManual + "?index=true";
            $w('#box191').expand();
        } else $w('#box191').collapse();
    });

    // Tecnology panel
    $w('#dataTecnology').onReady(() => {
        if (wixWindowFrontend.formFactor == "Mobile") {
            $w('#txtTecDescription').collapse();
            //$w('#btTecMoreInfo').show();

            $w('#repTecnical').onItemReady(($item, itemData) => {
                $item('#btInfo').onClick(() => {
                    if ($item('#txtTecDescription').collapsed) $item('#txtTecDescription').expand();
                    else $item('#txtTecDescription').collapse();
                });

                $item('#btTecTecnical').onClick(() => {
                    if ($item('#txtTecDescription').collapsed) $item('#txtTecDescription').expand();
                    else $item('#txtTecDescription').collapse();
                })
            })
        } else {
            $w('#txtTecDescription').expand();
            //$w('#btTecMoreInfo').hide();
            //$w('#btTecTecnical').disable();
            $w('#btInfo').disable();
        }
    })

    // =================== Plattar
    // if (wixWindowFrontend.formFactor == "Desktop") {
    //     heightSpan = 0;
    //     $w('#boxHtml').customClassList.add("altura-450");
    // } else if (wixWindowFrontend.formFactor == "Tablet") {
    //     heightSpan = 0;
    //     $w('#boxHtml').customClassList.add("altura-300");

    // } else {
    //     heightSpan = 10;
    //     $w('#boxHtml').customClassList.add("altura-300");

    // }
    // =================== Plattar
    //console.log("screen: ", wixWindowFrontend.formFactor);

    // $w("#html1").onMessage((event) => {
    //     console.log(event)
    //     if (event.data.height || event.data.height != null) {
    //         // Calcular la nueva altura
    //         let nuevaAltura = event.data.height + heightSpan;
    //         console.log("event.data.height: ", event.data.height);

    //         // Redondear la nueva altura al múltiplo de 5 más cercano
    //         let alturaRedondeada = Math.round(nuevaAltura / 5) * 5;

    //         // Limitar la altura a los valores mínimos y máximos definidos en las clases CSS
    //         let alturaMin = minHeight;
    //         let alturaMax = maxHeight;

    //         if (alturaRedondeada < alturaMin) {
    //             alturaRedondeada = alturaMin;
    //         } else if (alturaRedondeada > alturaMax) {
    //             alturaRedondeada = alturaMax;
    //         }
    //         console.log("alturaRedondeada: ", alturaRedondeada);

    //         // Construir el nombre de la clase CSS
    //         let nombreClase = `altura-${alturaRedondeada}`;
    //         // Asignar la clase CSS al elemento con id "boxHtml"
    //         let listaClasesBoxHtml = $w('#boxHtml').customClassList.values();
    //         // Remover cualquier clase de altura previamente asignada
    //         $w('#boxHtml').customClassList.values().forEach(clase => {
    //             if (clase.startsWith('altura-')) {
    //                 $w('#boxHtml').customClassList.remove(clase);
    //             }
    //         });
    //         // Agregar la nueva clase de altura
    //         $w('#boxHtml').customClassList.add(nombreClase);
    //         console.log("nueva clase ", $w('#boxHtml').customClassList.values());

    //     }
    // });

});

function applyFilter(item) {
    // Image controller
    $w('#imageX41').src = item.src;
    $w('#imageX41').alt = item.label;
    $w('#imageX41').tooltip = item.label;
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().hasSome(item.state, [item.itemId]));
    $w('#dataControlerOne').setFilter(filter);
}
// Plattar
async function getIds(productId, productImage) {
    let options = await getPlattarIds(productId);
    let image = await getFileInfo(productImage)

    let jsonP = {
        product: options,
        image: image
    }

    // $w('#html1').postMessage(jsonP)
    // $w('#html1').show();
}