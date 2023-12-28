class_name MultiplayerWorld
extends Node

class Info:
	var id: String
	var name: String
	var position: Vector2
	var lobby: String
	
	func _to_string():
		return "name (%s) position %f,%f lobby %s" % [name, position.x, position.y, lobby]

signal moved(players: Array[Info])
signal chated(message: String, lobby: String)
signal stats(count: int)
signal left(player: Info)
signal received(type: ReturnType, data: String)

var _socket = WebSocketPeer.new()
var _id : String
var _players : Dictionary

enum ReturnType {
	Receive_Id = 0,
	Receive_Movement,
	Receive_Chat_Message,
	Receive_Name,
	Receive_Leave,
	Receive_Stats_Count,
}

enum MessageType {
	Send_Movement_Position = 0,
	Send_Chat_Message,
	Send_Name,
}
@export var url := "wss://world.appsinacup.com"
@export var debug := true

func _ready():
	var err = _socket.connect_to_url(url)
	if err != OK:
		OS.alert("Cannot connect to server", "Error")
		
	if debug:
		received.connect(func (type, message): print("DEBUG: ", type, " ", message))

func _on_open(message: Dictionary):
	if !message.has("type"):
		printerr(message)
		return
	var message_type : MessageType = message["type"]
	var data = message["data"]
	received.emit(message_type, data)
	match message_type:
		ReturnType.Receive_Name:
			for other_id in data:
				var name = data[other_id]
				if !_players.has(other_id):
					_players[other_id] = Info.new()
				_players[other_id].id = other_id
				_players[other_id].name = name
		ReturnType.Receive_Id:
			_id = data
		ReturnType.Receive_Leave:
			left.emit(_players[data])
			_players.erase(data)
		ReturnType.Receive_Movement:
			var other_players : Array[Info] = []
			for other_id in data:
				var other_position = data[other_id]
				if !_players.has(other_id):
					_players[other_id] = Info.new()
					_players[other_id].id = other_id
				var other_player :Info = _players[other_id]
				# if player is found, add him to updated list
				if other_player:
					other_player.position = Vector2(other_position["x"], other_position["y"])
					other_players.push_back(other_player)
			moved.emit(other_players)
		ReturnType.Receive_Chat_Message:
			chated.emit(data["message"], data["room"])
		ReturnType.Receive_Stats_Count:
			stats.emit(int(data))
		_:
			printerr("Unknown type. %s" % message_type)

func move(position: Vector2):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": MessageType.Send_Movement_Position,
		"data": {
			"x": position.x,
			"y": position.y
		},
	}))

func chat(message: String, room: String = "global"):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": MessageType.Send_Chat_Message,
		"data": {
			"message": message,
			"room": room
		}
	}))

func rename(name: String):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": MessageType.Send_Name,
		"data": name,
	}))

func _process(delta):
	_socket.poll()
	var state = _socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN:
		while _socket.get_available_packet_count():
			var dict = JSON.parse_string(_socket.get_packet().get_string_from_utf8()) as Dictionary
			if dict == null:
				printerr("Failed to decode message")
			else:
				_on_open(dict)
	elif state == WebSocketPeer.STATE_CLOSING:
		# Keep polling to achieve proper close.
		pass
	elif state == WebSocketPeer.STATE_CLOSED:
		var code = _socket.get_close_code()
		var reason = _socket.get_close_reason()
		get_tree().reload_current_scene()
		#OS.alert("WebSocket closed with code: %d, reason %s. Clean: %s" % [code, reason, code != -1], "Error")
		set_process(false) # Stop processing.
