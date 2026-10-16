type Point = { x: number; y: number };
type Size = { width: number; height: number }

export function toScene(point: Point, size: Size): Point {
    return {
        x: (0.5 - point.x) * size.width,
        y: (0.5 - point.y) * size.height,

    };
}