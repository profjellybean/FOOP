import type { Entity } from "../ecs";
import type { PositionComponent } from "../ecs/components";

export function _handleMove(entity: Entity, payload: string) {
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
      console.warn(`Unknown direction ${payload}`);
  }
}