const consts = {
    aiData: {
        centreSiblings: [
            [1,0,2],
            [3,0,6],
            [5,2,8],
            [7,6,8]
        ],
        checks: ['110','101','011'],
        dangerousLines: [
            ['o48','26'],
            ['o46','08'],
            ['04o','26'],
            ['24o','08']
        ],
        diagonalPositions: [0,2,6,8],
        diagonalSiblings: [
            [0,1,3], [2,1,5], [6,3,7], [8,7,5]
        ],
        diagonalsOnly: [[0,4,8],[2,4,6]],
        drawPositions: [1,3,5,7],
        playerWinPositions: [ 
            // first 2 positions are taken by the player.
            // The 3rd position is where the CPU will drop their piece to allow the player to win
            [0,5,6], [0,7,2], [2,3,8], [2,7,0], [6,2,8], [6,5,0], [8,1,6], [8,3,2]
        ],
        positionsL: [
            [0,1,2,5],
            [1,2,5,8],
            [2,5,8,7],
            [5,8,7,6],
            [8,7,6,3],
            [7,6,3,0],
            [6,3,0,1],
            [3,0,1,2]
        ]
    },

    console: {
        important: 'font-size: 16px; color: yellow; background-color: #911; font-weight: bold;',
        importantish: 'font-size: 14px; color: yellow; background-color: #911;',
    },

    depths: {
        stars: [1,2,3],
        UI: 20, gamePiece: 15, boardPiece: 10, windowPiece: 5
    },

    pieces: { o: 0, x: 1 },

    solutions:[
        [0,1,2], [3,4,5], [6,7,8], // rows
        [0,3,6], [1,4,7], [2,5,8], // cols
        [0,4,8], [2,4,6] // diags
    ],

    tints: {
        yellow: 0xffff00, red: 0xff0000, green: 0x00ff00, blue: 0x0000ff,
        black: 0x000000, greyLight: 0xbbbbbb, greyMedium: 0x888888, greyDark: 0x444444,
        glassWindow: 0x260066
    },

    //wins : [7,56,73,84,146,273,292,448]
}