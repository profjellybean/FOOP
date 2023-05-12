// import type { PeerService } from "../peer";
import { klona } from 'klona';
import { ref, type Ref } from "vue";
import type { PeerService } from '../peer';
import { ECS, Entity, type EntityMap } from "./ecs";
import { AppearanceComponent, PositionComponent, MapComponent, AliveComponent } from "./ecs/components";
import { MouseHelper } from "./ecs/pathfinding";

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
  map: Ref<MapComponent> = ref(new MapComponent());
  numberOfMice: number;

  currentState: Ref<GameState> = ref({} as GameState);
  stateBuffer: GameState = {} as GameState;
  mouseHelper: MouseHelper;

  // constructor(peerService: PeerService, entitySystem?: ECS) {
  constructor(peerService?: PeerService, entitySystem?: ECS, settings?: GameSettings, numOfMice?: number) {
    this._settings = settings ?? { gameId: "game1", multiplayer: false, networked: false };
    this.mouseHelper = new MouseHelper(this.map);
    this.numberOfMice = this.mouseHelper.getNumberOfMice();
    this.peerService = peerService;
    this.entitySystem = entitySystem ?? new ECS(this.numberOfMice);
    this.map.value.init();
  }

  updateOpponentPosition() {
    for (let i = 1; i <= this.numberOfMice; i++) {
      const mouse = this.entitySystem.getMouse(i.toString());
      if (this.entitySystem.isAlive(mouse.id)) {
        this.mouseHelper.updateMousePosition(mouse);
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
      ent.addComponent(new PositionComponent('goal'), { x: 80, y: 0 });
      ent.addComponent(new AliveComponent, { isAlive: true });
      // todo: add a collision component, to know when mice collide with cats
      // ent.addComponent(new CollisionComponent());

      entities[ent.id] = ent;
    }
    return entities;
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
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.x = pos.x! - 1;
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      case "right":
        if (!this.checkBorder(pos.x!, pos.y! + 1)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.y = pos.y! + 1;
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      case "left":
        if (!this.checkBorder(pos.x! - 1, pos.y! - 1)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.y = pos.y! - 1;
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      case "down":
        if (!this.checkBorder(pos.x! + 1, pos.y!)) {
          break;
        }
        this.map.value.map![pos.x!][pos.y!].occupied = null;
        pos.x = pos.x! + 1;
        this.map.value.map![pos.x!][pos.y!].occupied = entity;
        break;
      default:
        console.warn(`${this.logTag} Unknown direction ${payload}`);
    }
    //checkCollision();
  }



  _gameLoop() {
    this.updateOpponentPosition();

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