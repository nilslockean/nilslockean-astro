---
title: Swerty on Omarchy - The Right Way
description: I’ve been building websites for companies for many years now, and I’ve grown tired of a pattern I keep seeing among web agencies.
pubDate: 2025-07-21
---

# Swerty on Omarchy - The Right Way

I can't believe it took me over 15 years as a software developer before I realised how superior the US keyboard layout is to the one we default to in Sweden. The placement of `{}`, `[]`, `<>`, and `;:` in the Swedish layout is a constant source of frustration when you write code all day. Swerty — a hybrid that keeps the Swedish letters `åäö` in their usual spots while moving the brackets, semicolon, and other symbols to US positions — is the perfect middle ground. But installing it on Arch with Hyprland? That turned into a rabbit hole.

## The problem

The standard Swerty instructions tell you to edit `/usr/share/X11/xkb/rules/evdev.xml` — a file owned by `xkeyboard-config`. On Arch, this gets overwritten on every package update. Omarchy's keyboard setup didn't have a way to add custom XKB variants either, so I was stuck.

## The solution

Modern Wayland compositors use libxkbcommon, which supports a per-user config directory at `~/.config/xkb/`. No system files touched.

### Step 1: Create the symbols file

```bash
mkdir -p ~/.config/xkb/symbols
```

Create `~/.config/xkb/symbols/se`:

```xkb
default partial alphanumeric_keys
xkb_symbols "basic" {
    include "%S/se(basic)"
};
partial alphanumeric_keys
xkb_symbols "swerty" {
    name[Group1]="Swedish";
    key.type = "FOUR_LEVEL_SEMIALPHABETIC";
    key <TLDE>  { [     grave, asciitilde, section, onehalf ] };
    key <AE01>  { [         1,     exclam                    ] };
    key <AE02>  { [         2,         at,  quotedbl         ] };
    key <AE03>  { [         3, numbersign,  sterling         ] };
    key <AE04>  { [         4,     dollar,  currency         ] };
    key <AE05>  { [         5,    percent,  EuroSign         ] };
    key <AE06>  { [         6, asciicircum, dead_circumflex  ] };
    key <AE07>  { [         7,  ampersand,  braceleft        ] };
    key <AE08>  { [         8,   asterisk,  bracketleft      ] };
    key <AE09>  { [         9,  parenleft,  bracketright     ] };
    key <AE10>  { [         0, parenright,  braceright       ] };
    key <AE11>  { [     minus, underscore,  dead_diaeresis,  dead_circumflex ] };
    key <AE12>  { [     equal,       plus,  dead_tilde       ] };
    key <AD01>  { [         q,          Q                    ] };
    key <AD02>  { [         w,          W                    ] };
    key <AD03>  { [         e,          E,  EuroSign         ] };
    key <AD04>  { [         r,          R                    ] };
    key <AD05>  { [         t,          T                    ] };
    key <AD06>  { [         y,          Y                    ] };
    key <AD07>  { [         u,          U                    ] };
    key <AD08>  { [         i,          I                    ] };
    key <AD09>  { [         o,          O,  braceleft        ] };
    key <AD10>  { [         p,          P,  braceright       ] };
    key <AD11>  { [      aring,     Aring,  bracketleft,  braceleft ] };
    key <AD12>  { [dead_acute, dead_grave,  bracketright,  braceright ] };
    key <AC01>  { [         a,          A                    ] };
    key <AC02>  { [         s,          S                    ] };
    key <AC03>  { [         d,          D                    ] };
    key <AC04>  { [         f,          F                    ] };
    key <AC05>  { [         g,          G                    ] };
    key <AC06>  { [         h,          H                    ] };
    key <AC07>  { [         j,          J                    ] };
    key <AC08>  { [         k,          K                    ] };
    key <AC09>  { [         l,          L                    ] };
    key <AC10>  { [odiaeresis, Odiaeresis,  semicolon,  colon ] };
    key <AC11>  { [adiaeresis, Adiaeresis,  apostrophe,  quotedbl ] };
    key <BKSL>  { [ backslash,        bar                    ] };
    key <AB01>  { [         z,          Z                    ] };
    key <AB02>  { [         x,          X                    ] };
    key <AB03>  { [         c,          C                    ] };
    key <AB04>  { [         v,          V                    ] };
    key <AB05>  { [         b,          B                    ] };
    key <AB06>  { [         n,          N                    ] };
    key <AB07>  { [         m,          M,  mu               ] };
    key <AB08>  { [     comma,       less                    ] };
    key <AB09>  { [    period,    greater,  colon            ] };
    key <AB10>  { [     slash,   question                    ] };
};
```

Three differences from the original Swerty instructions:

- `key.type = "FOUR_LEVEL_SEMIALPHABETIC"` — critical for 3rd/4th level (AltGr) keys to work in multi-layout mode. Without this, the compiler infers a 2-level type from the first group and never reaches levels 3 and 4.
- `include "%S/se(basic)"` — forwards to the system default without circular includes.
- `name[Group1]="Swedish"` — this must match the registry description so tools like waybar can identify the layout.

### Step 2: Configure Hyprland

In your Hyprland input config:

```
input {
    kb_layout = us,se
    kb_variant = ,swerty
    kb_options = ctrl:nocaps,grp:ctrl_space_toggle,lv3:ralt_switch
}
```

- `,swerty` — default variant for US, swerty for SE
- `lv3:ralt_switch` — right Alt becomes AltGr (accesses 3rd/4th symbol levels)
- `grp:ctrl_space_toggle` — switch layouts with Ctrl+Space

### Step 3: Waybar layout indicator

On Omarchy, the waybar config uses the `hyprland/language` module to show the current layout:

```json
"hyprland/language": {
    "format": "{}",
    "format-en": "US",
    "format-se": "SE",
    "format-sv_SE": "SE",
    "format-sv": "SE"
}
```

Waybar works by looking up the active layout's full keymap name in the XKB registry (evdev.xml) using libxkbregistry. It then matches the registry entry's `shortDescription` against `format-<shortDescription>` in your config.
The base Swedish layout has `shortDescription="sv"` in the system registry, which is why `format-sv: "SE"` is needed. Our Swerty variant uses `name[Group1]="Swedish"` — matching the base Swedish layout's registry description — so waybar resolves it the same way and shows "SE".
If you use a different `name[Group1]`, you'd need to add a matching entry to `~/.config/xkb/rules/evdev.xml` so the registry lookup succeeds. But matching the existing entry is simpler.

### Step 4: Verify and reload

```bash
xkbcli compile-keymap --layout us,se --variant ,swerty --options lv3:ralt_switch && echo "valid!"
hyprctl reload
```

## Why this works

libxkbcommon searches `~/.config/xkb/` before `/usr/share/X11/xkb/`, so your custom `se` file takes priority. The `%S` prefix on the include directive references the system version, avoiding infinite recursion.
The system `evdev` rules already have a catch-all (`* * = pc+%l%(v)`) that resolves any `layout(variant)` — no rules file edits needed.
Files in `~/.config/xkb/` are not managed by Omarchy, so they survive updates. You can verify by running `omarchy update` — your custom layout stays put.

## Why the official instructions fall short

The old approach edits `evdev.xml` and `evdev.lst` for discoverability in desktop settings UIs, but these aren't needed by libxkbcommon on Wayland. And the original Swerty definition omits the `key.type` declaration, which silently breaks AltGr in multi-layout setups because the compiler infers a 2-level type from the first group (US) and never reaches levels 3 and 4
---

_This guide was collaboratively created with [DeepSeek](https://deepseek.com) (via [opencode](https://opencode.ai)), an AI-powered CLI tool for software engineering tasks. I originally tried following the standard Swerty instructions but ran into the classic Arch problem: editing `/usr/share/X11/xkb/rules/evdev.xml` directly gets overwritten on every `xkeyboard-config` update. Omarchy's keyboard setup didn't have a way to add custom XKB variants either. With help from DeepSeek, we worked out the modern libxkbcommon approach using `~/.config/xkb/` — no system files touched, survives updates, and plays nicely with Hyprland on Wayland._
