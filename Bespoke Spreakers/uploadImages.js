import { mediaManager } from 'wix-media-backend';
import wixData from 'wix-data';

var filters = { parentFolderId: "661948c7821444f6a75dda8b36ed67b8" };
var paging = { limit: 1000 };

//listFolders( )
export function myListFoldersFunction() {
    return mediaManager.listFolders(null, null, null)
        .then((myFolders) => {
            return myFolders;
        })
        .catch((error) => {
            console.error(error);
        });
}

//listFiles2( )
export async function myListFilesFunction() {
    await mediaManager.listFiles(filters, null, paging)
        .then(async (myFiles) => {
            //let url = []

            for (let i = 0; i < myFiles.length; i++) {
                let one = myFiles[i].originalFileName.replace('.png', '')
                let two = one.replace('.jfif', '')
                let three = two.replace('.jpeg', '')
                let four = three.replace('.jpg', '')

                //url.push({ "originalFileName": four, "image": myFiles[i].fileUrl })

                await wixData.query("Recipes")
                    .ascending('photoUrl')
                    .eq('photoUrl', four)
                    .ne('ok', false)
                    .find()
                    .then(async (results) => {
                        if (results.items.length > 0) {
                            results.items[0].image = myFiles[i].fileUrl;
                            results.items[0].ok = true
                            await wixData.update("Recipes", results.items[0])
                                .then((results) => {
                                    console.log(i + ' of 919'); //see item below
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }

                    })

            }
        })
        .catch((error) => {
            console.error(error);
        });
}