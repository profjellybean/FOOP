import type { Entity } from ".";
import type { AliveComponent, MapComponent, PositionComponent, PositionListComponent } from "./components";

export class MouseHelper {
    private numberOfMice: number = 25;
    private mouseWinCounter: number = 0;

    async updateMousePosition(mouse: Entity, map: MapComponent): Promise<void> {
        return new Promise((resolve, reject) => {

            if (mouse.getComponent<AliveComponent>("isAlive").isAlive === false) {
                resolve();
                return;
            }


            const mousePos = new SinglePosition(mouse.getComponent<PositionComponent>("pos").x, mouse.getComponent<PositionComponent>("pos").y);
            const mouseTargetList = mouse.getComponent<PositionListComponent>("targetList").positions;
            const goalPos = this.getCurrentGoalPosition(mouseTargetList);

            const newPos = this.calcStep(mousePos, goalPos);

            if (newPos?.x === goalPos?.x && newPos?.y === goalPos?.y || mousePos?.x === goalPos?.x && mousePos?.y === goalPos?.y) {
                if (mouseTargetList.length === 0) {
                    mouse.getComponent<AliveComponent>("isAlive").isAlive = false;
                    this.mouseWinCounter++;
                    resolve();
                    return;
                }
                mouseTargetList.pop();
            }

            if (newPos === undefined) {
                reject();
                return;
            }

            map.map![mousePos!.x!][mousePos!.y!].occupied = null; // vorige Position freigeben
            map.map![newPos!.x!][newPos!.y!].occupied = mouse; // neue Position belegen

            mouse.getComponent<PositionComponent>("pos").x = newPos!.x;
            mouse.getComponent<PositionComponent>("pos").y = newPos!.y;

            resolve();
        });
    }

    getInitialMouseX(): number {
        return Math.floor(Math.random() * 100);
    }

    getInitialMouseY(): number {
        return Math.floor(Math.random() * 100);
    }


    calcStep(mousePos: SinglePosition, goalPos?: SinglePosition): SinglePosition | undefined {
        if (mousePos !== undefined && mousePos.x !== undefined && mousePos.y !== undefined &&
            goalPos !== undefined && goalPos.x !== undefined && goalPos.y !== undefined) {

            const deltaX = mousePos!.x! - goalPos!.x!;
            const deltaY = mousePos!.y! - goalPos!.y!;

            if (deltaX > 0 && deltaY != 0) {
                if (deltaY > 0) {
                    return new SinglePosition(mousePos!.x! - 1, mousePos!.y! - 1)
                } else {
                    return new SinglePosition(mousePos!.x! - 1, mousePos!.y! + 1)
                }
            } if (deltaX < 0 && deltaY != 0) {
                if (deltaY > 0) {
                    return new SinglePosition(mousePos!.x! + 1, mousePos!.y! - 1)
                } else {
                    return new SinglePosition(mousePos!.x! + 1, mousePos!.y! + 1)
                }
            } else {
                if (deltaY > 0) {
                    return new SinglePosition(mousePos!.x!, mousePos!.y! - 1)
                } else {
                    return new SinglePosition(mousePos!.x!, mousePos!.y! + 1)
                }
            }
        }
        return goalPos;
    }

    getCurrentGoalPosition(mouseTargetList: SinglePosition[]): SinglePosition | undefined {
        if (mouseTargetList !== undefined && mouseTargetList.length > 0) {
            return mouseTargetList[mouseTargetList.length - 1];
        } else {
            return undefined;
        }
    }

    getNumberOfMice(): number {
        return this.numberOfMice;
    }

    getMouseWinCounter(): number {
        return this.mouseWinCounter;
    }

    killMouse(mouse: Entity): number {
        console.log("killing mouse");
        if (this.numberOfMice > 0) {
            const alive = mouse.getComponent<AliveComponent>("isAlive");
            if (alive.isAlive !== false) {
                console.log("NOW ACTUALLY killing mouse");
                this.numberOfMice--;
                alive.isAlive = false;
                console.log(mouse)
                console.log(this.numberOfMice)
                return 1;
            }
        }
        return 0;
    }
}

export class SinglePosition {
    x?: number;
    y?: number;

    constructor(xVal?: number, yVal?: number) {
        this.x = xVal;
        this.y = yVal;
    }

    static fromComponent(comp: PositionComponent): SinglePosition {
        return new SinglePosition(comp.x, comp.y);
    }
}