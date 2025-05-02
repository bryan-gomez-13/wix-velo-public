import wixData from 'wix-data';

export function queryFunction(title) {
    return wixData.query('Items')
        .eq('title', title)
        .find()
        .then((results) => {
            let resu = results.items[0].pdf;
            return resu;
        })
}

export async function random() {
    return await wixData.query('BoatsForSale2').limit(1000).find({ "suppressAuth": true, "suppressHooks": true }).then(async (result) => {
        let items = result.items;
        let featureTrue = items.filter(obj => obj.featured === true);
        featureTrue.forEach((obj, index) => {
            obj.order = index + 1;
        });

        let featureFalse = items.filter(obj => (obj.featured === false || obj.featured === undefined));
        featureFalse.forEach((obj, index) => {
            obj.order = (featureTrue.length) + (index + 1);
        });

        let aleatoryNumbers = Array.from({ length: featureFalse.length }, (_, index) => index);
        aleatoryNumbers = aleatoryNumbers.sort(() => (Math.random() - 0.5));
        let x = [];
        aleatoryNumbers.forEach((obj) => x.push(obj + (featureTrue.length + 1)))

        let boats = featureTrue;
        featureFalse.forEach((obj, i) => {
            obj.order = x[i]
            boats.push(obj)
        })

        for (let i = 0; i < boats.length; i++) {
            await wixData.update("BoatsForSale2", boats[i], { "suppressAuth": true, "suppressHooks": true })
                .catch((err) => console.log(err));
        }
        return "UPDATE OK";
    }).catch((err) => console.log(err))
}

export async function testHour() {
    await wixData.insert("testHour", { title: "Parker" }, { "suppressAuth": true, "suppressHooks": true })
        .catch((err) => console.log(err));
}

export async function getMAxAndMinPrice() {
    return await wixData.query('BoatsForSale2').ascending('price').limit(1000).find().then((result) => {
        let items = result.items;
        let min = !(items[0].price || items[0].price == null || items[0].price == "" || items[0].price == undefined) ? items[0].price : 0;
        let max = items[(items.length - 1)].price;
        return [min, max];
    }).catch((err) => console.log(err))
}

export async function getMAxAndMinLenght() {
    return await wixData.query('BoatsForSale2').ascending('vesselLength').limit(1000).find().then((result) => {
        let items = result.items;
        let min = !(items[0].vesselLength || items[0].vesselLength == null || items[0].vesselLength == "" || items[0].vesselLength == undefined) ? items[0].vesselLength : 0;
        let max = items[(items.length - 1)].vesselLength;
        return [min, max];
    }).catch((err) => console.log(err))
}