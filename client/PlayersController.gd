extends Node2D

@export var multiplayer_world: MultiplayerWorld
@export var player: Player
var player_template: PackedScene = load("res://player.tscn")
var max_players = 100

func _ready():
	multiplayer_world.initial_info.connect(func(info): player.set_text(info.name))
	for player_i in range(max_players):
		var player_created = player_template.instantiate()
		add_child(player_created)

func _process(delta):
	multiplayer_world.move(player.global_position)
