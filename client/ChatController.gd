extends Node

@export var multiplayer_world : MultiplayerWorld
@export var line_edit: LineEdit
@export var proximity_label: RichTextLabel
@export var team_label: RichTextLabel
@export var stats_label: Label
@export var tab_container: TabContainer

func _ready():
	line_edit.text_submitted.connect(_send_chat_message)
	multiplayer_world.chated.connect(_update_chat_message)
	multiplayer_world.stats.connect(_update_stats_message)

	
func _send_chat_message(message: String):
	line_edit.clear()
	var room = "current_cell"
	if tab_container.current_tab == 1:
		room = "current_cell"
	multiplayer_world.chat(message, room)

func _update_chat_message(message: String):
	proximity_label.text += message + "\n"
	if proximity_label.text.length() > 400:
		proximity_label.text = proximity_label.text.substr(proximity_label.text.length() - 400)

func _update_stats_message(count: int):
	stats_label.text = "Online: " + str(count)
