import type { Entity } from ".";
import type { AliveComponent, PositionComponent, PositionListComponent } from "./components";
import type { MapComponent } from "./components";
import type { Ref } from "vue";

export class MouseHelper {
    private numberOfMice: number = 25;
    private mouseWinCounter: number = 0;
    private map: Ref<MapComponent>;

    private mousePos?: SinglePosition;
    private mouseTargetList?: SinglePosition[];
    private goalPos?: SinglePosition;

    constructor(map: Ref<MapComponent>) {
        this.map = map;
    }

    async updateMousePosition(mouse: Entity): Promise<void> {
        return new Promise((resolve, reject) => {
            this.mousePos = new SinglePosition(mouse.getComponent<PositionComponent>("pos").x, mouse.getComponent<PositionComponent>("pos").y);
            this.mouseTargetList = mouse.getComponent<PositionListComponent>("targetList").positions;
            this.goalPos = this.getCurrentGoalPosition();

            const newPos = this.calcStep();

            this.map.value.map![this.mousePos!.x!][this.mousePos!.y!].occupied = null; // vorige Position freigeben
            this.map.value.map![newPos.x!][newPos.y!].occupied! = mouse; // neue Position belegen

            if (newPos.x === this.goalPos?.x && newPos.y === this.goalPos?.y || this.mousePos?.x === this.goalPos?.x && this.mousePos?.y === this.goalPos?.y) {
                if (this.mouseTargetList.length === 0) {
                    mouse.getComponent<AliveComponent>("isAlive").isAlive = false;
                    this.mouseWinCounter++;
                    resolve();
                }
                this.mouseTargetList.pop();
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


    calcStep(): SinglePosition {
        if (this.mousePos !== undefined && this.mousePos.x !== undefined && this.mousePos.y !== undefined &&
            this.goalPos !== undefined && this.goalPos.x !== undefined && this.goalPos.y !== undefined) {

            const deltaX = this.mousePos!.x! - this.goalPos!.x!;
            const deltaY = this.mousePos!.y! - this.goalPos!.y!;

            if (deltaX > 0) {
                if (deltaY > 0) {
                    return new SinglePosition(this.mousePos!.x! - 1, this.mousePos!.y! - 1)
                } else {
                    return new SinglePosition(this.mousePos!.x! - 1, this.mousePos!.y! + 1)
                }
            } if (deltaX < 0) {
                if (deltaY > 0) {
                    return new SinglePosition(this.mousePos!.x! + 1, this.mousePos!.y! - 1)
                } else {
                    return new SinglePosition(this.mousePos!.x! + 1, this.mousePos!.y! + 1)
                }
            } else {
                if (deltaY > 0) {
                    return new SinglePosition(this.mousePos!.x!, this.mousePos!.y! - 1)
                } else {
                    return new SinglePosition(this.mousePos!.x!, this.mousePos!.y! + 1)
                }
            }
        }
        return this.goalPos!;
    }

    getCurrentGoalPosition(): SinglePosition {
        if (this.mouseTargetList !== undefined && this.mouseTargetList.length !== undefined && this.mouseTargetList.length > 0) {
            return this.mouseTargetList[this.mouseTargetList.length-1];
        } else {
            return this.goalPos!;
        }
    }

    getNumberOfMice(): number {
        return this.numberOfMice;
    }

    getMouseWinCounter(): number {
        return this.mouseWinCounter;
    }
}

export class SinglePosition {
    x?: number;
    y?: number;

    constructor(xVal?: number, yVal?: number) {
        this.x = xVal;
        this.y = yVal;
    }
}