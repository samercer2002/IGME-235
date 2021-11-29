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

class Circle extends PIXI.Graphics{
    constructor(radius, color=0xFF00000, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }
    move(dt=1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX(){
        this.fwd.x *=-1;
    }

    reflectY()
    {
        this.fwd.y *= -1;
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
        this.drawRect(-2,-3,4,6);
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