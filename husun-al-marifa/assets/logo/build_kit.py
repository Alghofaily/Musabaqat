"""Generate the Book Wall (حصون المعرفة) master SVGs into kit/masters/.
usage: build_kit.py name.json outdir"""
import json, math, os, sys

name = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

NAVY, BRASS, BRASS_DK, PARCH = "#0e1624", "#c9a24a", "#8a6a22", "#f4ecd8"
TITLE = "حصون المعرفة"


def pages(x0, x1, top, notch, outer_bottom, merlons):
    """Left page from outer x0 to spine x1; crenellated top; bottom slopes down 15° to the spine."""
    seg = (x1 - x0) / (2 * merlons - 1)
    spine_bottom = outer_bottom + (x1 - x0) * math.tan(math.radians(15))
    xs = [x0 + i * seg for i in range(2 * merlons)]
    d = f"M{x0:g} {top:g}"
    for i, x in enumerate(xs[1:], 1):  # alternate merlon / notch
        y_next = notch if i % 2 else top
        d += f"H{round(x, 2):g}V{y_next:g}"
    d = d[: d.rfind("V")]  # last step ends at the spine on the top line
    d += f"V{round(spine_bottom, 2):g}L{x0:g} {outer_bottom:g}Z"
    return d


# Main drawing: 3 merlons a page, 12-unit spine gap. Small cut (≤32 px): 2 merlons, 20-unit gap, deeper notches.
MAIN = pages(28, 122, 50, 72, 182, 3)
SMALL = pages(24, 118, 46, 76, 182, 2)
assert MAIN.startswith("M28 50H46.8V72H65.6V50H84.4V72H103.2V50H122V207.19L28 182Z"), MAIN


def symbol(d, left, right, title=TITLE, bg=None):
    tile = f'<rect width="256" height="256" rx="40" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>{title}</title>{tile}'
            f'<path fill="{left}" d="{d}"/><path fill="{right}" transform="matrix(-1 0 0 1 256 0)" d="{d}"/></svg>\n')


SCHEMES = {  # name: (left page, right page, wordmark colour, intended background)
    "color-dark": (BRASS, PARCH, PARCH, NAVY),
    "color-light": (NAVY, BRASS_DK, NAVY, PARCH),
    "brass": (BRASS, BRASS, BRASS, NAVY),
    "navy": (NAVY, NAVY, NAVY, PARCH),
}

for scheme, (l, r, _, _) in SCHEMES.items():
    open(f"{out}/symbol-{scheme}.svg", "w").write(symbol(MAIN, l, r))
    open(f"{out}/symbol-small-{scheme}.svg", "w").write(symbol(SMALL, l, r))

# Wordmark geometry: scale the shaped name so its ink is 112 units tall.
ink_h = name["ymax"] - name["ymin"]
s = 112 / ink_h
nw = (name["xmax"] - name["xmin"]) * s
GAP = 38  # 2 merlon widths


def word(x, y_top, fill):
    """Place the name so its ink box starts at (x, y_top)."""
    tx, ty = x - name["xmin"] * s, y_top - name["ymin"] * s
    return f'<path fill="{fill}" transform="matrix({s:.5f} 0 0 {s:.5f} {tx:.2f} {ty:.2f})" d="{name["d"]}"/>'


def pages_at(tx, ty, k, l, r):
    m = f"matrix({k} 0 0 {k} {tx:.2f} {ty:.2f})"
    mm = f"matrix({-k} 0 0 {k} {tx + 256 * k:.2f} {ty:.2f})"
    return f'<path fill="{l}" transform="{m}" d="{MAIN}"/><path fill="{r}" transform="{mm}" d="{MAIN}"/>'


for scheme, (l, r, w, _) in SCHEMES.items():
    if scheme in ("brass", "navy"):
        continue  # one-colour lockups come from export_variants
    # Horizontal, RTL reading: symbol on the right, name to its left; ink centred on the symbol (y 50–207).
    sym_x = 28 + nw + GAP - 28  # symbol box x so its ink (x=28) sits GAP after the name
    W = sym_x + 256
    h = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} 256"><title>{TITLE}</title>'
         f'{word(28, 128.6 - 56, w)}{pages_at(sym_x, 0, 1, l, r)}</svg>\n')
    open(f"{out}/lockup-horizontal-{scheme}.svg", "w").write(h)
    # Stacked: symbol above, name below, centred.
    SW = nw + 56
    k = 1.0
    st = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SW:.0f} {207 + GAP + 112 + 28:.0f}">'
          f'<title>{TITLE}</title>{pages_at(SW / 2 - 128, 0, k, l, r)}{word(28, 207 + GAP, w)}</svg>\n')
    open(f"{out}/lockup-stacked-{scheme}.svg", "w").write(st)
    open(f"{out}/wordmark-{scheme}.svg", "w").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {nw + 56:.0f} 168"><title>{TITLE}</title>'
        f'{word(28, 28, w)}</svg>\n')

print("wrote", sorted(os.listdir(out)))
