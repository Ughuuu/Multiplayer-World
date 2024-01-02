class_name MultiplayerWorld
extends Node

class Info:
	var id: String
	var name: String
	var position: Vector3
	var lobby: String

signal started()
signal moved(player: Info)
signal chated(message: String)
signal stats(count: int)
signal left(player: Info)

var _socket = WebSocketPeer.new()
var _id : String
var _players : Dictionary

@export var url := "wss://world.appsinacup.com/ws"
# local
# ws://localhost:6000/ws
@export var debug := true

var _start_time = Time.get_ticks_msec()

func _ready():
	var err = _socket.connect_to_url(url)
	if err != OK:
		OS.alert("Cannot connect to server", "Error")
		
func _on_open(message: Dictionary):
	for id in message:
		var info: Info
		if !_players.has(id):
			info = Info.new()
			_players[id] = info
			info.id = id
		else:
			info = _players[id]
		var properties: Dictionary = message[id]
		# Start event contains just the id of the user
		if properties.size() == 0:
			_id = id
			started.emit()
		for property in properties:
			match property:
				"p":
					var position_array: Array = JSON.parse_string(properties[property])
					info.position = Vector3(position_array[0], position_array[1], position_array[2])
					moved.emit(info)
				"c":
					chated.emit(properties[property] as String)
				"n":
					info.name = properties[property] as String
				"l":
					_players.erase(id)
					left.emit(info)

func move(position: Vector3):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": "p",
		"data": {
			"x": position.x,
			"y": position.y,
			"z": position.z
		},
	}))


func move2(position: Vector2):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": "p",
		"data": {
			"x": position.x,
			"y": position.y
		},
	}))

func chat(message: String, room: String = "current_cell"):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": "c",
		"data": {
			"message": message,
			"room": room
		}
	}))

func rename(rename: String):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": "n",
		"data": rename,
	}))

func _process(_delta):
	_socket.poll()
	var state = _socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN:
		while _socket.get_available_packet_count():
			var message = _socket.get_packet().get_string_from_utf8()
			if message == "":
				return
			var dict = JSON.parse_string(message) as Dictionary
			if dict == null:
				printerr("Failed to decode message")
			else:
				_on_open(dict)
	elif state == WebSocketPeer.STATE_CLOSING:
		# Keep polling to achieve proper close.
		pass
	elif state == WebSocketPeer.STATE_CLOSED or Time.get_ticks_msec() - _start_time > 5 * 1000:
		await get_tree().create_timer(1).timeout
		if (get_tree() != null):
			get_tree().reload_current_scene()
