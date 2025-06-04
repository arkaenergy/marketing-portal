import { isRil } from "../../constants";

export const APP_VERSION = "v0.1.0";
export const PRODUCTION_ENV = false;
export const CAMERA_TYPE_3D = 'perspective';
export const CAMERA_TYPE_2D = 'orthographic';
export const ORTHO_CAMERA_Z = 500;

export const SUN_REVOLUTION_RADIUS = 200;
export const LOW_SHADOW_MAP_RESOLUTION = 2048;

export const SHADOW_VIEW_SUMMER_SOLSTICE = 'Summer';
export const SHADOW_VIEW_WINTER_SOLSTICE = 'Winter';
export const SHADOW_VIEW_MORNING_TIME = 'Morning';
export const SHADOW_VIEW_EVENING_TIME = 'Evening';

export const SCENE_UPDATED = 'scene-updated';
export const CAMERA_UPDATED = 'camera-updated';
export const INVALID_SCALE = 0;

export const PANEL_ORIENTATION_LANDSCAPE = 'Landscape';
export const PANEL_ORIENTATION_PORTRAIT = 'Portrait';
export const ROW_SPACING_MODE_AUTO = 'Auto';
export const ROW_SPACING_MODE_MANUAL = 'Manual';
export const SUBARRAY_RACK_STYLE_FIXED = 'Fixed Tilt';
export const SUBARRAY_RACK_STYLE_FLUSH = 'Flush Mount';
export const PANEL_TYPE_MONOCRYSTALLINE = 'Monocrystalline';
export const BASE_URL = PRODUCTION_ENV ? '13.234.123.80' :
    'https://betaapi.thesolarlabs.com/';
    export const THIN_BORDER_OUTLINE_POINT_SIZE = 10;
export const THIN_BORDER_OUTLINE_POINT_IMAGE_URL =
    'https://design-studio-app.s3.ap-south-1.amazonaws.com/New_Project_1.png';
export const THICK_BORDER_OUTLINE_POINT_IMAGE_URL =
    'https://design-studio-app.s3.ap-south-1.amazonaws.com/outline_point.png';
export const POINT_SIZE = 8;
export const LINE_WIDTH = 2;
export const CREATED_STATE = 'created-state';
export const DELETED_STATE = 'deleted-state';
export const CROSSHAIR = "url('data:image/x-icon;base64,AAACAAEAICACAA8AEAAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAgAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAA////AAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAAAAAAAH/wH/wAAAAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAA//x////8f////H////x////8f////H////x////8f////H////x////8f////H////x///////8ABEABAAVAAQAEQAH///////x////8f////H////x////8f////H////x////8f////H////x////8f////H////x///////8='), auto";
export const INVALID_PROPERTIES_ERROR = 'Cannot complete with invalid properties';
export const MAX_DRAWING_POINTS = 100;
export const LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR = 'Need more vertices to complete object';
export const LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR =
    'Less vertices than needed for drawing object';
export const COMPLEX_GEOMETRY_ERROR = 'Complex geometries not supported';
export const OUT_OF_GROUND_ERROR = 'Model is outside ground';
export const VERTEX_EQUIVALENT_ERROR =
    'New vertex is same as another placed vertex';
export const POLYGON_WITH_NO_AREA_ERROR = 'Polygon has no area';
export const LAST_EDGE_INTERSECTION_ERROR = 'Intersecting models are not supported';
export const VERTEX_OVER_EDGE_ERROR = 'Vertex is over an edge';
export const OUT_OF_ASSOCIATED_MODEL_ERROR = 'Table outside the roof. Table deleted';


export const MUMTY_OBSTRUCTION = "mumty";
export const ACUNIT_OBSTRUCTION = "acunit";
export const CHIMNEY_OBSTRUCTION = "chimney";
export const WATERTANK_OBSTRUCTION = "watertank";
export const HEIGHT_PER_FLOOR = 3.5;
export const VISUAL_STATES = {
    SELECT: 'selected',
    HOVER: 'hover',
    PARENT: 'parent',
    ERROR: 'error',
    DRAWING_ERROR: 'drawing-error',
    APP_HIGHLIGHT: 'app-highlight',
    APP_DISABLE: 'app-disable',
    DELETE_MODE: 'delete-mode',
    DEFAULT: 'default',
    DEFAULT_STATES: {
        DEFAULT: 'default-default',
        SOLAR_ACCESS: 'solar-access',
        SUN_SIMULATION: 'sun-simulation',
        HEATMAP: 'heatmap',
    },
    STRINGING: {
        ENABLED: 'enabled',
        DISABLED: 'disabled',
        ALREADY_STRINGED: 'already-stringed',
        INCORRECT_STRING_SIZE: 'incorrect-string-size',
        CORRECT_STRING_SIZE: 'correct-string-size',
    },
    MIRROR_MODE: 'mirror-mode',
    EDGE_HIGHLIGHT: 'edge-highlight',
};

export const MATERIAL_STATES = {
    SOLID: 'solid',
    TRANSLUCENT: 'translucent',
};

export const COLOR_MAPPINGS = {
    GROUND: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xFFFFFF,
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xd3fff7,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
            },
        },
    },
    POLYGON: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xbffff3,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0x656970,
                PARAPET_COLOR: 0x29374a,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x656970,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
        },
    },
    SMARTROOF: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xbffff3,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0x656970,
                PARAPET_COLOR: 0x29374a,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x656970,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
        },
    },
    CYLINDER: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.HOVER]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xbffff3,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0x656970,
                PARAPET_COLOR: 0x29374a,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x656970,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
        },
    },
    WALKWAY: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    INVERTER: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x0099ff,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    ACDB: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    SAFETY_LINE: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    TREE: {
        // EDGE_COLOR required for outlinePoint Creation.
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.SELECT]: {
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.ERROR]: {
                TRUNK_MESH_COLOR: 0xf44336,
                TRUNK_EDGE_COLOR: 0xba000d,
                CROWN_MESH_COLOR: 0xf44336,
                CROWN_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.SELECT]: {
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.ERROR]: {
                TRUNK_MESH_COLOR: 0xf44336,
                TRUNK_EDGE_COLOR: 0xba000d,
                CROWN_MESH_COLOR: 0xf44336,
                CROWN_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                TRUNK_EDGE_COLOR: 0xffa000,
                CROWN_EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x423629,
                TRUNK_EDGE_COLOR: 0x423629,
                CROWN_MESH_COLOR: 0x2e7048,
                CROWN_EDGE_COLOR: 0x2e7048,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                TRUNK_MESH_COLOR: 0x423629,
                TRUNK_EDGE_COLOR: 0xFFFFFF,
                CROWN_MESH_COLOR: 0x2e7048,
                CROWN_EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    HANDRAIL: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    PROPERTY: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    SUBARRAY: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                PANEL_EDGE_COLOR: 0xf7f7f7,
                PANEL_MESH_COLOR: 0x0062A3,
                PANEL_MESH_COLOR_MONO: 0x262626,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
                PANEL_EDGE_COLOR: 0xf7f7f7,
                PANEL_MESH_COLOR: 0x0062A3,
                PANEL_MESH_COLOR_MONO: 0x262626,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x2e7048,
                EDGE_COLOR: 0x2e7048,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x2e7048,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.DISABLED]: {
                MESH_COLOR: 0x4A6A79,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.ENABLED]: {
                MESH_COLOR: 0x2e7048,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.ALREADY_STRINGED]: {
                MESH_COLOR: 0x64B5F6,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE]: {
                MESH_COLOR: 0xF44336,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.CORRECT_STRING_SIZE]: {
                MESH_COLOR: 0x74BC22,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    ROW: {

    },
    TABLE: {

    },
    PANEL: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x0062A3,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x007ACC,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x64b5f6,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DELETE_MODE]: {
                MESH_COLOR: 0xf44336,
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x0062A3,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x0062A3,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x007ACC,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x64b5f6,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DELETE_MODE]: {
                MESH_COLOR: 0xf44336,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x395263,
                EDGE_COLOR: 0xbdbdbd,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x395263,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.ALREADY_STRINGED]: {
                MESH_COLOR: 0x64B5F6,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE]: {
                MESH_COLOR: 0xF44336,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.CORRECT_STRING_SIZE]: {
                MESH_COLOR: 0x74BC22,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    DIMENSION: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.SELECT]: {
                EDGE_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
        },
    },
    LASSO_SELECTION: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                FIRST_POINT_DRAWING_COLOR: 0x00ff00,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
                FIRST_POINT_DRAWING_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
                FIRST_POINT_DRAWING_COLOR: 0xffa000,
            },
        },
    },
    IMAGE_MODEL: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xba000d,
            },
        },
    },
    TEXT_BOX: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00ff00,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00ff00,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xba000d,
            },
        },
    },
};

export const SUBARRAY_DEFAULTS = isRil ? {
    azimuth: 180,
    structureType: 'Default Fixed Tilt',
    moduleProperties: {
        moduleId: 32344,
        moduleLength: 2.175,
        moduleMake: 'Rec solar',
        moduleSize: 0.64,
        moduleWidth: 1.305,
    },
    panelProperties: {
        characteristics: {
            cell_number: 120,
            cell_type: 'Monocrystalline',
            length: 2.175,
            manufacturer: 'Rec solar',
            model: 'REC Alpha Pro MSeries(640-640)W',
            p_mp_ref: 640,
            series: 'REC Alpha Pro MSeries(620-640)W',
            v_max: 1500,
            width: 1.305,
        },
        id: 32344,
        image: null,
        image_link: null,
        is_selected: true,
        model: 'REC Alpha Pro MSeries(620-640)W REC Alpha Pro MSeries(640-640)W',
    },
    moduleSpacingUp: 0.025,
    moduleSpacingWide: 0.025,
    mountHeight: 1,
    mountType: 'Fixed Tilt',
    panelOrientation: 'Portrait',
    tableSizeUp: 1,
    tableSizeWide: 1,
    tableSpacing: 0.025,
    tilt: 20,
    rowSpacingMode: ROW_SPACING_MODE_AUTO,
    rowSpacing: 0.025,
} : {
    azimuth: 180,
    structureType: 'Default Fixed Tilt',
    moduleProperties: {
        moduleId: 153,
        moduleLength: 1.632,
        moduleMake: 'ANJI Technology Co., Ltd.',
        moduleSize: 0.26,
        moduleWidth: 0.995,
    },
    panelProperties: {
        characteristics: {
            cell_number: 60,
            cell_type: 'Polycrystalline',
            length: 1.632,
            manufacturer: 'ANJI Technology Co., Ltd.',
            model: '260',
            p_mp_ref: 260,
            series: 'AJP-M660 260-275',
            v_max: 1000,
            width: 0.995,
        },
        id: 153,
        image: null,
        image_link: null,
        is_selected: true,
        model: 'AJP-M660 260-275 260',
    },
    moduleSpacingUp: 0.025,
    moduleSpacingWide: 0.025,
    mountHeight: 1,
    mountType: 'Fixed Tilt',
    panelOrientation: 'Portrait',
    tableSizeUp: 1,
    tableSizeWide: 1,
    tableSpacing: 0.025,
    tilt: 20,
    rowSpacingMode: ROW_SPACING_MODE_AUTO,
    rowSpacing: 0.025,
};