import wixData from 'wix-data';
var dnow = new Date();

$w.onReady(function () {
    init();
    filter();
});

function init() {
    $w('#topic').onChange(() => filter())
    $w('#person').onChange(() => filter())
    $w('#type').onChange(() => filter())
    $w('#topics').onChange(() => filter())
    $w('#search').onInput(() => filter())
    $w('#reset').onClick(() => {
        $w('#topic').value = '';
        $w('#topics').value = [];
        $w('#person').value = '';
        $w('#type').value = '';
        $w('#search').value = '';
        filter();
    })

    let sizeTitle = 64;
    let sizeDescription = 148;
    $w('#rep').onItemReady(($product, product) => {
        if (product.title.length > sizeTitle) $product('#title').text = `${product.title.substr(0, sizeTitle)}...`;
        else $product('#title').text = product.title;

        if (product.description.length > sizeDescription) $product('#description').text = `${product.description.substr(0, sizeDescription)}...`;
        else $product('#description').text = product.description;
    })
}

function filter() {

    let filter = wixData.filter();
    //Search
    if ($w('#search').value !== '') filter = filter.and(wixData.filter().contains("title", $w('#search').value));
    //Topic
    if ($w('#topic').value !== '') filter = filter.and(wixData.filter().contains("categories", $w('#topic').value));
    //Topics
    if ($w('#topics').value.length > 0) filter = filter.and(wixData.filter().hasSome("categories", $w('#topics').value));
    //Person
    if ($w('#person').value !== '') filter = filter.and(wixData.filter().hasSome("author", $w('#person').value));
    //Type
    if ($w('#type').value !== '') filter = filter.and(wixData.filter().hasSome("type", $w('#type').value));

    filter = filter.and(wixData.filter().ne("upcoming", true));
    filter = filter.and(wixData.filter().not(wixData.filter().contains('typeLabel', 'ENDED')));
    filter = filter.and(filter.le('date', dnow))
    $w('#dataset1').setFilter(filter);
}

/*
        $w("#buttonAgile").onClick((event) => {
            $w("#dropdown1").value = "Agile";
            $w("#dataset1").refresh()
        });

        $w("#buttonStrategy").onClick((event) => {
            $w("#dropdown1").value = "Strategy";
            $w("#dataset1").refresh()
        });

        $w("#buttonChange").onClick((event) => {
            $w("#dropdown1").value = "Change";
            $w("#dataset1").refresh()
        });

        $w("#buttonCommunication").onClick((event) => {
            $w("#dropdown1").value = "Communication";
            $w("#dataset1").refresh()
        });

        $w("#buttonCulture").onClick((event) => {
            $w("#dropdown1").value = "Culture";
            $w("#dataset1").refresh()
        });

        $w("#buttonDiversity").onClick((event) => {
            $w("#dropdown1").value = "Diversity";
            $w("#dataset1").refresh()
        });

        $w("#buttonGovernment").onClick((event) => {
            $w("#dropdown1").value = "Government";
            $w("#dataset1").refresh()
        });

        $w("#buttonLeaders").onClick((event) => {
            $w("#dropdown1").value = "Leaders";
            $w("#dataset1").refresh()
        });

        $w("#buttonStrengths").onClick((event) => {
            $w("#dropdown1").value = "Strengths";
            $w("#dataset1").refresh()
        });

        $w("#buttonTeam").onClick((event) => {
            $w("#dropdown1").value = "Team";
            $w("#dataset1").refresh()
        });

        $w("#buttonWellbeing").onClick((event) => {
            $w("#dropdown1").value = "Wellbeing";
            $w("#dataset1").refresh()
        });

        $w("#buttonAssessments").onClick((event) => {
            $w("#dropdown1").value = "Assessments";
            $w("#dataset1").refresh()
        });
    */