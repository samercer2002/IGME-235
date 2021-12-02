"use strict";

let keys = {};

window.onload = function(){
   window.addEventListener("keydown", keysDown);
   window.addEventListener("keyup", keysUp); 
}

function keysDown(e){
    //console.log(e.keyCode);
    e.preventDefault();
    keys[e.keyCode] = true;
}

function keysUp(e){
    //console.log(e.keyCode);
    e.preventDefault();
    keys[e.keyCode] = false;
}

const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
app.loader.
    add([
        "../images/checkerpattern.jpg",
        "../images/latest.png",
        "../images/meatball_man.jpg"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let enemies = [];
let player;
let startScene,gameScene,gameOverScene; 
let bullets = [];
let score;
let scoreLabel,lifeLabel,gameOverScoreLabel;
let life = 3;
let paused = true;
let elapsedBulletTime = 0;
let elapsedEnemyTime = 0;
let elapsedItemUseTime = 0;
let totalElapsedTime = 0;
let items = [];
let inventory;
let inventoryItems = [];
let startTimer = false;
let wheelFireDirections = [];

function setup(){
    score = 0;
    stage = app.stage;

    startScene = new PIXI.Container();
    stage.addChild(startScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    createLabelsAndButtons();

    player = new Player(50,50);
    gameScene.addChild(player);

    wheelFireDirections.push({x:-1,y:0});
    wheelFireDirections.push({x:-0.7071,y:0});
    wheelFireDirections.push({x:1,y:0});
    wheelFireDirections.push({x:0.7071,y:0});
    wheelFireDirections.push({x:0,y:-1});
    wheelFireDirections.push({x:0,y:-0.7071});
    wheelFireDirections.push({x:0,y:1});
    wheelFireDirections.push({x:0,y:0.7071});

    setupInventory();
    

    app.ticker.add(gameLoop);
}

function setupInventory(){
    inventory = new PIXI.Container();
    let mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawRect(sceneWidth-100,0,sceneWidth,100);
    mask.endFill();

    inventory.mask = mask;
    inventory.addChild(mask);
    gameScene.addChild(inventory);
}

function createLabelsAndButtons()
{
        let buttonStyle = new PIXI.TextStyle({
            fill: 0xFF0000,
            fontSize: 48,
            fontFamily: "Verdana"
        });


    let startLabel1 = new PIXI.Text("Survive the Hoard!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 54,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    let startLabel2 = new PIXI.Text("Game Harder");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Verdana",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    let startButton = new PIXI.Text("Play the Game!");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Verdana",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // 3 - set up `gameOverScene`
// 3A - make game over text
let gameOverText = new PIXI.Text("Game Over!\n        :-O");
textStyle = new PIXI.TextStyle({
	fill: 0xFFFFFF,
	fontSize: 64,
	fontFamily: "Futura",
	stroke: 0xFF0000,
	strokeThickness: 6
});
gameOverText.style = textStyle;
gameOverText.x = 100;
gameOverText.y = sceneHeight/2 - 160;
gameOverScene.addChild(gameOverText);

textStyle = new PIXI.TextStyle({
	fill: 0xFFFFFF,
	fontSize: 24,
	fontFamily: "Futura",
	stroke: 0xFF0000,
	strokeThickness: 6
});

gameOverScoreLabel = new PIXI.Text();
gameOverScoreLabel.text = `Your final score: ${score}`;
gameOverScoreLabel.style = textStyle;
gameOverScoreLabel.x = 180;
gameOverScoreLabel.y = sceneHeight/2 + 50;
gameOverScene.addChild(gameOverScoreLabel);


// 3B - make "play again?" button
let playAgainButton = new PIXI.Text("Play Again?");
playAgainButton.style = buttonStyle;
playAgainButton.x = 150;
playAgainButton.y = sceneHeight - 100;
playAgainButton.interactive = true;
playAgainButton.buttonMode = true;
playAgainButton.on("pointerup",startGame); // startGame is a function reference
playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
gameOverScene.addChild(playAgainButton);
}

function startGame()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    life = 3;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    player.x = 300;
    player.y = 300;
    loadLevel();
}

function increaseScoreBy(value)
{
    score += value;
    scoreLabel.text = `Score ${score}`;
}

function decreaseLifeBy(value)
{
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Lives: ${life}`;
}

function createEnemies(numEnemies)
{
    let spawnPos = getSpawnInfo();
    for(let i=0; i<numEnemies;i++)
    {
        let e = new Enemy(0,0,player);
        switch(i%3)
        {
            case 0:
                if(spawnPos)
                if(spawnPos.x != 0 || spawnPos.x != sceneWidth / 2)
                {
                    e.x = spawnPos.x - e.width - 1;
                }
                else{
                    e.x = spawnPos.x;
                }
                if(spawnPos.y != 0 || spawnPos.y != sceneHeight / 2)
                {
                    e.y = spawnPos.y - e.width - 1;
                }
                else{
                    e.y = spawnPos.y;
                }
                
                break;
            case 1:
                e.x = spawnPos.x;
                e.y = spawnPos.y;
                break;
            case 2: 
            if(spawnPos.x != 0 || spawnPos.x != sceneWidth / 2)
            {
                e.x = spawnPos.x + e.width + 1;
            }
            else{
                e.x = spawnPos.x;
            }
            if(spawnPos.y != 0 || spawnPos.y != sceneHeight / 2)
            {
                e.y = spawnPos.y + e.width + 1;
            }
            else{
                e.y = spawnPos.y;
            }
                break;
        }
        
        enemies.push(e);
        gameScene.addChild(e);
    }
}

function loadLevel(){
	createEnemies(5);
	paused = false;
}

function gameLoop(){
    if(paused) return;

    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
    elapsedBulletTime += dt;
    elapsedEnemyTime += dt;
    totalElapsedTime += dt;

    if(items.length > 0)
    {
        for(let item of items)
        {
            item.lifeSpan -= dt;
            if(item.lifeSpan <= 0)
            {
                item.isAlive = false;
                gameScene.removeChild(item);
                items = items.filter(item => item.isAlive);
            }
        }
    }
    // W
    if(keys["87"])
    {
        player.y -= player.playerSpeed * dt;
    }
    // S
    if(keys["83"])
    {
        player.y += player.playerSpeed * dt;
    }
    // D
    if(keys["68"])
    {
        player.x += player.playerSpeed * dt;
    }
    // A
    if(keys["65"])
    {
        player.x -= player.playerSpeed * dt;
    }

    player.x = clamp(player.x,0 + player.width / 2, sceneWidth - player.width / 2);
    player.y = clamp(player.y,0 + player.height / 2, sceneHeight - player.height / 2);

    // Left Arrow
    if(player.wheelFire)
    {
        if(keys["37"] || keys["38"] || keys["39"] || keys["40"])
        {
            fireBullet();
        }
    }
    else{
        if(keys["37"])
        {
            fireBullet(-1,0);
        }
        // Up Arrow
        if(keys["38"])
        {
            fireBullet(0,-1);
        }
        // Right Arrow
        if(keys["39"])
        {
            fireBullet(1,0);
        }
        // Down Arrow
        if(keys["40"])
        {
            fireBullet(0,1);
        }
    }
    

    if(keys["32"] && inventoryItems.length > 0)
    {
        player = inventoryItems[0].useItem(player);
        inventory.removeChild(inventoryItems[0]);
        inventoryItems = [];
        if(startTimer && elapsedItemUseTime > 0)
        {
            elapsedItemUseTime = 0;
        }
        else
        {
            startTimer = true;
        }
        
    }

    if(startTimer)
    {
        elapsedItemUseTime += dt;
    }
    if(elapsedItemUseTime >= 12)
    {
        console.log("item ran out");
        startTimer = false;
        elapsedItemUseTime = 0;
        player.ResetPlayerStats();
    }

    for (let b of bullets){
		b.move(dt);
	}

    for(let e of enemies)
    {
        e.move(dt);
        checkBounds(e);
        for(let en of enemies)
        {
            if(rectsIntersect(e,en) && e != en)
            {
                if(e.x > en.x && e.x-en.x > e.y-en.y)
                {
                    e.x = en.x+en.width;
                }
                else if(en.x > e.x && en.x-e.x > en.y-e.y){
                    en.x = e.x+e.width;
                }
                else if(e.y > en.y && e.y-en.y > e.x-en.x)
                {
                    e.y = en.y+en.height;
                }
                else if (en.y > e.y && en.y-e.y > en.x -e.x){
                    en.y = e.y+e.height;
                }
            }
        }

        for(let b of bullets)
        {
            if(rectsIntersect(e,b) && e.isAlive && b.isAlive && !player.hasPiercing)
            {
                gameScene.removeChild(e);
                e.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                tryForItem(e);
            }
            else if(rectsIntersect(e,b) && e.isAlive && b.isAlive && player.hasPiercing)
            {
                gameScene.removeChild(e);
                e.isAlive = false;
                increaseScoreBy(1);
                tryForItem(e);
            }

            if(b.x > sceneWidth || b.x < 0 || b.y > sceneHeight || b.y < 0)
            {
                b.isAlive = false;
                gameScene.removeChild(b);
            }
        }

        if(e.isAlive && rectsIntersect(e, player))
        {
            Reset();
            totalElapsedTime = 0;
            loadLevel();
            decreaseLifeBy(1);
        }
    }

    for(let item of items)
    {
        if(item.isAlive && rectsIntersect(item, player) && inventoryItems.length == 0)
        {
            console.log("picked up item");
            inventoryItems.push(item);
            item.isAlive = false;
            gameScene.removeChild(item);
            inventoryItems[0].x = sceneWidth-50;
            inventoryItems[0].y = 50;
            inventoryItems[0].scale.set(0.2);
            inventory.addChild(inventoryItems[0]);
        }
        else if (item.isAlive && rectsIntersect(item, player) && inventoryItems.length > 0){
            player = item.useItem(player);
            gameScene.removeChild(item);

            if(startTimer && elapsedItemUseTime > 0)
            {
                elapsedItemUseTime = 0;
            }
        }
    }

    enemies = enemies.filter(e => e.isAlive);
    bullets = bullets.filter(b=>b.isAlive);
    items = items.filter(item => item.isAlive);

    if(enemies.length == 0 || elapsedEnemyTime > 4.5)
    {
        createEnemies(Math.floor(3 + (totalElapsedTime * 1/10)));
        elapsedEnemyTime = 0;
    }

    if(life <= 0)
    {
        end();
        return;
    }
}

function fireBullet(x = 0, y = 0){
    if(paused) return;
    if(elapsedBulletTime >= player.playerFireRate && !player.wheelFire)
    {
        let b = new Bullet(0xFFFFFF,player.x,player.y,x, y);
        bullets.push(b);
        gameScene.addChild(b);
        elapsedBulletTime = 0;
    }
    else if(player.wheelFire)
    {
        if(elapsedBulletTime >= player.playerFireRate)
        {
            for(let i = 0; i < wheelFireDirections.length; i++)
            {
                let b = new Bullet(0xFFFFFF,player.x,player.y,wheelFireDirections[i].x, wheelFireDirections[i].y);
                bullets.push(b);
                gameScene.addChild(b);
                elapsedBulletTime = 0;
            }
        }
    }
}

function Reset()
{
    enemies.forEach(c=>gameScene.removeChild(c));
    enemies = [];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];

    items.forEach(i=>gameScene.removeChild(i));
    items = [];
    player.ResetPlayerStats();
}

function end()
{
    paused = true;
    gameOverScoreLabel.text = `Your final score: ${score}`;
    Reset();

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function getSpawnInfo()
{
    let spawnQuad = getRandomInt(1,4);
    switch(spawnQuad)
    {
        case 1:
            return {x:0, y:(sceneHeight / 2)};
            break;
        case 2:
            return {x:sceneWidth / 2, y:0};
            break;
        case 3:
            return {x:sceneWidth, y:(sceneHeight / 2)};
            break;
        case 4:
            return {x:sceneWidth / 2, y:sceneHeight};
            break;
    }
}

function checkBounds(enemy)
{
    if(enemy.x >= sceneWidth)
    {
        enemy.x = sceneWidth - enemy.width;
    }
    else if(enemy.x <= 0)
    {
        enemy.x = enemy.width;
    }
    if(enemy.y >= sceneHeight)
    {
        enemy.y = sceneHeight - enemy.height;
    }
    else if(enemy.y <= 0)
    {
        enemy.y = enemy.height;
    }
}

function tryForItem(enemy)
{
    if(Math.random() < 0.3)
    {
        // To be changed once unique items are added
        let item = pickItem(enemy.x,enemy.y);
        items.push(item);
        gameScene.addChild(item);
    }
}

function pickItem(x,y)
{
    let value = Math.random();
    if(value < 0.3)
    {
        return new FireRateItem(x,y);
    }
    else if(value >= 0.3 && value < 0.6){
        return new SpeedItem(x,y);
    }
    else if(value >= 0.6 && value < 0.8)
    {
        return new WheelFire(x,y);
    }
    else{
        return new Piercing(x,y);
    }
}