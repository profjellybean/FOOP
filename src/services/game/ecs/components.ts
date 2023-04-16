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
  compName: string = "pos";
  x?: number;
  y?: number;

  init(params: any): Object {
    return {
      x: params.x ?? 0,
      y: params.y ?? 0
    }
  }
}