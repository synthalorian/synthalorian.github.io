#!/usr/bin/env python3
"""Forge the Wave Knight — synthwave '84 field companion.

Atlas: 8 cols x 9 rows of 192x208 frames (1536x1872).
Rows: idle, running-right, running-left, waving, jumping, failed,
waiting, running, review. Six frames per state; cols 6-7 duplicate
0 and 1 because renderers ignore them.

Drawn on a 96x104 logical grid and scaled 2x nearest.
Sword sits on the viewer's left (the knight's right hand).
Shield sits on the viewer's right.

This is not the iron-cross templar. Chrome plate, magenta energy crest,
a glowing T-visor, a cyan blade, and an outrun sun on the heater.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
HERMES_PET = Path.home() / ".hermes" / "pets" / "wave-knight"
LW, LH = 96, 104
SCALE = 2
FW, FH = LW * SCALE, LH * SCALE
COLS, ROWS = 8, 9

# Synthwave '84. Names, not a swatch bar.
INK = (18, 0, 32, 255)
PLATE = (42, 8, 72, 255)
PLATE_HI = (92, 28, 140, 255)
CHROME = (216, 196, 240, 255)
WHITE = (255, 255, 255, 255)
MAGENTA = (255, 0, 255, 255)
PINK = (255, 126, 219, 255)
PINK_DK = (176, 32, 140, 255)
CYAN = (3, 237, 249, 255)
CYAN_DK = (0, 140, 168, 255)
YELLOW = (243, 231, 15, 255)
SUN = (255, 140, 40, 255)
FIELD = (26, 0, 48, 255)


def new():
    return Image.new("RGBA", (LW, LH), (0, 0, 0, 0))


def rect(d, x0, y0, x1, y1, color):
    if x1 < x0:
        x0, x1 = x1, x0
    if y1 < y0:
        y0, y1 = y1, y0
    d.rectangle([x0, y0, x1, y1], fill=color)


def shift(im, dx, dy):
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sx0 = max(0, -dx)
    sy0 = max(0, -dy)
    sx1 = im.width - max(0, dx)
    sy1 = im.height - max(0, dy)
    if sx1 <= sx0 or sy1 <= sy0:
        return out
    out.paste(im.crop((sx0, sy0, sx1, sy1)), (max(0, dx), max(0, dy)))
    return out


def squash(im, yscale, foot_y):
    nh = max(1, int(round(im.height * yscale)))
    scaled = im.resize((im.width, nh), Image.Resampling.NEAREST)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    top = foot_y - nh
    src_top = max(0, -top)
    dst_top = max(0, top)
    src_bot = min(nh, im.height - top)
    if src_bot > src_top:
        out.paste(scaled.crop((0, src_top, im.width, src_bot)), (0, dst_top))
    return out


def draw_sun(d, cx, cy):
    """Outrun sun. Yellow core, hot corona, one cyan horizon cut. Not a cross."""
    d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=MAGENTA)
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=SUN)
    d.ellipse([cx - 3, cy - 4, cx + 3, cy + 2], fill=YELLOW)
    rect(d, cx - 7, cy + 1, cx + 7, cy + 2, CYAN)
    rect(d, cx - 6, cy + 4, cx + 6, cy + 4, PINK)


def draw_shield(d, ox, oy, gleam=None):
    cx = 70 + ox
    top = 34 + oy
    bot = 62 + oy
    left = 58 + ox
    right = 82 + ox
    rim = [
        (left - 1, top), (right + 1, top),
        (right + 2, top + 6),
        (cx + 2, bot + 3),
        (cx - 2, bot + 3),
        (left - 2, top + 6),
    ]
    field = [
        (left + 2, top + 2), (right - 2, top + 2),
        (right - 1, top + 7),
        (cx, bot - 1),
        (left + 1, top + 7),
    ]
    d.polygon(rim, fill=CHROME)
    d.polygon(field, fill=FIELD)
    # neon rim inset
    d.line([(left + 3, top + 3), (right - 3, top + 3)], fill=MAGENTA, width=1)
    draw_sun(d, cx, top + 14)
    if gleam is not None:
        gx = left + 3 + gleam
        rect(d, gx, top + 3, gx + 1, top + 4, WHITE)


def draw_sword(angle):
    """Cyan blade on the viewer's left. Rotated about the shoulder."""
    im = new()
    d = ImageDraw.Draw(im)
    sx, sy = 30, 36
    rect(d, sx - 1, sy - 2, sx + 1, sy + 3, PINK_DK)
    rect(d, sx - 5, sy - 4, sx + 5, sy - 2, MAGENTA)
    rect(d, sx - 5, sy - 4, sx - 4, sy - 2, CYAN)
    rect(d, sx - 1, 8, sx + 1, sy - 5, CYAN)
    rect(d, sx, 6, sx, 9, WHITE)
    rect(d, sx - 1, 12, sx - 1, 22, WHITE)
    if angle:
        im = im.rotate(angle, resample=Image.Resampling.NEAREST, center=(sx, sy))
    return im


def draw_visor(d, mode):
    """T-visor. Horizontal bar plus a stem. The face of the wave knight."""
    if mode == "x":
        rect(d, 43, 18, 46, 21, YELLOW)
        rect(d, 50, 18, 53, 21, YELLOW)
        rect(d, 44, 19, 45, 20, INK)
        rect(d, 51, 19, 52, 20, INK)
        return
    bar = CYAN if mode == "on" else CYAN_DK
    core = PINK if mode == "on" else PINK_DK
    rect(d, 41, 17, 55, 22, bar)
    rect(d, 42, 18, 54, 21, core)
    rect(d, 46, 17, 50, 26, bar)
    rect(d, 47, 18, 49, 25, core)
    rect(d, 43, 18, 44, 19, WHITE)


def draw_body(plume_dx=0, visor="on", legs="stand", lean=0, stars=None):
    im = new()
    d = ImageDraw.Draw(im)
    px = 46 + plume_dx
    # energy crest — magenta with a yellow tip, not a blood plume
    rect(d, px + 1, 2, px + 2, 5, YELLOW)
    rect(d, px - 1, 4, px + 5, 8, MAGENTA)
    rect(d, px, 7, px + 4, 11, PINK)
    rect(d, px + 1, 10, px + 3, 13, PINK_DK)

    rect(d, 39, 13, 57, 28, INK)
    rect(d, 40, 14, 56, 27, PLATE)
    rect(d, 40, 14, 56, 15, MAGENTA)
    rect(d, 41, 16, 42, 17, CYAN)
    draw_visor(d, visor)
    rect(d, 40, 26, 56, 27, CYAN)

    # pauldrons — magenta left edge, cyan right edge
    rect(d, 30, 28, 40, 34, INK)
    rect(d, 31, 29, 39, 33, PLATE)
    rect(d, 31, 29, 32, 33, MAGENTA)
    rect(d, 56, 28, 66, 34, INK)
    rect(d, 57, 29, 65, 33, PLATE)
    rect(d, 64, 29, 65, 33, CYAN)

    rect(d, 36, 32, 60, 52, INK)
    rect(d, 37, 33, 59, 51, PLATE)
    rect(d, 38, 34, 40, 48, PLATE_HI)
    rect(d, 46, 36, 50, 48, PINK_DK)
    rect(d, 47, 37, 49, 40, MAGENTA)
    rect(d, 36, 50, 60, 53, CHROME)
    rect(d, 46, 50, 50, 52, YELLOW)

    rect(d, 28, 34, 36, 40, INK)
    rect(d, 29, 35, 35, 39, PLATE)
    rect(d, 27, 38, 30, 42, PLATE)
    rect(d, 27, 38, 29, 39, CYAN)

    rect(d, 58, 36, 64, 44, PLATE)
    rect(d, 62, 40, 66, 46, PLATE)
    rect(d, 64, 44, 68, 48, CHROME)

    if legs == "stand":
        rect(d, 37, 53, 48, 90, INK)
        rect(d, 38, 54, 47, 89, PLATE)
        rect(d, 48, 53, 59, 90, INK)
        rect(d, 49, 54, 58, 89, PLATE)
        rect(d, 36, 84, 46, 94, CHROME)
        rect(d, 50, 84, 60, 94, CHROME)
        rect(d, 36, 91, 46, 94, MAGENTA)
        rect(d, 50, 91, 60, 94, CYAN)
    elif legs == "left":
        rect(d, 32, 54, 44, 94, INK)
        rect(d, 33, 55, 43, 93, PLATE)
        rect(d, 52, 52, 62, 84, INK)
        rect(d, 53, 53, 61, 83, PLATE)
        rect(d, 31, 88, 45, 96, CHROME)
        rect(d, 51, 78, 63, 85, CHROME)
    elif legs == "right":
        rect(d, 52, 54, 64, 94, INK)
        rect(d, 53, 55, 63, 93, PLATE)
        rect(d, 34, 52, 44, 84, INK)
        rect(d, 35, 53, 43, 83, PLATE)
        rect(d, 51, 88, 65, 96, CHROME)
        rect(d, 33, 78, 45, 85, CHROME)
    elif legs == "pass":
        rect(d, 38, 53, 48, 86, INK)
        rect(d, 39, 54, 47, 85, PLATE)
        rect(d, 48, 53, 58, 86, INK)
        rect(d, 49, 54, 57, 85, PLATE)
        rect(d, 37, 80, 49, 87, CHROME)
        rect(d, 47, 80, 59, 87, CHROME)
    elif legs == "tuck":
        rect(d, 36, 52, 48, 74, INK)
        rect(d, 37, 53, 47, 73, PLATE)
        rect(d, 48, 52, 60, 74, INK)
        rect(d, 49, 53, 59, 73, PLATE)
        rect(d, 34, 68, 46, 76, CHROME)
        rect(d, 50, 68, 62, 76, CHROME)

    if lean:
        im = shift(im, lean, 0)
    if stars:
        sd = ImageDraw.Draw(im)
        for (x, y, col) in stars:
            rect(sd, x, y, x + 1, y + 1, col)
    return im


def compose(body, sword, shield_ox=0, shield_oy=0, gleam=None, dy=0, yscale=1.0):
    im = body.copy()
    d = ImageDraw.Draw(im)
    draw_shield(d, shield_ox, shield_oy, gleam=gleam)
    im = Image.alpha_composite(im, sword)
    if yscale != 1.0:
        im = squash(im, yscale, foot_y=100)
    im = shift(im, 0, dy + 6)
    return im.resize((FW, FH), Image.Resampling.NEAREST)


def f_idle(i):
    plume = (0, 2, 2, 0, -2, 0)[i]
    visor = "dim" if i == 2 else "on"
    body = draw_body(plume_dx=plume, visor=visor)
    sword = draw_sword(0)
    if i == 4:
        sd = ImageDraw.Draw(sword)
        rect(sd, 29, 10, 30, 12, WHITE)
    gleam = 2 if i == 5 else None
    dy = -1 if i == 3 else 0
    return compose(body, sword, gleam=gleam, dy=dy)


def f_run(i):
    legs = ("left", "pass", "right", "pass", "left", "pass")[i]
    bob = (0, -2, 0, -2, 0, -3)[i]
    arm = (8, 0, -10, 0, 8, 0)[i]
    body = draw_body(plume_dx=(1, 0, -1, 0, 1, 0)[i], legs=legs)
    sword = draw_sword(arm)
    return compose(body, sword, shield_oy=-bob // 2, dy=bob)


def f_wave(i):
    angle = (0, 18, 38, 56, 38, 18)[i]
    body = draw_body(plume_dx=(0, 1, 2, 1, 0, -1)[i])
    sword = draw_sword(angle)
    return compose(body, sword)


def f_jump(i):
    specs = (
        ("stand", 2, 0.86, 1),
        ("tuck", 3, 0.78, 2),
        ("stand", -6, 1.08, -6),
        ("tuck", -8, 1.0, -10),
        ("stand", -4, 1.04, -5),
        ("stand", 2, 0.84, 2),
    )
    legs, plume, yscale, dy = specs[i]
    body = draw_body(plume_dx=plume, legs=legs, visor="on")
    sword = draw_sword(-8 if i in (2, 3) else 0)
    return compose(body, sword, yscale=yscale, dy=dy)


def f_failed(i):
    stars_a = [(18, 8, CYAN), (70, 6, PINK), (22, 4, YELLOW)]
    stars_b = [(16, 6, MAGENTA), (74, 8, CYAN), (20, 10, YELLOW)]
    body = draw_body(
        plume_dx=3, visor="x", legs="stand", lean=3,
        stars=stars_a if i % 2 == 0 else stars_b,
    )
    sword = draw_sword(28)
    return compose(body, sword, shield_ox=1, shield_oy=6, dy=1)


def f_waiting(i):
    look = ("dim", "dim", "on", "on", "dim", "on")[i]
    bob = (0, 0, 1, 0, 0, 0)[i]
    body = draw_body(plume_dx=(-2, -2, 0, 2, 2, 0)[i], visor=look)
    sword = draw_sword(6)
    return compose(body, sword, shield_ox=2, shield_oy=4, dy=bob)


def f_review(i):
    gleam = (0, 2, 4, 6, 4, 2)[i]
    body = draw_body(plume_dx=0, visor="on")
    sword = draw_sword(0)
    return compose(body, sword, shield_oy=-4, gleam=gleam)


def mirror(im):
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


ROW_BUILDERS = [
    f_idle,
    f_run,
    lambda i: mirror(f_run(i)),
    f_wave,
    f_jump,
    f_failed,
    f_waiting,
    f_run,
    f_review,
]


def build_atlas():
    atlas = Image.new("RGBA", (COLS * FW, ROWS * FH), (0, 0, 0, 0))
    frames = []
    for row_i, builder in enumerate(ROW_BUILDERS):
        row = [builder(i) for i in range(6)]
        frames.append(row)
        padded = row + [row[0], row[1]]
        for col_i, frame in enumerate(padded):
            atlas.paste(frame, (col_i * FW, row_i * FH))
    return atlas, frames


def knight_card(idle_frames):
    card_w, card_h = 880, 980
    scale = 4
    out = []
    for frame in idle_frames:
        card = Image.new("RGBA", (card_w, card_h), (36, 0, 55, 255))
        d = ImageDraw.Draw(card)
        d.ellipse([36, 36, card_w - 37, card_h - 37], outline=MAGENTA, width=6)
        d.ellipse([48, 48, card_w - 49, card_h - 49], outline=CYAN, width=2)
        knight = frame.resize((FW * scale, FH * scale), Image.Resampling.NEAREST)
        x = (card_w - knight.width) // 2
        y = (card_h - knight.height) // 2 - 10
        card.alpha_composite(knight, (x, y))
        out.append(card.convert("P", palette=Image.Palette.ADAPTIVE, colors=48))
    return out


def og_card(idle):
    w, h = 1200, 630
    card = Image.new("RGBA", (w, h), (13, 2, 33, 255))
    d = ImageDraw.Draw(card)
    # sunset disc, off-center so a title could sit left — the knight owns the right
    d.ellipse([620, 40, 1120, 540], fill=(255, 90, 40, 255))
    d.ellipse([660, 80, 1080, 500], fill=(255, 180, 40, 255))
    d.rectangle([0, 430, w, h], fill=(36, 0, 55, 255))
    for i in range(8):
        y = 450 + i * 22
        d.line([(0, y), (w, y)], fill=(143, 0, 255, 180), width=1)
    knight = idle.resize((FW * 3, FH * 3), Image.Resampling.NEAREST)
    card.alpha_composite(knight, (w - knight.width - 80, h - knight.height - 20))
    return card


def write_pet(atlas):
    HERMES_PET.mkdir(parents=True, exist_ok=True)
    atlas.save(
        HERMES_PET / "spritesheet.webp",
        format="WEBP", lossless=True, quality=100, method=6, exact=True,
    )
    (HERMES_PET / "pet.json").write_text(json.dumps({
        "id": "wave-knight",
        "displayName": "Wave Knight",
        "description": "Synthwave '84 field knight. Chrome plate, T-visor, outrun sun. The grid does not blink.",
        "spritesheetPath": "spritesheet.webp",
        "createdBy": "generator",
    }, indent=2) + "\n", encoding="utf-8")
    thumb = Path.home() / ".hermes" / "pets" / ".thumbs" / "wave-knight.png"
    thumb.unlink(missing_ok=True)


def _opaque_bbox(im):
    px = im.load()
    miny, maxy, minx, maxx = LH * 9, 0, FW, 0
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y][3] > 10:
                miny = min(miny, y)
                maxy = max(maxy, y)
                minx = min(minx, x)
                maxx = max(maxx, x)
    return miny, maxy, minx, maxx


def verify(frames):
    idle = frames[0][0]
    px = idle.load()
    # T-visor lives in the upper-center of the 192x208 frame (logical * 2, plus the +6 shift).
    cyan = pink = yellow = 0
    for y in range(40, 90):
        for x in range(70, 130):
            r, g, b, a = px[x, y]
            if a < 200:
                continue
            if b > 180 and g > 160 and r < 80:
                cyan += 1
            if r > 180 and b > 140 and g < 180:
                pink += 1
    assert cyan >= 12, f"T-visor cyan missing: {cyan}"
    assert pink >= 8, f"T-visor pink core missing: {pink}"

    # Outrun sun sits on the viewer's right. Yellow core, not a blood cross.
    blood = 0
    for y in range(70, 160):
        for x in range(120, 180):
            r, g, b, a = px[x, y]
            if a < 200:
                continue
            if r > 220 and g > 180 and b < 80:
                yellow += 1
            if r > 160 and g < 40 and b < 50:
                blood += 1
    assert yellow >= 8, f"outrun sun missing: yellow={yellow}"
    assert blood < 6, f"iron-cross blood still on the shield: {blood}"

    def blade_tip(fr):
        p = fr.load()
        best = None
        for y in range(0, 120):
            for x in range(0, 110):
                r, g, b, a = p[x, y]
                if a > 200 and b > 180 and g > 160 and r < 90:
                    if best is None or y < best[1]:
                        best = (x, y)
        assert best, "wave frame has no cyan blade"
        return best

    tips = [blade_tip(fr) for fr in frames[3]]
    xs = [t[0] for t in tips]
    assert max(xs) - min(xs) >= 8, f"wave does not move the blade: {tips}"

    idle_top, idle_bot, _, _ = _opaque_bbox(frames[0][0])
    peak_top, peak_bot, _, _ = _opaque_bbox(frames[4][3])
    assert idle_top - peak_top >= 8, f"jump peak did not rise: idle {idle_top} peak {peak_top}"
    assert idle_bot - peak_bot >= 6, f"feet did not leave the ground: idle {idle_bot} peak {peak_bot}"

    foot_x = []
    for fr in frames[1]:
        p = fr.load()
        xs = [x for y in range(160, 200) for x in range(fr.width) if p[x, y][3] > 10]
        assert xs, "run frame has no feet"
        foot_x.append(min(xs))
    assert max(foot_x) - min(foot_x) >= 6, f"run does not stride: {foot_x}"
    print("verify ok", {
        "cyan": cyan, "pink": pink, "yellow": yellow, "blood": blood,
        "wave_tips": tips, "jump": (idle_top, peak_top, idle_bot, peak_bot),
        "stride": foot_x,
    })


def main():
    atlas, frames = build_atlas()
    verify(frames)
    write_pet(atlas)

    img = ROOT / "img"
    img.mkdir(exist_ok=True)
    atlas.save(img / "wave-knight.webp", format="WEBP", lossless=True, quality=100, method=6, exact=True)
    atlas.save(img / "wave-knight.png")

    preview = Image.new("RGBA", (6 * FW, 9 * FH), (13, 2, 33, 255))
    for row_i, row in enumerate(frames):
        for col_i, frame in enumerate(row):
            preview.paste(frame, (col_i * FW, row_i * FH))
    preview.save(img / "wave-knight-preview.png")

    close = Image.new("RGBA", (FW * 4 * 3 + 24, FH * 4 + 16), (13, 2, 33, 255))
    for i, fr in enumerate((frames[0][0], frames[3][3], frames[4][3])):
        big = fr.resize((FW * 4, FH * 4), Image.Resampling.NEAREST)
        close.paste(big, (8 + i * (FW * 4 + 8), 8))
    close.save(img / "wave-knight-closeup.png")

    card = knight_card(frames[0])
    card[0].save(
        img / "knight-card.gif",
        save_all=True,
        append_images=card[1:],
        duration=140,
        loop=0,
        disposal=2,
        optimize=False,
    )
    og_card(frames[0][0]).convert("RGB").save(img / "og-wave-knight.png", "PNG")
    print("wrote", HERMES_PET / "spritesheet.webp")
    print("site", img / "wave-knight.webp")


if __name__ == "__main__":
    main()
