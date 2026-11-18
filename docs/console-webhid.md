# LoopyBrain USB HID console protocol

The web app sends a cue to four RGB button LEDs. Use Chrome on a secure
origin and click Connect console in a supported game.
The chooser only requests devices exposing the collection below. The browser
sends RGB intensity values and the firmware drives the actual LEDs.

| HID field | Value |
| --- | --- |
| Top-level application collection Usage Page | 0xFF60 (vendor-defined) |
| Collection Usage | 0x61 |
| Output Report ID | 1 |
| Output Report Size / Count | 8 bits / 12 fields |
| Output Report payload | R1 G1 B1 R2 G2 B2 R3 G3 B3 R4 G4 B4 |
| Channel range | 0 to 255 |

An example HID report descriptor, in hexadecimal:

```text
06 60 FF   09 61   A1 01
85 01      09 62   15 00   26 FF 00
75 08      95 0C   91 02   C0
```

The ID is passed separately to WebHID sendReport. Its data buffer contains
exactly 12 bytes. Some firmware libraries provide the report ID separately,
while others supply it as the first wire byte. Check your USB stack callback
before decoding and reject invalid report IDs and lengths. For example,
`FF 00 00 00 FF 00 00 00 FF 00 00 00` sets button 1 red, 2 green, 3 blue and
4 off. The games currently send the same cue to all four buttons. An all-zero
frame switches every LED off.

Use the firmware's LED library for on-board RGB order conversion (RGB/GRB
etc.), brightness limits, and any power management. Firmware should default to
off and clear the LEDs when USB disconnects. The page attempts an off frame
when pausing, disconnecting or leaving the game where the device is reachable.

The report is output-only. Physical button responses are outside this report
format. Browser-approved keyboard events continue to work in Color Reaction;
a future custom HID input report can carry console-specific responses.


## Supported game cues

| Game | Color sent |
| --- | --- |
| Color Reaction, Color + Shape, Shape Sorting, Quick Color, Color Sort | Current visible stimulus |
| Quick Count, Color Invaders, Visual Search | Visible target or reference color |
| Sequence Memory | Each color during presentation only |
| Light Track | Active light during presentation only |
| Go / No-Go | Visible red or green signal |
| Robot Mission | Visible Go signal in the reaction phase |

Games with several simultaneous cues or a color conflict (such as Stroop)
keep the screen as the source of the task. The output report is unchanged.
