export function isGreen(r: number, g: number, b: number): boolean {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if(max !== g) return false;
    if(max  < 40) return false;
    
    const sat = (max - min) / max;
    if(sat < 0.3) return false;

    const hue = 120 + 60 * (b - r) / (max - min);
    return hue >= 80 && hue <= 160;   // true green only, excludes yellow (60) and cyan (180)

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