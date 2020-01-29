import { DrawColor } from './enums';

export interface IMovingShape {
    drawOnCanvas(context: CanvasRenderingContext2D);
    shouldRedraw: boolean;
};

export class Position {
    x: number = 0;
    y: number = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
};

export class Ball {
    constructor(x: number = 0, y: number = 0, radius: number = 5, color: DrawColor = DrawColor.Black) {
        this.position = new Position(x, y);
        this.radius = radius;
        this.color = color;
    }
    position: Position;
    radius: number;
    color: DrawColor;
};

export class BouncingBall extends Ball implements IMovingShape {
    constructor(x: number = 0, y: number = 0, radius: number = 5, canvasHeight: number = 0, canvasWidth: number = 0) {
        super(x, y, radius);
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
    }
    //the height of the canvas needed to prevent the ball to go out of bounds
    canvasHeight: number = 0;

    //the width of the canvas needed to prevent the ball to go out of bounds
    canvasWidth: number = 0;

    //value added to acceleration intervals to achieve more natural movement
    acceleration: number = 0;

    //flag that indicates if the acceleration value should increase or decrease 
    isAccelerationIncreasing: boolean = true;

    //flag that indicates has the ball stopped moving
    shouldRedraw: boolean = true;

    //flag that controls x movement of the ball
    wasWallHit: boolean = false;

    drawOnCanvas(context: CanvasRenderingContext2D) {
        //draw and fill the ball
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.stroke();
        context.fillStyle = this.color;
        context.fill();

        //if the ball is still moving, calculate the next position and check if it has hit the floor or wall
        if (this.shouldRedraw) {
            this.calculateNextPosition();
            if (context.canvas.height <= (this.position.y + this.radius))
                this.floorHit();
            if (context.canvas.width <= (this.position.x + this.radius))
                this.wallHit();
        }
    }

    private calculateNextPosition() {
        // constant for the acceleration of the ball when falling
        const accelerationInterval: number = 2;

        //constant for the deceleration of the ball to achieve the peak slowdown
        const decelerationInterval: number = 3;

        //constant for each moving step for x and y
        const movingStep: number = 5;

        //if wall was hit, change the x direction of the ball
        if (this.wasWallHit) {
            this.position.x -= movingStep;
        }
        else {
            this.position.x += movingStep;
        }

        //check if the acceleration should be increased or decreased
        if (this.isAccelerationIncreasing)
            this.acceleration += accelerationInterval;
        else {
            this.acceleration -= decelerationInterval;
        }

        //increase or decrease the y position of the ball 
        if (this.isAccelerationIncreasing)
            this.position.y += (movingStep + this.acceleration);
        else {
            this.position.y -= (movingStep + this.acceleration);
        }

        //after the position update, check if the ball is out of canvas range and update the positions if needed
        if (this.position.y + this.radius > this.canvasHeight)
            this.position.y = this.canvasHeight - this.radius;
        if (this.position.x + this.radius > this.canvasWidth)
            this.position.x = this.canvasWidth - this.radius;

    };

    //function that handles floor hit 
    private floorHit() {
        // constant used for increasing the acceleration after deceleration
        const accelerationBoost: number = 1.4;

        //when floor is hit, switch between acceleration and deceleration
        this.isAccelerationIncreasing = !this.isAccelerationIncreasing;

        //if accelaration is negative, give it a boost for more natural look 
        if (this.acceleration < 0) this.acceleration = this.acceleration / accelerationBoost;

        //if the acceleration is very low, stop the ball
        if (Math.abs(this.acceleration) < Math.floor(this.radius / 2)) this.shouldRedraw = false;
    };

    //function that handles wall hit
    private wallHit() {
        //swith the flag so the x moves in opposite direction
        this.wasWallHit = !this.wasWallHit;
    };
};