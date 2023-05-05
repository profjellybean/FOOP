// import type { PeerService } from "../peer";
import { klona } from 'klona';
import { ref, type Ref } from "vue";
import type { PeerService } from '../peer';
import { ECS, Entity, type EntityMap } from "./ecs";
import { AppearanceComponent, PositionComponent } from "./ecs/components";

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

  currentState: Ref<GameState> = ref({} as GameState);
  stateBuffer: GameState = {} as GameState;

  // constructor(peerService: PeerService, entitySystem?: ECS) {
  constructor(peerService?: PeerService, entitySystem?: ECS, settings?: GameSettings) {
    this._settings = settings ?? { gameId: "game1", multiplayer: false, networked: false };
    this.peerService = peerService;
    this.entitySystem = entitySystem ?? new ECS();
  }

  startGame(players?: string[]) {
    this.currentState.value = {
      entities: {
        ...this.generatePlayers(players)
      },
      // entities: {
      //   ...this.generateOpponents()
      // }
    }

    this.stateBuffer = { ...this.currentState.value };

    // send start game event through the peerService
    if (this._settings.multiplayer && this._settings.networked) {
      this.peerService!.send({
        type: "initial_state_sync",
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
      ent.addComponent(new PositionComponent(), { x: (Math.random() * 1000) / (Math.random() * 10), y: (Math.random() * 1000) / (Math.random() * 10) });
      // todo: add a collision component, to know when mice collide with cats
      // ent.addComponent(new CollisionComponent());

      entities[ent.id] = ent;
    }
    return entities;
  }

  generateOpponents(): EntityMap {
    const entities: EntityMap = {};
    for (let i = 0; i < 10; ++i) {
      const ent = this.entitySystem.createEntity();
      ent.addComponent(new AppearanceComponent(), { shape: 'mouse' });
      ent.addComponent(new PositionComponent(), { x: (Math.random() * 1000) / (Math.random() * 10), y: (Math.random() * 1000) / (Math.random() * 10) });
      // todo: add a collision component, to know when mice collide with cats
      // ent.addComponent(new CollisionComponent());

      entities[ent.id] = ent;
    }
    return entities;
  }

  emit(entityId: string, event: string, payload?: any) {
    const entity = klona(this.stateBuffer.entities[entityId]);
    if (!entity) {
      console.warn(`${this.logTag} Entity with ID ${entityId} not found`);
      return;
    }

    switch (event) {
      case "move":
        this._handleMove(entity, payload);
        break;
    }

    this.stateBuffer.entities[entityId] = entity;
  }

  _handleMove(entity: Entity, payload: string) {
    const pos = entity.getComponent<PositionComponent>("pos");
    switch (payload) {
      case "up":
        pos.y = pos.y! - 10;
        break;
      case "down":
        pos.y = pos.y! + 10;
        break;
      case "left":
        pos.x = pos.x! - 10;
        break;
      case "right":
        pos.x = pos.x! + 10;
        break;
      default:
        console.warn(`${this.logTag} Unknown direction ${payload}`);
    }
  }

  _gameLoop() {

    // todo: send the game changed gameloop update to peers
    if (this._settings.multiplayer && this._settings.networked) {
      this.peerService!.send({
        type: "update",
        value: this.stateBuffer
      });
    }

    this.entitySystem.update(this.stateBuffer.entities);

    this.stateBuffer = { ...this.currentState.value };

    if (this.gameFinished === true) {
      return;
    }

    window.requestAnimationFrame(this._gameLoop.bind(this));
  }
}

export type GameState = {
  // players: EntityMap
  entities: EntityMap
}