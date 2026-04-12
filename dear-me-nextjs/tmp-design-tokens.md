# design.pen tokens (extracted 2026-04-12)

## Colors

### shadcn-standard slots (used by every shadcn primitive)
- background: #EFF2E6
- foreground: #2C331EDD
- card: rgba(255,255,255,0.627) /* #FFFFFFA0 */
- card-foreground: #2C331EDD
- primary: #5C6B3ABB /* olive-green at ~73% opacity */
- primary-foreground: #FFFFFF
- secondary: #8A9A5B12 /* very light olive tint */
- secondary-foreground: #2C331EDD
- accent: #6B7A48FF
- accent-foreground: #FFFFFF
- muted: #8A9A5B15
- muted-foreground: #6B7A4888
- border: #8A9A5B20
- input: rgba(255,255,255,0.627) /* #FFFFFFA0, matches card */
- ring: #5C6B3ABB
- destructive: (not found in design)
- destructive-foreground: (not found in design)

### dear-me custom tokens
- glass-surface: rgba(255,255,255,0.627) /* #FFFFFFA0 */
- glass-border: rgba(138,154,91,0.125) /* #8A9A5B20 */
- mood-chip-bg: rgba(138,154,91,0.071) /* #8A9A5B12 */
- mood-chip-border: rgba(138,154,91,0.125) /* #8A9A5B20 */
- tag-chip-bg: rgba(138,154,91,0.082) /* #8A9A5B15 */
- tag-chip-border: rgba(138,154,91,0.125) /* #8A9A5B20 */
- encouragement-bg: rgba(138,154,91,0.082) /* #8A9A5B15 */
- encouragement-border: rgba(138,154,91,0.133) /* #8A9A5B22 */
- privacy-note-fg: rgba(107,122,72,0.400) /* #6B7A4866 */
- tab-bar-bg: rgba(255,255,255,0.600) /* #FFFFFF99 */
- tab-bar-border: rgba(138,154,91,0.094) /* #8A9A5B18 */
- tab-icon-inactive: rgba(92,107,58,0.533) /* #5C6B3A88 */
- tab-label-inactive: rgba(92,107,58,0.600) /* #5C6B3A99 */
- status-bar-fg: rgba(44,51,30,0.867) /* #2C331EDD */
- status-bar-icon: rgba(44,51,30,0.800) /* #2C331ECC */

### Background gradient overlays (applied on `body`)
- base: #EFF2E6
- overlay-1: radial-gradient(center 25% 15%, #D8E0C4 0%, transparent 100%), opacity 0.5, size 140% 100%
- overlay-2: radial-gradient(center 80% 75%, #D0DCC0 0%, transparent 100%), opacity 0.4, size 100% 80%

## Typography

- Display family: Geist, weights: 400, 500, 600, 700
- Body family: Geist, weights: 400, 500, 600
- UI/system family: Inter (status bar time only)
- Roles (size px / weight / line-height / letter-spacing / color):
  - display-xl: 28px / 700 / default / default / #2C331EDD (screen title, e.g. "Dear Me", date heading)
  - title-lg: 20px / 700 / default / default / #2C331EDD (back-header title)
  - title-md: 16px / 600 / default / default / #2C331EDD (card title, section header like "Record a Memo", page sub-header)
  - body-lg: 14px / 400 / 1.55 / default / #4D5A35FF (transcript body text)
  - body-lg-italic: 14px / 400 italic / 1.5 / default / #5C6B3ADD (encouragement text)
  - body-md: 14px / 500 / default / default / #6B7A48FF (greeting, subtitle, back-pill text)
  - body-sm: 13px / 600 / default / default / #2C331EAA (section label like "Quick check-in")
  - body-sm-sub: 13px / 400 / default / default / #6B7A48FF (recording card subtitle)
  - caption: 11px / 500 / default / default / #6B7A48FF (mood chip label, privacy note, "Not sure what to say")
  - tab-label: 11px / 400 / default / 0.3 / #5C6B3A99 (inactive tab label)
  - tab-label-active: 11px / 600 / default / 0.3 / #FFFFFF (active tab label)
  - status-time: 16px / 600 / default / default / #2C331EDD (Inter, status bar clock)
  - time-sub: 14px / 400 / default / default / #5C6B3AAA (memo time stamp)

## Radii
- sm: 10px
- md: 14px
- lg: 16px
- xl: 22px
- pill: 9999px (used for send button: cornerRadius 22 on a 44×44 circle)
- Component defaults:
  - button: 14px (primary button), 16px (continue/inline buttons)
  - card: 16px
  - chat-input: 22px
  - tab-bar: 32px (outer), 28px (tab items)
  - chip-mood: 14px
  - chip-tag: 20px
  - back-pill: 10px
  - video-area: 22px

## Shadows
- glass-card: 0 4px 10px rgba(92,107,58,0.071), 0 1px 2px rgba(92,107,58,0.031)
  /* from Start Recording Card: blur:10 color:#5C6B3A12 y:4, blur:2 color:#5C6B3A08 y:1 */
- elevated: 0 8px 20px rgba(0,0,0,0.094), 0 2px 6px rgba(0,0,0,0.063)
  /* from Video Area: blur:20 color:#00000018 y:8, blur:6 color:#00000010 y:2 */
- floating-button: 0 4px 12px rgba(92,107,58,0.188)
  /* from Continue Button: blur:12 color:#5C6B3A30 y:4 */
- tab-bar: 0 -1px 12px rgba(0,0,0,0.063)
  /* from Tab Bar pill: blur:12 color:#00000010 y:-1 */
- transcript-card: 0 2px 8px rgba(0,0,0,0.063)
  /* from Transcript/Encouragement card: blur:8 color:#00000010 y:2 */

## Spacing
- unit: 4px
- scale: 4, 6, 8, 10, 12, 14, 16, 20, 24, 32
- Common patterns observed:
  - Screen padding: 20px horizontal, 24px top
  - Card padding: 20px (Start Recording), 18px–20px (Transcript)
  - Gap between stacked cards: 20px–24px
  - Gap within card content: 10px–14px
  - Tab bar outer padding: 10px top, 20px sides, 20px bottom
  - Back-pill padding: 8px vertical, 12px horizontal
  - Mood chip padding: 10px all sides
