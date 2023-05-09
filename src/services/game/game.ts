// import type { PeerService } from "../peer";
import { useThrottleFn, type PromisifyFn } from '@vueuse/core';
import { klona } from 'klona';
import { inject, ref, type Ref } from "vue";
import type { PeerService } from '../peer';
import type { InitialSyncMessage, PeerContext, StartGameMessage } from '../peer/data_handlers/types';
import { PeerServiceHook } from '../peer/types';
import { ECS, Entity, type EntityMap } from "./ecs";
import { AliveComponent, AppearanceComponent, MapComponent, PositionComponent } from "./ecs/components";
import { MouseHelper } from "./ecs/pathfinding";
import { _handleMove } from './handlers/move';
import type { GameContext, GameSettings } from './types';

export class GameService {
  logTag = "[GameService]";
  _settings: GameSettings;
  context: GameContext = {} as GameContext;
  gameFinished: boolean = false;
  peerService?: PeerService;
  entitySystem: ECS;
  map: Ref<MapComponent> = ref(new MapComponent());
  numberOfMice: number;

  currentState: Ref<GameState> = ref({} as GameState);
  stateBuffer: GameState = {} as GameState;
  mouseHelper: MouseHelper;

  _multiplayerUpdater?: PromisifyFn<() => void>;

  // constructor(peerService: PeerService, entitySystem?: ECS) {
  constructor(peerService?: PeerService, entitySystem?: ECS, settings?: GameSettings, numOfMice?: number) {
    this._settings = settings ?? { multiplayer: false, networked: false };
    this.mouseHelper = new MouseHelper(this.map);
    this.numberOfMice = this.mouseHelper.getNumberOfMice();
    this.peerService = peerService ?? inject("peerService") as PeerService;
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

  initMultiplayer() {
    if (this._settings.multiplayer && this._settings.networked) {
      if (this.peerService!.lobbySettings.value.lobbyId === null) {
        throw new Error(this.logTag + " Cannot start game without lobbyId");
      }

      if (!this.peerService!.peer) {
        return;
      }

      this.context.gameId = this.peerService!.lobbySettings.value.lobbyId;

      console.log(this.context.gameId, this.peerService!.peer.value!.id, this.peerService!.lobbySettings.value)
      // console.log(settings.lobbyId, this.peerService!.peer.value!.id, this.context.gameId === this.peerService!.peer.value!.id)
      if (this.context.gameId === this.peerService!.peer.value!.id) {
        // user is host
        this.peerService!.dataHandler!.registerHandler("sync_ack", this._handleInitialSyncAck.bind(this));
      } else {
        this.peerService!.dataHandler!.registerHandler("initial_state_sync", this._handleInitialSync.bind(this));
      }

      this._multiplayerUpdater = useThrottleFn(() => {
        this.peerService!.send({
          type: "update",
          value: this.stateBuffer
        });
      }, 3000);
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

    if (this._settings.multiplayer && this._settings.networked) {
      this.peerService!.setHook(PeerServiceHook.PEER_CONNECTION, (connection) => {
        if (this.context.started === true && !this.context.players![connection.peer]) {
          console.error(this.logTag + " Peer cannot connect to game, game is already running");
          // todo: maybe emitting an event would also help, haven't tested it yet
          // connection.emit("game_error", "Game is already running");
          connection.removeAllListeners();
          connection.close();
          return false;
        }
        return true;
      });


      if (this.peerService?.peer.value) {
        // set the players for the current game and set their ready state to false, 
        // will be set to true after they ack'ed the initial sync
        this.context.players = this.peerService!.peerConnections.value.map((conn) => (
          { [conn.peer]: { id: conn.peer, ready: false } })).reduce((acc, curr) => ({ ...acc, ...curr }), {});
        // send start game event through the peerService
        this.peerService!.send({
          type: "initial_state_sync",
          value: this.currentState.value
        })
      }

      // after sending to peers make sure to await the acks from peers

    }
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
        _handleMove(entity, payload);
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
  }

  _gameLoop() {

    // todo: send the game changed gameloop update to peers
    if (this._settings.multiplayer && this._settings.networked) {
      this._multiplayerUpdater!();
    }

    this.entitySystem.update(this.stateBuffer.players);
    this.entitySystem.update(this.stateBuffer.opponents);

    this.stateBuffer = { ...this.currentState.value };

    if (this.gameFinished === true) {
      return;
    }

    window.requestAnimationFrame(this._gameLoop.bind(this));
  }

  /**
   * Handles the initial sync of the given data, sending the host an ack message, when we
   * successfully imported the game state.
   * @param context Provides access to the peerService and the senderId
   * @param data a sync ack message with no additional data
   * @returns -
   */
  async _handleInitialSync(context: PeerContext, data: InitialSyncMessage) {
    console.log(this.logTag + " handling initial sync");
    this.currentState.value = data.value;

    // state is theoretically synced

    const host = context.peerService.peerConnections.value.filter((conn) => conn.peer === context.peerService.lobbySettings.value.lobbyId)[0];

    if (!host) {
      console.error(this.logTag + " Cannot find host connection");
    }

    console.log(this.logTag + " sending sync ack to host");

    host.send({
      type: "sync_ack"
    });

    this.peerService!.dataHandler!.removeHandler("initial_state_sync");
    this.peerService!.dataHandler!.registerHandler("start_game", this._handleStartGame.bind(this));
  }

  /**
   * Handles an ack from a peer, when they successfully imported the game state.
   * Will check if all players in the given game context are ready and start the game if so.
   * @param context Provides access to the peerService and the senderId
   * @param data a sync ack message with no additional data
   * @returns -
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _handleInitialSyncAck(context: PeerContext, data: { type: "sync_ack" }) {
    // todo check if all peers in the game have sent an ack
    // if so, send the `start_game` event to the peers
    console.log(this.logTag + " handle sync_ack data");

    if (!this.context.players) {
      console.log(this.logTag + " got handleSyncAck but no players");
      return;
    }

    const player = this.context.players[context.senderId];
    if (!player) {

      console.warn(this.logTag + " Got initial handle async from peer id: " + context.senderId + " but no player was found in context");
      return;
    }

    player.ready = true;

    if (Object.values(this.context.players!).every((player) => player.ready === true)) {
      // send start game event
      this.peerService!.send({
        type: "start_game",
        value: this.context.gameId
      });
      this.context.started = true;
      console.log("TODO GAMEL LOOP SHOULD START HERE")
      window.requestAnimationFrame(this._gameLoop.bind(this));
    }
  }

  /**
   * Handles the start game event, which will require the game service hooks 
   * for start game to run and finish successfully, and only then start the game loop
   * @param context Provides access to the peerService and the senderId
   * @param data -
   */
  async _handleStartGame(context: PeerContext, data: StartGameMessage) {
    this.context.started = true;
    console.log("starting gaame");

    console.log("TODO GAME LOOP SHOULD START HERE");
    window.requestAnimationFrame(this._gameLoop.bind(this));
  }
}

export type GameState = {
  //entities: EntityMap,
  players: EntityMap,
  opponents: EntityMap
}