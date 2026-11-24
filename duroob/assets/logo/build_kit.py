"""Generate the Duroob (دروب) master SVGs: the tile-path dal, lockups and wordmark.
usage: build_kit.py name.json outdir   (name.json = the name outlined from Reem Kufi Bold, font units, baseline y=0)

Unit x = half a tile = 25 (main cut). Clear space 2x; the lockup gap is 2x too."""
import json, os, sys

name = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

NIGHT, LIMESTONE, LANTERN, LANTERN_DK = "#1a1714", "#efe6d4", "#e8a33d", "#a8661a"
TITLE = "دروب"
# scheme: (tiles, runner, name). color-dark is for dark backgrounds, color-light for light ones.
SCHEMES = {"color-dark": (LIMESTONE, LANTERN, LIMESTONE), "color-light": (NIGHT, LANTERN_DK, NIGHT)}


def rr(x, y, s, r):
    return f'<rect x="{x:g}" y="{y:g}" width="{s:g}" height="{s:g}" rx="{r:g}"/>'


def dal(t, g, r, run_r, x0, y0):
    """Dal as 6 board tiles + the runner: 3 on top, 1 right in the middle, 2 (middle, right) at the bottom."""
    p = t + g
    tl = [(0, 0), (1, 0), (2, 0), (2, 1), (1, 2), (2, 2)]
    tiles = "".join(rr(x0 + c * p, y0 + k * p, t, r) for c, k in tl)
    runner = f'<circle cx="{x0 + t / 2:g}" cy="{y0 + 2 * p + t / 2:g}" r="{run_r:g}"/>'
    return tiles, runner


# Main cut: ink 41..215 both ways, centred in the 256 box (approved construction, origin shifted -9 to centre).
MAIN = dal(50, 12, 7, 22, 41, 41)
# Small cut (16-32 px): bigger tiles, wider gaps (1.5 px at 16 px), 14..242.
SMALL = dal(60, 24, 8, 26, 14, 14)
INK = (41, 41, 215, 215)  # main-cut ink box
X = 25  # one unit = half a tile
GAP = 2 * X
PAD = 2 * X  # outer margin baked into the lockup files

H = 460 / 1.0  # name letter body height in font units (baseline to top)
s = 0.47 * (INK[3] - INK[1]) / H  # letter body = 47 % of the symbol height
nw = (name["xmax"] - name["xmin"]) * s
desc = name["ymax"] * s  # how far the dots hang below the baseline


def sym(parts, tile, run, dx=0, dy=0):
    return f'<g transform="translate({dx:g} {dy:g})"><g fill="{tile}">{parts[0]}</g><g fill="{run}">{parts[1]}</g></g>'


def word(x_left, baseline, fill):
    tx, ty = x_left - name["xmin"] * s, baseline
    return f'<path fill="{fill}" transform="matrix({s:.5f} 0 0 {s:.5f} {tx:.2f} {ty:.2f})" d="{name["d"]}"/>'


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}"><title>{TITLE}</title>{body}</svg>\n')


def save(fn, text):
    open(f"{out}/{fn}", "w").write(text)


for sc, (tile, run, w) in SCHEMES.items():
    save(f"symbol-{sc}.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>{TITLE}</title>{sym(MAIN, tile, run)}</svg>\n')
    save(f"symbol-small-{sc}.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>{TITLE}</title>{sym(SMALL, tile, run)}</svg>\n')

    # Horizontal, right to left: symbol right, name left, baseline on the bottom tile row (y=215).
    W = PAD + nw + GAP + (INK[2] - INK[1]) + PAD
    Hh = PAD + (INK[3] - INK[1] + desc) + PAD
    sx = PAD + nw + GAP - INK[0]  # symbol box x so its ink starts GAP after the name
    save(f"lockup-horizontal-{sc}.svg", svg(W, Hh, word(PAD, PAD + INK[3] - INK[1], w) + sym(MAIN, tile, run, sx, PAD - INK[1])))

    # Stacked: symbol centred above the name, gap 2x between ink and the letter body top.
    SW = PAD * 2 + max(nw, INK[2] - INK[0])
    top = PAD + (INK[3] - INK[1]) + GAP
    base = top + 460 * s
    save(f"lockup-stacked-{sc}.svg", svg(SW, base + desc + PAD,
         sym(MAIN, tile, run, SW / 2 - 128, PAD - INK[1]) + word(SW / 2 - nw / 2, base, w)))

    save(f"wordmark-{sc}.svg", svg(nw + 2 * PAD, 460 * s + desc + 2 * PAD, word(PAD, PAD + 460 * s, w)))

print("wrote", sorted(os.listdir(out)))
