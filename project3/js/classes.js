class Player extends PIXI.Sprite{
    constructor(x=0, y=0)
    {
        super(app.loader.resources["../images/checkerpattern.jpg"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.02);
        this.x=x;
        this.y=y;
        this.playerSpeed = 100;
        this.playerFireRate = 0.7;
        this.hasPiercing = false;
        this.wheelFire = false;
    }
    ResetPlayerStats()
    {
        this.playerSpeed = 100;
        this.playerFireRate = 0.7;
        this.hasPiercing = false;
        this.wheelFire = false;
    }
}

class Enemy extends PIXI.Sprite{
    constructor(x=0, y=0, player){
        super(app.loader.resources["../images/latest.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        this.player = player;
        //variables
        this.fwd = getPlayerDirection(this.x,this.y,this.player);
        this.speed = 50;
        this.isAlive = true;
    }
    move(dt=1/60)
    {
        this.fwd = getPlayerDirection(this.x,this.y,this.player);
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class Bullet extends PIXI.Graphics{
    constructor(color = 0xFFFFFF, x=0, y=0, dirX = 0, dirY = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-2,-4,4,6);
        this.endFill();
        this.x = x;
        this.y = y;
        //variables
        this.fwd = {x:dirX,y:dirY};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

// Item class concept
/*class Item extends PIXI.Sprite{
    constructor(x=0,y=0)
    {
        super(app.loader.resources["../images/meatball_man.jpg"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.08);
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.lifeSpan = 10.0;
        // Fix use time for multiple items
        this.activeTime = 12.0;
        this.isActive = false;
    }
    useItem(player){
        // Item would be used up and do a special effect        
    }
}*/

// Unique items

class FireRateItem extends PIXI.Sprite{
    constructor(x=0,y=0)
    {
        super(app.loader.resources["../images/MiniGunPack1.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.lifeSpan = 10.0;
        this.activeTime = 12.0;
        this.isActive = false;
    }
    
    useItem(player)
    {
        this.isAlive = false;
        this.isActive = true;
        player.playerFireRate = 0.35;
        return player;
    }
    deactivateItem(player)
    {
        //console.log("deactivate");
        player.playerFireRate = 0.7;
    }
}

class SpeedItem extends PIXI.Sprite{
    constructor(x=0,y=0)
    {
        super(app.loader.resources["../images/meatball_man.jpg"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.08);
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.lifeSpan = 10.0;
        this.activeTime = 12.0;
        this.isActive = false;
    }

    useItem(player)
    {
        this.isAlive = false;
        this.isActive = true;
        player.playerSpeed = 150;
        return player;
    }
    deactivateItem(player)
    {
        //console.log("deactivate");
        player.playerSpeed = 100;
    }
}

class WheelFire extends PIXI.Sprite{
    constructor(x=0,y=0)
    {
        super(app.loader.resources["../images/meatball_man.jpg"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.08);
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.lifeSpan = 10.0;
        this.activeTime = 12.0;
        this.isActive = false;
        this.tint = 0x0000FF;
    }

    useItem(player)
    {
        this.isAlive = false;
        this.isActive = true;
        player.wheelFire = true;
        return player;
    }
    deactivateItem(player)
    {
        //console.log("deactivate");
        player.wheelFire = false;
    }

}
class Piercing extends PIXI.Sprite{
    constructor(x=0,y=0)
    {
        super(app.loader.resources["../images/meatball_man.jpg"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.08);
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.lifeSpan = 10.0;
        this.activeTime = 12.0;
        this.isActive = false;
        this.tint = 0x00FFFF;
    }

    useItem(player)
    {
        this.isAlive = false;
        this.isActive = true;
        player.hasPiercing = true;
        return player;
    }
    deactivateItem(player)
    {
        //console.log("deactivate");
        player.hasPiercing = false;
    }
}