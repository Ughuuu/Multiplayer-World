extends Node

@export var multiplayer_world : MultiplayerWorld
@export var line_edit: LineEdit
@export var chat_label: RichTextLabel
@export var stats_label: Label

func _ready():
	line_edit.text_submitted.connect(_send_chat_message)
	multiplayer_world.chat_messaged.connect(_update_chat_message)
	multiplayer_world.stats_counted.connect(_update_stats_message)

func _send_chat_message(message: String):
	line_edit.clear()
	multiplayer_world.chat(message)

func _update_chat_message(message: String):
	chat_label.text += message + "\n"

func _update_stats_message(count: int):
	stats_label.text = "Online: " + str(count)
