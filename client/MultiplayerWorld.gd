class_name MultiplayerWorld
extends Node

class Info:
	var name: String
	var position: Vector2
	var lobby: String
	
	func _to_string():
		return "name (%s) position %f,%f lobby %s" % [name, position.x, position.y, lobby]

signal initial_info(info: Info)
signal chat_messaged(message: String)
signal position_moved(players: Array[Info])
signal stats_counted(count: int)

var _socket = WebSocketPeer.new()
const POSITION_SCALE = 1000

enum ReturnType {
	InitialInfo = 0,
	Chat,
	Positions,
	Stats_Count }

enum MessageType {
	Movement_Position = 0,
	Chat_Message,
	MatchMaking_Join,
	MatchMaking_Id,
	MatchMaking_PeerConnected,
	MatchMaking_PeerDisconnected,
	MatchMaking_Offer,
	MatchMaking_Answer,
	MatchMaking_Candidate,
	MatchMaking_Seal,
}
@export var url := "wss://world.appsinacup.com"
@export var debug := true

func _ready():
	var err = _socket.connect_to_url(url)
	if err != OK:
		OS.alert("Cannot connect to server", "Error")
	if debug:
		initial_info.connect(func (info): print("INFO: ", info))
		chat_messaged.connect(func (message): print("CHAT: ", message))
		position_moved.connect(func (players): print("MOVE: ",players))

func _on_open(message: Dictionary):
	if !message.has("type"):
		printerr(message)
		return
	var message_type : MessageType = message["type"]
	var data = message["data"]
	match message_type:
		ReturnType.InitialInfo:
			var info:= Info.new()
			info.lobby = data["lobby"]
			info.name = data["name"]
			info.position.x = data["position"]["x"] * POSITION_SCALE
			info.position.y = data["position"]["y"] * POSITION_SCALE
			initial_info.emit(info)
		ReturnType.Chat:
			chat_messaged.emit(data)
		ReturnType.Positions:
			var players : Array[Info] = []
			for player in players:
				var info: Info
				info.lobby = data["lobby"]
				info.name = data["name"]
				info.position.x = data["position"]["x"] * POSITION_SCALE
				info.position.y = data["position"]["y"] * POSITION_SCALE
				players.append(info)
			position_moved.emit(players)
		ReturnType.Stats_Count:
			var count := int(data)
			stats_counted.emit(count)
		_:
			printerr("Unknown type.")

func move(position: Vector2):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": MessageType.Movement_Position,
		"data": {
			"x": position.x / POSITION_SCALE,
			"y": position.y / POSITION_SCALE
		},
	}))

func chat(message: String):
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return
	_socket.send_text(JSON.stringify({
		"type": MessageType.Chat_Message,
		"data": message,
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
		OS.alert("WebSocket closed with code: %d, reason %s. Clean: %s" % [code, reason, code != -1], "Error")
		set_process(false) # Stop processing.
