vars.ai.choosePosition = function() {
    let gV = vars.game;
    // its the CPU's shot, disable input
    scene.input.enabled=false;

    let aiData = consts.aiData;
    let usedPositions = gV.usedPositions;
    let availablePositions = gV.availablePositions;

    // force CPUs turn
    let current = 'x';
    let next = current === 'x' ? 'o' : 'x';

    let cpu=false;
    if (next==='o') { console.log('%cCPU\'s shot',consts.console.importantish); cpu=true; }

    let moveFound=false;
    let centreID = 4
    if (availablePositions.includes(centreID)) { // CENTRE SQAURE IS AVAILABLE, TAKE IT! (this is definitely move 0 or 1)
        console.log('%c  CPU takes middle square', consts.console.importantish);
        moveFound=true;
        let boardPiece = scene.children.getByName('block_4');
        vars.game.dropPlayerPiece(boardPiece);
    } else {
        // CENTRE SQUARE ISNT AVAILABLE
        // (basically the cpu takes the centre square or does this)

        // ok, so alex is a wuss and decided never winning was boring,
        // so we're gonna randomly forget to do this check, simulating dumbness
        let move = vars.player.move;

        let c=true;
        if (move>2 && vars.game.easy) {
            // randomly decide against checking the board
            c = Phaser.Math.RND.between(20, 80) > 50 ?  true : false;
        }
        if (!c) {
            vars.DEBUG ? console.log(`IGNORING CHECK. SELECTING RANDOM POSITION`) : null;
            vars.ai.getRandomPosition();
            return false;
        }

        vars.DEBUG ? console.log(`IGNORING CHECK. SELECTING RANDOM POSITION`) : null;

        // check for possible wins
        let winArray = vars.game.buildWinArray();
        let winArrays = [];
        let possibles = [];
        let xPositions = [];
        let win = false;
        // this loop creates Winning Moves for the CPU
        // as well as possible winning lines for X (player)
        // AND "possibles" which are used if there are no win lines for CPU blocking moves
        winArray.forEach( (c, index)=>{
            if (win===false) {
                if (c==='00') { // CPU can win from this position
                    winArrays=['o', index];
                    win=true;
                } else if (c==='11') { // player will win if CPU doesnt stop it
                    winArrays.push(['x', index]);
                } else if (c==='0') {
                    // add to possibles (needed if no defensive moves are found)
                    possibles.push(consts.solutions[index]);
                } else if (c==='1') {
                    xPositions.push(consts.solutions[index]);
                }
            }
        })


        // THIS IS THE MAIN CHECK OF THIS FUNCTION
        // SO FAR WEVE CREATED AN ARRAY THAT HOLDS POSSIBLE CPU WINS/POSSIBLE
        // PLAYER WINS AND POSSIBLES IF THE FIRST 2 ARENT AVAILABLE
        if (win===true) { // WAS A WIN FOUND? PLACE THE CPU PIECE HERE
            let winArrayIndex = winArrays[1]; // this index relates to the solutions (constant)
            let boardPositions = consts.solutions[winArrayIndex];
            let boardPosition = -1; let found=false;

            boardPositions.forEach( (c)=> { if (scene.children.getByName('block_' + c).getData('clicked')===false && found===false) { boardPosition=c; found=true; } })
            console.log('%cCPU WIN!\nPlacing the CPU piece at position: ' + boardPosition, consts.console.important);
            moveFound=true;
            vars.ai.dropPiece(boardPosition);
            // do the current check for win routine to start the fall animation for players pieces
            // we dont have to add this position to the Used Positions array as the CPU has won the game
        } else if (winArrays.length>0) { // THE PLAYER HAS A POSSIBLE WIN LINE, BLOCK IT
            // might as well just pick the first one,
            // coz if theres 2 possible win lines it really wont matter which position the CPU selects as PLAYER is about to win
            let selectedPositions = consts.solutions[winArrays[0][1]];
            selectedPositions.forEach( (c)=> {
                if (scene.children.getByName('block_' + c).getData('clicked')===false) { // position hasnt been taken. CPU places piece here
                    moveFound=true; vars.ai.dropPiece(c);
                }
            })
        } else { // NO WIN POSITIONS FOUND FOR CPU OR PLAYER
            // if we are here, we know the centre sqaure has been taken
            // if this is only move 2 we select from diagonalPositions
            if (vars.player.move===1) { // THIS IS THE 2ND MOVE
                // also remember, middle space HAS been taken and ALL corners are available
                let availablePositions = consts.aiData.diagonalPositions;
                let rndIndex = getRandom(0,availablePositions.length-1);
                let boardID = availablePositions[rndIndex];
                
                let APs = vars.game.availablePositions;
                let found=-1;
                APs.find( (c,index)=> { // search for this position ID in the availables array
                    if (c===boardID) {
                        // push it to used array
                        usedPositions.push(boardID);
                        found=index;
                    }
                })

                if (found!==-1) {
                    moveFound=true; vars.ai.dropPiece(boardID);
                } else { // sanity check
                    console.error('The ID (' + boardID + ') doesnt appear to be in the available array!\nThis is a problem as its only move 2! So every diagonal should be available!');
                }
            } else if (vars.player.move!==1) { // THIS IS MOVE 3 OR MORE
                if (moveFound===false) { // ok, so centre isnt available and CPU/PLAYER has no possible win line and at least one corner has been taken
                    if (vars.player.move===3) { // IF ITS MOVE 3 MAKE SURE THERE ARENT ANY DANGEROUS POSITIONS
                        let randomSlip = getRandom(1,100);
                        let slip = gV.CPUError;
                        if (randomSlip===75 && slip===false) {
                            slip=true;
                            // if we get a 75 back from the random number gen, we ignore the dangerous lines check
                            vars.ai.getRandomPosition();
                        } else {
                            let d = vars.game.checkForDangerousLines();
                            if (d!==false) { moveFound = true; vars.ai.dropPiece(d); } else { vars.ai.doFinalChecks(possibles,xPositions); }
                        }
                    } else {
                        vars.ai.doFinalChecks(possibles,xPositions);
                    }
                }
            }
        }
    }
}



vars.ai.doFinalChecks = function(possibles,xPositions) {
    let gV = vars.game;
    let slip = gV.CPUError;
    // OK. Make sure there are no L's
    let moveFound=false; // this variable is unused, but can be set if needed in future
    console.log('%cChecking for Ls', consts.console.important);
    let whoopsie = getRandom(1,10);
    if (whoopsie===8 && slip===false) { // 1 in 10 times the CPU ignores the L check
        slip=true;
        vars.ai.getRandomPosition();
    } else {
        let l = vars.game.checkForLPattern();
        if (l!==false) { // a possible L has been found... block this
            moveFound = true; vars.ai.dropPiece(l);
        } else {
            console.log('%c  ... no Ls found', consts.console.important);
            let emptyPossibles = false; let CPUmalfunction = getRandom(1,9); if (CPUmalfunction===7 && slip===false) { slip=true; possibles = []; emptyPossibles=true; }
            if (emptyPossibles===false) { console.log('%c\nNo move found for CPU!\nNow were gonna look for a single 0 in the winArray to force a block by the player', consts.console.importantish); }
            if (possibles.length>0) {
                // No defensive or offensive positions left, find an X to put the piece beside (this causes a block on the players end)
                // THIS MIGHT FAIL. WE NEED TO DOUBLE CHECK THIS  *** TODO ***
                console.log('Searching for an x to place our piece beside');
                let x=-1;
                xPositions.forEach( (p)=>{ p.forEach( (c)=> { if (scene.children.getByName('block_' + c).getData('piece')===consts.pieces.x) { x = c; } }) })
                let ai = consts.aiData;
                let posArray = [];
                if (ai.diagonalPositions.includes(x)) { posArray = ai.diagonalSiblings; } else { posArray = ai.centreSiblings; }

                let selectedIndex = -1;
                posArray.forEach( (c)=> { if (c[0]===x) { let tempArray = [c[1],c[2]]; selectedIndex = getRandom(tempArray); } })

                // sanity check
                if (selectedIndex===-1) {
                    console.error('Ummm.. somethings gone very wrong.\nWe were looking for a position (diag or centre) but it wasnt found.\nHave we selected diags when we need centres (or vice versa - line 129!');
                } else {
                    // OK, we have a valid position, lets place the piece
                    moveFound = true; vars.ai.dropPiece(selectedIndex);
                }
            } else { // THERE ARE NO POSSIBLES WHICH MEANS WE CAN JUST PICK FROM WHATEVERS LEFT
                if (vars.DEBUG===true) { console.log('%cCPU is picking a random square as all tests have failed.', consts.console.important); }
                moveFound=true; vars.ai.getRandomPosition(emptyPossibles);
            }
        }
    }
}

vars.ai.dropPiece = function(_positionID) {
    let selectedPosition = scene.children.getByName('block_' + _positionID);
    vars.game.dropPlayerPiece(selectedPosition);
}

vars.ai.getRandomPosition = function(_whoopsie=true) { // this function generally deals with CPU mistakes but can also be called when no other options are available
    if (_whoopsie===true) { console.log('%c *** CPU did a whoopsie! Selecting a random position! ***', consts.console.likeReallyImportant); }
    let gV = vars.game;
    let randomPosition = getRandom(0,gV.availablePositions.length-1);
    let boardID = gV.availablePositions[randomPosition];
    console.log('%cThe selected board position is: board_' + boardID + ' (index was ' + randomPosition + ')', consts.console.important);
    vars.ai.dropPiece(boardID);
}

vars.phaserObject = {
    quickGet: (_oN)=> {
        if (!_oN) { return false; }
        return scene.children.getByName(_oN);
    }
}