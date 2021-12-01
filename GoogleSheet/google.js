/*var gsheets = require('google-sheets');
 
// authorize your account
gsheets.auth({
    email: <YOUR GOOGLE USERNAME>,
    password: <YOUR GOOGLE PASS>
}, function(err) {
    if (err) {
        throw err;
 
        // list spreadsheets in the account
        gsheets.list(function(err, sheets) {
            // sheets is an array of Spreadsheet objects
        });
 
        // load a specific sheet
        gsheets.getSpreadsheet(<YOUR SPREADSHEET KEY HERE>, function(err, sheet) {
            if (err) {
                throw err;
            }
 
            // sheet is a Spreadsheet object....lets list all its worksheets
            sheet.getWorksheets(function(err, worksheets) {
                if (err) {
                    throw err;
                }
                // loop over the worksheets and print their titles
                Array.forEach(worksheets, function(worksheet) {
                    console.log('Worksheet : ' + worksheet.getTitle());
                });
 
                // set size of first worksheet
                worksheets[0].set({
                    rows: 50,
                    cols: 50
                });
                // save it
                worksheet[0].save(function(err, worksheet) {
                    // worksheet now refers to the updated worksheet object
                    // lets get its rows and add some new ones
                    worksheet.getRows(function(err, rows) {
                        rows.create({
                            id: 1,
                            date: new Date().toUTCString(),
                            value: 'A new value'
                        }, function(err, row) {
                            // now delete it again
                            rows.remove(row, function(err) {
                                // remove succeeded
                            });
                        });
                    });
                });
            });
 
        });
    }	
});
*/