GDPC                 �                                                                         T   res://.godot/exported/133200997/export-36a25e342948d0ceacc500772b5412b3-player.scn  0      �      Lb���=��q#b�    T   res://.godot/exported/133200997/export-76e0adcbc83681695885bae615f516ae-world.scn           �      F3����e�"�Dm�n    ,   res://.godot/global_script_class_cache.cfg  �3      �      �\��8��}���s��מ    D   res://.godot/imported/icon.svg-218a8f2b3041327d8a5756f3a245f83b.ctex�"      �      �Yz=������������       res://.godot/uid_cache.bin  09      �      +����3+h�:x�v�       res://CharacterBody2D.gd             �:��vX0�`_�h�/       res://ChatController.gd �      m      �a4�B=rB��q7�N�       res://MultiplayerWorld.gd   �      �      kO�����x�d�       res://Player.gd p2      w       ��j6�}j�L��v��J       res://PlayersController.gd  �0      �      r�r$>|;b}��       res://icon.svg  p5      �      C��=U���^Qu��U3       res://icon.svg.import   �/      �       �]���fU,��W�       res://player.tscn.remap `3      c       ������T�?�L���       res://project.binary�;            ���4�O�݆       res://world.tscn.remap  �2      b       �t�׵B�}��6�x                RSRC                    PackedScene            ��������                                                  ..    MultiplayerWorld    CharacterBody2D 	   Sprite2D    VBoxContainer 	   LineEdit    RichTextLabel    Label    resource_local_to_scene    resource_name    custom_solver_bias    radius    script    default_base_scale    default_font    default_font_size    size 	   _bundled       Script    res://MultiplayerWorld.gd ��������   Script    res://CharacterBody2D.gd ��������   PackedScene    res://player.tscn �*[=I.   Script    res://Player.gd ��������   Script    res://PlayersController.gd ��������   Script    res://ChatController.gd ��������      local://CircleShape2D_tjhxc v         local://Theme_ftuyb �         local://RectangleShape2D_cq04m �         local://RectangleShape2D_pebgy �         local://PackedScene_iiuhk $         CircleShape2D          ftB         Theme                      RectangleShape2D       
    �E  �B         RectangleShape2D       
     xB ДD         PackedScene          	         names "   -      World    Node2D    MultiplayerWorld    script    Node    CharacterBody2D 	   Sprite2D    CollisionShape2D    shape    Players    multiplayer_world    player    CanvasLayer    MarginContainer    custom_minimum_size    anchors_preset    anchor_top    anchor_right    anchor_bottom    offset_top    grow_horizontal    grow_vertical    size_flags_horizontal    size_flags_vertical    theme 
   line_edit    chat_label    stats_label    VBoxContainer    layout_mode    Label    text    RichTextLabel    focus_mode    bbcode_enabled    scroll_following    selection_enabled 	   LineEdit 	   Camera2D    zoom    StaticBody2D 	   position    CollisionShape2D2    CollisionShape2D3    CollisionShape2D4    	   variants                                                                                            
     �C  HC           �?     ��                                                                                             
   Online: 0 
     HC  HC      
   ��?��?
     n� ��C         
     H� �.�
     �� @�         
     D  �      node_count             nodes     �   ��������       ����                      ����                            ����                    ���                                ����                        	   ����         
  @     @                     ����                     ����            	      
      
      
                                             
  @     @     @     @                    ����                                ����                                  ����                     !      "      #      $                 %   %   ����                     &   &   ����   '                  (   (   ����                     ����   )                          *   ����   )                          +   ����   )                          ,   ����   )                      conn_count              conns               node_paths              editable_instances              version             RSRC  class_name MultiplayerWorld
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
        extends Node

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
   extends CharacterBody2D


const SPEED = 500.0
const JUMP_VELOCITY = -800.0

# Get the gravity from the project settings to be synced with RigidBody nodes.
var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")


func _physics_process(delta):
	# Add the gravity.
	if not is_on_floor():
		velocity.y += gravity * delta

	# Handle jump.
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	# Get the input direction and handle the movement/deceleration.
	# As good practice, you should replace UI actions with custom gameplay actions.
	var direction = Input.get_axis("ui_left", "ui_right")
	if direction:
		velocity.x = direction * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)

	move_and_slide()
              RSRC                    PackedScene            ��������                                                  resource_local_to_scene    resource_name 	   _bundled    script    
   Texture2D    res://icon.svg 
O��3�VP      local://PackedScene_v67ev 	         PackedScene          	         names "      	   Sprite2D    texture    Label    custom_minimum_size    offset_left    offset_top    offset_right    offset_bottom    text    horizontal_alignment    vertical_alignment 
   uppercase    	   variants    	             
     C�{,     ��     ��     �B     t�      Name                   node_count             nodes     "   ��������        ����                            ����	                                       	      
                      conn_count              conns               node_paths              editable_instances              version             RSRC   GST2   �   �      ����               � �        �  RIFF�  WEBPVP8L�  /������!"2�H�$�n윦���z�x����դ�<����q����F��Z��?&,
ScI_L �;����In#Y��0�p~��Z��m[��N����R,��#"� )���d��mG�������ڶ�$�ʹ���۶�=���mϬm۶mc�9��z��T��7�m+�}�����v��ح����mow�*��f�&��Cp�ȑD_��ٮ}�)� C+���UE��tlp�V/<p��ҕ�ig���E�W�����Sթ�� ӗ�A~@2�E�G"���~ ��5tQ#�+�@.ݡ�i۳�3�5�l��^c��=�x�Н&rA��a�lN��TgK㼧�)݉J�N���I�9��R���$`��[���=i�QgK�4c��%�*�D#I-�<�)&a��J�� ���d+�-Ֆ
��Ζ���Ut��(Q�h:�K��xZ�-��b��ٞ%+�]�p�yFV�F'����kd�^���:[Z��/��ʡy�����EJo�񷰼s�ɿ�A���N�O��Y��D��8�c)���TZ6�7m�A��\oE�hZ�{YJ�)u\a{W��>�?�]���+T�<o�{dU�`��5�Hf1�ۗ�j�b�2�,%85�G.�A�J�"���i��e)!	�Z؊U�u�X��j�c�_�r�`֩A�O��X5��F+YNL��A��ƩƗp��ױب���>J�[a|	�J��;�ʴb���F�^�PT�s�)+Xe)qL^wS�`�)%��9�x��bZ��y
Y4�F����$G�$�Rz����[���lu�ie)qN��K�<)�:�,�=�ۼ�R����x��5�'+X�OV�<���F[�g=w[-�A�����v����$+��Ҳ�i����*���	�e͙�Y���:5FM{6�����d)锵Z�*ʹ�v�U+�9�\���������P�e-��Eb)j�y��RwJ�6��Mrd\�pyYJ���t�mMO�'a8�R4��̍ﾒX��R�Vsb|q�id)	�ݛ��GR��$p�����Y��$r�J��^hi�̃�ūu'2+��s�rp�&��U��Pf��+�7�:w��|��EUe�`����$G�C�q�ō&1ŎG�s� Dq�Q�{�p��x���|��S%��<
\�n���9�X�_�y���6]���մ�Ŝt�q�<�RW����A �y��ػ����������p�7�l���?�:������*.ո;i��5�	 Ύ�ș`D*�JZA����V^���%�~������1�#�a'a*�;Qa�y�b��[��'[�"a���H�$��4� ���	j�ô7�xS�@�W�@ ��DF"���X����4g��'4��F�@ ����ܿ� ���e�~�U�T#�x��)vr#�Q��?���2��]i�{8>9^[�� �4�2{�F'&����|���|�.�?��Ȩ"�� 3Tp��93/Dp>ϙ�@�B�\���E��#��YA 7 `�2"���%�c�YM: ��S���"�+ P�9=+D�%�i �3� �G�vs�D ?&"� !�3nEФ��?Q��@D �Z4�]�~D �������6�	q�\.[[7����!��P�=��J��H�*]_��q�s��s��V�=w�� ��9wr��(Z����)'�IH����t�'0��y�luG�9@��UDV�W ��0ݙe)i e��.�� ����<����	�}m֛�������L ,6�  �x����~Tg����&c�U��` ���iڛu����<���?" �-��s[�!}����W�_�J���f����+^*����n�;�SSyp��c��6��e�G���;3Z�A�3�t��i�9b�Pg�����^����t����x��)O��Q�My95�G���;w9�n��$�z[������<w�#�)+��"������" U~}����O��[��|��]q;�lzt�;��Ȱ:��7�������E��*��oh�z���N<_�>���>>��|O�׷_L��/������զ9̳���{���z~����Ŀ?� �.݌��?�N����|��ZgO�o�����9��!�
Ƽ�}S߫˓���:����q�;i��i�]�t� G��Q0�_î!�w��?-��0_�|��nk�S�0l�>=]�e9�G��v��J[=Y9b�3�mE�X�X�-A��fV�2K�jS0"��2!��7��؀�3���3�\�+2�Z`��T	�hI-��N�2���A��M�@�jl����	���5�a�Y�6-o���������x}�}t��Zgs>1)���mQ?����vbZR����m���C��C�{�3o��=}b"/�|���o��?_^�_�+��,���5�U��� 4��]>	@Cl5���w��_$�c��V��sr*5 5��I��9��
�hJV�!�jk�A�=ٞ7���9<T�gť�o�٣����������l��Y�:���}�G�R}Ο����������r!Nϊ�C�;m7�dg����Ez���S%��8��)2Kͪ�6̰�5�/Ӥ�ag�1���,9Pu�]o�Q��{��;�J?<�Yo^_��~��.�>�����]����>߿Y�_�,�U_��o�~��[?n�=��Wg����>���������}y��N�m	n���Kro�䨯rJ���.u�e���-K��䐖��Y�['��N��p������r�Εܪ�x]���j1=^�wʩ4�,���!�&;ج��j�e��EcL���b�_��E�ϕ�u�$�Y��Lj��*���٢Z�y�F��m�p�
�Rw�����,Y�/q��h�M!���,V� �g��Y�J��
.��e�h#�m�d���Y�h�������k�c�q��ǷN��6�z���kD�6�L;�N\���Y�����
�O�ʨ1*]a�SN�=	fH�JN�9%'�S<C:��:`�s��~��jKEU�#i����$�K�TQD���G0H�=�� �d�-Q�H�4�5��L�r?����}��B+��,Q�yO�H�jD�4d�����0*�]�	~�ӎ�.�"����%
��d$"5zxA:�U��H���H%jس{���kW��)�	8J��v�}�rK�F�@�t)FXu����G'.X�8�KH;���[          [remap]

importer="texture"
type="CompressedTexture2D"
uid="uid://coqjollnwgdxa"
path="res://.godot/imported/icon.svg-218a8f2b3041327d8a5756f3a245f83b.ctex"
metadata={
"vram_texture": false
}
                extends Node2D

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
     class_name Player
extends Sprite2D

@onready var label:Label = $Label

func set_text(text: String):
	label.text = text
         [remap]

path="res://.godot/exported/133200997/export-76e0adcbc83681695885bae615f516ae-world.scn"
              [remap]

path="res://.godot/exported/133200997/export-36a25e342948d0ceacc500772b5412b3-player.scn"
             list=Array[Dictionary]([{
"base": &"Node",
"class": &"MultiplayerWorld",
"icon": "",
"language": &"GDScript",
"path": "res://MultiplayerWorld.gd"
}, {
"base": &"Node",
"class": &"OptionsConstants",
"icon": "",
"language": &"GDScript",
"path": "res://addons/EasyMenus/Scripts/options_constants.gd"
}, {
"base": &"Sprite2D",
"class": &"Player",
"icon": "",
"language": &"GDScript",
"path": "res://Player.gd"
}])
      <svg height="128" width="128" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="124" height="124" rx="14" fill="#363d52" stroke="#212532" stroke-width="4"/><g transform="scale(.101) translate(122 122)"><g fill="#fff"><path d="M105 673v33q407 354 814 0v-33z"/><path fill="#478cbf" d="m105 673 152 14q12 1 15 14l4 67 132 10 8-61q2-11 15-15h162q13 4 15 15l8 61 132-10 4-67q3-13 15-14l152-14V427q30-39 56-81-35-59-83-108-43 20-82 47-40-37-88-64 7-51 8-102-59-28-123-42-26 43-46 89-49-7-98 0-20-46-46-89-64 14-123 42 1 51 8 102-48 27-88 64-39-27-82-47-48 49-83 108 26 42 56 81zm0 33v39c0 276 813 276 813 0v-39l-134 12-5 69q-2 10-14 13l-162 11q-12 0-16-11l-10-65H447l-10 65q-4 11-16 11l-162-11q-12-3-14-13l-5-69z"/><path d="M483 600c3 34 55 34 58 0v-86c-3-34-55-34-58 0z"/><circle cx="725" cy="526" r="90"/><circle cx="299" cy="526" r="90"/></g><g fill="#414042"><circle cx="307" cy="532" r="60"/><circle cx="717" cy="532" r="60"/></g></g></svg>
             �&*'�&�'A   res://addons/EasyMenus/Nodes/controller_echo_input_generator.tscn���(o3R2   res://addons/EasyMenus/Nodes/gamepad_closable.tscn�V�
�j�t7   res://addons/EasyMenus/Nodes/menu_template_manager.tscn�HE:��z1   res://addons/EasyMenus/Nodes/slider_w_labels.tscnM�R��$Y`0   res://addons/EasyMenus/Nodes/startup_loader.tscn�O�q,�s,   res://addons/EasyMenus/Scenes/main_menu.tscn�h�7f�/   res://addons/EasyMenus/Scenes/options_menu.tscn}�[Hdm7-   res://addons/EasyMenus/Scenes/pause_menu.tscn�L ��.   res://addons/EasyMenus/default_bus_layout.tres
O��3�VP   res://icon.svg�$*`SM    res://loader.tscnTע"��P   res://menu.scn�*[=I.   res://player.tscnII0��   res://world.tscn     ECFG      application/config/name         Multiplayer World      application/run/main_scene         res://world.tscn   application/config/features(   "         4.2    GL Compatibility       application/config/icon         res://icon.svg     display/window/stretch/mode         canvas_items   display/window/stretch/aspect      
   keep_width     editor_plugins/enabled,   "          res://addons/gdworld/plugin.cfg *   rendering/renderer/rendering_method.mobile         gl_compatibility             