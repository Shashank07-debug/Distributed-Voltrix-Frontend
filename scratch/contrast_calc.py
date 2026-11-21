import pathlib, json, math

def hex_to_rgb(hex_str):
    h = hex_str.lstrip('#')
    return tuple(int(h[i:i+2],16)/255.0 for i in (0,2,4))

def relative_luminance(rgb):
    def chan(c):
        return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055) ** 2.4
    r,g,b = rgb
    return 0.2126*chan(r) + 0.7152*chan(g) + 0.0722*chan(b)

def contrast(c1,c2):
    l1 = relative_luminance(hex_to_rgb(c1))
    l2 = relative_luminance(hex_to_rgb(c2))
    lighter, darker = max(l1,l2), min(l1,l2)
    return (lighter+0.05)/(darker+0.05)

# Base palette (Developer Tool dark) – from search result 1
base = {
    'primary': '#1E293B',
    'onPrimary': '#FFFFFF',
    'secondary': '#334155',
    'onSecondary': '#FFFFFF',
    'background': '#0F172A',
    'foreground': '#F8FAFC',
    'card': '#1B2336',
    'cardFg': '#F8FAFC',
    'muted': '#272F42',
    'mutedFg': '#94A3B8',
    'border': '#475569',
    'destructive': '#EF4444',
    'onDestructive': '#000000',
    'ring': '#FFFFFF',
}

# Candidate accent colors (green, teal, cyan)
accents = {
    'emerald': '#22C55E',  # classic green
    'teal': '#0D9488',    # matches logo cyan vibe
    'cyan': '#06B6D4',    # bright cyan
}

# Additional semantic colors
semantic = {
    'success': accents['emerald'],
    'onSuccess': '#0F172A',
    'warning': '#F59E0B',  # amber
    'onWarning': '#0F172A',
    'danger': '#EF4444',
    'onDanger': '#000000',
}

# Compute contrast pairs required by WCAG
pairs = []
# text on background
pairs.append(('foreground','background', contrast(base['foreground'], base['background'])))
# primary on background (may be used for badges)
pairs.append(('primary','background', contrast(base['primary'], base['background'])))
# secondary on background
pairs.append(('secondary','background', contrast(base['secondary'], base['background'])))
# onPrimary on primary
pairs.append(('onPrimary','primary', contrast(base['onPrimary'], base['primary'])))
# onSecondary on secondary
pairs.append(('onSecondary','secondary', contrast(base['onSecondary'], base['secondary'])))
# mutedFg on muted
pairs.append(('mutedFg','muted', contrast(base['mutedFg'], base['muted'])))
# destructive on background (danger button text)
pairs.append(('onDestructive','destructive', contrast(base['onDestructive'], base['destructive'])))
# ring on background (focus ring)
pairs.append(('ring','background', contrast(base['ring'], base['background'])))
# success on background
pairs.append(('onSuccess','success', contrast(semantic['onSuccess'], semantic['success'])))
# warning on background
pairs.append(('onWarning','warning', contrast(semantic['onWarning'], semantic['warning'])))
# danger on background (already computed as destructive)
# Accent contrast on background and on card
accent_contrast = []
for name,hexcol in accents.items():
    accent_contrast.append((name, hexcol, contrast(hexcol, base['background']), contrast(hexcol, base['card'])))

# Build HTML preview
html = ['<!doctype html><html><head><meta charset="utf-8"><title>Voltrix Design Tokens Preview</title></head><body style="font-family:Arial,sans-serif;background:#0F172A;color:#F8FAFC;padding:2rem;">']
html.append('<h1>Design Tokens (Minimal & Swiss – Dark)</h1>')
html.append('<h2>Palette</h2>')
html.append('<table border="1" cellpadding="4" cellspacing="0"><tr><th>Name</th><th>Hex</th><th>Sample</th></tr>')
for k,v in base.items():
    html.append(f'<tr><td>{k}</td><td>{v}</td><td style="background:{v};width:50px;"></td></tr>')
for name,hexcol in accents.items():
    html.append(f'<tr><td>accent-{name}</td><td>{hexcol}</td><td style="background:{hexcol};width:50px;"></td></tr>')
for k,v in semantic.items():
    html.append(f'<tr><td>{k}</td><td>{v}</td><td style="background:{v};width:50px;"></td></tr>')
html.append('</table>')
html.append('<h2>Contrast Ratios (WCAG)</h2>')
html.append('<table border="1" cellpadding="4" cellspacing="0"><tr><th>Foreground</th><th>Background</th><th>Ratio</th><th>Pass (≥4.5 body, ≥3 large)</th></tr>')
for fg,bg,ratio in pairs:
    pass_ok = ratio >= 4.5
    html.append(f'<tr><td>{fg}</td><td>{bg}</td><td>{ratio:.2f}</td><td>{"✓" if pass_ok else "✗"}</td></tr>')
html.append('</table>')
html.append('<h2>Accent Contrast</h2>')
html.append('<table border="1" cellpadding="4" cellspacing="0"><tr><th>Name</th><th>Hex</th><th>On Background</th><th>Ratio</th><th>On Card</th><th>Ratio</th></tr>')
for name,hexcol,bg_ratio,card_ratio in accent_contrast:
    html.append(f'<tr><td>{name}</td><td>{hexcol}</td><td>background</td><td>{bg_ratio:.2f}</td><td>card</td><td>{card_ratio:.2f}</td></tr>')
html.append('</table>')
html.append('</body></html>')
preview_path = pathlib.Path('C:/Users/shash/.gemini/antigravity/brain/76e7efa3-e4a8-4894-82da-c31786f46281/preview.html')
preview_path.write_text('\n'.join(html), encoding='utf-8')
print('Preview written to', preview_path)
