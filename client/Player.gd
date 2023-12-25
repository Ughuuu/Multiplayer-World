class_name Player
extends Sprite2D

@onready var label:Label = $Label

func set_text(text: String):
	label.text = text
