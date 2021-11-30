class Player extends PIXI.Sprite{
    constructor(x=0, y=0)
    {
        super(app.loader.resources["../images/checkerpattern.jpg"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.02);
        this.x=x;
        this.y=y;
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
    seperate(dt=1/60)
    {
        
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