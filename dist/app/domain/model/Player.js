"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
/**
 * @name 玩家信息
 * @field {string} uid  玩家ID
 * @field {string} gameId 游戏ID
 * @field {string} name  玩家昵称
 * @field {string} teamId  队伍ID
 * @field {number} customPlayerStatus  自定义玩家状态
 * @field {string} customProfile  自定义玩家信息
 * @field {Cola.MatchAttribute[]} matchAttributes  玩家匹配属性列表
 * @field {boolean} isRobot  玩家是否为机器人
 * @field {string} frontendId  前端服务器id
 * @field {Cola.NetworkState} commonNetworkState  玩家在房间的网络状态
 * @field {Cola.NetworkState} relayNetworkState  玩家在游戏中的网络状态
 */
class Player {
    constructor(params) {
        this.uid = params.uid;
        this.gameId = params.gameId;
        this.name = params.name;
        this.teamId = params.teamId;
        this.customPlayerStatus = params.customPlayerStatus;
        this.customProfile = params.customProfile;
        this.matchAttributes = params.matchAttributes;
        this.isRobot = params.isRobot;
        this.frontendId = params.frontendId;
        this.commonNetworkState = 1;
        this.relayNetworkState = 3;
    }
}
exports.Player = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9tb2RlbC9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBa0JBOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxNQUFhLE1BQU07SUFhakIsWUFBWSxNQUEwQjtRQUNwQyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUNwRCxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7Q0FDRjtBQTFCRCx3QkEwQkMifQ==