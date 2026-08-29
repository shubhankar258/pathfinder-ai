declare module 'ogl' {
  export class Renderer {
    constructor(options?: any);
    gl: WebGLRenderingContext | any;
    dpr: number;
    setSize(width: number, height: number): void;
    render(options: { scene: any; camera?: any }): void;
  }
  export class Program {
    constructor(gl: any, options: any);
    uniforms: any;
  }
  export class Mesh {
    constructor(gl: any, options: { geometry: any; program: any });
  }
  export class Triangle {
    constructor(gl: any);
  }
  export class Color {
    constructor(...args: any[]);
    r: number;
    g: number;
    b: number;
    set(...args: any[]): void;
  }
}
