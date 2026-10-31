# companion-module-sony-bravia-simpleip

This is a Companion module for controlling Sony Bravia TVs using the Simple IP protocol.

## 1.3.0

- Add presets for power, audio, HDMI inputs, picture mute and navigation
- Add Toggle to Set Mute State and Set Picture Mute State
- Read the TV's state on connect and after each command, with an optional Poll Interval, so variables and feedbacks are correct from the start
- Add `power_text`, `mute_text` and `picture_mute_text` variables
- Press Key and Set Input Source use readable ids; existing buttons are upgraded automatically
- Fix buttons saved before 1.2.0 losing their volume and input number values
- Fix the module crashing when Target Port is empty, and malformed commands from fractional volume or input numbers
- Press Key now defaults to Home
- Document configuration, variables and presets in the help

## 1.2.0

- Updated to Companion API v2 (requires Companion 4.3 or later)
- Action and feedback option fields now support variables and expressions natively

## 1.1.0

- Add initial expression support

## 1.0.0

- Initial release with basic actions, feedbacks, and variables
- Supports power, volume, input source, and mute controls
