import type { Entity } from "./index";
import type { SinglePosition } from "./pathfinding";

export interface Component {
  id: string;
  init(params: any): Component;
}

export const mapComponentFromJson = (json: any): Component => {
  let comp: Component;
  switch (json.id) {
    case 'map':
      comp = new MapComponent();
      comp.init(json);
      break;
    case 'pos':
    case 'goal':
      comp = new PositionComponent(json.id);
      comp.init(json);
      break;
    case 'ap':
      comp = new AppearanceComponent();
      comp.init(json);
      break;
    case 'isAlive':
      comp = new AliveComponent();
      comp.init(json.isAlive);
      break;
    case 'targetList':
      comp = new PositionListComponent(json.id);
      comp.init(json.positions);
      break;
    default:
      throw new Error(`Unknown component type ${json.id}`);
  }

  return comp;
};

export class AppearanceComponent implements Component {
  id: string = "ap";
  shape?: string;

  init(params: any): Component {
    this.shape = params.shape ?? 'mouse'; //could be 'cat' as well
    return this;
  }
}

export class PositionComponent implements Component {
  id: string; //could be 'pos' or 'goal' or 'tempDest' // TODO: should this be an enum?
  x?: number;
  y?: number;

  constructor(componentName: string) {
    this.id = componentName;
  }

  init(params: any): Component {
    this.x = params.x ?? 0;
    this.y = params.y ?? 0;
    return this;
  }
}

export class PositionListComponent implements Component {
  id: string;
  positions: SinglePosition[];

  constructor(componentName: string) {
    this.id = componentName;
    this.positions = [];
  }

  init(params: any): Component {
    this.positions = params;
    return this;
  }
}

export class AliveComponent implements Component {
  id: string = "isAlive";
  isAlive?: boolean;

  init(params: any): Component {
    this.isAlive = params ?? false;
    return this;
  }

}

type FieldInfo = {
  occupied: Entity | null;
  type: 'surface' | 'underground' | 'entry' | 'meeting';
};

export class MapComponent implements Component {
  id: string = "map";
  map?: FieldInfo[][];

  init(params?: any): Component {
    this.map = Array(100);
    for (let i = 0; i < 100; i++) {
      this.map[i] = new Array(100);
      for (let j = 0; j < 100; j++) {
        if (i % 20 === 0 && i !== 0) {
          this.map[i][j] = {
            occupied: null,
            type: 'underground'
          };
        } else {
          this.map[i][j] = {
            occupied: null,
            type: 'surface'
          };
        }
      }
    }
    this.map[99][10] = {
      occupied: null,
      type: 'meeting'
    }
    this.map[20][10] = {
      occupied: null,
      type: 'entry'
    }
    this.map[20][80] = {
      occupied: null,
      type: 'entry'
    }
    this.map[40][90] = {
      occupied: null,
      type: 'entry'
    }
    this.map[40][20] = {
      occupied: null,
      type: 'entry'
    }
    this.map[60][10] = {
      occupied: null,
      type: 'entry'
    }
    this.map[60][30] = {
      occupied: null,
      type: 'entry'
    }
    this.map[80][90] = {
      occupied: null,
      type: 'entry'
    }
    this.map[80][10] = {
      occupied: null,
      type: 'entry'
    }
    return this;
  }
}