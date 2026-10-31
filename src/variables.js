module.exports = function (self) {
	self.setVariableDefinitions({
		power: { name: 'Power State' },
		power_text: { name: 'Power State (On/Off)' },
		volume: { name: 'Volume Level' },
		input: { name: 'Input Source' },
		mute: { name: 'Audio Mute State' },
		mute_text: { name: 'Audio Mute State (Muted/Unmuted)' },
		picture_mute: { name: 'Picture Mute State' },
		picture_mute_text: { name: 'Picture Mute State (Muted/Unmuted)' },
	})
}
