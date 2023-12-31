GDPC                �                                                                         T   res://.godot/exported/133200997/export-36a25e342948d0ceacc500772b5412b3-player.scn  p:      /      ����7�|�Aq�7g    T   res://.godot/exported/133200997/export-76e0adcbc83681695885bae615f516ae-world.scn           �      =����և�¯�e�    ,   res://.godot/global_script_class_cache.cfg  �?      �      �\��8��}���s��מ    D   res://.godot/imported/icon.svg-218a8f2b3041327d8a5756f3a245f83b.ctex�       �      �Yz=������������       res://.godot/uid_cache.bin  �D      �      +����3+h�:x�v�       res://CharacterBody2D.gd�.            �:��vX0�`_�h�/       res://ChatController.gd 0      �      r�'�#���`���}�       res://MultiplayerWorld.gd   �      X      ��5�!� �e�C��v       res://Player.gd �9      w       ��j6�}j�L��v��J       res://PlayersController.gd  �1      Q      
N�2�cyd��u�YI       res://icon.svg   A      �      C��=U���^Qu��U3       res://icon.svg.import   �-      �       �]���fU,��W�       res://player.tscn.remap ?      c       ������T�?�L���       res://project.binary�G      F      �M��hB��%`��       res://world.tscn.remap  �>      b       �t�׵B�}��6�x                RSRC                    PackedScene            ��������                                                  ..    MultiplayerWorld    CharacterBody2D 	   Sprite2D    VBoxContainer 	   LineEdit    TabContainer 
   Proximity    RichTextLabel    Team    resource_local_to_scene    resource_name    custom_solver_bias    radius    script    default_base_scale    default_font    default_font_size    size    interpolation_mode    interpolation_color_space    offsets    colors 	   _bundled       Script    res://MultiplayerWorld.gd ��������   Script    res://CharacterBody2D.gd ��������
   Texture2D    res://icon.svg 
O��3�VP   Script    res://Player.gd ��������   Script    res://PlayersController.gd ��������   Script    res://ChatController.gd ��������      local://CircleShape2D_tjhxc �         local://Theme_ftuyb (         local://RectangleShape2D_cq04m J         local://RectangleShape2D_pebgy {         local://Gradient_uufff �         local://PackedScene_5klrx �         CircleShape2D          ftB         Theme                      RectangleShape2D       
    �E  �B         RectangleShape2D       
     xB ДD      	   Gradient             PackedScene          	         names "   D      World    Node2D    MultiplayerWorld    script    Node    CharacterBody2D    process_mode 	   Sprite2D    texture    Label    custom_minimum_size    offset_left    offset_top    offset_right    offset_bottom    text    horizontal_alignment    vertical_alignment 
   uppercase    CollisionShape2D    shape 	   Camera2D    zoom    Players    multiplayer_world    current_player_node    CanvasLayer    MarginContainer    title 	   position    size    theme 
   line_edit    proximity_label    team_label    tab_container    Window    VBoxContainer    anchors_preset    anchor_right    anchor_bottom    grow_horizontal    grow_vertical    TabContainer    layout_mode    size_flags_vertical    drag_to_rearrange_enabled 
   Proximity    visible    Control    RichTextLabel    focus_mode    bbcode_enabled    scroll_following    selection_enabled    Team 	   LineEdit    StaticBody2D    CollisionShape2D2    CollisionShape2D3    CollisionShape2D4    Line2D    points    closed 	   gradient    Line2D2    Line2D3    Line2D4    	   variants    ,                                              
     C�{,     ��     ��     �B     t�      Name                       
   ��?��?                                            Chat -       $   -   �                                                                                 	                             �?                   
     n� ��C         
     H� �.�
     �� @�         
     D  �%      �{,�{,  zD�{,  zD  zD�{,  zD         
     zĬ{,
     z�  z�
   �{,  z�      node_count             nodes     b  ��������       ����                      ����                            ����                                ����                          	   	   ����	   
                           	      
                                      ����                          ����                           ����           @     @                     ����               $      ����
                                   @      @   !  @   "  @   #  @       	       %   %   ����   &      '      (      )      *          
       +   +   ����   ,      -      .                 1   /   ����   0       ,                 2   2   ����
   ,      &      '      (      )      *      3      4      5      6                 1   7   ����   0       ,                 2   2   ����   ,      &      '      (      )      *      -      3      4      5      6          
       8   8   ����   ,                  9   9   ����                     ����      !      "                 :   ����      #      "                 ;   ����      $      %                 <   ����      &      %               =   =   ����   >   '   ?      @   (               =   A   ����      )   >   '   ?      @   (               =   B   ����      *   >   '   ?      @   (               =   C   ����      +   >   '   ?      @   (             conn_count              conns               node_paths              editable_instances              version             RSRC       class_name MultiplayerWorld
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
        extends Node

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
        GST2   �   �      ����               � �        �  RIFF�  WEBPVP8L�  /������!"2�H�$�n윦���z�x����դ�<����q����F��Z��?&,
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
                extends CharacterBody2D


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
              extends Node2D

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
               class_name Player
extends Sprite2D

@onready var label:Label = $Label

func set_text(text: String):
	label.text = text
         RSRC                    PackedScene            ��������                                                  resource_local_to_scene    resource_name 	   _bundled    script    
   Texture2D    res://icon.svg 
O��3�VP   Script    res://Player.gd ��������      local://PackedScene_difvm 0         PackedScene          	         names "      	   Sprite2D    texture    script    Label    custom_minimum_size    offset_left    offset_top    offset_right    offset_bottom    text    horizontal_alignment    vertical_alignment 
   uppercase    RigidBody2D    	   variants    
                      
     C�{,     ��     ��     �B     t�      Name                   node_count             nodes     +   ��������        ����                                  ����	                                 	      
               	                    ����              conn_count              conns               node_paths              editable_instances              version             RSRC [remap]

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
O��3�VP   res://icon.svg�$*`SM    res://loader.tscnTע"��P   res://menu.scn�*[=I.   res://player.tscnII0��   res://world.tscn     ECFG	      application/config/name         Multiplayer World      application/run/main_scene         res://world.tscn   application/config/features(   "         4.2    GL Compatibility       application/config/icon         res://icon.svg     display/window/stretch/mode         canvas_items   display/window/stretch/aspect      
   keep_width     editor_plugins/enabled,   "          res://addons/gdworld/plugin.cfg #   rendering/renderer/rendering_method         gl_compatibility*   rendering/renderer/rendering_method.mobile         gl_compatibility          