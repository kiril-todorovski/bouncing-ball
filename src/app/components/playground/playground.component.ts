import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Position, IMovingShape, BouncingBall } from 'src/app/models/models';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})

export class PlaygroundComponent implements OnInit {

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D;
  private currentShapes: Array<IMovingShape> = [];
  constructor() { }

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
  }

  //variable for storing the redrawing interval
  redrawInterval: any;

  canvasClick(e = null) {
    //on mouse click on the canvas, get the clicked point, create new ball and add it to the shapes for drawing
    let point = this.getPoint(e);
    this.currentShapes.push(new BouncingBall(point.x, point.y, 5, this.context.canvas.height, this.context.canvas.width));

    //if there is no interval set for drawing, create the interval and start draw/redaw
    if (!this.redrawInterval)
      this.redrawInterval = setInterval(() => {
        this.redrawShapes();
      }, 50);
  }

  private redrawShapes() {
    //if there are no shapes left for redrawing, clear the interval
    if (!this.currentShapes.some(x => x.shouldRedraw)) {
      clearInterval(this.redrawInterval);
      this.redrawInterval = undefined;
    }

    //clear the canvas before redrawing the shapes
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    //draw each shape on the canvas
    this.currentShapes.forEach(x => {
      x.drawOnCanvas(this.context);
    });
  }

  //function that calculates the click position on the canvas
  private getPoint(x) {
    var rect = this.canvas.nativeElement.getBoundingClientRect();
    return new Position(x.clientX - rect.left, x.clientY - rect.top);
  }
}
