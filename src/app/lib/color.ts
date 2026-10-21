export function isGreen(r: number, g: number, b: number): boolean {
    return g > 80 && g > r*1.4 && g > b*1.4;
}

export function greenScore(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number
): number {
    const size = radius * 2;
    const { data } = ctx.getImageData(Math.round(cx - radius), Math.round(cy - radius), size, size);
    let greenPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (isGreen(r, g, b)) {
            greenPixels++;
        }
    }
    return greenPixels / (size * size);

}