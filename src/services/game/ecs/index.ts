import { mapComponentFromJson, type AliveComponent, type Component } from "./components";

export type EntityMap = { [key: string]: Entity };

export class ECS {
  _entityCount: number = 0;
  _entities: EntityMap;
  numberOfMice: number;



  constructor(numOfMice: number) {
    this.numberOfMice = numOfMice;
    this._entities = {};
  }

  getMouse(id: string): Entity {
    return this._entities[id];
  }

  isAlive(id: string): boolean {
    return this._entities[id].getComponent<AliveComponent>("isAlive").isAlive!;
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

  importEntities(ents: EntityMap): EntityMap {
    const imported: EntityMap = {};
    for (const entId in ents) {
      if (this._entities[entId]) {
        console.error(`Entity with ID ${entId} already exists; I assume that this entity is the same, won't import...`);
      }

      this._entities[entId] = imported[entId] = Entity.fromJson(ents[entId]);
    }
    this._entityCount = Object.keys(this._entities).length;

    return imported;
  }
}

type ComponentMap = { [key: string]: Component };

export class Entity {
  id: string;
  components: ComponentMap = {};

  constructor(id: string) {
    this.id = id;
  }

  static fromJson(json: Entity): Entity {
    const entity = new Entity(json.id);
    for (const compId in json.components) {
      entity.components[compId] = mapComponentFromJson(json.components[compId]);
    }
    return entity;
  }

  addComponent(component: Component, params?: any) {
    this.components[component.id] = component.init(params)
  };

  getComponent<T>(componentKey: string): T {
    return this.components[componentKey] as T;
  }
}