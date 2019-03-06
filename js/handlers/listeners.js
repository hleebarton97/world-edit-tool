const storage = require('./storage');
module.exports = (fileManip, frontend) => {

    /**
     * Button to import an image. On click
     * allow the user to select an image file
     * to import.
     * 
     * @event {onClick}
     */
    $('#btn-import-image').on('click', () => {
        // Import a user selected image
        fileManip.importImage(path => {
            if(path.err) { // Error
                console.error('No files were selected!');
                return;
            }
            frontend.showImportImage(path); // Show imported image
            fileManip.getImageTiles(path, imageObj => { // Get tilemap tiles
                console.log(imageObj);
                storage.save.object('tilemap', imageObj); // Save image object
                frontend.showImageTiles(imageObj);
            }); 
        });
    });

    $('#btn-import-level').on('click', () => {
        fileManip.importLevel(path => {
            if(path.err) { // Error
                console.error('No files were selected!');
                return;
            }
            fileManip.getLevelFromFile(path, (lvlArray, json) => {
                storage.save.level(lvlArray); // Save level array
                fileManip.getImageTiles(json.image_path, imageObj => { // Get tilemap tiles
                    storage.save.object('tilemap', imageObj); // Save image object
                    frontend.setPage('#page-edit');
                    frontend.setupImportedLevelEditPage(imageObj, lvlArray);
                });
            });
        });
    });

    /**
     * Button to confirm the imported image.
     * 
     * @event {onClick}
     */
    $('#btn-confirm').on('click', () => {
        frontend.setPage('#page-edit');
        frontend.setupLevelEditPage(storage.get.object('tilemap'));
    });

    /**
     * Button to cancel import and return 
     * to home page.
     * 
     * @event {onClick}
     */
    $('#btn-cancel').on('click', () => {
        frontend.cancelImport();
    });

    /**
     * Button to cancel import and return 
     * to home page.
     * 
     * @event {onClick}
     */
    $('#btn-back').on('click', () => {
        frontend.setPage('#page-import');
    });

    /**
     * Button to export level. 
     * 
     * @event {onClick}
     */
    $('#btn-export').on('click', () => {
        fileManip.exportLevel();
    });

    /**
     * Update level dimensions (row) on change.
     * 
     * @event {onDhange}
     */
    $('#input-dimensions-row').on('change', () => {
        let row = $('#input-dimensions-row').val();
        let column = $('#input-dimensions-column').val();
        console.log(row, column);
        storage.update.level(row, column);
        frontend.updateLevelEditPage(row, column);
    });

    /**
     * Update level dimensions (column) on change.
     * 
     * @event {onChange}
     */
    $('#input-dimensions-column').on('change', () => {
        let row = $('#input-dimensions-row').val();
        let column = $('#input-dimensions-column').val();
        console.log(row, column);
        storage.update.level(row, column);
        frontend.updateLevelEditPage(row, column);
    });
};