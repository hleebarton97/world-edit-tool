// localStorage API
const storage = {

    // locStorage.setItem
    save: {

        /**
         * Use localStorage to store an object.
         * 
         * @param {String} name 
         * @param {Object} dataObj
         */
        object: function(name, dataObj) {
            localStorage.setItem(name, JSON.stringify(dataObj))
        },

        /**
         * Use localStorage to store a string.
         * 
         * @param {String} name 
         * @param {String} dataString 
         */
        string: function(name, dataString) {
            localStorage.setItem(name, JSON.stringify(dataString));
        },

        /**
         * Use localStorage to save the edited
         * level.
         * 
         * @param {*} array 
         */
        level: function(array) {
            // Save array in object
            storage.save.object('level', {
                level: array
            });
        },

        /**
         * Save tile to the level array.
         * 
         * @param {Number} row 
         * @param {Number} column
         * @param {Number} tile
         */
        tile: function(row, column, tile) {
            // Get level array
            let level = storage.get.level().level;
            // Set the tile
            level[row][column] = tile;
            // Save the edited level
            storage.save.level(level);
            console.log(level);
        }


    },

    // Create (level editor)
    create: {

        /**
         * User localStorage to create and store 
         * the level array and object.
         * 
         * @param {Number} rows 
         * @param {Number} columns 
         */
        level: function(rows, columns) {
            // Generate level array
            let array = new Array(rows);
            for(let i = 0; i < rows; i++) {
                array[i] = new Array(columns);
            }
            // Set empty level (All tiles 0)
            for(let i = 0; i < rows; i++) {
                for(let j = 0; j < columns; j++) {
                    array[i][j] = 0;
                }
            }
            // Save array in object
            storage.save.object('level', {
                level: array
            });
        }
    },

    // Update (level editor)
    update: {

        /**
         * 
         * @param {Number} rows 
         * @param {Number} columns 
         */
        level: function(rows, columns) {
            // Get current level state
            let level = storage.get.level().level;
            // Remove rows from top if rows are less
            // Add rows to the top if rows are more
            if(rows < level.length) {
                let deleteCount = level.length - rows;
                for(let i = 0; i < deleteCount; i++) {
                    level.shift();
                }
            } else if(rows > level.length) {
                let addCount = rows - level.length;
                for(let i = 0; i < addCount; i++) {
                    level.unshift([]);
                    for(let j = 0; j < level[level.length - 1].length; j++) {
                        level[0].push(0);
                    }
                }
            }
            // Generate level array
            let array = new Array(rows);
            for(let i = 0; i < rows; i++) {
                array[i] = new Array(columns);
            }
            // Set empty level with previous selected tiles
            for(let i = 0; i < rows; i++) {
                for(let j = 0; j < columns; j++) {
                    if(i < level.length) { // Within previous row dimension
                        if(j < level[i].length) { // Within previous column dimension
                            if(level[i][j] !== 0) { // Previous value exists
                                array[i][j] = level[i][j]
                            } else {
                                array[i][j] = 0;
                            }
                        } else {
                            array[i][j] = 0;
                        }
                    } else {
                        array[i][j] = 0;
                    }
                }
            }
            console.log(level);
            console.log(array);
            // Save array in object
            storage.save.object('level', {
                level: array
            });
        }
    },

    // localStorage.getItem
    get: {

        /**
         * Get an object from localStorage by
         * name.
         * 
         * @param {String} name 
         */
        object: function(name) {
            return JSON.parse(localStorage.getItem(name));
        },

        /**
         * Get a string from localStorage by
         * name.
         * 
         * @param {String} name 
         */
        string: function(name) {
            return localStorage.getItem(name);
        },

        /**
         * Get the level array from localStorage.
         */
        level: function() {
            return JSON.parse(localStorage.getItem('level'));
        }
    },

    remove: {

        /**
         * Remove a tile from the level
         * (replace with default tile 0).
         * 
         * @param {Number} row 
         * @param {Number} column 
         */
        tile: function(row, column) {
            // Get level array
            let level = storage.get.level().level;
            // Set the tile to default
            level[row][column] = 0;
            // Save the edited level
            storage.save.level(level);
            console.log(level);
        }
    },

    /**
     * Delete an item in localStorage by
     * name.
     * 
     * @param {String} name 
     */
    delete: function(name) {
        localStorage.removeItem(name);
    }
};
module.exports = storage;