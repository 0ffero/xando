var vars = {
    DEBUG: true,

    version: 0.7,

    init: function() {
        vars.game.availablePositions = Phaser.Utils.Array.NumberArray(0,8);
        vars.game.usedPositions = [];
    },

    // ENGINE FUNCTIONS
    canvas: {
        width: 1920, height: 1080,
        cX: 1920/2, cY: 1080/2,
    },

    durations: {
        xodrop: 250,
    },

    files: {
        audio: {
            load: function() {
                scene.load.audio('pieceDrop', 'audio/pieceDrop.ogg');
                scene.load.audio('glassCrack1', 'audio/glassCrack.ogg');
                scene.load.audio('glassCrack2', 'audio/glassCrack2.ogg');
                scene.load.audio('glassBreak', 'audio/glassBreak.ogg');
            }
        },

        images: {
            init: function() {
                scene.load.image('block', 'images/block.png');
                scene.load.spritesheet('xopieces', 'images/xo.png', { frameWidth: 122, frameHeight: 104})
                scene.load.image('brokenGlass', 'images/glassBreak.png');
                scene.load.image('whitePixel', 'images/whitePixel.png');
                scene.load.image('star', 'images/parallaxStar.png');
            }
        },

        loadAssets: function() {
            let fV = vars.files;
            fV.audio.load();
            fV.images.init();
        }
    },

    groups: {
        init: function() {
            scene.groups = { };
            scene.groups.windows     = scene.add.group().setName('windowsGroup');
            scene.groups.brokenGlass = scene.add.group().setName('brokenGlassGroup');
            scene.groups.board       = scene.add.group().setName('boardGroup');
            scene.groups.pieces      = scene.add.group().setName('piecesGroup');
            scene.groups.score       = scene.add.group().setName('scoreGroup');
        }
    },

    localStorage: {
        init: function() {
            let lS = window.localStorage;
            if (lS.xando_scores===undefined) { 
                lS.xando_scores = '0,0,0'; // x wins, o wins, draws
            } else {
                let scores = lS.xando_scores.split(',');
                vars.player.oWins = scores[0]; vars.player.xWins = scores[1]; vars.player.draws = scores[2];
            }
        },
    
        resetScores: function() {
            let lS = window.localStorage;
            lS.xando_scores = '0,0,0';
        },

        saveScores: function() {
            let lS = window.localStorage; let pV = vars.player;
            let oScore = pV.oWins; let xScore = pV.xWins; let draws = pV.draws;
            lS.xando_scores = oScore + ',' + xScore + ',' + draws;
        }
    },

    // GAME

    ai: {

    },

    animate: {
        dropPiece: function(_position) {
            let currentPiece = vars.player.currentPiece;
            let frame = consts.pieces[currentPiece];
            _position.setData({ 'clicked': true, piece: frame });
            let windowPosition = _position.getData('position');
            scene.children.getByName('window_' + windowPosition).setData({ 'clicked': true, piece: frame })
            vars.game.swapPieces();

            vars.audio.playSound('pieceDrop');
            let positionID = _position.getData('position');
            let duration = vars.durations.xodrop;
            let piece = scene.add.image(_position.x, _position.y, 'xopieces', frame).setScale(6).setName('piece_' + positionID).setData('piece', currentPiece).setDepth(consts.depths.gamePiece);
            scene.groups.pieces.add(piece);
            let oC = vars.game.createGlassBreak;
            let oCParams = [_position.x, _position.y];
            scene.tweens.add({ targets: piece, scale: 1, duration: duration, ease: 'Quad.easeIn', onComplete: oC, onCompleteParams: oCParams })
        }
    },

    audio: {
        init: function() {
            scene.sound.volume=0.2;
        },

        playGlassCrack: function() {
            let rndSound = Phaser.Math.RND.integerInRange(1,2);
            vars.camera.shake();
            vars.audio.playSound('glassCrack' + rndSound);
        },

        playSound: function(_key) {
            scene.sound.play(_key);
        },
    },

    camera: {
        mainCam: null,

        init: function() {
            vars.camera.mainCam = scene.cameras.main;
        },

        shake: function() {
            vars.camera.mainCam.shake(50);
        }
    },

    game: {
        availablePositions: [],
        usedPositions: [],

        init: function() {
            let x = 180; let y=180; let xyInc=360;
            for (let p=0; p<9; p++) {
                if (p%3===0 && p>0) { y += xyInc; x = 180; }
                // create the window first
                let windowGlass = scene.add.image(x,y,'whitePixel').setName('window_' + p).setData({ 'position': p, 'clicked': false, 'piece': -1 }).setScale(238).setTint(consts.tints.glassWindow).setAlpha(0.97).setDepth(consts.depths.windowPiece);
                scene.groups.windows.add(windowGlass);
                // then the board position
                let position = scene.add.image(x,y,'block').setName('block_' + p).setData({ 'position': p, 'clicked': false, 'piece': -1 }).setDepth(consts.depths.boardPiece).setInteractive();
                scene.groups.board.add(position);
                x+=xyInc;
            }
        },

        buildWinArray: function() {
            let winArray = [];
            let solutions = consts.solutions;
            solutions.forEach( (lines)=>{
                //console.log('New check');
                let tempStr = '';
                lines.forEach( (val)=> {
                    let posPiece = scene.children.getByName('block_' + val).getData('piece');
                    if (posPiece!==-1) { tempStr+=posPiece.toString(); }
                })
                winArray.push(tempStr);
            })
            return winArray;
        },

        checkForDangerousLines: function() {
            // search for xxo, xox and oxx
            // this code should be done after checking for oWin
            // because the player can force a win if we pick the wrong position
            let ai = consts.aiData;
            let dangerousLineCounter = ai.dangerousLines;
            let tArray = ai.diagonalsOnly;
            let checks = ai.checks;
            let lines = []
            tArray.forEach( (c,index)=> {
                let tempStr = '';
                c.forEach( (c)=> {
                    let piece = scene.children.getByName('block_' + c).getData('piece');
                    if (piece!==-1) {
                        tempStr+=piece.toString();
                    }
                })
                lines.push([tempStr,c.toString().replaceAll(',','')]);
            })

            let found=false;
            lines.forEach( (c,index)=> {
                if (found===false) {
                    let tempStr = '';
                    if (checks.includes(c[0])) {
                        console.log('%cWe found a dangerous line. Block it',consts.console.important);
                        //console.log('Line Data: ' + c[0] + '. Positions: ' + c[1]);
                        let lineData = c[0].split('');
                        let positions = c[1].split('');
                        lineData.forEach( (piece,idx)=> {
                            if (parseInt(piece)===consts.pieces.o) {
                                tempStr+='o';
                            } else {
                                tempStr+=positions[idx];
                            }
                        })
                        found=tempStr;
                    }
                }
            })

            let selectedIndex = false;
            dangerousLineCounter.forEach( (c)=> {
                if (found===c[0]) {
                    console.log('Weve found the counter to this dangerous line\nReturning a counter position');
                    selectedIndex = Phaser.Math.RND.pick(c[1].split(''));
                }
            })
            return selectedIndex;
        },

        checkForLPattern: function() {
            let lPos = consts.aiData.positionsL;
            let returnVar = false;
            lPos.forEach( (p)=> {
                if (returnVar === false) {
                    let pieces = '';
                    let empties = '';
                    p.forEach( (c)=>{
                        let block = scene.children.getByName('block_' + c);
                        let piece = block.getData('piece');
                        if (piece!==-1) {
                            pieces+=piece.toString();
                        } else {
                            // add to empties in case L is found
                            empties+=c.toString();
                        }
                    })
                    if (pieces==='11') { // weve found an L with no blocker
                        // pick one of the empty positions in lPos
                        let positions = empties.split('');
                        returnVar = Phaser.Math.RND.pick(positions);
                    }
                }
            })
            return returnVar;
        },

        checkForWin(_move) {
            let winArray = vars.game.buildWinArray();
            let oxWin = false;
            winArray.forEach( (line, index)=> {
                if (oxWin===false) {
                    if (line==='000') { // O Win
                        vars.player.oWins++; vars.player.winnerFound = oxWin = true; vars.player.win('o', index);
                    } else if (line==='111') { // X Win
                        vars.player.xWins++; vars.player.winnerFound = oxWin = true; vars.player.win('x', index);
                    }
                }
            })

            if (_move===9 && oxWin===false) { // the board is full and no-one has won, ie reset
                vars.game.destroyAllThePieces();
            }
        },

        createGlassBreak: function(_tween, _object, _x, _y) {
            let imageWidth = 400;
            let windowWidth = 238;
            let windowDiameter = 337;
            let diff = imageWidth - windowDiameter;
            let x = Phaser.Math.RND.between(0,diff);
            let y = Phaser.Math.RND.between(0,diff);

            // now grab that piece of the image
            let glassBroken = scene.add.image(_x,_y,'brokenGlass').setCrop(x,y,windowDiameter,windowDiameter).setDepth(consts.depths.windowPiece+1);
            scene.groups.brokenGlass.add(glassBroken);
            let rotation = Phaser.Math.Angle.Random();
            // now rotate the image
            glassBroken.setRotation(rotation);
            // should be flip it?

            // and crop
            let cropXY = windowDiameter-windowWidth;
            glassBroken.setCrop(cropXY, cropXY, windowWidth, windowWidth);

            vars.audio.playGlassCrack();
        },

        destroyLosingPieces: function(_tween, _object, _loser) {
            vars.audio.playSound('glassBreak');
            // first find all windows with the losers piece sitting on it
            scene.groups.windows.children.each( (target)=> {
                if (target.getData('piece')===_loser) {
                    target.setAlpha(0);
                }
            })

            let first = true;
            scene.groups.pieces.children.each( (target)=> {
                let oC = null;
                if (target.frame.name===_loser) {
                    if (first===true) { first=false; oC = vars.game.restart; }
                    scene.tweens.add({ targets: target, delay: 250, scale: 0, duration: 1000, onComplete: oC })
                }
            })
        },

        dropPlayerPiece: function(_position) {
            let posID = _position.getData('position');
            // first, we need to remove this position from the available positions
            let usedPositions = vars.game.usedPositions;
            let availablePositions = vars.game.availablePositions;
            let found=-1;
            availablePositions.find( (c,index)=> {
                if (c===posID) {
                    // push it to used array
                    usedPositions.push(c);
                    found=index;
                }
            })

            if (found!==-1) {
                //remove this index from the available array
                availablePositions.splice(found,1);
                let pV = vars.player;
                pV.move++;
                vars.animate.dropPiece(_position);
                if (pV.move>=5) { vars.game.checkForWin(pV.move); }
            } else {
                console.error('Something went wrong!!!\nThe player tried to drop a piece on to position ' + _position + '.\nBut, this position isnt in Available Positions array!');
            }
        },

        destroyAllThePieces: function() { // ITS A DRAW
            //vars.UI.removeCrackedGlass();

            vars.audio.playSound('glassBreak');
            vars.localStorage.saveScores();

            // update the UI scores
            let scoreNum = scene.children.getByName('drawsInt');
            vars.player.draws++;
            scene.tweens.add({ targets: scoreNum, scale: 1.5, duration: 250, ease: 'Quad.easeOut', yoyo: true, onYoyo: vars.UI.updateScoresDraw })

            scene.groups.windows.children.each( (target)=> { target.setAlpha(0); })
            setTimeout( ()=> {
                scene.groups.brokenGlass.children.each( (c)=> { c.setAlpha(0); })
            },500)


            // now animate all the pieces (as no-one won)
            let first=true;
            scene.groups.pieces.children.each( (c)=> {
                let oC = null; if (first===true) { first=false; oC = vars.game.restart; }
                c.setTint(consts.tints.red);
                scene.tweens.add({ targets: c, delay: 500, scale: 0, duration: 1000, onComplete: oC })
            })
        },

        restart: function() {
            console.clear();
            console.log('%c**********************\n***    NEW GAME    ***\n**********************', consts.console.important);
            // init all vars
            vars.init();
            // clear the board
            scene.groups.board.children.each( (c)=> { c.setData({ clicked: false, piece: -1 }) })
            // remove the pieces
            scene.groups.pieces.children.each( (c)=> { c.destroy(); })
            vars.UI.removeCrackedGlass();
            // destroy any black holes created for the losers pieces
            //let first = true;
            scene.groups.windows.children.each( (w) => {
                // let oC = null; if (first===true) { first = false; oC=vars.input.enable; }
                w.setTint(consts.tints.glassWindow).setData({ piece: -1, clicked: false });
                scene.tweens.add({ targets: w, alpha: 0.97, duration: 500 })
            })

            // re-enable input
            scene.input.enabled=true;

            let pV = vars.player;
            pV.winnerFound=false;
            pV.move=0;

            if (pV.currentPiece==='o') {
                setTimeout( ()=> { vars.ai.choosePosition(); }, 500)
            }
        },

        swapPieces: function() {
            let pV = vars.player;
            pV.currentPiece = pV.currentPiece === 'x' ? 'o' : 'x';
            if (pV.currentPiece==='o' && pV.move<9 && pV.winnerFound===false) {
                scene.input.enabled=false;
                setTimeout(()=>{ vars.ai.choosePosition(); },500)
            } else {
                scene.input.enabled=true;
            }
        }
    },

    input: {
        init: function() {
            scene.input.on('gameobjectdown', function (pointer, position) {
                if (position.getData('clicked') === false) { vars.game.dropPlayerPiece(position); }
            })
        },
    },

    particles: {
        init: function() {
            scene.particles = {}
            // PARALLAX STARS
            scene.particles.stars = scene.add.particles('star');
            //scene.particles.rain = scene.add.particles('flares');
            let square = new Phaser.Geom.Rectangle(-50, -100, vars.canvas.width+100, vars.canvas.height+200);

            // Front Layer
            scene.particles.stars.createEmitter({ x: -32, y: { min: 2, max: vars.canvas.height-3 }, speedX: { min: 580, max: 620}, lifespan: 10000, blendMode: 'ADD', quantity: 1, frequency: 10, deathZone: { type: 'onLeave', source: square } });
            // Middle Layer
            scene.particles.stars.createEmitter({ x: -32, y: { min: 2, max: vars.canvas.height-3 }, speedX: { min: 380, max: 420}, scaleX: 2/3, alpha: 2/3, lifespan: 10000, blendMode: 'ADD', quantity: 1, frequency: 10, deathZone: { type: 'onLeave', source: square } });
            // back Layer
            scene.particles.stars.createEmitter({ x: -32, y: { min: 2, max: vars.canvas.height-3 }, speedX: { min: 180, max: 220}, alpha: 1/3, scaleX: 1/3, lifespan: 10000, blendMode: 'ADD', quantity: 1, frequency: 10, deathZone: { type: 'onLeave', source: square } });

            // create the stars mask so we can fade them in
            let m = scene.add.image(vars.canvas.cX, vars.canvas.cY, 'whitePixel').setScale(vars.canvas.width, vars.canvas.height).setTint(consts.tints.black).setDepth(consts.depths.stars[2]+1);
            scene.tweens.add({
                targets: m,
                delay: 5000,
                duration: 10000,
                alpha: 0.1
            })
        }
    },

    player: {
        currentPiece: 'x',
        move: 0, oWins: 0, xWins: 0, draws: 0,
        winnerFound: false,

        lose: function(_tween, _object, _winner) {
            console.log('Winner was ' + _winner);
            let loser = _winner === 'o' ? 'x' : 'o';
            loser = consts.pieces[loser];
            console.log('Tweening the losing pieces colour to red...');
            let first = true;
            scene.groups.pieces.children.each( (target)=> {
                let oC = null;
                if (target.frame.name===loser) {
                    if (first===true) { first=false; oC = vars.game.destroyLosingPieces; }
                    scene.tweens.addCounter({
                        from: 0, to: 255, delay: 500, duration: 1000,
                        onUpdate: function (tween) { const value = Math.floor(tween.getValue()); target.setTint(Phaser.Display.Color.GetColor(255, 255-value, 255-value)); },
                        onComplete: oC, onCompleteParams: loser
                    });
                }
            })
        },

        win: function(_winner, winIndex) {
            // update the UI
            let scoreNum = _winner === 'x' ? scene.children.getByName('xWinInt') : scene.children.getByName('oWinInt');

            scene.tweens.add({
                targets: scoreNum,
                scale: 1.5,
                duration: 250,
                ease: 'Quad.easeOut',
                yoyo: true,
                onYoyo: vars.UI.updateScoresWin,
                onYoyoParams: _winner
            })

            // save the score
            vars.localStorage.saveScores();
            console.log('Tweening the winning pieces colour to green...');
            scene.input.enabled=false;
            // the last piece is currently falling, so we have to wait for it to fall into position (250ms)
            // change the winning pieces green
            let pieces = consts.solutions[winIndex];
            pieces.forEach( (c, index)=> {
                let target = scene.children.getByName('piece_' + c);
                let oC = null
                if (index===2) { oC = vars.player.lose; }
                scene.tweens.addCounter({
                    from: 0, to: 255, duration: 1000,
                    onUpdate: function (tween) { const value = Math.floor(tween.getValue()); target.setTint(Phaser.Display.Color.GetColor(255-value, 255, 255-value)); },
                    onComplete: oC, onCompleteParams: _winner
                });
            })
        }
    },

    UI: {
        init: function() {
            let pV = vars.player;
            let tints = consts.tints;
            let uiDepth = consts.depths.UI;
            graphics = scene.add.graphics();
            graphics.fillStyle(0x000000, 1);
            graphics.lineStyle(2, 0xBBBBBB, 1);
            graphics.fillRoundedRect(1100, 20, 795, 300, 16).setAlpha(0.75);
            graphics.strokeRoundedRect(1100, 20, 795, 300, 16).setAlpha(0.75);

            scene.add.text(1200, 100, 'For the love of god, let me win!').setFontSize(32).setTint(tints.yellow).setName('please').setInteractive().setAlpha(0).setScale(0.5).setDepth(uiDepth);

            let fontSize = 64;
            let textX = 1450;
            scene.add.text(textX, 90, 'PLAYER (X) Wins: ').setFontSize(fontSize).setTint(tints.yellow).setName('xWinText').setFontStyle('bold').setOrigin(0.5).setDepth(uiDepth);
            scene.add.text(textX, 170, '   CPU (O) Wins: ').setFontSize(fontSize).setTint(tints.yellow).setName('oWinText').setFontStyle('bold').setOrigin(0.5).setDepth(uiDepth);
            scene.add.text(textX, 250, '          Draws: ').setFontSize(fontSize).setTint(tints.yellow).setName('drawsText').setFontStyle('bold').setOrigin(0.5).setDepth(uiDepth);

            textX = 1820;
            scene.add.text(textX, 90, parseInt(pV.xWins)).setFontSize(fontSize).setTint(tints.white).setName('xWinInt').setFontStyle('bold').setOrigin(0.5).setDepth(uiDepth);
            scene.add.text(textX, 170, parseInt(pV.oWins)).setFontSize(fontSize).setTint(tints.white).setName('oWinInt').setFontStyle('bold').setOrigin(0.5).setDepth(uiDepth);
            scene.add.text(textX, 250, parseInt(pV.draws)).setFontSize(fontSize).setTint(tints.red).setName('drawsInt').setFontStyle('bold').setOrigin(0.5).setDepth(uiDepth);
        },

        removeCrackedGlass: function() {
            scene.groups.brokenGlass.children.each( (c)=> {
                c.setAlpha(0).destroy(); // NOTE. The destroy requires one tick to do its thing, so we set the alpha to 0
            })
        },

        showAllowMeToWin: function() {
            let please = scene.children.getByName('please');
            scene.tweens.add({ targets: please, alpha: 1, scale: 1, y: 40, duration: 3000 })
        },

        updateScoresDraw: function() {
            scene.children.getByName('drawsInt').setText(vars.player.draws);
        },

        updateScoresWin: function(_tween, _object, _winner) {
            _object.setText(vars.player[_winner + 'Wins']);
        }
    }

}