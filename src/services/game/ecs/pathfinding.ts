import type { Entity } from ".";
import type { AliveComponent, PositionComponent } from "./components";

export class MouseHelper {
    private numberOfMice: number = 25;
    private mouseStepSize: number = 5;
    private mouseWinCounter: number = 0;

    private mousePos?: Pos;
    private goalPos?: Pos;

    async updateMousePosition(mouse: Entity): Promise<void> {
        return new Promise((resolve, reject) => {
            this.mousePos = new Pos(mouse.getComponent<PositionComponent>("pos").x, mouse.getComponent<PositionComponent>("pos").y);
            this.goalPos = new Pos(mouse.getComponent<PositionComponent>("goal").x, mouse.getComponent<PositionComponent>("goal").y);

            const newPos = this.calcStep();

            if (newPos.x === undefined && newPos.y === undefined) {
                mouse.getComponent<AliveComponent>("isAlive").isAlive = false;
                this.mouseWinCounter++;
                resolve();
            }

            mouse.getComponent<PositionComponent>("pos").x = newPos.x;
            mouse.getComponent<PositionComponent>("pos").y = newPos.y;

            resolve();
        });

        //console.log(mouse.id + "= X: " + this.mousePos.x + ", Y: " + this.mousePos.y);
    }

    getInitialMouseX(): number {
        // TODO: return X value of a randomly selected spawnpoint on a randomly selected subway S
        return 133;
    }

    getInitialMouseY(): number {
        // TODO: return Y value of that same randomly selected spawnpoint on that randomly selected subway S
        return Math.random() * 792 + 360;; //1152 - 360 = 792
    }

    getGoalMouseX(): number {
        // TODO: return X value of a randomly selected subway entry that contains the goal
        return 613;
    }

    getGoalMouseY(): number {
        // TODO: return Y value of a randomly selected subway entry that contains the goal
        return 360; //1152 - 360 = 792
    }

    calcStep(): Pos {
        const deltaX = this.mousePos!.x! - this.goalPos!.x!;
        const deltaY = this.mousePos!.y! - this.goalPos!.y!;
        const directPath = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        if (this.mouseStepSize > directPath) {
            // Destination Reached
            return new Pos(undefined, undefined)
        }
        const numberOfSteps = directPath / this.mouseStepSize;
        const stepX = deltaX / numberOfSteps;
        const stepY = deltaY / numberOfSteps;

        return new Pos(this.mousePos!.x! - stepX, this.mousePos!.y! - stepY);
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
}