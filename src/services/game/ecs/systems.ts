import type { Entity } from ".";

export function renderSystem(entities: Entity[]) {
  for (const entity in entities) {
    // update the entities positions
    console.log(entity)
  }
}