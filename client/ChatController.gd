extends Node

@export var multiplayer_world : MultiplayerWorld
@export var line_edit: LineEdit
@export var global_label: RichTextLabel
@export var cell_label: RichTextLabel
@export var stats_label: Label
@export var tab_container: TabContainer

func _ready():
	line_edit.text_submitted.connect(_send_chat_message)
	multiplayer_world.chated.connect(_update_chat_message)
	multiplayer_world.stats.connect(_update_stats_message)

	
func _send_chat_message(message: String):
	line_edit.clear()
	var room = "global"
	if tab_container.current_tab == 1:
		room = "cell"
	multiplayer_world.chat(message, room)

func _update_chat_message(message: String, room: String):
	if room == "global":
		global_label.text += message + "\n"
	else:
		cell_label.text += message + "\n"

func _update_stats_message(count: int):
	stats_label.text = "Online: " + str(count)
