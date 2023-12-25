extends Node

var download_path := "user://test-menu.pck"

func _ready():
	var http_request = HTTPRequest.new()
	add_child(http_request)
	http_request.request_completed.connect(_on_request_completed)
	http_request.download_file = download_path
	http_request.request("https://artwall.b-cdn.net/test-menu.pck", [], HTTPClient.METHOD_GET)

func _on_request_completed(result, response_code, headers, body):
	var result_load := ProjectSettings.load_resource_pack(download_path, true)
	if !result_load:
		print("cannot load package")
	var scene_loaded = load("res://menu.scn")
	if !scene_loaded:
		print("cannot load scene")
	add_child(scene_loaded.instantiate())
