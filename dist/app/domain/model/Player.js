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
        this.commonNetworkState = 1;
        this.relayNetworkState = 3;
    }
}
exports.Player = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9tb2RlbC9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZ0JBOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQWEsTUFBTTtJQVlqQixZQUFZLE1BQTBCO1FBQ3BDLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO1FBQ3BELElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUMxQyxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDOUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUF4QkQsd0JBd0JDIn0=