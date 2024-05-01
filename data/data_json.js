const PROGRAM_DATA = {
    "controls": {
        "max_angle_change_per_tick_fighter_plane": 3.75,
        "max_angle_change_per_tick_bomber_plane": 1.25,
        "spectator_cam_speed": 1000,
        "approximate_zoom_peek_time_ms": 500
    },
    "plane_data": {
        "spitfire": {
            "radius": 64,
            "max_speed": 594,
            "health": 12*5,
            "country": "Britain",
            "type": "Fighter",
            "gun_offset_x": 110-64,
            "gun_offset_y": 64-90,
            "tail_offset_x": 6-64,
            "tail_offset_y": 64-44,
            "bullet_damage": 1.35,
            "bullet_heat_capacity": 40,
            "cooling_time_ms": 7500,
            "rate_of_fire": 100
        },
        "a6m_zero": {
            "radius": 64,
            "max_speed": 565,
            "health": 13*5,
            "country": "Japan",
            "type": "Fighter",
            "gun_offset_x": 89-64,
            "gun_offset_y": 64-78,
            "tail_offset_x": 14-64,
            "tail_offset_y": 64-36,
            "bullet_damage": 1.2,
            "bullet_heat_capacity": 40,
            "cooling_time_ms": 7500,
            "rate_of_fire": 100
        },
        "republic_p_47": {
            "radius": 64,
            "max_speed": 686,
            "health": 12*5,
            "country": "USA",
            "type": "Fighter",
            "gun_offset_x": 84-64,
            "gun_offset_y": 64-75,
            "tail_offset_x": 13-64,
            "tail_offset_y": 64-23,
            "bullet_damage": 1.225,
            "bullet_heat_capacity": 35,
            "cooling_time_ms": 7500,
            "rate_of_fire": 75
        },
        "me_bf_109": {
            "radius": 64,
            "max_speed": 634,
            "health": 10*5,
            "country": "Germany",
            "type": "Fighter",
            "gun_offset_x": 60-64,
            "gun_offset_y": 64-86,
            "tail_offset_x": 14-64,
            "tail_offset_y": 64-1,
            "bullet_damage": 1.5,
            "bullet_heat_capacity": 40,
            "cooling_time_ms": 10000,
            "rate_of_fire": 50
        },
        "kawasaki_ki_45": {
            "radius": 64,
            "max_speed": 540,
            "health": 17*5,
            "country": "Japan",
            "type": "Fighter",
            "gun_offset_x": 86-64,
            "gun_offset_y": 64-78,
            "tail_offset_x": 6-64,
            "tail_offset_y": 64-26,
            "bullet_damage": 1.075,
            "bullet_heat_capacity": 40,
            "cooling_time_ms": 10000,
            "rate_of_fire": 100
        },
        "p51_mustang": {
            "radius": 64,
            "max_speed": 710,
            "health": 10*5,
            "country": "USA",
            "type": "Fighter",
            "gun_offset_x": 81-64,
            "gun_offset_y": 64-74,
            "tail_offset_x": 10-64,
            "tail_offset_y": 64-30,
            "bullet_damage": 3.0,
            "bullet_heat_capacity": 20,
            "cooling_time_ms": 12000,
            "rate_of_fire": 100
        },
        "hawker_sea_fury": {
            "radius": 64,
            "max_speed": 740,
            "health": 9*5,
            "country": "Britain",
            "type": "Fighter",
            "gun_offset_x": 87-64,
            "gun_offset_y": 64-85,
            "tail_offset_x": 6-64,
            "tail_offset_y": 64-46,
            "bullet_damage": 1.6,
            "bullet_heat_capacity": 26,
            "cooling_time_ms": 4450,
            "rate_of_fire": 50
        },
        "me_309": {
            "radius": 64,
            "max_speed": 733,
            "health": 9*5,
            "country": "Germany",
            "type": "Fighter",
            "gun_offset_x": 88-64,
            "gun_offset_y": 64-65,
            "tail_offset_x": 6-64,
            "tail_offset_y": 64-37,
            "bullet_damage": 1.5,
            "bullet_heat_capacity": 30,
            "cooling_time_ms": 5000,
            "rate_of_fire": 75
        },
        "b24": {
            "radius": 128,
            "max_speed": 467,
            "health": 50*5,
            "country": "USA",
            "type": "Bomber",
            "bomb_offset_x": 123-128,
            "bomb_offset_y": 128-136,
            "tail_offset_x": 23-128,
            "tail_offset_y": 128-83,
            "bomb_damage": 1,
            "guns": [
                { // Front gun
                    "x_offset": 224-128,
                    "y_offset": 128-132,
                    "fov_1": 40,
                    "fov_2": 320,
                    "bullet_heat_capacity": 16,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 300,
                    "bullet_damage": 8
                },
                { // Top gun front
                    "x_offset": 149-128,
                    "y_offset": 128-93,
                    "fov_1": 170,
                    "fov_2": 10,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                },
                { // Back bottom gun
                    "x_offset": 110-128,
                    "y_offset": 128-130,
                    "fov_1": 260,
                    "fov_2": 175,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                },
                { // Top gun back
                    "x_offset": 27-128,
                    "y_offset": 128-89,
                    "fov_1": 190,
                    "fov_2": 10,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                }
            ]
        },
        "short_stirling": {
            "radius": 128,
            "max_speed": 434,
            "health": 50*5,
            "country": "Britain",
            "type": "Bomber",
            "bomb_offset_x": 142-128,
            "bomb_offset_y": 128-144,
            "tail_offset_x": 16-128,
            "tail_offset_y": 128-48,
            "bomb_damage": 1,
            "guns": [
                { // Front gun
                    "x_offset": 253-128,
                    "y_offset": 128-118,
                    "fov_1": 70,
                    "fov_2": 330,
                    "bullet_heat_capacity": 16,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 300,
                    "bullet_damage": 8
                },
                { // Top gun front
                    "x_offset": 149-128,
                    "y_offset": 128-93,
                    "fov_1": 160,
                    "fov_2": 20,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                },
                { // Top gun back
                    "x_offset": 27-128,
                    "y_offset": 128-89,
                    "fov_1": 200,
                    "fov_2": 120,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                }
            ]
        },
        "junkers_ju_88": {
            "radius": 128, // Using this value from a prototype according to Wikipedia but this is just for fun I don't care all that much about realism
            "max_speed": 580, 
            "health": 50*5,
            "country": "Germany",
            "type": "Bomber",
            "bomb_offset_x": 135-128,
            "bomb_offset_y": 128-153,
            "tail_offset_x": 24-128,
            "tail_offset_y": 128-95,
            "bomb_damage": 1,
            "guns": [
                { // Top gun front
                    "x_offset": 205-128,
                    "y_offset": 128-116,
                    "fov_1": 70, // 70
                    "fov_2": 10, // 10
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                },
                { // Top gun front facing back
                    "x_offset": 179-128,
                    "y_offset": 128-115,
                    "fov_1": 170, // 170
                    "fov_2": 100, // 100
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                },
                { // Bottom gun front
                    "x_offset": 230-128,
                    "y_offset": 128-140,
                    "fov_1": 70, // 350
                    "fov_2": 290, // 290
                    "bullet_heat_capacity": 16,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 300,
                    "bullet_damage": 8
                }
            ]
        },
        /*
            Note about this plane: I based this off a couple black and white photos. I usually try and avoid looking at pictures of these planes that are recreations so
            I had to use some creative liberty to try and make this different. Also for the purpose of this game I'm treating this as a German plane loaned to the Japanese so I can
            use it for the Japanese bombing missions since I could not find any appropriate Japanese bomber to use.
        */
        "me_264": {
            "radius": 128,
            "max_speed": 560,
            "health": 50*5,
            "country": "Germany",
            "type": "Bomber",
            "bomb_offset_x": 135-128,
            "bomb_offset_y": 128-153,
            "tail_offset_x": 24-128,
            "tail_offset_y": 128-95,
            "bomb_damage": 1,
            "guns": [
                { // Top gun back
                    "x_offset": 91-128,
                    "y_offset": 128-41,
                    "fov_1": 170,
                    "fov_2": 20,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                },
                { // Front bottom
                    "x_offset": 240-128,
                    "y_offset": 128-106,
                    "fov_1": 355,
                    "fov_2": 280,
                    "bullet_heat_capacity": 16,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 300,
                    "bullet_damage": 8
                },
                { // Back bottom
                    "x_offset": 83-128,
                    "y_offset": 128-103,
                    "fov_1": 260,
                    "fov_2": 170,
                    "bullet_heat_capacity": 48,
                    "cooling_time_ms": 10000,
                    "rate_of_fire": 100,
                    "bullet_damage": 2
                }
            ]
        }
    },
    "teams": ["Allies", "Axis"],
    "bullet_data": {
        "speed": 1200, // 7000 I think would be close to a real number I used 800/1600/900 most recently
        "picture": "bullet",
        "radius": 3
    },

    "bomb_data": {
        "picture": "bomb",
        "bomb_gap_ms": 750,
        "radius": 8,
        "explosion_visual_size": 24,
        "initial_y_velocity": -300,
        "bomb_explosion_radius": 1000
    },

    "ui": {
        "font_family": "arial"
    },

    "building_data": {
        "building_colour": "#c2c2c4"
    },

    "radar": {
        "size": 37,
        "blip_size": 5,
        "border_width": 2,
        "distance_multiplier_a": 250,
        "b": [1.15,1.2,1.25, 1.3,1.35,1.4],
        "fighter_weight": 1,
        "bomber_weight": 1,
        "friendly_fighter_weight": 1,
        "enemy_fighter_weight": 2,
        "friendly_bomber_weight": 4,
        "enemy_bomber_weight": 8,
        "building_weight": 10,
        "bomb_hit_location_weight": Number.MAX_SAFE_INTEGER,
        "friendly_bomber_colour": "#26940a",
        "friendly_fighter_colour": "#32c70c",
        "enemy_bomber_colour": "#a6140a",
        "enemy_fighter_colour": "#db655c",
        "building_colour": "#919191",
        "bomb_hit_location_colour": "#0011fc",
        "text_colour": "#ff6700",
        "text_size": 18,
        "text_box_height": 20,
        "text_box_width": 120
    },

    "background": {
        "ground": {
            "picture": "dirt",
        }
    },
    "settings": {
        "plane_image_size_constant": 2, // This is because I use 256 size images for fighter planes and scale down by 2 on 1x zoom also bomber
        "shoot_distance_constant": 5 * 800 / 1200,
        "close_to_ground_constant": 3,
        "close_constant": 3,
        "enemy_disregard_distance_time_constant": 20,
        "turn_to_enemy_constant": 0.75, // Maybe 0.75 is good?
        "enemy_taken_distance_multiplier": 5,
        "evasive_time_to_catch": 20,
        "evasive_speed_diff": 4,
        "min_velocity_assumption": 0.01,
        "max_throttle": 100,
        "fall_speed": 1200,
        "expected_canvas_width": 1920,
        "expected_canvas_height": 927,
        "frame_rate": 100, // 60
        "tick_rate": 20, // 100
        "ms_between_ticks": 50, // 10
        "max_bullet_y_velocity_multiplier": 2/800,
        "max_bullets_per_team": 2000,
        "max_bombs": 500,
        "keep_alive_interval": 5000,
        "multiplayer_disabled": false,
        "bomber_distance_from_friendlies_dogfight": 2000,
        "bullet_reduction_coefficient": 1,
        "focused_count_distance_equivalent": 1500,
        "text_box_padding_percent": 0.1,
        "use_physics_bullets": true,
        "human_health_multiplier": 1,
        "human_damage_multiplier": 1,
        "instant_shot_max_distance": 1200,
        "max_expected_screen_width": 3840,
        "max_expected_screen_height": 2160,
        "max_cloud_animation_speed_y": 0.5,
        "max_cloud_animation_speed_x": 0.5,
        "max_tick_deficit": 100,
        "expected_plane_size": 64,
        "health_effect_on_throttle": 0.35,
        "game_zoom": 1
    },

    "constants": {
        "gravity": 9.81*9 // About 9 pixels = 1 meter
    },

    "extra_settings": [
        {
            "name": "use_physics_bullets",
            "path": ["settings", "use_physics_bullets"],
            "type": "on_off"
        },
        {
            "name": "moon_phase",
            "path": ["sky_generation", "moon_phase"],
            "type": "quantity_slider",
            "min_value": 0,
            "max_value": 7,
            "uses_float": false
        },
        {
            "name": "current_hour",
            "path": ["sky_generation", "current_hour"],
            "type": "quantity_slider",
            "min_value": 0,
            "max_value": 23,
            "uses_float": false
        },
        {
            "name": "min_clouds_per_cluster",
            "path": ["sky_generation", "cloud_generation", "min_clouds_per_cluster"],
            "type": "quantity_slider",
            "min_value": 0,
            "max_value": 80,
            "uses_float": false
        },
        {
            "name": "max_clouds_per_cluster",
            "path": ["sky_generation", "cloud_generation", "max_clouds_per_cluster"],
            "type": "quantity_slider",
            "min_value": 80,
            "max_value": 200,
            "uses_float": false
        },
        {
            "name": "game_zoom",
            "path": ["settings", "game_zoom"],
            "type": "selection_slider",
            "options": [0.125, 0.25, 0.5, 1, 2]
        },
        {
            "name": "human_damage_multiplier",
            "path": ["settings", "human_damage_multiplier"],
            "type": "quantity_slider",
            "min_value": 0.5,
            "max_value": 5,
            "uses_float": true
        },
        {
            "name": "human_health_multiplier",
            "path": ["settings", "human_health_multiplier"],
            "type": "quantity_slider",
            "min_value": 0.5,
            "max_value": 10,
            "uses_float": true
        }
    ],

    "ai": {
        "threshold_3_distance": 600,
        "threshold_2_distance": 1200,
        "update_enemy_cooldown": 1000,
        "fighter_plane": {
            "evasive_ticks_cd": 40,
            "max_enemy_distance_campaign": 5000,
            "max_x_distance_from_bomber_cruising_campaign": 2000,
            "max_y_distance_from_bomber_cruising_campaign": 500,
            "bomber_cruise_speed_following_offset": 1,
            "max_ticks_on_course": 1200,
            "tick_cd": 100,
            "bias_ranges": {
                "easy":{"distance_to_enemy":{"upper_range":{"upper_bound":200,"lower_bound":150},"lower_range":{"upper_bound":-150,"lower_bound":-200}},"angle_to_enemy":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":-7.5,"lower_bound":-10}},"angle_from_ground":{"upper_range":{"upper_bound":15,"lower_bound":11.25},"lower_range":{"upper_bound":-11.25,"lower_bound":-15}},"enemy_far_away_distance":{"upper_range":{"upper_bound":100,"lower_bound":75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"enemy_behind_angle":{"upper_range":{"upper_bound":20,"lower_bound":15},"lower_range":{"upper_bound":-15,"lower_bound":-20}},"enemy_close_distance":{"upper_range":{"upper_bound":100,"lower_bound":75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"max_ticks_on_course":{"upper_range":{"upper_bound":100,"lower_bound":75},"lower_range":{"upper_bound":-37.5,"lower_bound":-50}},"ticks_cooldown":{"upper_range":{"upper_bound":100,"lower_bound":75},"lower_range":{"upper_bound":-37.5,"lower_bound":-50}},"turn_direction":{"upper_range":{"upper_bound":40,"lower_bound":30},"lower_range":{"upper_bound":-30,"lower_bound":-40}},"close_to_ground":{"upper_range":{"upper_bound":2000,"lower_bound":1500},"lower_range":{"upper_bound":-1500,"lower_bound":-2000}},"flip_direction_lb":{"upper_range":{"upper_bound":15,"lower_bound":11.25},"lower_range":{"upper_bound":-7.5,"lower_bound":-10}},"flip_direction_ub":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":-11.25,"lower_bound":-15}},"angle_allowance_at_range":{"upper_range":{"upper_bound":5,"lower_bound":3.75},"lower_range":{"upper_bound":5,"lower_bound":3.75}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0.2,"lower_bound":0.15000000000000002},"lower_range":{"upper_bound":-0.26249999999999996,"lower_bound":-0.35}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":10,"lower_bound":7.5}},"max_shooting_distance":{"upper_range":{"upper_bound":400,"lower_bound":300},"lower_range":{"upper_bound":-300,"lower_bound":-400}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-18.75,"lower_bound":-25}},"max_speed":{"upper_range":{"upper_bound":25,"lower_bound":18.75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"health":{"upper_range":{"upper_bound":20,"lower_bound":15},"lower_range":{"upper_bound":-22.5,"lower_bound":-30}},"rotation_angle_debuff":{"upper_range":{"upper_bound":3.01,"lower_bound":2.25},"lower_range":{"upper_bound":3.01,"lower_bound":2.25}},"evasive_ticks_cd":{"upper_range":{"upper_bound":3.01,"lower_bound":2.25},"lower_range":{"upper_bound":3.01,"lower_bound":2.25}}},
                "medium":{"distance_to_enemy":{"upper_range":{"upper_bound":150,"lower_bound":100},"lower_range":{"upper_bound":-100,"lower_bound":-150}},"angle_to_enemy":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":-5,"lower_bound":-7.5}},"angle_from_ground":{"upper_range":{"upper_bound":11.25,"lower_bound":7.5},"lower_range":{"upper_bound":-7.5,"lower_bound":-11.25}},"enemy_far_away_distance":{"upper_range":{"upper_bound":75,"lower_bound":50},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"enemy_behind_angle":{"upper_range":{"upper_bound":15,"lower_bound":10},"lower_range":{"upper_bound":-10,"lower_bound":-15}},"enemy_close_distance":{"upper_range":{"upper_bound":75,"lower_bound":50},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"max_ticks_on_course":{"upper_range":{"upper_bound":75,"lower_bound":50},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"ticks_cooldown":{"upper_range":{"upper_bound":75,"lower_bound":50},"lower_range":{"upper_bound":-25,"lower_bound":-37.5}},"turn_direction":{"upper_range":{"upper_bound":30,"lower_bound":20},"lower_range":{"upper_bound":-20,"lower_bound":-30}},"close_to_ground":{"upper_range":{"upper_bound":1500,"lower_bound":1000},"lower_range":{"upper_bound":-1000,"lower_bound":-1500}},"flip_direction_lb":{"upper_range":{"upper_bound":11.25,"lower_bound":7.5},"lower_range":{"upper_bound":-5,"lower_bound":-7.5}},"flip_direction_ub":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":-7.5,"lower_bound":-11.25}},"angle_allowance_at_range":{"upper_range":{"upper_bound":3.75,"lower_bound":2.5},"lower_range":{"upper_bound":3.75,"lower_bound":2.5}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0.15000000000000002,"lower_bound":0.1},"lower_range":{"upper_bound":-0.175,"lower_bound":-0.26249999999999996}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":7.5,"lower_bound":5}},"max_shooting_distance":{"upper_range":{"upper_bound":300,"lower_bound":200},"lower_range":{"upper_bound":-200,"lower_bound":-300}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-12.5,"lower_bound":-18.75}},"max_speed":{"upper_range":{"upper_bound":18.75,"lower_bound":12.5},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"health":{"upper_range":{"upper_bound":15,"lower_bound":10},"lower_range":{"upper_bound":-15,"lower_bound":-22.5}},"rotation_angle_debuff":{"upper_range":{"upper_bound":2.5,"lower_bound":1.5},"lower_range":{"upper_bound":2.5,"lower_bound":1.5}}},
                "hard":{"distance_to_enemy":{"upper_range":{"upper_bound":100,"lower_bound":50},"lower_range":{"upper_bound":-50,"lower_bound":-100}},"angle_to_enemy":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":-2.5,"lower_bound":-5}},"angle_from_ground":{"upper_range":{"upper_bound":7.5,"lower_bound":3.75},"lower_range":{"upper_bound":-3.75,"lower_bound":-7.5}},"enemy_far_away_distance":{"upper_range":{"upper_bound":50,"lower_bound":25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"enemy_behind_angle":{"upper_range":{"upper_bound":10,"lower_bound":5},"lower_range":{"upper_bound":-5,"lower_bound":-10}},"enemy_close_distance":{"upper_range":{"upper_bound":50,"lower_bound":25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"max_ticks_on_course":{"upper_range":{"upper_bound":50,"lower_bound":25},"lower_range":{"upper_bound":-62.5,"lower_bound":-125}},"ticks_cooldown":{"upper_range":{"upper_bound":50,"lower_bound":25},"lower_range":{"upper_bound":-62.5,"lower_bound":-125}},"turn_direction":{"upper_range":{"upper_bound":20,"lower_bound":10},"lower_range":{"upper_bound":-10,"lower_bound":-20}},"close_to_ground":{"upper_range":{"upper_bound":1000,"lower_bound":500},"lower_range":{"upper_bound":-500,"lower_bound":-1000}},"flip_direction_lb":{"upper_range":{"upper_bound":7.5,"lower_bound":3.75},"lower_range":{"upper_bound":-2.5,"lower_bound":-5}},"flip_direction_ub":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":-3.75,"lower_bound":-7.5}},"angle_allowance_at_range":{"upper_range":{"upper_bound":2.5,"lower_bound":1.25},"lower_range":{"upper_bound":2.5,"lower_bound":1.25}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0.1,"lower_bound":0.05},"lower_range":{"upper_bound":-0.0875,"lower_bound":-0.175}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":5,"lower_bound":2.5}},"max_shooting_distance":{"upper_range":{"upper_bound":200,"lower_bound":100},"lower_range":{"upper_bound":-100,"lower_bound":-200}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-6.25,"lower_bound":-12.5}},"max_speed":{"upper_range":{"upper_bound":12.5,"lower_bound":6.25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"health":{"upper_range":{"upper_bound":10,"lower_bound":5},"lower_range":{"upper_bound":-7.5,"lower_bound":-15}},"rotation_angle_debuff":{"upper_range":{"upper_bound":2.01,"lower_bound":0},"lower_range":{"upper_bound":2.01,"lower_bound":0}}},
                "hardest":{"distance_to_enemy":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"angle_to_enemy":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"angle_from_ground":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_far_away_distance":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_behind_angle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_close_distance":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_ticks_on_course":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"ticks_cooldown":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"turn_direction":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"close_to_ground":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"flip_direction_lb":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"flip_direction_ub":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"angle_allowance_at_range":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_shooting_distance":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_speed":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"health":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"rotation_angle_debuff":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}}}
            }
        },

        "bomber_plane": {
            "bomb_falling_distance_allowance_multiplier": 1.05,
            "update_friendly_center": 2000,
            "extra_bomb_distance": 250,
            "bias_ranges": {
                "easy":{"friendly_center_x_offset":{"upper_range":{"upper_bound":4000,"lower_bound":3000},"lower_range":{"upper_bound":-3000,"lower_bound":-4000}},"friendly_center_y_offset":{"upper_range":{"upper_bound":4000,"lower_bound":3000},"lower_range":{"upper_bound":-3000,"lower_bound":-4000}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":3500,"lower_bound":2625},"lower_range":{"upper_bound":-2625,"lower_bound":-3500}},"shooting_angle_offset":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":-7.5,"lower_bound":-10}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":1.5,"lower_bound":1.125},"lower_range":{"upper_bound":1.5,"lower_bound":1.125}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-18.75,"lower_bound":-25}},"max_speed":{"upper_range":{"upper_bound":25,"lower_bound":18.75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"health":{"upper_range":{"upper_bound":50,"lower_bound":37.5},"lower_range":{"upper_bound":-52.5,"lower_bound":-70}},"max_turret_angle_change_per_tick":{"upper_range":{"upper_bound":2.99,"lower_bound":2.51},"lower_range":{"upper_bound":2.99,"lower_bound":2.51}}},
                "medium":{"friendly_center_x_offset":{"upper_range":{"upper_bound":3000,"lower_bound":2000},"lower_range":{"upper_bound":-2000,"lower_bound":-3000}},"friendly_center_y_offset":{"upper_range":{"upper_bound":3000,"lower_bound":2000},"lower_range":{"upper_bound":-2000,"lower_bound":-3000}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":2625,"lower_bound":1750},"lower_range":{"upper_bound":-1750,"lower_bound":-2625}},"shooting_angle_offset":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":-5,"lower_bound":-7.5}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":1.125,"lower_bound":0.9},"lower_range":{"upper_bound":1.125,"lower_bound":0.9}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-12.5,"lower_bound":-18.75}},"max_speed":{"upper_range":{"upper_bound":18.75,"lower_bound":12.5},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"health":{"upper_range":{"upper_bound":37.5,"lower_bound":25},"lower_range":{"upper_bound":-35,"lower_bound":-52.5}},"max_turret_angle_change_per_tick":{"upper_range":{"upper_bound":16,"lower_bound":10},"lower_range":{"upper_bound":16,"lower_bound":10}}},
                "hard":{"friendly_center_x_offset":{"upper_range":{"upper_bound":2000,"lower_bound":1000},"lower_range":{"upper_bound":-1000,"lower_bound":-2000}},"friendly_center_y_offset":{"upper_range":{"upper_bound":2000,"lower_bound":1000},"lower_range":{"upper_bound":-1000,"lower_bound":-2000}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":1750,"lower_bound":875},"lower_range":{"upper_bound":-875,"lower_bound":-1750}},"shooting_angle_offset":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":-2.5,"lower_bound":-5}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":0.9,"lower_bound":0.75},"lower_range":{"upper_bound":0.9,"lower_bound":0.75}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-6.25,"lower_bound":-12.5}},"max_speed":{"upper_range":{"upper_bound":12.5,"lower_bound":6.25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"health":{"upper_range":{"upper_bound":25,"lower_bound":12.5},"lower_range":{"upper_bound":-17.5,"lower_bound":-35}},"max_turret_angle_change_per_tick":{"upper_range":{"upper_bound":36,"lower_bound":24},"lower_range":{"upper_bound":36,"lower_bound":24}}},
                "hardest":{"friendly_center_x_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"friendly_center_y_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"shooting_angle_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":0.75,"lower_bound":0.75},"lower_range":{"upper_bound":0.75,"lower_bound":0.75}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_speed":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"health":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_turret_angle_change_per_tick":{"upper_range":{"upper_bound":359,"lower_bound":359},"lower_range":{"upper_bound":359,"lower_bound":359}}}
            }
        }
    },

    "dogfight_settings": {
        "ally_spawn_x": 50000,
        "ally_spawn_y": 50000,
        "axis_spawn_x": 70000,
        "axis_spawn_y": 50000,
        "spawn_offset": 5000
    },
    "country_to_alliance": {
        "Britain": "Allies",
        "USA": "Allies",
        "Japan": "Axis",
        "Germany": "Axis"
    },
    "extra_images_to_load": [
        "radar_outline",
        "bullet",
        "bomb",
        "dirt",
        "above_ground",
        "freecam",
        "flash"
    ],

    "other_effects": {
        "building_collapse": {
            "fake_building": {
                "life_span_ms": 2000,
            },
            "inside_smoke": {
                "colour": "#909091",
                "number": 40,
                "diameter": 20,
                "life_span_ms": 4000
            },
            "runaway_smoke": {
                "colour": "#a8aaad",
                "number": 80,
                "diameter": 20,
                "life_span_ms": 4000,
                "y_position": 0.15,
                "max_speed": 500
            }
        },

        "explosion": {
            "center_ball": {
                "start_diameter": 20/64,
                "end_diameter": 40/64,
                "colour": "#ff000b",
                "growing_time_ms": 500, // 500
                "life_span_ms": 1000 // 1000
            },
            "secondary_ball": {
                "start_diameter": 30/64,
                "end_diameter": 60/64,
                "colour": "#ff5400",
                "growing_time_ms": 250, // 250
                "life_span_ms": 1000, // 1000
                "delay_ms": 500 // 500
            },
            "smoke": {
                "number": 16,
                "diameter": 20/64,
                "colour": "#404040",
                "delay_ms": 750, // 750
                "life_span_ms": 10000 // 10000
            }
        }
    },

    "plane_smoke": {
        "number_of_stages": 3,
        "plane_smoke_interval_ms": 600, // 1400 was ok....
        "smoke_life_span_ms": 2000,
        "stage_details": [
            // 1
            [
                {
                    "colour": "#dee3e0",
                    "number": 3,
                    "spread": 7,
                    "diameter": 6
                }
            ],
            // 2
            [
                {
                    "colour": "#707070",
                    "number": 6,
                    "spread": 7,
                    "diameter": 6
                }
            ],
            // 3
            [
                {
                    "colour": "#2e2d2d",
                    "number": 8,
                    "spread": 8,
                    "diameter": 7
                },
                {
                    "colour": "#3b3939",
                    "number": 8,
                    "spread": 8,
                    "diameter": 7
                },
                {
                    "colour": "#d10808",
                    "number": 3,
                    "spread": 8,
                    "diameter": 5
                },
                {
                    "colour": "#ff5226",
                    "number": 3,
                    "spread": 8,
                    "diameter": 6
                }
            ]
        ]
    },

    "team_to_colour": {
        // General
        "Axis": "#8427db",
        "Allies": "#f5d442",
        // Plane Type Specific
        "fighter_plane": {
            "Axis": "#8427db",
            "Allies": "#f5d442"
        },
        "bomber_plane": {
            "Axis": "#591994",
            "Allies": "#c2a213"
        }
    },

    "sound_data": {
        "sounds": [
            { "name": "shoot", "type": "discrete" },
            { "name": "explode", "type": "discrete" },
            { "name": "damage", "type": "discrete" },
            { "name": "engine", "type": "ongoing" },
            { "name": "bomb", "type": "discrete" },
            { "name": "building_collapse", "type": "discrete" }
        ],
        "url": "./sounds",
        "file_type": ".mp3"
    },

    "missions": [
        {
            "id": 0,
            "description": "Mission 1\nAn American assault on German\npositions in Western Germany.",
            "user_planes": [
                "republic_p_47",
                "p51_mustang",
                "b24",
                "me_309",
                "me_bf_109"
            ],
            "attacker_planes": [
                "republic_p_47",
                "p51_mustang",
                "b24"
            ],
            "defender_planes": [
                "me_309",
                "me_bf_109"
            ],
            "attackers": "Allies",
            "defenders": "Axis",
            "easy": {
                "max_planes": 40,
                "attacker_plane_counts": {
                    "republic_p_47": 3, // 3?
                    "p51_mustang": 3, // 3?
                    "b24": 1
                },
                "defender_plane_counts": {
                    "me_309": 3, // 3?
                    "me_bf_109": 3 // 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 7 // Based on attacker difficulty
            },
            "medium": {
                "max_planes": 50,
                "attacker_plane_counts": {
                    "republic_p_47": 3, // 5?
                    "p51_mustang": 3, // 5?
                    "b24": 1
                },
                "defender_plane_counts": {
                    "me_309": 3,
                    "me_bf_109": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
                "max_planes": 60,
                "attacker_plane_counts": {
                    "republic_p_47": 5,
                    "p51_mustang": 5,
                    "b24": 2
                },
                "defender_plane_counts": {
                    "me_309": 6,
                    "me_bf_109": 6
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 30, // 20?
                    "min_health": 12,
                    "max_health": 15 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 45e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "max_planes": 70,
                "attacker_plane_counts": {
                    "republic_p_47": 9,
                    "p51_mustang": 9,
                    "b24": 4
                },
                "defender_plane_counts": {
                    "me_309": 10,
                    "me_bf_109": 10
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 22,
                    "max_health": 26 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 66e3, // 70e3?
                    "defenders": 33e3 // 30e3?
                },
                "bomber_hp_multiplier": 4 // Based on attacker difficulty
            },
            "start_zone": {
                "attackers": {
                    "x": 0,
                    "y": 10e3
                },
                "defenders": {
                    "x": 65e3, // 60e3?
                    "y": 200
                },
                "offsets": {
                    "x": 5500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 50e3, // 70e3
                "min_gap": 150,
                "max_gap": 500,
                "min_height": 60,
                "max_height": 500,
                "min_width": 25,
                "max_width": 250,
            }
        },
        {
            "id": 1,
            "description": "Mission 2\nAn American assault on Japanese positions on\n a small island\nsomewhere between Japan and Hawaii.",
            "user_planes": [
                "republic_p_47",
                "p51_mustang",
                "b24",
                "a6m_zero",
                "kawasaki_ki_45"
            ],
            "attacker_planes": [
                "republic_p_47",
                "p51_mustang",
                "b24"
            ],
            "defender_planes": [
                "a6m_zero",
                "kawasaki_ki_45"
            ],
            "attackers": "Allies",
            "defenders": "Axis",
            "easy": {
                "max_planes": 40,
                "attacker_plane_counts": {
                    "republic_p_47": 3, // 5?
                    "p51_mustang": 3, // 5?
                    "b24": 1
                },
                "defender_plane_counts": {
                    "a6m_zero": 3,
                    "kawasaki_ki_45": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 7 // Based on attacker difficulty
            },
            "medium": {
                "max_planes": 50,
                "attacker_plane_counts": {
                    "republic_p_47": 3, // 5?
                    "p51_mustang": 3, // 5?
                    "b24": 1
                },
                "defender_plane_counts": {
                    "a6m_zero": 3,
                    "kawasaki_ki_45": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
                "max_planes": 60,
                "attacker_plane_counts": {
                    "republic_p_47": 5,
                    "p51_mustang": 5,
                    "b24": 2
                },
                "defender_plane_counts": {
                    "a6m_zero": 6,
                    "kawasaki_ki_45": 6
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 30, // 20?
                    "min_health": 12,
                    "max_health": 15 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 45e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "max_planes": 70,
                "attacker_plane_counts": {
                    "republic_p_47": 9,
                    "p51_mustang": 9,
                    "b24": 4
                },
                "defender_plane_counts": {
                    "a6m_zero": 5, // was working with 12 for a while but too op suddenly
                    "kawasaki_ki_45": 5 // was working with 12 for a while but too op suddenly
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 22,
                    "max_health": 26 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 66e3, // 70e3?
                    "defenders": 33e3 // was working at 30e3 but now changing to 45 because op
                },
                "bomber_hp_multiplier": 4 // Based on attacker difficulty
            },
            "start_zone": {
                "attackers": {
                    "x": 0,
                    "y": 10e3
                },
                "defenders": {
                    "x": 45e3, // used 65e3 for a while
                    "y": 200
                },
                "offsets": {
                    "x": 5500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 30e3, // used 50e3 for a while
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        },
        {
            "id": 2,
            "description": "Mission 3\nA British assault on German positions in France.",
            "user_planes": [
                "spitfire",
                "hawker_sea_fury",
                "short_stirling",
                "me_309",
                "me_bf_109"
            ],
            "attacker_planes": [
                "spitfire",
                "hawker_sea_fury",
                "short_stirling"
            ],
            "defender_planes": [
                "me_309",
                "me_bf_109"
            ],
            "attackers": "Allies",
            "defenders": "Axis",
            "easy": {
                "max_planes": 40,
                "attacker_plane_counts": {
                    "hawker_sea_fury": 3, // 5?
                    "spitfire": 3, // 5?
                    "short_stirling": 1
                },
                "defender_plane_counts": {
                    "me_309": 3,
                    "me_bf_109": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "medium": {
                "max_planes": 50,
                "attacker_plane_counts": {
                    "hawker_sea_fury": 3, // 5?
                    "spitfire": 3, // 5?
                    "short_stirling": 1
                },
                "defender_plane_counts": {
                    "me_309": 3,
                    "me_bf_109": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
                "max_planes": 60,
                "attacker_plane_counts": {
                    "hawker_sea_fury": 5,
                    "spitfire": 5,
                    "short_stirling": 2
                },
                "defender_plane_counts": {
                    "me_309": 6,
                    "me_bf_109": 6
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 30, // 20?
                    "min_health": 12,
                    "max_health": 15 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 45e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "max_planes": 70,
                "attacker_plane_counts": {
                    "hawker_sea_fury": 9,
                    "spitfire": 9,
                    "short_stirling": 4
                },
                "defender_plane_counts": {
                    "me_309": 5, // was working with 12 for a while but too op suddenly
                    "me_bf_109": 5 // was working with 12 for a while but too op suddenly
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 22,
                    "max_health": 26 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 66e3, // 70e3?
                    "defenders": 33e3 // was working at 30e3 but now changing to 45 because op
                },
                "bomber_hp_multiplier": 4 // Based on attacker difficulty
            },
            "start_zone": {
                "attackers": {
                    "x": 0,
                    "y": 10e3
                },
                "defenders": {
                    "x": 45e3, // used 65e3 for a while
                    "y": 200
                },
                "offsets": {
                    "x": 5500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 30e3, // used 50e3 for a while
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        },
        {
            "id": 3,
            "description": "Mission 4\nA German bombing run on Cambridge.",
            "user_planes": [
                "spitfire",
                "hawker_sea_fury",
                "junkers_ju_88",
                "me_309",
                "me_bf_109"
            ],
            "attacker_planes": [
                "me_309",
                "me_bf_109",
                "junkers_ju_88"
            ],
            "defender_planes": [
                "spitfire",
                "hawker_sea_fury"
            ],
            "attackers": "Axis",
            "defenders": "Allies",
            "easy": {
                "max_planes": 40,
                "attacker_plane_counts": {
                    "me_309": 3, // 5?
                    "me_bf_109": 3, // 5?
                    "junkers_ju_88": 1
                },
                "defender_plane_counts": {
                    "spitfire": 3,
                    "hawker_sea_fury": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 7 // Based on attacker difficulty
            },
            "medium": {
                "max_planes": 50,
                "attacker_plane_counts": {
                    "me_309": 3, // 5?
                    "me_bf_109": 3, // 5?
                    "junkers_ju_88": 1
                },
                "defender_plane_counts": {
                    "spitfire": 3,
                    "hawker_sea_fury": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
                "max_planes": 60,
                "attacker_plane_counts": {
                    "me_309": 5,
                    "me_bf_109": 5,
                    "junkers_ju_88": 2
                },
                "defender_plane_counts": {
                    "spitfire": 6,
                    "hawker_sea_fury": 6
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 30, // 20?
                    "min_health": 12,
                    "max_health": 15 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 45e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "max_planes": 70,
                "attacker_plane_counts": {
                    "me_309": 9,
                    "me_bf_109": 9,
                    "junkers_ju_88": 4
                },
                "defender_plane_counts": {
                    "spitfire": 5, // was working with 12 for a while but too op suddenly
                    "hawker_sea_fury": 5 // was working with 12 for a while but too op suddenly
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 22,
                    "max_health": 26 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 66e3, // 70e3?
                    "defenders": 33e3 // was working at 30e3 but now changing to 45 because op
                },
                "bomber_hp_multiplier": 4 // Based on attacker difficulty
            },
            "start_zone": {
                "attackers": {
                    "x": 0,
                    "y": 10e3
                },
                "defenders": {
                    "x": 45e3, // used 65e3 for a while
                    "y": 200
                },
                "offsets": {
                    "x": 5500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 30e3, // used 50e3 for a while
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        },
        {
            "id": 4,
            "description": "Mission 5\nA Japanese assault on San Francisco\nin an alternate reality where Japan has the capacity to conduct such an attack.\nThe Japanese bomber is on loan from the Germans in this scenario.",
            "user_planes": [
                "republic_p_47",
                "p51_mustang",
                "me_264",
                "a6m_zero",
                "kawasaki_ki_45"
            ],
            "attacker_planes": [
                "a6m_zero",
                "kawasaki_ki_45",
                "me_264"
            ],
            "defender_planes": [
                "republic_p_47",
                "p51_mustang"
            ],
            "attackers": "Axis",
            "defenders": "Allies",
            "easy": {
                "max_planes": 40,
                "attacker_plane_counts": {
                    "a6m_zero": 3, // 5?
                    "kawasaki_ki_45": 3, // 5?
                    "me_264": 1
                },
                "defender_plane_counts": {
                    "republic_p_47": 3,
                    "p51_mustang": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 7 // Based on attacker difficulty
            },
            "medium": {
                "max_planes": 50,
                "attacker_plane_counts": {
                    "a6m_zero": 3, // 5?
                    "kawasaki_ki_45": 3, // 5?
                    "me_264": 1
                },
                "defender_plane_counts": {
                    "republic_p_47": 3,
                    "p51_mustang": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
                "max_planes": 60,
                "attacker_plane_counts": {
                    "a6m_zero": 5,
                    "kawasaki_ki_45": 5,
                    "me_264": 2
                },
                "defender_plane_counts": {
                    "republic_p_47": 6,
                    "p51_mustang": 6
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 30, // 20?
                    "min_health": 12,
                    "max_health": 15 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 45e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "max_planes": 70,
                "attacker_plane_counts": {
                    "a6m_zero": 9,
                    "kawasaki_ki_45": 9,
                    "me_264": 4
                },
                "defender_plane_counts": {
                    "republic_p_47": 5, // was working with 12 for a while but too op suddenly
                    "republic_p_47": 5 // was working with 12 for a while but too op suddenly
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 22,
                    "max_health": 26 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 66e3, // 70e3?
                    "defenders": 33e3 // was working at 30e3 but now changing to 45 because op
                },
                "bomber_hp_multiplier": 4 // Based on attacker difficulty
            },
            "start_zone": {
                "attackers": {
                    "x": 0,
                    "y": 10e3
                },
                "defenders": {
                    "x": 45e3, // used 65e3 for a while
                    "y": 200
                },
                "offsets": {
                    "x": 5500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 30e3, // used 50e3 for a while
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        },
        {
            "id": 5,
            "description": "Mission 6\nA German counter offensive against Americans in France.",
            "user_planes": [
                "me_309",
                "me_bf_109",
                "junkers_ju_88",
                "republic_p_47",
                "p51_mustang"
            ],
            "attacker_planes": [
                "me_309",
                "me_bf_109",
                "junkers_ju_88"
            ],
            "defender_planes": [
                "republic_p_47",
                "p51_mustang"
            ],
            "attackers": "Axis",
            "defenders": "Allies",
            "easy": {
                "max_planes": 40,
                "attacker_plane_counts": {
                    "me_309": 3, // 5?
                    "me_bf_109": 3, // 5?
                    "junkers_ju_88": 1
                },
                "defender_plane_counts": {
                    "republic_p_47": 3,
                    "p51_mustang": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 27e3 // 30e3?
                },
                "bomber_hp_multiplier": 7 // Based on attacker difficulty
            },
            "medium": {
                "max_planes": 50,
                "attacker_plane_counts": {
                    "me_309": 3, // 5?
                    "me_bf_109": 3, // 5?
                    "junkers_ju_88": 1
                },
                "defender_plane_counts": {
                    "republic_p_47": 3,
                    "p51_mustang": 3
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 20, // 20?
                    "min_health": 6,
                    "max_health": 8 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
                "max_planes": 60,
                "attacker_plane_counts": {
                    "me_309": 5,
                    "me_bf_109": 5,
                    "junkers_ju_88": 2
                },
                "defender_plane_counts": {
                    "republic_p_47": 6,
                    "p51_mustang": 6
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 30, // 20?
                    "min_health": 12,
                    "max_health": 15 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 45e3, // 70e3?
                    "defenders": 35e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "max_planes": 70,
                "attacker_plane_counts": {
                    "me_309": 9,
                    "me_bf_109": 9,
                    "junkers_ju_88": 4
                },
                "defender_plane_counts": {
                    "republic_p_47": 5, // was working with 12 for a while but too op suddenly
                    "p51_mustang": 5 // was working with 12 for a while but too op suddenly
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 22,
                    "max_health": 26 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 66e3, // 70e3?
                    "defenders": 33e3 // was working at 30e3 but now changing to 45 because op
                },
                "bomber_hp_multiplier": 4 // Based on attacker difficulty
            },
            "start_zone": {
                "attackers": {
                    "x": 0,
                    "y": 10e3
                },
                "defenders": {
                    "x": 45e3, // used 65e3 for a while
                    "y": 200
                },
                "offsets": {
                    "x": 5500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 30e3, // used 50e3 for a while
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        }
    ],
    "sky_generation": {
        "far_away_multiplier": 2,
        "sky_colour": "#5bb8ff",
        "sun_colour": "#fdb813",
        "sunrise_start": 6,
        "sunrise_end": 7,
        "sunrise_colour": "#ff870f",
        "sunrise_modifier": 0.9,
        "sunset_start": 18,
        "sunset_end": 20,
        "sunset_colour": "#820185",
        "sunset_modifier": 0.3,
        "moon_colour": "#f6f1d5",
        "sun_diameter": 300,
        "moon_diameter": 150,
        "moon_phase": 5, // Allowed range [0, 7]
        "current_hour": 12,
        "cloud_generation": {
            "min_height": 1000,
            "cloud_opacity": 80,
            "cloud_colour": "#e8ecff",
            "cloud_cluster_width": 3840*4,
            "cloud_cluster_height": 2160*4,
            "min_radius": 30*4,
            "max_radius": 80*4,
            "min_circles_per_cloud": 3,
            "max_circles_per_cloud": 7,
            "min_clouds_per_cluster": 80,
            "max_clouds_per_cluster": 100,
        }
    },

    "hud": {
        "text_size": 20,
        "key_colour": "#ff6700",
        "value_colour": "#0066ff"
    },

    "client_states": {
        "prospective": 0,
        "cancelled": 1,
        "waiting": 2,
        "in_game": 3,
        "in_lobby": 4,
        "hosting": 5

    },

    "menu": {
        "option_slider": {
            "slider_width_px": 20,
            "x_size": 300
        }
    },

    "heat_bar": {
        "width": 120,
        "height": 40,
        "border_colour": "#000000",
        "border_thickness": 1,
        "cooling_colour": "#ff1212",
        "threshold_3": 0.8,
        "threshold_2": 0.55,
        "threshold_3_colour": "#ff1212",
        "threshold_2_colour": "#ff7512",
        "threshold_1_colour": "#12ff12",
        "cooling_delay_ms": 500
    }
}
if (typeof window === "undefined"){
    module.exports = PROGRAM_DATA;
}
