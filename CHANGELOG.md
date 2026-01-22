# Changelog

## v2.0 
- Multi-entity support (Slides) — rotate between multiple entities instead of showing only one
- Slide-based animation engine — configurable In / Stay / Out timing per slide
- Multiple animation styles — Left, Right, Top, Bottom, Billboard, Matrix, and Running
- Continuous Running mode — scrolling text that flows left → right without stopping
- Per-slide value templates — mix static text with <value> placeholders
- Color Intervals — dynamic text color based on numeric value ranges
- Global render settings — shared style, size, colors, alignment across all slides
- Plain Text render mode — in addition to Dot-Matrix and 7-Segment
- Italic text support (Plain Text + 7-Segment)
- Center text option
- Improved Visual Editor — structured Slides list with Add / Move / Delete controls
- Backwards compatibility — automatic migration from old single-entity YAML
- 7-Segment letter support — displays C, F, L, I (e.g., °C / °F units)
- Animations work even with a single slide
- Improved color picker stability — no focus loss while editing
- Enhanced editor layout — Slides list separated for better readability
- More robust architecture — animation logic split into modular functions for future expansion


## v1.2.7
- FIX: Safe customElements.define (avoid duplicate define errors)
- FIX: Wrap in IIFE (avoid "Identifier already declared")
- FIX: Update SVG when style/config changes (not only when text changes)

## v1.2.6
- Added support for card-mod customization
- Fixed refresh flickering / scrolling issues

## v1.2.5
- Added support for Danish / Norwegian characters
- Added Decimal management
- Added Leading Zero function if value is without leading zero it will be added
