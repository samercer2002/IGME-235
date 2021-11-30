"use strict";

let keys = {};

window.onload = function(){
   window.addEventListener("keydown", keysDown);
   window.addEventListener("keyup", keysUp); 
}

function keysDown(e){
    //console.log(e.keyCode);
    keys[e.keyCode] = true;
}

function keysUp(e){
    //console.log(e.keyCode);
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
        "../images/latest.png"
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
let elapsedTime = 0;

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

    app.ticker.add(gameLoop);
}

function createLabelsAndButtons()
{
        let buttonStyle = new PIXI.TextStyle({
            fill: 0xFF0000,
            fontSize: 48,
            fontFamily: "Verdana"
        });


    let startLabel1 = new PIXI.Text("Name!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
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

    let startButton = new PIXI.Text("Button!");
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
    /*player.x = 300;
    player.y = 550;*/
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

function createEnemies(numCircles)
{
    for(let i=0; i<numCircles;i++)
    {
        let e = new Enemy(0,0,player);
        e.x = Math.random() * (sceneWidth - 50) + 25;
        e.y = Math.random() * (sceneHeight - 400) + 25;
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
    elapsedTime += dt;
    if (dt > 1/12) dt=1/12;

    // W
    if(keys["87"])
    {
        player.y -= 100 * dt;
    }
    // S
    if(keys["83"])
    {
        player.y += 100 * dt;
    }
    // D
    if(keys["68"])
    {
        player.x += 100 * dt;
    }
    // A
    if(keys["65"])
    {
        player.x -= 100 * dt;
    }

    player.x = clamp(player.x,0 + player.width / 2, sceneWidth - player.width / 2);
    player.y = clamp(player.y,0 + player.height / 2, sceneHeight - player.height / 2);

    // Left Arrow
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

    for (let b of bullets){
		b.move(dt);
	}

    for(let e of enemies)
    {
        e.move(dt);
        for(let en of enemies)
        {
            /*if(rectsIntersect(e,en) && e != en)
            {
                // Only works sometimes
                en.x = clamp(en.x,e.x+e.width);
                en.y = clamp(en.y,e.y+e.height);
            }*/
        }

        for(let b of bullets)
        {
            if(rectsIntersect(e,b) && e.isAlive && b.isAlive)
            {
                gameScene.removeChild(e);
                e.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
            }

            if(b.x > sceneWidth || b.x < 0 || b.y > sceneHeight || b.y < 0)
            {
                b.isAlive = false;
            }
        }

        if(e.isAlive && rectsIntersect(e, player))
        {
            Reset()
            loadLevel();
            decreaseLifeBy(1);
        }
    }

    enemies = enemies.filter(e => e.isAlive);
    bullets = bullets.filter(b=>b.isAlive);

    if(life <= 0)
    {
        end();
        return;
    }
}

function fireBullet(x = 0, y = 0){
    if(paused) return;
    if(elapsedTime >= 0.5 || bullets.length == 0)
    {
        let b = new Bullet(0xFFFFFF,player.x,player.y,x, y);
        bullets.push(b);
        gameScene.addChild(b);
        elapsedTime = 0;
    }
}

function Reset()
{
    enemies.forEach(c=>gameScene.removeChild(c));
    enemies = [];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];
}

function end()
{
    paused = true;
    gameOverScoreLabel.text = `Your final score: ${score}`;
    Reset();

    gameOverScene.visible = true;
    gameScene.visible = false;
}