const storage = require('./storage');
module.exports = {

    /**
     * Display an imported file using the
     * file path.
     * 
     * @param {String} path 
     */
    showImportImage: function(path) {
        $('#img-import').remove();
        $('#container-import-image').append(
            '<img class="Image" id="img-import" src="' + path +'"/>'
        );
    },

    /**
     * Display the generated tiles and
     * image descriptions for the user to 
     * confirm they are correctly generated. 
     * 
     * @param {Object} imageObj 
     */
    showImageTiles: function(imageObj) {
        // Remove previous tile images & descriptions if any
        $('.Tile').remove();
        $('#container-image-description').remove();
        // Generate description of tilemap image
        $('#container-image-tiles').append(
            '<div class="Container Flex" id="container-image-description"> <p> Width: ' + imageObj.dimensions.width + ', Height: ' + imageObj.dimensions.height + ' </p>'+
            '<p> Tile Resolution: ' + imageObj.tile_resolution + ' </p>'+
            '<p> Tiles Created: ' + imageObj.tile_count + ' </p> </div>'
        );
        // Generate tile images
        imageObj.tile_paths.forEach((path, i) => {
            $('#container-image-tiles').append(
                '<img class="Image Tile" src="' + path + '?new=' + (i + Math.random()) + '"/>'
            );
        });
        // Allow the user to confirm
        $('#btn-confirm').removeClass('Hide');
        $('#btn-cancel').removeClass('Hide');
        $('#btn-import-level').addClass('Hide');
    },

    /**
     * Cancel import of image and show home
     * screen format.
     */
    cancelImport: function() {
        $('#img-import').remove();
        $('.Tile').remove();
        $('#container-image-description').remove();
        $('#btn-import-level').removeClass('Hide');
        $('#btn-confirm').addClass('Hide');
        $('#btn-cancel').addClass('Hide');
    },

    /**
     * Set the page to be visible to the user
     * by ID.
     * 
     * @param {String} id 
     */
    setPage(id) {
        $('.Page').addClass('Hide');
        $(id).removeClass('Hide');
    },

    /**
     * Set up the level edit page - show
     * the selectable tiles, and the level
     * grid for placing the tiles.
     * Default tile is the 0 tile.
     * 
     * @param {Object} imageObj 
     */
    setupLevelEditPage(imageObj) {
        console.log(imageObj);
        // For each tile path
        generateTileSelections(imageObj);
        // Select 0 tile as default selected
        setSelected(0, imageObj.tile_paths[0]);
        // Listen for tile selection
        listenForTileSelection(imageObj);
        // Save imageObj
        storage.save.object('image_object', imageObj);
        // Generate level edit 10x10 default
        storage.create.level(10, 10);
        generateLevelEditor(10, 10);
        // Listen for tile placement
        listenForTilePlacement();
    },

    /**
     * Set up the level edit page - show
     * the selectable tiles, and the level
     * grid for placing the tiles.
     * Default tile is the 0 tile.
     * 
     * @param {Object} imageObj 
     */
    setupImportedLevelEditPage(imageObj, lvlArray) {
        // For each tile path
        generateTileSelections(imageObj);
        // Select 0 tile as default selected
        setSelected(0, imageObj.tile_paths[0]);
        // Listen for tile selection
        listenForTileSelection(imageObj);
        // Generate level editor
        generateLevelEditor(lvlArray.length, lvlArray[0].length);
        // Listen for tile placement
        listenForTilePlacement();
    },

    updateLevelEditPage(row, column) {
        // Generate level edit
        storage.update.level(row, column);
        generateLevelEditor(row, column);
        // Listen for tile placement
        listenForTilePlacement();
    }
};






/**
 * Listen for tile selection click.
 * 
 * @param {Object} imageObj 
 */
function listenForTileSelection(imageObj) {
    $('.Container.Select').on('click', event => {
        setSelected(event.currentTarget.id, imageObj.tile_paths[event.currentTarget.id]);
    });
}

/**
 * Handle tile placement / hover
 */
function listenForTilePlacement() {
    // Show image on hover
    $('.Placeable').hover(event => { // On mouseenter
        // Get path
        let path = storage.get.object('selectedTilePath');
        // Check that an image has not been placed
        if($('#' + event.currentTarget.id).has('img').length === 0) {
            $('#' + event.currentTarget.id).append(
                '<img class="Image Hover" src="' + path.selected_path + '" />'
            );
        }
    }, event => { // On mouseleave
        // Check that the image is a hover image
        if($('#' + event.currentTarget.id + ' img').hasClass('Hover')) {
            $('#' + event.currentTarget.id + ' img').remove();
        }
    })

    // Place image on click
    $('.Placeable').on('click', event => {
        // Get path
        let path = storage.get.object('selectedTilePath');
        // Check for deletion
        let selectedImgPath = $('.Selected img').prop('src');
        let placedImgPath = $('#' + event.currentTarget.id + ' img.Placed').prop('src');
        if(selectedImgPath === placedImgPath) { // Delete img
            $('#' + event.currentTarget.id + ' img').remove();
            removeTileAtPositionById(event.currentTarget.id);
            return;
        }
        // Remove hover image
        $('#' + event.currentTarget.id + ' img').remove();
        // Place image
        saveTileAtPositionById(event.currentTarget.id);
        placeTileAtPositionById(event.currentTarget.id, path)
    });
}

/**
 * Set the tile image in the element by
 * id.
 * 
 * @param {Number} id 
 * @param {String} path 
 */
function placeTileAtPositionById(id, path) {
    $('#' + id).append(
        '<img class="Image Placed" src="' + path.selected_path + '" />'
    );
}

/**
 * Save a tile in the level array
 * by the element id of the tile
 * clicked.
 * 
 * @param {String} id 
 */
function saveTileAtPositionById(id) {
    // Get selected tile
    let path = storage.get.object('selectedTilePath').selected_path.split('\\').pop();
    let tile = Number(path.split('.').shift());
    // Get row / column
    let pos = getRowColumnById(id);
    // Save the tile to the row, col position
    storage.save.tile(pos.row, pos.col, tile);
}

/**
 * Remove a tile in the level array
 * by the element id of the tile
 * clicked.
 * 
 * @param {String} id 
 */
function removeTileAtPositionById(id) {
    let pos = getRowColumnById(id);
    storage.remove.tile(pos.row, pos.col);
}

/**
 * Return an object containing the
 * row / column.
 * 
 * @param {Number} id 
 */
function getRowColumnById(id) {
    let idArry = id.split('-');
    let col = idArry.pop(); // Pop off the column
    let row = idArry.pop(); // Pop off the row
    return { col, row };
}

/**
 * Generate the level editor with specified
 * rows and columns count (level dimensions).
 * 
 * @param {Number} rows 
 * @param {Number} columns 
 */
function generateLevelEditor(rows, columns) {
    // Reset rows / columns
    $('.Row').remove();
    for(let i = 0; i < rows; i++) {
        // Row container
        $('#container-edit-level').append(
            '<div class="Row" id="row-' + i + '">'+
            '</div>'
        );
        for(let j = 0; j < columns; j++) {
            $('#row-' + i).append(
                '<div class="Placeable" id="tile-' + i + '-' + j + '">'+
                '   '+
                '</div>'
            );
        }
    }
    // Place previous tiles
    let level = storage.get.level().level;
    let paths = storage.get.object('image_object').tile_paths;
    for(let i = 0; i < level.length; i++) {
        for(let j = 0; j < level[i].length; j++) {
            if(level[i][j] !== 0) {
                setSelected(level[i][j], paths[level[i][j]]);
                placeTileAtPositionById('tile-' + i + '-' + j, storage.get.object('selectedTilePath'));
            }
        }
    }
    // Set correct values in text box
    $('#input-dimensions-row').val(rows);
    $('#input-dimensions-column').val(columns);
}

/**
 * Generate the tiles that can be selected.
 * 
 * @param {Object} imageObj 
 */
function generateTileSelections(imageObj) {
    $('.Container.Select').remove();
    imageObj.tile_paths.forEach((path, i) => {
        $('#container-select-tiles').append(
            '<div class="Container Select" id="' + i + '">'+
            '   <p> ' + i + ' </p>'+
            '   <div id="select-tile-' + i + '"><img class="Image Tile Small Selectable" src="' + path +'" /></div>'+
            '</div>'
        );
    });
}

/**
 * Set the selected tile.
 * 
 * @param {Number} id 
 */
function setSelected(id, path) {
    $('.Container.Select').removeClass('Selected');
    $('.Container.Select#' + id).addClass('Selected');
    storage.save.object('selectedTilePath', { selected_path: path });
}