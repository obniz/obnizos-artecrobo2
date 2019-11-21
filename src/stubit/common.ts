export type Color = [number, number, number];

export function _rgb_24bit(color: Color): number {
    const r = Math.max(Math.min(color[0], 255), 0);
    const g = Math.max(Math.min(color[1], 255), 0);
    const b = Math.max(Math.min(color[2], 255), 0);
    return (r << 16) + (g << 8) + (b);
}

export function  _24bit_rgb( val24: number): Color {

    const r = (val24 >> 16) & 0x000000ff;
    const g = (val24 >>  8) & 0x000000ff;
    const b =  val24        & 0x000000ff;
    return [r, g, b];
}
