export interface Component {
  compName: string;
  init(params: any): Object;
}

export class AppearanceComponent implements Component {
  compName: string = "ap";
  shape?: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(params: any): Object {
    return {
      shape: params.shape ?? 'mouse', //could be 'cat' as well
    }
  }
}

export class PositionComponent implements Component {
  compName: string; //could be 'pos' or 'goal' or 'tempDest' // TODO: should this be an enum?
  x?: number;
  y?: number;

  constructor (componentName: string) {
    this.compName = componentName;
  }

  init(params: any): Object {
    return {
      x: params.x ?? 0,
      y: params.y ?? 0
    }
  }
}

export class AliveComponent implements Component {
  compName: string = "isAlive";
  isAlive?: boolean;

  init(params: any): Object {
    return {
      isAlive: params ?? false
    }
  }

}

type FieldInfo = {
  occupied: Component | null;
  type: 'surface' | 'underground' | 'entry' | 'meeting';
};

export class MapComponent implements Component {
  compName: string = "map";
  map?: FieldInfo[][];

  init(params?: any): Object {
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
    this.map[80][0] = {
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
    return this.map;
  }
}