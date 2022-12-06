$w.onReady(function () {

    //Video = https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg
    //PDF = https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg

    let sizeDescription = 303;
    $w('#repG').onItemReady(($product, product) => {
        if (product.description.length > sizeDescription) $product('#descriptionG').text = `${product.description.substr(0, sizeDescription)}...`;
        else $product('#descriptionG').text = product.description;

        if (product.pdfIcon && product.videoIcon) {
            $product('#videoG').src = "https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg"
            $product('#pdfG').src = "https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg"
        } else if (product.pdfIcon && !(product.videoIcon)) {
            $product('#videoG').src = "https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg"
            $product('#pdfG').hide()
        } else if (!(product.pdfIcon) && product.videoIcon) {
            $product('#videoG').src = "https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg"
            $product('#pdfG').hide()
        }else{
            $product('#videoG').hide()
            $product('#pdfG').hide()
        }
    })

    $w('#repC').onItemReady(($product, product) => {
        if (product.description.length > sizeDescription) $product('#descriptionC').text = `${product.description.substr(0, sizeDescription)}...`;
        else $product('#descriptionC').text = product.description;

        if (product.pdfIcon && product.videoIcon) {
            $product('#videoC').src = "https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg"
            $product('#pdfC').src = "https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg"
        } else if (product.pdfIcon && !(product.videoIcon)) {
            $product('#videoC').src = "https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg"
            $product('#pdfC').hide()
        } else if (!(product.pdfIcon) && product.videoIcon) {
            $product('#videoC').src = "https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg"
            $product('#pdfC').hide()
        }else{
            $product('#videoC').hide()
            $product('#pdfC').hide()
        }
    })

    $w('#repE').onItemReady(($product, product) => {
        if (product.description.length > sizeDescription) $product('#descriptionE').text = `${product.description.substr(0, sizeDescription)}...`;
        else $product('#descriptionE').text = product.description;

        if (product.pdfIcon && product.videoIcon) {
            $product('#videoE').src = "https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg"
            $product('#pdfE').src = "https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg"
        } else if (product.pdfIcon && !(product.videoIcon)) {
            $product('#videoE').src = "https://static.wixstatic.com/shapes/b0568f_460ecf563e1b4f4cbf2b98b892bcc21f.svg"
            $product('#pdfE').hide()
        } else if (!(product.pdfIcon) && product.videoIcon) {
            $product('#videoE').src = "https://static.wixstatic.com/shapes/b0568f_48f31495d87e46108da74578d1e067b1.svg"
            $product('#pdfE').hide()
        }else{
            $product('#videoE').hide()
            $product('#pdfE').hide()
        }
    })

});