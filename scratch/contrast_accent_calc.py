import pathlib, math

def hex_to_rgb(hex_str):
    h = hex_str.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def luminance(rgb):
    def chan(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)

def contrast(c1, c2):
    l1 = luminance(hex_to_rgb(c1))
    l2 = luminance(hex_to_rgb(c2))
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

base = {
    'background': '#0F172A',
    'foreground': '#F8FAFC',
    'card': '#1B2336',
    'cardFg': '#F8FAFC',
    'muted': '#272F42',
    'mutedFg': '#94A3B8',
    'primary': '#1E293B',
    'secondary': '#334155',
    'border': '#475569',
    'destructive': '#EF4444',
    'onDestructive': '#000000',
    'success': '#22C55E',
    'onSuccess': '#0F172A',
    'warning': '#F59E0B',
    'onWarning': '#0F172A',
    'danger': '#EF4444',
    'onDanger': '#000000',
    'ring': '#FFFFFF',
}

accent = '#22D3EE'  # cyan
on_accent = base['background']  # dark surface for text on accent

pairs = [
    ('accent', 'background', contrast(accent, base['background'])),
    ('accent', 'card', contrast(accent, base['card'])),
    ('accent', 'muted', contrast(accent, base['muted'])),
    ('accent', 'primary', contrast(accent, base['primary'])),
    ('accent', 'secondary', contrast(accent, base['secondary'])),
    ('onAccent', 'accent', contrast(on_accent, accent)),
]

out = []
for fg, bg, ratio in pairs:
    out.append(f"{fg} on {bg}: {ratio:.2f}")

preview_path = pathlib.Path('C:/Users/shash/.gemini/antigravity/brain/76e7efa3-e4a8-4894-82da-c31786f46281/contrast_accent.txt')
preview_path.write_text('\n'.join(out), encoding='utf-8')
print('Wrote', preview_path)
