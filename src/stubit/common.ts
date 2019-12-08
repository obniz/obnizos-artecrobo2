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

function _componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function _rgbToHex(r: number, g: number, b: number) {
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
}

export function ColorToHex(color: Color) {
    return "#" + _componentToHex(color[0]) + _componentToHex(color[1]) + _componentToHex(color[2]);
}

export function hexToColor(hex: string): Color {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`it is not hex color`)
    }
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

export const Cookies = {
    set: function (b:any, c:any, a?:any) {
        b = [encodeURIComponent(b) + "=" + encodeURIComponent(c)];
        a && ("expiry" in a && ("number" == typeof a.expiry && (a.expiry = new Date(1E3 * a.expiry + +new Date)), b.push("expires=" + a.expiry.toGMTString())), "domain" in a && b.push("domain=" + a.domain), "path" in a && b.push("path=" + a.path), "secure" in a && a.secure && b.push("secure"));
        document.cookie = b.join("; ")
    },
    get: function (b:any) : string | null {
        for (var a = [], e = document.cookie.split(/; */), d = 0; d < e.length; d++) {
            var f = e[d].split("="); f[0] == encodeURIComponent(b) && a.push(decodeURIComponent(f[1].replace(/\+/g, "%20")))
        }
        return a[0]
    },
    clear: function (b:any, c?:any) { c || (c = {}); c.expiry = -86400; this.set(b, "", c) }
};