const PROGRAM_DATA = {
    "plane_data": {
        "spitfire": {
            "radius": 64,
            "max_speed": 594,
            "health": 12*5,
            "country": "Britain",
            "type": "Fighter",
            "gun_offset_x": 126-64,
            "gun_offset_y": 64-61
        },
        "a6m_zero": {
            "radius": 64,
            "max_speed": 565,
            "health": 13*5,
            "country": "Japan",
            "type": "Fighter",
            "gun_offset_x": 89-64,
            "gun_offset_y": 64-78
        },
        "republic_p_47": {
            "radius": 64,
            "max_speed": 686,
            "health": 12*5,
            "country": "USA",
            "type": "Fighter",
            "gun_offset_x": 84-64,
            "gun_offset_y": 64-75
        },
        "me_bf_109": {
            "radius": 64,
            "max_speed": 634,
            "health": 10*5,
            "country": "Germany",
            "type": "Fighter",
            "gun_offset_x": 60-64,
            "gun_offset_y": 64-86
        },
        "kawasaki_ki_45": {
            "radius": 64,
            "max_speed": 540,
            "health": 17*5,
            "country": "Japan",
            "type": "Fighter",
            "gun_offset_x": 86-64,
            "gun_offset_y": 64-78
        },
        "p51_mustang": {
            "radius": 64,
            "max_speed": 710,
            "health": 10*5,
            "country": "USA",
            "type": "Fighter",
            "gun_offset_x": 81-64,
            "gun_offset_y": 64-74
        },
        "hawker_sea_fury": {
            "radius": 64,
            "max_speed": 740,
            "health": 9*5,
            "country": "Britain",
            "type": "Fighter",
            "gun_offset_x": 87-64,
            "gun_offset_y": 64-85
        },
        "me_309": {
            "radius": 64,
            "max_speed": 733,
            "health": 9*5,
            "country": "Germany",
            "type": "Fighter",
            "gun_offset_x": 88-64,
            "gun_offset_y": 64-65
        },
        "b24": {
            "radius": 128,
            "max_speed": 467,
            "health": 50*5,
            "country": "USA",
            "type": "Bomber",
            "BOMB_OFFSET_X": 123-128,
            "BOMB_OFFSET_Y": 128-136,
            "guns": [
                { // Front gun
                    "x_offset": 224-128,
                    "y_offset": 128-132,
                    "fov_1": 40,
                    "fov_2": 320,
                    "rate_of_fire": 50
                },
                { // Top gun front
                    "x_offset": 149-128,
                    "y_offset": 128-93,
                    "fov_1": 170,
                    "fov_2": 10,
                    "rate_of_fire": 50
                },
                { // Back bottom gun
                    "x_offset": 110-128,
                    "y_offset": 128-130,
                    "fov_1": 260,
                    "fov_2": 175,
                    "rate_of_fire": 50
                },
                { // Top gun back
                    "x_offset": 27-128,
                    "y_offset": 128-89,
                    "fov_1": 190,
                    "fov_2": 10,
                    "rate_of_fire": 50
                }
            ]
        }
    },
    "teams": ["Allies", "Axis"],
    "bullet_data": {
        "speed": 1600,
        "picture": "bullet",
        "radius": 1
    },

    "bomb_data": {
        "picture": "bomb",
        "radius": 8,
        "initial_y_velocity": -300,
        "bomb_explosion_radius": 100
    },

    "radar": {
        "size": 36,
        "blip_size": 5,
        "border_width": 2,
        "blip_distance": 375
    },

    "background": {
        "ground": {
            "picture": "dirt",
        },
        "above_ground": {
            "picture": "above_ground",
        },
        "sky": {
            "picture": "clouds",
        }
    },
    "settings": {
        "shoot_distance_constant": 5,
        "close_to_ground_constant": 3,
        "close_constant": 3,
        "enemy_disregard_distance_time_constant": 20,
        "turn_to_enemy_constant": 0.75, // Maybe 0.75 is good?
        "enemy_taken_distance_multiplier": 5,
        "evasive_time_to_catch": 20,
        "evasive_speed_diff": 4,
        "min_angle_to_adjust": 3,
        "min_velocity_assumption": 0.01,
        "max_throttle": 100,
        "fall_speed": 200,
        "slow_down_amount": 0.1,
        "expected_canvas_width": 1920,
        "expected_canvas_height": 927,
        "frame_rate": 60, // 60
        "tick_rate": 100, // 100
        "assumed_tick_rate": 100, // TODO: Remove this constant?
        "ms_between_ticks": 10, // 10
        "max_bullet_y_velocity_multiplier": 2/800,
        "server_ip": "localhost",
        "server_port": "8080",
        "plane_shoot_gap_ms": 100,
        "max_bullets": 2000,
        "saved_ticks": 500,
        "keep_alive_interval": 5000,
        "time_to_ready_up": 5000, // 5000
        "multiplayer_disabled": false,
        "bomber_distance_from_friendlies_dogfight": 2000,
        "bullet_reduction_coefficient": 1.5,
        "focused_count_distance_equivalent": 1500,
        "text_box_padding_percent": 0.1,
        "use_physics_bullets": false,
        "instant_shot_max_distance": 1200,
        "max_expected_screen_width": 3840,
        "max_expected_screen_height": 2160,
        "max_cloud_animation_speed_y": 0.5,
        "max_cloud_animation_speed_x": 0.5
    },
    "constants": {
        "gravity": 9.81
    },

    "extra_settings": [
        {
            "name": "use_physics_bullets",
            "path": ["settings"]
        }
    ],

    "ai": {
        "fighter_plane": {
            "max_enemy_distance_campaign": 5000,
            "max_x_distance_from_bomber_cruising_campaign": 2000,
            "max_y_distance_from_bomber_cruising_campaign": 500,
            "update_enemy_cooldown": 1000,
            "max_ticks_on_course": 6000,
            "tick_cd": 500,
            "bias_ranges": {
                "easy":{"distance_to_enemy":{"upper_range":{"upper_bound":200,"lower_bound":150},"lower_range":{"upper_bound":-150,"lower_bound":-200}},"angle_to_enemy":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":-7.5,"lower_bound":-10}},"angle_from_ground":{"upper_range":{"upper_bound":15,"lower_bound":11.25},"lower_range":{"upper_bound":-11.25,"lower_bound":-15}},"enemy_far_away_distance":{"upper_range":{"upper_bound":100,"lower_bound":75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"enemy_behind_angle":{"upper_range":{"upper_bound":20,"lower_bound":15},"lower_range":{"upper_bound":-15,"lower_bound":-20}},"enemy_close_distance":{"upper_range":{"upper_bound":100,"lower_bound":75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"max_ticks_on_course":{"upper_range":{"upper_bound":500,"lower_bound":375},"lower_range":{"upper_bound":-187.5,"lower_bound":-250}},"ticks_cooldown":{"upper_range":{"upper_bound":500,"lower_bound":375},"lower_range":{"upper_bound":-187.5,"lower_bound":-250}},"turn_direction":{"upper_range":{"upper_bound":40,"lower_bound":30},"lower_range":{"upper_bound":-30,"lower_bound":-40}},"close_to_ground":{"upper_range":{"upper_bound":2000,"lower_bound":1500},"lower_range":{"upper_bound":-1500,"lower_bound":-2000}},"flip_direction_lb":{"upper_range":{"upper_bound":15,"lower_bound":11.25},"lower_range":{"upper_bound":-7.5,"lower_bound":-10}},"flip_direction_ub":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":-11.25,"lower_bound":-15}},"min_angle_to_adjust":{"upper_range":{"upper_bound":15,"lower_bound":11.25},"lower_range":{"upper_bound":15,"lower_bound":11.25}},"angle_allowance_at_range":{"upper_range":{"upper_bound":5,"lower_bound":3.75},"lower_range":{"upper_bound":5,"lower_bound":3.75}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0.2,"lower_bound":0.15000000000000002},"lower_range":{"upper_bound":-0.26249999999999996,"lower_bound":-0.35}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":10,"lower_bound":7.5}},"max_shooting_distance":{"upper_range":{"upper_bound":400,"lower_bound":300},"lower_range":{"upper_bound":-300,"lower_bound":-400}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-18.75,"lower_bound":-25}},"max_speed":{"upper_range":{"upper_bound":25,"lower_bound":18.75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"health":{"upper_range":{"upper_bound":20,"lower_bound":15},"lower_range":{"upper_bound":-22.5,"lower_bound":-30}},"rotation_time":{"upper_range":{"upper_bound":35,"lower_bound":26.25},"lower_range":{"upper_bound":35,"lower_bound":26.25}}},
                "medium":{"distance_to_enemy":{"upper_range":{"upper_bound":150,"lower_bound":100},"lower_range":{"upper_bound":-100,"lower_bound":-150}},"angle_to_enemy":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":-5,"lower_bound":-7.5}},"angle_from_ground":{"upper_range":{"upper_bound":11.25,"lower_bound":7.5},"lower_range":{"upper_bound":-7.5,"lower_bound":-11.25}},"enemy_far_away_distance":{"upper_range":{"upper_bound":75,"lower_bound":50},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"enemy_behind_angle":{"upper_range":{"upper_bound":15,"lower_bound":10},"lower_range":{"upper_bound":-10,"lower_bound":-15}},"enemy_close_distance":{"upper_range":{"upper_bound":75,"lower_bound":50},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"max_ticks_on_course":{"upper_range":{"upper_bound":375,"lower_bound":250},"lower_range":{"upper_bound":-125,"lower_bound":-187.5}},"ticks_cooldown":{"upper_range":{"upper_bound":375,"lower_bound":250},"lower_range":{"upper_bound":-125,"lower_bound":-187.5}},"turn_direction":{"upper_range":{"upper_bound":30,"lower_bound":20},"lower_range":{"upper_bound":-20,"lower_bound":-30}},"close_to_ground":{"upper_range":{"upper_bound":1500,"lower_bound":1000},"lower_range":{"upper_bound":-1000,"lower_bound":-1500}},"flip_direction_lb":{"upper_range":{"upper_bound":11.25,"lower_bound":7.5},"lower_range":{"upper_bound":-5,"lower_bound":-7.5}},"flip_direction_ub":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":-7.5,"lower_bound":-11.25}},"min_angle_to_adjust":{"upper_range":{"upper_bound":11.25,"lower_bound":7.5},"lower_range":{"upper_bound":11.25,"lower_bound":7.5}},"angle_allowance_at_range":{"upper_range":{"upper_bound":3.75,"lower_bound":2.5},"lower_range":{"upper_bound":3.75,"lower_bound":2.5}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0.15000000000000002,"lower_bound":0.1},"lower_range":{"upper_bound":-0.175,"lower_bound":-0.26249999999999996}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":7.5,"lower_bound":5}},"max_shooting_distance":{"upper_range":{"upper_bound":300,"lower_bound":200},"lower_range":{"upper_bound":-200,"lower_bound":-300}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-12.5,"lower_bound":-18.75}},"max_speed":{"upper_range":{"upper_bound":18.75,"lower_bound":12.5},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"health":{"upper_range":{"upper_bound":15,"lower_bound":10},"lower_range":{"upper_bound":-15,"lower_bound":-22.5}},"rotation_time":{"upper_range":{"upper_bound":26.25,"lower_bound":17.5},"lower_range":{"upper_bound":26.25,"lower_bound":17.5}}},
                "hard":{"distance_to_enemy":{"upper_range":{"upper_bound":100,"lower_bound":50},"lower_range":{"upper_bound":-50,"lower_bound":-100}},"angle_to_enemy":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":-2.5,"lower_bound":-5}},"angle_from_ground":{"upper_range":{"upper_bound":7.5,"lower_bound":3.75},"lower_range":{"upper_bound":-3.75,"lower_bound":-7.5}},"enemy_far_away_distance":{"upper_range":{"upper_bound":50,"lower_bound":25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"enemy_behind_angle":{"upper_range":{"upper_bound":10,"lower_bound":5},"lower_range":{"upper_bound":-5,"lower_bound":-10}},"enemy_close_distance":{"upper_range":{"upper_bound":50,"lower_bound":25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"max_ticks_on_course":{"upper_range":{"upper_bound":250,"lower_bound":125},"lower_range":{"upper_bound":-62.5,"lower_bound":-125}},"ticks_cooldown":{"upper_range":{"upper_bound":250,"lower_bound":125},"lower_range":{"upper_bound":-62.5,"lower_bound":-125}},"turn_direction":{"upper_range":{"upper_bound":20,"lower_bound":10},"lower_range":{"upper_bound":-10,"lower_bound":-20}},"close_to_ground":{"upper_range":{"upper_bound":1000,"lower_bound":500},"lower_range":{"upper_bound":-500,"lower_bound":-1000}},"flip_direction_lb":{"upper_range":{"upper_bound":7.5,"lower_bound":3.75},"lower_range":{"upper_bound":-2.5,"lower_bound":-5}},"flip_direction_ub":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":-3.75,"lower_bound":-7.5}},"min_angle_to_adjust":{"upper_range":{"upper_bound":7.5,"lower_bound":3.75},"lower_range":{"upper_bound":7.5,"lower_bound":3.75}},"angle_allowance_at_range":{"upper_range":{"upper_bound":2.5,"lower_bound":1.25},"lower_range":{"upper_bound":2.5,"lower_bound":1.25}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0.1,"lower_bound":0.05},"lower_range":{"upper_bound":-0.0875,"lower_bound":-0.175}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":5,"lower_bound":2.5}},"max_shooting_distance":{"upper_range":{"upper_bound":200,"lower_bound":100},"lower_range":{"upper_bound":-100,"lower_bound":-200}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-6.25,"lower_bound":-12.5}},"max_speed":{"upper_range":{"upper_bound":12.5,"lower_bound":6.25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"health":{"upper_range":{"upper_bound":10,"lower_bound":5},"lower_range":{"upper_bound":-7.5,"lower_bound":-15}},"rotation_time":{"upper_range":{"upper_bound":17.5,"lower_bound":8.75},"lower_range":{"upper_bound":17.5,"lower_bound":8.75}}},
                "hardest":{"distance_to_enemy":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"angle_to_enemy":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"angle_from_ground":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_far_away_distance":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_behind_angle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_close_distance":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_ticks_on_course":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"ticks_cooldown":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"turn_direction":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"close_to_ground":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"flip_direction_lb":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"flip_direction_ub":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"min_angle_to_adjust":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"angle_allowance_at_range":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_disregard_distance_time_constant":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"enemy_taken_distance_multiplier":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_shooting_distance":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_speed":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"health":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"rotation_time":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}}}
            }
        },

        "bomber_plane": {
            "bomb_falling_distance_allowance_multiplier": 1.05,
            "bias_ranges": {
                "easy":{"friendly_center_x_offset":{"upper_range":{"upper_bound":4000,"lower_bound":3000},"lower_range":{"upper_bound":-3000,"lower_bound":-4000}},"friendly_center_y_offset":{"upper_range":{"upper_bound":4000,"lower_bound":3000},"lower_range":{"upper_bound":-3000,"lower_bound":-4000}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":3500,"lower_bound":2625},"lower_range":{"upper_bound":-2625,"lower_bound":-3500}},"shooting_angle_offset":{"upper_range":{"upper_bound":10,"lower_bound":7.5},"lower_range":{"upper_bound":-7.5,"lower_bound":-10}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":1.5,"lower_bound":1.125},"lower_range":{"upper_bound":1.5,"lower_bound":1.125}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-18.75,"lower_bound":-25}},"max_speed":{"upper_range":{"upper_bound":25,"lower_bound":18.75},"lower_range":{"upper_bound":-75,"lower_bound":-100}},"health":{"upper_range":{"upper_bound":50,"lower_bound":37.5},"lower_range":{"upper_bound":-52.5,"lower_bound":-70}}},
                "medium":{"friendly_center_x_offset":{"upper_range":{"upper_bound":3000,"lower_bound":2000},"lower_range":{"upper_bound":-2000,"lower_bound":-3000}},"friendly_center_y_offset":{"upper_range":{"upper_bound":3000,"lower_bound":2000},"lower_range":{"upper_bound":-2000,"lower_bound":-3000}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":2625,"lower_bound":1750},"lower_range":{"upper_bound":-1750,"lower_bound":-2625}},"shooting_angle_offset":{"upper_range":{"upper_bound":7.5,"lower_bound":5},"lower_range":{"upper_bound":-5,"lower_bound":-7.5}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":1.125,"lower_bound":0.9},"lower_range":{"upper_bound":1.125,"lower_bound":0.9}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-12.5,"lower_bound":-18.75}},"max_speed":{"upper_range":{"upper_bound":18.75,"lower_bound":12.5},"lower_range":{"upper_bound":-50,"lower_bound":-75}},"health":{"upper_range":{"upper_bound":37.5,"lower_bound":25},"lower_range":{"upper_bound":-35,"lower_bound":-52.5}}},
                "hard":{"friendly_center_x_offset":{"upper_range":{"upper_bound":2000,"lower_bound":1000},"lower_range":{"upper_bound":-1000,"lower_bound":-2000}},"friendly_center_y_offset":{"upper_range":{"upper_bound":2000,"lower_bound":1000},"lower_range":{"upper_bound":-1000,"lower_bound":-2000}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":1750,"lower_bound":875},"lower_range":{"upper_bound":-875,"lower_bound":-1750}},"shooting_angle_offset":{"upper_range":{"upper_bound":5,"lower_bound":2.5},"lower_range":{"upper_bound":-2.5,"lower_bound":-5}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":0.9,"lower_bound":0.75},"lower_range":{"upper_bound":0.9,"lower_bound":0.75}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":-6.25,"lower_bound":-12.5}},"max_speed":{"upper_range":{"upper_bound":12.5,"lower_bound":6.25},"lower_range":{"upper_bound":-25,"lower_bound":-50}},"health":{"upper_range":{"upper_bound":25,"lower_bound":12.5},"lower_range":{"upper_bound":-17.5,"lower_bound":-35}}},
                "hardest":{"friendly_center_x_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"friendly_center_y_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_shooting_distance_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"shooting_angle_offset":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"rate_of_fire_multiplier":{"upper_range":{"upper_bound":0.75,"lower_bound":0.75},"lower_range":{"upper_bound":0.75,"lower_bound":0.75}},"throttle":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"max_speed":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}},"health":{"upper_range":{"upper_bound":0,"lower_bound":0},"lower_range":{"upper_bound":0,"lower_bound":0}}}
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
        "clouds",
        "freecam",
        "explosion",
        "flash"
    ],

    "smoke_images": [
        "smoke_1",
        "smoke_2",
        "smoke_3"
    ],

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
            "shoot",
            "explode",
            "damage",
            "engine",
            "bomb"
        ],
        "url": "./sounds",
        "file_type": ".mp3"
    },

    "missions": [
        {
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
                    "min_health": 1,
                    "max_health": 2 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 25e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "medium": {
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
                    "min_health": 1,
                    "max_health": 2 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 25e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
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
                    "min_health": 2,
                    "max_health": 4 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 25e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "attacker_plane_counts": {
                    "republic_p_47": 8,
                    "p51_mustang": 8,
                    "b24": 4
                },
                "defender_plane_counts": {
                    "me_309": 12,
                    "me_bf_109": 12
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 3,
                    "max_health": 6 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 30e3 // 30e3?
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
                    "x": 2500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 50e3, // 70e3
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        },
        {
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
                    "min_health": 1,
                    "max_health": 2 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 25e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "medium": {
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
                    "min_health": 1,
                    "max_health": 2 // 5? 10?f
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 25e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hard": {
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
                    "min_health": 2,
                    "max_health": 4 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 25e3 // 30e3?
                },
                "bomber_hp_multiplier": 5 // Based on attacker difficulty
            },
            "hardest": {
                "attacker_plane_counts": {
                    "republic_p_47": 8,
                    "p51_mustang": 8,
                    "b24": 4
                },
                "defender_plane_counts": {
                    "a6m_zero": 12,
                    "kawasaki_ki_45": 12
                },
                "buildings": { // Specifically for attacker difficulty, defender difficulty not used to determine building health
                    "count": 40, // 20?
                    "min_health": 3,
                    "max_health": 6 // 5? 10?
                },
                "respawn_times": {
                    "attackers": 70e3, // 70e3?
                    "defenders": 30e3 // 30e3?
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
                    "x": 2500,
                    "y": 9000
                }
            },
            "buildings": {
                "start_x": 50e3, // 70e3
                "min_gap": 50,
                "max_gap": 200,
                "min_height": 60,
                "max_height": 300,
                "min_width": 50,
                "max_width": 150,
            }
        }
    ],

    "cloud_generation": {
        "sky_colour": "#5bb8ff",
        "cloud_colour": "#e8ecff",
        "cloud_cluster_width": 3840,
        "cloud_cluster_height": 2160,
        "min_radius": 30,
        "max_radius": 80,
        "min_circles_per_cloud": 3,
        "max_circles_per_cloud": 7,
        "min_clouds_per_cluster": 50,
        "max_clouds_per_cluster": 70,
    },

    "hud": {
        "text_size": 20,
        "key_colour": "#ff6700",
        "value_colour": "#0066ff"
    }
}
if (typeof window === "undefined"){
    module.exports = PROGRAM_DATA;
}