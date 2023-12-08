var fileData = {
    "plane_data": {
        "spitfire": {
//            "radius": 48,
            "radius": 64,
            "max_speed": 594,
            "health": 12*5,
            "country": "Britain"
        },
        "a6m_zero": {
//            "radius": 47,
            "radius": 64,
            "max_speed": 565,
            "health": 13*5,
            "country": "Japan"
        },
        "republic_p_47": {
//            "radius": 46,
            "radius": 64,
            "max_speed": 686,
            "health": 12*5,
            "country": "USA"
        },
        "me_bf_109": {
//            "radius": 37,
            "radius": 64,
            "max_speed": 634,
            "health": 10*5,
            "country": "Germany"
        },
        "kawasaki_ki_45": {
            "radius": 64,
            "max_speed": 540,
            "health": 17*5,
            "country": "Japan"
        },
        "p51_mustang": {
            "radius": 64,
            "max_speed": 710,
            "health": 10*5,
            "country": "USA"
        },
        "hawker_sea_fury": {
            "radius": 64,
            "max_speed": 740,
            "health": 9*5,
            "country": "Britain"
        },
        "me_309": {
            "radius": 64,
            "max_speed": 733,
            "health": 9*5,
            "country": "Germany"
        }
    },

    "bullet_data": {
        "speed": 800,
        "picture": "bullet",
        "radius": 2
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
    "constants": {
        "SHOOT_DISTANCE_CONSTANT": 5,
        "CLOSE_TO_GROUND_CONSTANT": 3,
        "CLOSE_CONSTANT": 3,
        "ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT": 20,
        "TURN_TO_ENEMY_CONSTANT": 0.75, // Maybe 0.75 is good?
        "ENEMY_TAKEN_DISTANCE_MULTIPLIER": 5,
        "EVASIVE_TIME_TO_CATCH": 20,
        "EVASIVE_SPEED_DIFF": 4,
        "MIN_ANGLE_TO_ADJUST": 3,
        "MIN_VELOCITY_ASSUMPTION": 0.01,
        "MAX_THROTTLE": 100,
        "FALL_SPEED": 200,
        "SLOW_DOWN_AMOUNT": 0.1,
        "CANVAS_WIDTH": 1920,
        "CANVAS_HEIGHT": 927,
        "FRAME_RATE": 60,
        "TICK_RATE": 100,
        "MS_BETWEEN_TICKS": 10,
        "GRAVITY": 9.81
    },

    "ai": {
        "max_ticks_on_course": 6000,
        "tick_cd": 500,
        "bias_ranges": {
            "distance_to_enemy": {
                "upper_bound": 50,
                "lower_bound": -50
            },
            "angle_to_enemy": {
                "upper_bound": 2,
                "lower_bound": -2
            },
            "angle_from_ground": {
                "upper_bound": 4,
                "lower_bound": -4
            },
            "enemy_far_away_distance": {
                "upper_bound": 25,
                "lower_bound": -25
            },
            "enemy_behind_angle": {
                "upper_bound": 5,
                "lower_bound": -5
            },
            "enemy_close_distance": {
                "upper_bound": 50,
                "lower_bound": -50
            },
            "max_ticks_on_course": {
                "upper_bound": 200,
                "lower_bound": -100
            },
            "ticks_cooldown": {
                "upper_bound": 300,
                "lower_bound": -100
            },
            "turn_direction": {
                "upper_bound": 5,
                "lower_bound": -5
            },
            "close_to_ground": {
                "upper_bound": 200,
                "lower_bound": -200
            },
            "flip_direction_lb": {
                "upper_bound": 2,
                "lower_bound": -3
            },
            "flip_direction_ub": {
                "upper_bound": 3,
                "lower_bound": -2
            },
            "min_angle_to_adjust": {
                "upper_bound": 5,
                "lower_bound": 0
            },
            "angle_allowance_at_range": {
                "upper_bound": 3,
                "lower_bound": -4
            },
            "enemy_disregard_distance_time_constant": {
                "upper_bound": 0.05,
                "lower_bound": -0.15
            },
            "enemy_taken_distance_multiplier": {
                "upper_bound": 5,
                "lower_bound": 0.95
            },
            "max_shooting_distance": {
                "upper_bound": 200,
                "lower_bound": -200
            },
            "throttle": {
                "upper_bound": 0,
                "lower_bound": -5
            },
            "max_speed": {
                "upper_bound": 20,
                "lower_bound": -30
            },
            "health": {
                "upper_bound": 3,
                "lower_bound": -3
            },
            "rotation_time": {
                "upper_bound": 18,
                "lower_bound": 12
            }
        }
    },

    "test_bots":{
        "ally_spawn_x": 50000,
        "ally_spawn_y": 50000,
        "axis_spawn_x": 70000,
        "axis_spawn_y": 70000,
        "spawn_offset": 5000,
        "active_bots": [
            {
                "plane": "a6m_zero",
                "count": 10
            },
            {
                "plane": "hawker_sea_fury",
                "count": 0
            },
            {
                "plane": "kawasaki_ki_45",
                "count": 10
            },
            {
                "plane": "me_309",
                "count": 0
            },
            {
                "plane": "me_bf_109",
                "count": 0
            },
            {
                "plane": "p51_mustang",
                "count": 10
            },
            {
                "plane": "republic_p_47",
                "count": 10
            },
            {
                "plane": "spitfire",
                "count": 0
            },
            
        ] 
    },
    "country_to_alliance": {
        "Britain": "Allies",
        "USA": "Allies",
        "Japan": "Axis",
        "Germany": "Axis"
    }
}