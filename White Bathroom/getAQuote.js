import { local } from 'wix-storage';
var checkOut = []

$w.onReady(function () {
    checkOut = local.getItem('checkOut') ? JSON.parse(local.getItem('checkOut')) : [];
    cartPage();
    addToCartPageItem()
    init();
});

function init() {
    // Form
    $w('#form1').onFieldValueChange(() => {
        addToCartPageItem();
    })

    $w('#form1').onSubmit(() => {
        local.clear();
        checkOut = [];
        cartPage();
        addToCartPageItem();
    })

    // Cart PAge
    // Plus
    $w('#plus').onClick((event) => {
        let $item = $w.at(event.context);
        const itemId = event.context.itemId;
        const itemData = $w('#repCartPage').data.find(item => item._id == itemId)

        let value = parseInt($item('#quantity').value) || 1;
        value++;
        $item('#quantity').value = value.toString();
        itemData.quantity = parseInt(value.toString());
        $item('#less').enable();

        local.setItem('checkOut', JSON.stringify($w('#repCartPage').data));
        checkOut = $w('#repCartPage').data;
        const totalQuantity = checkOut.reduce((sum, item) => {
            return sum + (item.quantity || 0);
        }, 0);
        $w('#quantityQuote').text = `${totalQuantity}`;
        addToCartPageItem()
    });

    // Less
    $w('#less').onClick((event) => {
        let $item = $w.at(event.context);
        const itemId = event.context.itemId;
        const itemData = $w('#repCartPage').data.find(item => item._id == itemId)

        let value = parseInt($item('#quantity').value) || 1;
        if (value > 1) value--;

        $item('#quantity').value = value.toString();
        itemData.quantity = parseInt(value.toString());

        if (value === 1) $item('#less').disable();

        local.setItem('checkOut', JSON.stringify($w('#repCartPage').data));
        checkOut = $w('#repCartPage').data;
        const totalQuantity = checkOut.reduce((sum, item) => {
            return sum + (item.quantity || 0);
        }, 0);
        $w('#quantityQuote').text = `${totalQuantity}`;
        addToCartPageItem()
    });

    $w('#btDeleteItem').onClick((event) => {
        const itemId = event.context.itemId;
        const itemData = $w('#repCartPage').data.find(item => item._id == itemId)

        checkOut = checkOut.filter(item => item._id !== itemData._id);
        local.setItem('checkOut', JSON.stringify(checkOut));
        const totalQuantity = checkOut.reduce((sum, item) => {
            return sum + (item.quantity || 0);
        }, 0);
        $w('#quantityQuote').text = `${totalQuantity}`;

        cartPage();
        addToCartPageItem();
    })
}

function cartPage() {
    // Cart Page
    $w('#repCartPage').data = checkOut;
    $w('#repCartPage').onItemReady(($item, itemData) => {
        $item('#title').text = itemData.name;
        $item('#options').text = itemData.options;
        $item('#price').text = `Unit Price: ${itemData.price}`;
        $item('#quantity').value = itemData.quantity;

        $item('#image').src = itemData.image;
        $item('#image').alt = itemData.name;
        $item('#image').tooltip = itemData.name;
    })
}

function addToCartPageItem() {
    const orderSummary = checkOut.map(item => {
        const lines = [];

        // Name
        lines.push(`• ${item.name}`);

        // Options (only if not empty)
        if (item.options && item.options.trim() !== '') {
            // Replace newlines with commas (or keep newlines if preferred)
            const formattedOptions = item.options.replace(/\n/g, ', ');
            lines.push(`  Options: ${formattedOptions}`);
        }

        // Quantity
        lines.push(`  Quantity: ${item.quantity}`);

        // Unit price
        lines.push(`  Unit Price: ${item.price}`);

        return lines.join('\n');
    }).join('\n\n');

    console.log(orderSummary)

    $w('#form1').setFieldValues({
        cart_page: orderSummary
    })
}