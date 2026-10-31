# Sony Bravia Simple IP Module

A generic module for controlling Sony Bravia TV's that support the Simple IP control method. To control TV's that support the HTTP control protocol, use the Sony Bravia module

### Configuration

[Follow Sony's instructions to enable Simple IP control on your TV](https://pro-bravia.sony.net/develop/integrate/ssip/overview/index.html)

- **Target Host name or IP**: the TV's address
- **Target Port**: the Simple IP port, 20060 by default
- **Poll Interval**: how often, in seconds, to re-read the TV's state (10 by default, 0 to disable)

When the connection comes up, the module reads the TV's power, volume, input, audio mute and picture mute state. It keeps it updated from the TV's change notifications, by re-reading the state after each command, and by polling, since the TV does not report every change. In standby the TV does not report volume, input or mute, so those keep their last known values until it is turned on.

### To use the module

Add an action to a button and choose the action you wish to use, or drag a ready-made button from the Presets tab.

**Available Actions:**

- Send Command (Sends any Simple IP command)
- Set Power Status (On, Off, Toggle)
- Set Volume Level (0-100)
- Set Input Source (HDMI, Composite, Component, Screen Mirroring, plus an input number)
- Set Mute State (On, Off, Toggle)
- Set Picture Mute State (On, Off, Toggle)
- Press Key (Volume Up, Volume Down, Channel Up, Channel Down, etc)

**Available Feedbacks:**

- Power Status
- Volume Level
- Input Source
- Mute Status
- Picture Mute Status

**Available Variables:**

| Variable            | Description                | Example                   |
| ------------------- | -------------------------- | ------------------------- |
| `power`             | Power state                | `1` (on) or `0` (standby) |
| `power_text`        | Power state as text        | `On` / `Off`              |
| `volume`            | Volume level               | `25`                      |
| `input`             | Input source               | `HDMI2`                   |
| `mute`              | Audio mute state           | `1` (muted) or `0`        |
| `mute_text`         | Audio mute state as text   | `Muted` / `Unmuted`       |
| `picture_mute`      | Picture mute state         | `1` (muted) or `0`        |
| `picture_mute_text` | Picture mute state as text | `Muted` / `Unmuted`       |

**Available Presets:**

- Power: On, Off, Toggle
- Audio: Volume Up, Volume Down, Volume Level display, Mute Toggle
- Inputs: HDMI 1-4
- Picture: Picture Mute Toggle, On, Off
- Navigation: arrows, OK, Back, Home, Options, Input, Display
