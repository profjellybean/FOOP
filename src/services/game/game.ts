// import type { PeerService } from "../peer";
import { klona } from 'klona';
import { ref, shallowRef, type Ref, type ShallowRef, triggerRef } from "vue";
import type { PeerService } from '../peer';
import { ECS, Entity, type EntityMap } from "./ecs";
import { AppearanceComponent, PositionComponent, MapComponent, AliveComponent, PositionListComponent } from "./ecs/components";
import { MouseHelper, SinglePosition } from "./ecs/pathfinding";

export type GameSettings = {
  gameId: string;
  multiplayer: boolean;
  networked: boolean;
};

export class GameService {
  logTag = "[GameService]";
  _settings: GameSettings;
  gameFinished: boolean = false;
  peerService?: PeerService;
  entitySystem: ECS;
  map: ShallowRef<MapComponent> = shallowRef(new MapComponent());
  numberOfMice: number;

  currentState: Ref<GameState> = ref({} as GameState);
  stateBuffer: GameState = {} as GameState;
  mouseHelper: MouseHelper;
  counter = 0;
  killCount = 0;

  // constructor(peerService: PeerService, entitySystem?: ECS) {
  constructor(peerService?: PeerService, entitySystem?: ECS, settings?: GameSettings, numOfMice?: number) {
    this._settings = settings ?? { gameId: "game1", multiplayer: false, networked: false };
    this.mouseHelper = new MouseHelper();
    this.numberOfMice = this.mouseHelper.getNumberOfMice();
    this.peerService = peerService;
    this.entitySystem = entitySystem ?? new ECS(this.numberOfMice);
    this.map.value.init();
  }

  async updateOpponentPosition() {
    for (let i = 1; i <= this.numberOfMice; i++) {
      const mouse = this.entitySystem.getMouse(i.toString());
      if (this.entitySystem.isAlive(mouse.id)) {
        await this.mouseHelper.updateMousePosition(mouse, this.map.value);
      }
    }
  }

  startGame(players?: string[]) {
    this.currentState.value = {
      players: {
        ...this.generatePlayers(players)
      },
      opponents: {
        ...this.generateOpponents()
      }
    }

    this.stateBuffer = { ...this.currentState.value };

    // send start game event through the peerService
    if (this._settings.multiplayer && this._settings.networked) {
      this.peerService!.send({
        type: "start_game",
        value: {
          state: this.currentState.value
        }
      })
    }

    // after sending to peers make sure to await the acks from peers

    window.requestAnimationFrame(this._gameLoop.bind(this));
  }

  generatePlayers(players: string[] = []): EntityMap {
    const entities: EntityMap = {};
    for (const playerId of players) {
      const ent = this.entitySystem.createEntity(playerId);
      ent.addComponent(new AppearanceComponent(), { shape: 'cat' });
      ent.addComponent(new PositionComponent('pos'), { x: 50, y: 50 });
      // todo: add a collision component, to know when mice collide with cats
      // ent.addComponent(new CollisionComponent());

      entities[ent.id] = ent;
    }
    return entities;
  }

  generateOpponents(): EntityMap {
    const entities: EntityMap = {};
    for (let i = 0; i < this.numberOfMice; ++i) {
      const ent = this.entitySystem.createEntity();
      ent.addComponent(new AppearanceComponent(), { shape: 'mouse' });
      ent.addComponent(new PositionComponent('pos'), { x: this.mouseHelper.getInitialMouseX(), y: this.mouseHelper.getInitialMouseY() });
      ent.addComponent(new PositionComponent('goal'), { x: 85, y: 10 });
      ent.addComponent(new PositionListComponent('targetList'), this.generateMouseGoalList()); // getRandomPathStrategy
      ent.addComponent(new AliveComponent, { isAlive: true });
      // todo: add a collision component, to know when mice collide with cats
      // ent.addComponent(new CollisionComponent());

      entities[ent.id] = ent;
    }
    return entities;
  }

  randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }


  generateMouseGoalList(): SinglePosition[] {
    const positionList = [];
    // final goal goes first
    positionList.push(new SinglePosition(this.randomIntFromInterval(0, 99), this.randomIntFromInterval(0, 99))); // each mouse gets a random valid goal
    const random = this.randomIntFromInterval(1, 3);
    if (random == 1) {
      //PathStrategies.speedRunner
    } else if (random == 2) {
      //PathStrategies.chicken
      positionList.push(new SinglePosition(85, 10)); //TODO: implement?
    }
    else if (random == 3) {
      //PathStrategies.tourist
      for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
        positionList.push(new SinglePosition(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)));
      }
    }

    return positionList;
  }

  emit(entityId: string, event: string, payload?: any) {
    const entity = klona(this.stateBuffer.players[entityId]);
    if (!entity) {
      console.warn(`${this.logTag} Entity with ID ${entityId} not found`);
      return;
    }

    switch (event) {
      case "move":
        this._handleMove(entity, payload);
        break;
    }

    this.stateBuffer.players[entityId] = entity;
  }

  checkBorder(x: number, y: number) {
    if (this.map.value.map![x] == undefined) {
      return false;
    }
    if (this.map.value.map![x][y] == undefined) {
      return false;
    }
    return true;
  }

  _handleMove(entity: Entity, payload: string) {
    const pos = entity.getComponent<PositionComponent>("pos");
    switch (payload) {
      case "up":
        if (!this.checkBorder(pos.x! - 1, pos.y!)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null; // vorige Position freigeben
        pos.x = pos.x! - 1;
        this.checkCollision(pos.x!, pos.y!);
        this.map.value.map![pos.x!][pos.y!].occupied = entity; // neue Position belegen
        break;
      case "right":
        if (!this.checkBorder(pos.x!, pos.y! + 1)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.y = pos.y! + 1;
        this.checkCollision(pos.x!, pos.y!);
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      case "left":
        if (!this.checkBorder(pos.x! - 1, pos.y! - 1)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.y = pos.y! - 1;
        this.checkCollision(pos.x!, pos.y!);
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      case "down":
        if (!this.checkBorder(pos.x! + 1, pos.y!)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.x = pos.x! + 1;
        this.checkCollision(pos.x!, pos.y!);
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      default:
        console.warn(`${this.logTag} Unknown direction ${payload}`);
    }

  }

  checkCollision(x: number, y: number) { //cat too small, only 1x1
    this.killChecker(x, y);
    //ugly code but it works:
    x = x - 1; //check left -1 0
    this.killChecker(x, y);
    x = x + 2; //check right 1 0
    this.killChecker(x, y);
    x = x - 1; //check down 0 -1
    y = y - 1;
    this.killChecker(x, y);
    y = y + 2; //check up 0 1
    this.killChecker(x, y);
    x = x + 1; // check right upper corner 1 1
    this.killChecker(x, y);
    y = y - 2; // check right lower corner 1 -1
    this.killChecker(x, y);
    x = x - 2; // check left lower corner -1 -1
    this.killChecker(x, y);
    y = y + 2; // check left upper corner -1 1
    this.killChecker(x, y);
  }

  killChecker(x: number, y: number) {
    if (y >= 0 && y < 100 && x >= 0 && x < 100) {
      if (this.map.value.map![x][y].occupied != null && this.map.value.map![x][y].type != 'underground') {
        const i = this.map.value.map![x][y].occupied?.id;
        const mouse = this.entitySystem.getMouse(i!.toString())
        this.killCount += this.mouseHelper.killMouse(mouse);
      }
    }
  }

  async _gameLoop() {
    this.counter++;
    if (this.counter % 7 === 0) {
      this.counter = 0;
      await this.updateOpponentPosition();
    }

    triggerRef(this.map);

    // todo: send the game changed gameloop update to peers
    if (this._settings.multiplayer && this._settings.networked) {
      this.peerService!.send({
        type: "update",
        value: this.stateBuffer
      });
    }

    this.entitySystem.update(this.stateBuffer.players);
    this.entitySystem.update(this.stateBuffer.opponents);

    this.stateBuffer = { ...this.currentState.value };

    if (this.gameFinished === true) {
      return;
    }

    window.requestAnimationFrame(this._gameLoop.bind(this));
  }
}

export type GameState = {
  //entities: EntityMap,
  players: EntityMap,
  opponents: EntityMap
}

enum PathStrategies {
  speedRunner,
  chicken,
  tourist
}