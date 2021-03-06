<!doctype html>
<html lang="en">
		<script src="howler.js"></script>
		<script src="howler.spatial.min.js"></script>

        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
       
        <meta name="msapplication-TileColor" content="#2b5797">
        <meta name="theme-color" content="#ffffff">
        
	<meta charset="UTF-8">
	<title>Blackout</title>

	<!-- Basic styling, centering the canvas -->
	<style>
	canvas {
		display: block;
		position: absolute;
		margin: auto;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}
	</style>
</head>
<body>
<script>
// $(document).keyup(function(event){
//   player.x-=7; 
// });
var

gameover=false,
WIDTH  = 140,
HEIGHT = 600,
pi = Math.PI,
SpaceBar=32,
RightArrow = 39,
DownArrow = 40,
LeftArrow = 37,
pop = new Howl({
	src: ['pop.mp3'],
	format: "mp3",
	}),

Lpop = new Howl({
	src: ['Lpop.mp3']}),
pop2 = new Howl({
	src: ['pop2.mp3']}),
HurryUp = new Howl({
	src: ['HurryUp.mp3']}),
	

/**
 * Game elements
 */
canvas,
ctx,
keystate,
/**
 * The player paddle
 * 
 * @type {Object}
 */
player = {
	x: null,
    w: 60,
	y: null,
    z:1,
    target: 100,
    Lefttarget:19,
	width:  20,
	height: 20,
	/**
	 * Update the position depending on pressed keys
	 */
    
	update: function() {
        
		if (keystate[RightArrow]){this.x += 100; keystate[RightArrow]=false;}
             
		if (keystate[LeftArrow]) this.x += 100; keystate[LeftArrow]=false;
		// keep the paddle inside of the canvas
		
        if(this.x>this.target){
            this.x=20;
            this.y-=10;
			;
			
            pop.play();
            //alert("pop");
            }
        if(this.x<this.Lefttarget){
            this.x=99;
            this.y-=10;
            
            Lpop.play();
            //alert("pop");
            }
        if(this.y>600-this.height){
            
            pop2.play();
            gameover=true;
        }
        this.y+=.1*this.z;
        this.z+=.01
        if(this.y>=400){
            
            
        }

	},
	/**
	 * Draw the player paddle to the canvas
	 */
	draw: function() {
		ctx.fillRect(this.w, this.y, this.width, this.height);
	}
},
/**
 * The ai paddle
 * 
 * @type {Object}
 */
ai = {
	x: null,
	y: null,
	width:  20,
	height: 100,
	/**
	 * Update the position depending on the ball position
	 */
	update: function() {
		// calculate ideal position
		var desty = ball.y - (this.height - ball.side)*0.5;
		// ease the movement towards the ideal position
		this.y += (desty - this.y) * 0.1;
		// keep the paddle inside of the canvas
		this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
	},
	/**
	 * Draw the ai paddle to the canvas
	 */
	draw: function() {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
},
/**	
 * The ball object
 * 
 * @type {Object}
 */
ball = {
	x:   null,
	y:   null,
	vel: null,
	side:  20,
	speed: 12,
	/**
	 * Serves the ball towards the specified side
	 * 
	 * @param  {number} side 1 right
	 *                       -1 left
	 */
	serve: function(side) {
		// set the x and y position
		var r = Math.random();
		this.x = side===1 ? player.x+player.width : ai.x - this.side;
		this.y = (HEIGHT - this.side)*r;
		// calculate out-angle, higher/lower on the y-axis =>
		// steeper angle
		var phi = 0.1*pi*(1 - 2*r);
		// set velocity direction and magnitude
		this.vel = {
			x: side*this.speed*Math.cos(phi),
			y: this.speed*Math.sin(phi)
		}
	},
	/**
	 * Update the ball position and keep it within the canvas
	 */
	update: function() {
		// update position with current velocity
		this.x += this.vel.x;
		this.y += this.vel.y;
		// check if out of the canvas in the y direction
		if (0 > this.y || this.y+this.side > HEIGHT) {
			// calculate and add the right offset, i.e. how far
			// inside of the canvas the ball is
			var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.side);
			this.y += 2*offset;
			// mirror the y velocity
			this.vel.y *= -1;
		}
		// helper function to check intesectiont between two
		// axis aligned bounding boxex (AABB)
		var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
		};
		// check againts target paddle to check collision in x
		// direction
		var pdle = this.vel.x < 0 ? player : ai;
		if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
				this.x, this.y, this.side, this.side)
		) {	
			// set the x position and calculate reflection angle
			this.x = pdle===player ? player.x+player.width : ai.x - this.side;
			var n = (this.y+this.side - pdle.y)/(pdle.height+this.side);
			var phi = 0.25*pi*(2*n - 1); // pi/4 = 45
			// calculate smash value and update velocity
			var smash = Math.abs(phi) > 0.2*pi ? 1.5 : 1;
			this.vel.x = smash*(pdle===player ? 1 : -1)*this.speed*Math.cos(phi);
			this.vel.y = smash*this.speed*Math.sin(phi);
		}
		// reset the ball when ball outside of the canvas in the
		// x direction
		if (0 > this.x+this.side || this.x > WIDTH) {
			this.serve(pdle===player ? 1 : -1);
		}
	},
	/**
	 * Draw the ball to the canvas
	 */
	draw: function() {
		ctx.fillRect(this.x, this.y, this.side, this.side);
	}
};
/**
 * Starts the game
 */
function startgame() {
	// create, initiate and append game canvas
	alert("gamestarted");
	canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);
	keystate = {};
	// keep track of keyboard presses
	// document.addEventListener("keydown", function(evt) {
	// 	keystate[evt.keyCode] = true;
	// });
	document.addEventListener("keyup", function(evt) {
		//HurryUp.play();
		keystate[evt.keyCode] = true;
		if(evt.keyCode==RightArrow){
			pop.pos(1,0,0,pop.play())
			//pop.play();}}
		}
		if(evt.keyCode==LeftArrow){
			pop.pos(-1,0,0,pop.play())
			//pop.play();}}
		}
		if(evt.keyCode==DownArrow){
			pop.pos(0,0,0,pop.play())
			//pop.play();}}
		}
	});
	//init(); // initiate game objects
	// game loop function
	// var loop = function() {
		
	// 	update();
	// 	draw();
    //     if(!gameover){
	// 	window.requestAnimationFrame(loop, canvas);}
	// };
	//window.requestAnimationFrame(loop, canvas);
}
/**
 * Initatite game objects and set start positions
 */

 document.addEventListener("keyup", function(evt) {
		//HurryUp.play();
		//keystate[evt.keyCode] = true;
		if(evt.keyCode==SpaceBar){
			startgame();
		}
	});
function init() {
	HurryUp.play();
	player.x = player.width;
	player.y = (HEIGHT - player.height)/2;
	ai.x = WIDTH - (player.width + ai.width);
	ai.y = (HEIGHT - ai.height)/2;
	ball.serve(1);
}
/**
 * Update all game objects
 */
function update() {
	//ball.update();
	player.update();
	//ai.update();
}
/**
 * Clear canvas and draw all game objects and net
 */
function draw() {
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.save();
	ctx.fillStyle = "#fff";
	//ball.draw();
	player.draw();
	//ai.draw();
	//draw the net
	var w = 4;
	var x = (WIDTH - w)*0.5;
	var y = 0;
	var step = HEIGHT/20; // how many net segments
	// while (y < HEIGHT) {
	// 	ctx.fillRect(x, y+step*0.25, w, step*0.5);
	// 	y += step;
	// }
	ctx.restore();
}
// start and run the game

</script>
</body>
</html>