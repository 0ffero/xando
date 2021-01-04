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
        pack: {
            files: [
                { type: 'image', key: 'loadingImage', url: 'assets/images/mainScreen.png' }
            ]
        }
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
var startTime = new Date();
function preload() {
    scene = this;
    scene.add.image(vars.canvas.cX, vars.canvas.cY, 'loadingImage').setName('loadingImage').setDepth(100);
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
    let endTime = new Date();
    let totalTime = endTime - startTime;

    // INITIALISE VARIABLES, OBJECTS & ARRAYS
    vars.init();
    vars.groups.init();
    vars.audio.init();
    vars.localStorage.init();
    // INIT THE CAMERA
    vars.camera.init();
    // DRAW THE BACKGROUND STARS
    vars.particles.init();

    if (totalTime < 3000) {
        setTimeout( ()=> {
            init();
        }, 3000-totalTime);
    } else {
        init();
    }
}




function init() {
    scene.children.getByName('loadingImage').destroy();
    // DRAW GAME BOARD
    vars.game.init();
    // INPUT
    vars.input.init();
    // UI
    vars.UI.init();
}