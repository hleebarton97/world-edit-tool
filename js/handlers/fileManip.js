const { dialog } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const jimp = require('jimp');
const storage = require('./storage');
const frontend = require('./frontend'); // For error handling

fileManip = {

    /**
     * Import image file. Allow user to select
     * image file using window dialog.
     * 
     * @param {Function} callback
     */
    importImage: function(callback) {
        // Begin file dialog
        dialog.showOpenDialog({
            // Set specific file types
            filters: [{
                name: 'Image File (*.png, *.jpeg, *.gif, *.bmp)', extensions: ['png', 'jpeg', 'gif', 'bmp']
            }]
        }, fileNames => {
            // No files selected
            if(fileNames === undefined) {
                callback({ err: 'No files were selected!' }); // Return with error object
                return;
            }
            // Files selected
            callback(fileNames[0]);
        });
    },

    /**
     * Import level file. Allow user to select
     * .lvl file using window dialog.
     * 
     * @param {Function} callback 
     */
    importLevel: function(callback) {
        // Begin file dialog
        dialog.showOpenDialog({
            // Set specific file types
            filters: [{
                name: 'Level File (*.lvl)', extensions: ['lvl']
            }]
        }, fileNames => {
            // No files selected
            if(fileNames === undefined) {
                callback({ err: 'No files were selected!' }); // Return with error object
                return;
            }
            // Files selected
            callback(fileNames[0]);
        });
    },

    /**
     * Get the level array from the imported
     * .lvl file.
     * 
     * @param {String} path 
     * @param {Function} callback 
     */
    getLevelFromFile: function(path, callback) {
        fs.readFile(path, 'utf8', (err, data) => {
            if(err) { // Error
                console.error(err);
                return;
            } else {
                // Convert data to array of rows
                let dataArray = data.split('\n'); // Get each row in file 
                let json = JSON.parse(dataArray.pop()); // Get image path obj
                let lvlArray = [];
                dataArray.forEach(line => {
                    let stringTileRow = line.split(' '); // Get each tile
                    stringTileRow.pop(); // Remove blank line
                    let numberTileRow = stringTileRow.map(Number); // Convert each element to Number type
                    lvlArray.push(numberTileRow) // Push to array
                });
                // Level imported
                callback(lvlArray, json);
            }
        });
    },

    /**
     * Export the created level as a .lvl
     * file.
     * 
     * @param {Function} callback 
     */
    exportLevel: function(callback) {
        dialog.showSaveDialog({
            filters: [{
                name: 'Level File (*.lvl)', extensions: ['lvl']
            }]
        }, (fileName) => {
            let writeStream = fs.createWriteStream(fileName);
            writeStream.once('open', fd => {
                let imageObj = storage.get.object('tilemap');
                let level = storage.get.level().level;
                for(let i = 0; i < level.length; i++) {
                    let row = '';
                    for(let j = 0; j < level[i].length; j++) {
                        row += level[i][j] + ' ';
                    }
                    writeStream.write(row + '\r\n');
                }

                writeStream.write('{ "image_path": "' + imageObj.image_path.replace(/\\/g, '\\\\') + '" }'); // JSON obj image path
                writeStream.end();
            });
        });
    },

    /**
     * Break an imported image down into the 
     * appropriate tile sets.
     * Get image details: 
     *  dimensions
     *  tile resolution
     *  tile count
     *  tile image paths
     * 
     * @param {String} imgPath
     * @param {Function} callback
     */
    getImageTiles: function(imgPath, callback) {
        // Description of image
        let _dimensions = { width: 0, height: 0 }; // Tilemap image dimensions
        let _tileRes = 0; // Tilemap resolution (16x16, 64x64, etc.)
        let _tileCount = 0; // Amount of tiles to crop
        let _tilePaths = []; // Each temporary path to the tile images

        // Edit image
        jimp.read(imgPath)
            .then(image => {
                // Get dimensions
                _dimensions.height = image.bitmap.height;
                _dimensions.width = image.bitmap.width;
                // Get res
                _tileRes = image.bitmap.height;
                // Get tile count
                _tileCount = _dimensions.width / _dimensions.height;
                
                // Clone images tile count times
                let crops = [];
                for(let i = 0; i < _tileCount; i++) {
                    crops.push(image.clone());
                }
                // Crop each image and store it
                let tempPath = '';
                let tilePath = '';
                crops.forEach((tile, i) => {
                    // Generate path to tile image
                    tempPath = './temp/' + i + '.' + tile.getExtension();
                    tilePath = path.join(__dirname, '../../' + tempPath);
                    _tilePaths.push(tilePath);
                    // Crop images to creat tile image
                    tile.crop((i * _tileRes), 0, _tileRes, _tileRes)
                        .write(tempPath, () => {
                            // Complete
                            if(i === (crops.length - 1)) {
                                callback({ // Return an object with
                                    dimensions: _dimensions,    // Original tilemap image dimensions
                                    tile_count: _tileCount,     // Amount of tiles generated
                                    tile_resolution: _tileRes + 'x' + _tileRes,  // Each tile resolution
                                    tile_paths: _tilePaths,      // Each tile image path
                                    image_path: imgPath
                                });
                            }
                        });
                });
            })
            .catch(err => {
                window.alert(err);
                console.error('Error editing image! ', err);
            })
    }
};
module.exports = fileManip;