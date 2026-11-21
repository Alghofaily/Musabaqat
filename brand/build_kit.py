"""Generate the مسابقات (Three Dots) master SVGs into <outdir>.
usage: build_kit.py name.json outdir"""
import json, math, os, sys

name = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
INK, PAPER = "#0b1220", "#f7f3ea"
SCHEMES = {  # dots (top, right, left) and the name's colour
    "dark": (("#16c784", "#f6c343", "#4f7fd8"), PAPER),   # on ink: the share card, dark pages
    "light": (("#0b8a5a", "#b97f06", "#2c56a8"), INK),    # on white or paper
    "ink": ((INK,) * 3, INK),                            # one colour
    "paper": ((PAPER,) * 3, PAPER),
}
TITLE = "مسابقات"


def dots(side, gap, cy_mid=125):
    """Three rhombi (squares at 45°) like the dots over ث: one on top, two below.
    The two lower tips and both diagonal edges are `gap` apart."""
    h = side / math.sqrt(2)                       # half-diagonal
    dx = 2 * h + gap                              # lower centres, tip gap = gap
    dy = math.sqrt(2) * (side + gap) - dx / 2     # top-to-lower edge gap = gap
    top_cy = cy_mid - (dy + 2 * h) / 2 + h
    pts = [(128, top_cy), (128 + dx / 2, top_cy + dy), (128 - dx / 2, top_cy + dy)]
    f = lambda v: f"{v:.2f}".rstrip("0").rstrip(".")
    return [f"M{f(x)} {f(y - h)}L{f(x + h)} {f(y)}L{f(x)} {f(y + h)}L{f(x - h)} {f(y)}Z" for x, y in pts]


MAIN = dots(72, 18)
SMALL = dots(76, 24)  # ≤ 32 px: wider gaps so the dots stay apart


def paths(ds, cols, transform=""):
    t = f' transform="{transform}"' if transform else ""
    return "".join(f'<path fill="{c}"{t} d="{d}"/>' for d, c in zip(ds, cols))


def svg(body, vb="0 0 256 256"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>{TITLE}</title>{body}</svg>\n'


for scheme, (cols, _) in SCHEMES.items():
    open(f"{out}/symbol-{scheme}.svg", "w").write(svg(paths(MAIN, cols)))
    open(f"{out}/symbol-small-{scheme}.svg", "w").write(svg(paths(SMALL, cols)))

# Tile icon (favicon / app icon / family row): paper tile, like the games' coloured tiles (rx 56).
open(f"{out}/symbol-tile.svg", "w").write(svg(
    f'<rect width="256" height="256" rx="56" fill="{PAPER}"/>' +
    paths(SMALL, SCHEMES["light"][0], "matrix(.78 0 0 .78 28.16 30.5)")))

# Lockups. Name ink 120 tall; RTL: symbol on the right.
s = 120 / (name["ymax"] - name["ymin"])
nw = (name["xmax"] - name["xmin"]) * s
GAP = 40  # clear-space unit: about one dot's half-diagonal


def word(x, y_top, fill):
    tx, ty = x - name["xmin"] * s, y_top - name["ymin"] * s
    return f'<path fill="{fill}" transform="matrix({s:.5f} 0 0 {s:.5f} {tx:.2f} {ty:.2f})" d="{name["d"]}"/>'


SYM_L = min(float(d.split("L")[3].split()[0]) for d in MAIN)  # leftmost x of the symbol's ink
SYM_R = 256 - SYM_L
for scheme, (cols, w) in SCHEMES.items():
    sx = 28 + nw + GAP - SYM_L
    open(f"{out}/lockup-horizontal-{scheme}.svg", "w").write(svg(
        word(28, 68, w) + f'<g transform="translate({sx:.2f} 0)">{paths(MAIN, cols)}</g>',
        f"0 0 {sx + SYM_R + 28:.0f} 256"))
    SW = max(nw, 256) + 56
    open(f"{out}/lockup-stacked-{scheme}.svg", "w").write(svg(
        f'<g transform="translate({SW / 2 - 128:.2f} 0)">{paths(MAIN, cols)}</g>' + word((SW - nw) / 2, 236, w),
        f"0 0 {SW:.0f} {236 + 120 + 28}"))
    open(f"{out}/wordmark-{scheme}.svg", "w").write(svg(word(28, 28, w), f"0 0 {nw + 56:.0f} 176"))

print("wrote", len(os.listdir(out)), "files; symbol ink x", round(SYM_L, 1), "to", round(SYM_R, 1))
