if (vars.DEBUG===true) { console.log('Initialising...'); }

var config = {
    title: "XANDO",
    type: Phaser.WEBGL,

    backgroundColor: '#000000',
    disableContextMenu: true,

    height: vars.canvas.height,
    width: vars.canvas.width,
    parent: 'XANDO',

    dom: {
        createContainer: true
    },

    scale: {
        parent: 'XANDO',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: vars.canvas.width,
        height: vars.canvas.height,
    },

    scene: {
        preload: preload,
        create: create,
    }
};

var game = new Phaser.Game(config);


/*
█████ ████  █████ █      ███  █████ ████  
█   █ █   █ █     █     █   █ █   █ █   █ 
█████ ████  ████  █     █   █ █████ █   █ 
█     █   █ █     █     █   █ █   █ █   █ 
█     █   █ █████ █████  ███  █   █ ████  
*/
function preload() {
    scene = this;
    scene.load.setPath('assets');

    vars.files.loadAssets();
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {

    // INITIALISE VARIABLES, OBJECTS & ARRAYS
    vars.init();

    vars.groups.init();

    vars.audio.init();

    vars.localStorage.init();

    // INIT THE CAMERA
    vars.camera.init();

    // DRAW THE BACKGROUND STARS
    vars.particles.init();

    // DRAW GAME BOARD
    vars.game.init();
    // INPUT
    vars.input.init();

    // UI
    vars.UI.init();
}