import type { AliveComponent, Component } from "./components";

export type EntityMap = { [key: string]: Entity };

export class ECS {
  _entityCount: number = 0;
  _entities: EntityMap = {};
  numberOfMice: number;



  constructor(numOfMice: number) {
    this.numberOfMice = numOfMice;
  }

  getMouse(id: String): Entity {
    return this._entities[`${id}`];
  }

  isAlive(id: String): boolean {
    return this._entities[`${id}`].getComponent<AliveComponent>("isAlive").isAlive!;
  }

  createEntity(preferredId?: string): Entity {
    if (!preferredId) {
      preferredId = this._entityCount.toString();
    }

    if (this._entities[preferredId]) {
      throw new Error(`Entity with ID ${preferredId} already exists`);
    }

    const entity: Entity = new Entity(preferredId);
    this._entities[entity.id] = entity;
    this._entityCount++;
    return entity;
  }

  importEntities(ents: EntityMap): void {
    // todo: check if there are any colliding Entity IDs, if soo, what happens?
    this._entities = { ...this._entities, ...ents };
  }

  update(entities: EntityMap) {
    this.importEntities(entities);
  }
}

export class Entity {
  id: string;
  components: { [name: string]: Object } = {};

  constructor(id: string) {
    this.id = id;
  }

  addComponent(component: Component, params?: any) {
    this.components[component.compName] = component.init(params)
  };

  getComponent<T>(componentKey: string): T {
    return this.components[componentKey] as T;
  }
}