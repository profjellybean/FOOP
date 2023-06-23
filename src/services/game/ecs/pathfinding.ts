import type { Entity } from ".";
import type { AliveComponent, MapComponent, PositionComponent } from "./components";

export class MouseHelper {
    private numberOfMice: number = 25;
    private mouseWinCounter: number = 0;
    private map: MapComponent;

    constructor(map: MapComponent) {
        this.map = map;
    }



    async updateMousePosition(mouse: Entity): Promise<void> {
        return new Promise((resolve, reject) => {
            const mousePos = Pos.fromComponent(mouse.getComponent<PositionComponent>("pos"));
            const goalPos = Pos.fromComponent(mouse.getComponent<PositionComponent>("goal"));

            const newPos = this.calcStep(mousePos, goalPos);

            this.map.map![mousePos!.x!][mousePos!.y!].occupied = null;
            this.map.map![newPos.x!][newPos.y!].occupied = mouse;

            if (newPos.x === goalPos.x && newPos.y === goalPos.y || mousePos!.x === goalPos!.x && mousePos!.y === goalPos!.y) {
                mouse.getComponent<AliveComponent>("isAlive").isAlive = false;
                this.mouseWinCounter++;
                resolve();
            }

            mouse.getComponent<PositionComponent>("pos").x = newPos.x;
            mouse.getComponent<PositionComponent>("pos").y = newPos.y;

            resolve();
        });
    }

    getInitialMouseX(): number {
        return Math.floor(Math.random() * 100);
    }

    getInitialMouseY(): number {
        return Math.floor(Math.random() * 100);
    }


    calcStep(mousePos: Pos, goalPos: Pos): Pos {
        /*const deltaX = this.mousePos!.x! - this.goalPos!.x!;
        const deltaY = this.mousePos!.y! - this.goalPos!.y!;
        const directPath = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        if (this.mouseStepSize > directPath) {
            // Destination Reached
            return new Pos(undefined, undefined)
        }
        const numberOfSteps = directPath / this.mouseStepSize;
        const stepX = deltaX / numberOfSteps;
        const stepY = deltaY / numberOfSteps;

        return new Pos(Math.floor(this.mousePos!.x! - stepX), Math.floor(this.mousePos!.y! - stepY));*/

        const deltaX = mousePos!.x! - goalPos!.x!;
        const deltaY = mousePos!.y! - goalPos!.y!;

        if (deltaX > 0) {
            if (deltaY > 0) {
                return new Pos(mousePos!.x! - 1, mousePos!.y! - 1)
            } else {
                return new Pos(mousePos!.x! - 1, mousePos!.y! + 1)
            }
        } if (deltaX < 0) {
            if (deltaY > 0) {
                return new Pos(mousePos!.x! + 1, mousePos!.y! - 1)
            } else {
                return new Pos(mousePos!.x! + 1, mousePos!.y! + 1)
            }
        } else {
            if (deltaY > 0) {
                return new Pos(mousePos!.x!, mousePos!.y! - 1)
            } else {
                return new Pos(mousePos!.x!, mousePos!.y! + 1)
            }
        }
    }

    getNumberOfMice(): number {
        return this.numberOfMice;
    }

    getMouseWinCounter(): number {
        return this.mouseWinCounter;
    }
}

class Pos {
    x?: number;
    y?: number;

    constructor(xVal?: number, yVal?: number) {
        this.x = xVal;
        this.y = yVal;
    }

    static fromComponent(comp: PositionComponent): Pos {
        return new Pos(comp.x, comp.y);
    }
}