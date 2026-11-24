"""Generate the Haql al-Alghaam (حقل الألغام) master SVGs: the tile shell, lockups and wordmark.
usage: build_kit.py name.json outdir   (name.json = the name outlined from Reem Kufi Bold, font units, baseline y=0)

Unit x = the main fuse width, 16 (of 256). Clear space 2x; the lockup gap is 2x too. Dependency-free."""
import json, math, os, sys

name = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

NIGHT, SAND, FLAME, EMBER = "#23291c", "#ece0c4", "#ef6a2e", "#b8461a"
TITLE = "حقل الألغام"
# scheme: (body+fuse, flame, name). color-dark is for dark backgrounds, color-light for light ones.
SCHEMES = {"color-dark": (SAND, FLAME, SAND), "color-light": (NIGHT, EMBER, NIGHT)}


def rr(x, y, w, h, r):
    return (f"M{x+r:g} {y:g}h{w-2*r:g}a{r:g} {r:g} 0 0 1 {r:g} {r:g}v{h-2*r:g}a{r:g} {r:g} 0 0 1 {-r:g} {r:g}"
            f"h{-(w-2*r):g}a{r:g} {r:g} 0 0 1 {-r:g} {-r:g}v{-(h-2*r):g}a{r:g} {r:g} 0 0 1 {r:g} {-r:g}Z")


def flame(x, y, s):  # teardrop pointing up, base centre (x,y), height 2s
    return (f"M{x:g} {y-2*s:g}C{x+s*0.9:g} {y-s:g} {x+s:g} {y-s*0.2:g} {x:g} {y+s*0.1:g}"
            f"C{x-s:g} {y-s*0.2:g} {x-s*0.9:g} {y-s:g} {x:g} {y-2*s:g}Z")


def fuse(x0, y0, x1, y1, cx, cy, w):  # a thick quadratic band as a filled outline
    pts = []
    for k in range(41):
        t = k / 40
        x = (1-t)**2*x0 + 2*(1-t)*t*cx + t*t*x1
        y = (1-t)**2*y0 + 2*(1-t)*t*cy + t*t*y1
        dx = 2*(1-t)*(cx-x0) + 2*t*(x1-cx)
        dy = 2*(1-t)*(cy-y0) + 2*t*(y1-cy)
        n = math.hypot(dx, dy)
        pts.append((x, y, -dy/n*w/2, dx/n*w/2))
    a = [(x+nx, y+ny) for x, y, nx, ny in pts]
    b = [(x-nx, y-ny) for x, y, nx, ny in reversed(pts)]
    return a + b


def poly(p):
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in p) + "Z"


def ink(parts):
    """ink bbox (x0,y0,x1,y1) of fuse polygons, body rect and flame (bezier sampled)."""
    xs, ys = [], []
    for kind, v in parts:
        if kind == "rect":
            x, y, w, h, _r = v; xs += [x, x+w]; ys += [y, y+h]
        elif kind == "poly":
            xs += [p[0] for p in v]; ys += [p[1] for p in v]
        else:
            x, y, s = v
            for t in [i/20 for i in range(21)]:
                for (p0, p1, p2, p3) in (((x, y-2*s), (x+s*.9, y-s), (x+s, y-s*.2), (x, y+s*.1)),
                                         ((x, y+s*.1), (x-s, y-s*.2), (x-s*.9, y-s), (x, y-2*s))):
                    xs.append((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0])
                    ys.append((1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1])
    return min(xs), min(ys), max(xs), max(ys)


# Main cut: body field square with a gloss arc cut out, fuse, flame (approved concept B v3).
G = fuse(58, 150, 96, 104, 60, 108, 11)
F1 = fuse(172, 92, 210, 46, 216, 86, 16)
MAIN = dict(body=(36, 80, 160, 160, 34), gloss=G, fuse=F1, flame=(212, 42, 17))
# Small cut (16-32 px): no gloss, fuse 26 wide, bigger flame, body 168. Gaps are >= 16 units (1 px at 16 px).
F2 = fuse(160, 100, 204, 66, 214, 100, 26)
SMALL = dict(body=(12, 84, 168, 168, 36), gloss=None, fuse=F2, flame=(214, 58, 26))


def box(c):
    parts = [("rect", c["body"]), ("poly", c["fuse"]), ("flame", c["flame"])]
    return ink(parts)


def offset(c):  # shift that centres the ink box in the 256 box
    x0, y0, x1, y1 = box(c)
    return 128 - (x0+x1)/2, 128 - (y0+y1)/2


def sym(c, body, flm, dx=0, dy=0):
    ox, oy = offset(c)
    d = rr(*c["body"]) + (poly(c["gloss"]) if c["gloss"] else "")
    return (f'<g transform="translate({dx+ox:.2f} {dy+oy:.2f})"><g fill="{body}">'
            f'<path fill-rule="evenodd" d="{d}"/><path d="{poly(c["fuse"])}"/></g>'
            f'<path fill="{flm}" d="{flame(*c["flame"])}"/></g>')


# ink box of the main cut in the centred 256 frame
_x0, _y0, _x1, _y1 = box(MAIN); _ox, _oy = offset(MAIN)
INK = (_x0+_ox, _y0+_oy, _x1+_ox, _y1+_oy)
X = 16
GAP = 2 * X
PAD = 2 * X
SH = INK[3] - INK[1]
H = 1018.0
s = 0.58 * SH / H  # name ascender height = 58 % of the symbol height
nw = (name["xmax"] - name["xmin"]) * s
desc = name["ymax"] * s


def word(x_left, baseline, fill):
    return (f'<path fill="{fill}" transform="translate({x_left - name["xmin"]*s:.2f} {baseline:.2f}) scale({s:.5f})" '
            f'd="{name["d"]}"/>')


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" width="{w:.0f}" height="{h:.0f}">'
            f'<title>{TITLE}</title>{body}</svg>\n')


def save(fn, text):
    open(os.path.join(out, fn), "w").write(text)


for sc, (bd, fl, nm) in SCHEMES.items():
    for fn, c in (("symbol", MAIN), ("symbol-small", SMALL)):
        save(f"{fn}-{sc}.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>{TITLE}</title>{sym(c, bd, fl)}</svg>\n')

    # Horizontal, right to left: symbol right, name left, baseline on the body's bottom edge.
    W = PAD + nw + GAP + (INK[2] - INK[0]) + PAD
    Hh = PAD + SH + desc + PAD
    sx = PAD + nw + GAP - INK[0]
    save(f"lockup-horizontal-{sc}.svg", svg(W, Hh, word(PAD, PAD + SH, nm) + sym(MAIN, bd, fl, sx, PAD - INK[1])))

    # Stacked: symbol centred above the name.
    SW = PAD * 2 + max(nw, INK[2] - INK[0])
    base = PAD + SH + GAP + H * s
    save(f"lockup-stacked-{sc}.svg", svg(SW, base + desc + PAD,
         sym(MAIN, bd, fl, SW / 2 - 128, PAD - INK[1]) + word(SW / 2 - nw / 2, base, nm)))

    save(f"wordmark-{sc}.svg", svg(nw + 2 * PAD, H * s + desc + 2 * PAD, word(PAD, PAD + H * s, nm)))

print("ink", [round(v, 1) for v in INK], "name scale", round(s, 4), "wrote", sorted(os.listdir(out)))
