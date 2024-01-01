extends Node2D

@export var multiplayer_world: MultiplayerWorld
@export var current_player_node: Player
var player_template: PackedScene = load("res://player.tscn")
var max_players = 1000
var player_nodes : Array[Node2D]
var target_positions: Dictionary
var active_players: Dictionary

func _ready():
	multiplayer_world.started.connect(_started)
	multiplayer_world.moved.connect(_moved)
	multiplayer_world.left.connect(_left)
	for player_i in range(max_players):
		var player_created = player_template.instantiate()
		player_nodes.push_back(player_created)
		add_child(player_created)
	_hide_players()

func _started():
	current_player_node.get_parent().process_mode = Node.PROCESS_MODE_ALWAYS

func _hide_players():
	for player_node in player_nodes:
		player_node.visible = false

func _left(player_left: MultiplayerWorld.Info):
	target_positions.erase(player_left.id)
	if !active_players.has(player_left.id):
		return
	var player_node = active_players[player_left.id]
	player_node.visible = false
	player_nodes.push_back(player_node)
	active_players.erase(player_left.id)

func _moved(player: MultiplayerWorld.Info):
	if player.id == multiplayer_world._id:
		current_player_node.set_text(player.name)
		return
	target_positions[player.id] = Vector2(player.position.x, player.position.y)
	# if player is not instantiated, instantiate him at current position
	if !active_players.has(player.id):
		active_players[player.id] = player_nodes.pop_front()
		if active_players[player.id] != null:
			active_players[player.id].set_text(player.name)
			active_players[player.id].global_position = Vector2(player.position.x, player.position.y)
			active_players[player.id].visible = true

func _physics_process(_delta):
	for active_player_id in active_players:
		var active_player_node = active_players[active_player_id]
		active_players[active_player_id].set_text(multiplayer_world._players[active_player_id].name)
		active_player_node.global_position = lerp(active_player_node.global_position, target_positions[active_player_id], Engine.get_physics_interpolation_fraction())
	multiplayer_world.move2(current_player_node.global_position)
