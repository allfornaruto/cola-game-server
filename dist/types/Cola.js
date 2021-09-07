"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cola = void 0;
var Cola;
(function (Cola) {
    /**
     * @name 创建房间方式
     * @field {0} COMMON_CREATE  普通创建
     * @field {1} MATCH_CREATE  匹配创建
     */
    let CreateRoomType;
    (function (CreateRoomType) {
        CreateRoomType[CreateRoomType["COMMON_CREATE"] = 0] = "COMMON_CREATE";
        CreateRoomType[CreateRoomType["MATCH_CREATE"] = 1] = "MATCH_CREATE";
    })(CreateRoomType = Cola.CreateRoomType || (Cola.CreateRoomType = {}));
    /**
     * @name 房间帧同步状态
     * @field {0} STOP 未开始帧同步
     * @field {1} START 已开始帧同步
     */
    let FrameSyncState;
    (function (FrameSyncState) {
        FrameSyncState[FrameSyncState["STOP"] = 0] = "STOP";
        FrameSyncState[FrameSyncState["START"] = 1] = "START";
    })(FrameSyncState = Cola.FrameSyncState || (Cola.FrameSyncState = {}));
    /**
     * @name 玩家网络状态
     * @field {0} COMMON_OFFLINE  房间中玩家掉线
     * @field {1} COMMON_ONLINE  房间中玩家在线
     * @field {2} RELAY_OFFLINE  帧同步中玩家掉线
     * @field {3} RELAY_ONLINE  帧同步中玩家在线
     */
    let NetworkState;
    (function (NetworkState) {
        NetworkState[NetworkState["COMMON_OFFLINE"] = 0] = "COMMON_OFFLINE";
        NetworkState[NetworkState["COMMON_ONLINE"] = 1] = "COMMON_ONLINE";
        NetworkState[NetworkState["RELAY_OFFLINE"] = 2] = "RELAY_OFFLINE";
        NetworkState[NetworkState["RELAY_ONLINE"] = 3] = "RELAY_ONLINE";
    })(NetworkState = Cola.NetworkState || (Cola.NetworkState = {}));
})(Cola = exports.Cola || (exports.Cola = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3R5cGVzL0NvbGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBaUIsSUFBSSxDQTJkcEI7QUEzZEQsV0FBaUIsSUFBSTtJQXNhbkI7Ozs7T0FJRztJQUNILElBQVksY0FHWDtJQUhELFdBQVksY0FBYztRQUN4QixxRUFBaUIsQ0FBQTtRQUNqQixtRUFBZ0IsQ0FBQTtJQUNsQixDQUFDLEVBSFcsY0FBYyxHQUFkLG1CQUFjLEtBQWQsbUJBQWMsUUFHekI7SUFDRDs7OztPQUlHO0lBQ0gsSUFBWSxjQUdYO0lBSEQsV0FBWSxjQUFjO1FBQ3hCLG1EQUFRLENBQUE7UUFDUixxREFBUyxDQUFBO0lBQ1gsQ0FBQyxFQUhXLGNBQWMsR0FBZCxtQkFBYyxLQUFkLG1CQUFjLFFBR3pCO0lBQ0Q7Ozs7OztPQU1HO0lBQ0gsSUFBWSxZQUtYO0lBTEQsV0FBWSxZQUFZO1FBQ3RCLG1FQUFrQixDQUFBO1FBQ2xCLGlFQUFpQixDQUFBO1FBQ2pCLGlFQUFpQixDQUFBO1FBQ2pCLCtEQUFnQixDQUFBO0lBQ2xCLENBQUMsRUFMVyxZQUFZLEdBQVosaUJBQVksS0FBWixpQkFBWSxRQUt2QjtBQXVCSCxDQUFDLEVBM2RnQixJQUFJLEdBQUosWUFBSSxLQUFKLFlBQUksUUEyZHBCIn0=