"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const uuid_1 = require("uuid");
const constants_1 = require("../../util/constants");
;
/**
 * @name 房间
 * @field {string} id  房间ID
 * @field {string} gameId 游戏ID
 * @field {string} name  房间名称
 * @field {string} type  房间类型
 * @field {Cola.CreateRoomType} createType  创建房间方式
 * @field {number} maxPlayers  房间最大玩家数量
 * @field {string} owner  房主ID
 * @field {boolean} isPrivate  是否私有
 * @field {string} customProperties  房间自定义属性
 * @field {Player[]} playerList  玩家列表
 * @field {TeamInfo[]} teamList  团队属性
 * @field {Cola.FrameSyncState} frameSyncState  房间帧同步状态
 * @field {number} frameRate  帧率
 * @field {number} createTime  房间创建时的时间戳（单位：秒）
 * @field {number} startGameTime  开始帧同步时的时间戳（单位：秒）
 * @field {boolean} isForbidJoin  是否禁止加入房间
 * @field {Channel} channel  频道
 * @field {number} stepTime  第几帧
 * @field {number} stepUpdateTime  这帧执行了多久
 * @field {Command[]} commands  当前命令
 * @field {Command[][]} historyCommands  历史命令，可以考虑写入到redis中
 */
class Room {
    constructor(params) {
        this.rid = uuid_1.v4();
        this.frameSyncState = 0;
        this.frameRate = constants_1.default.STEP_INTERVAL;
        this.createTime = Math.floor(+new Date() / 1000);
        this.isForbidJoin = false;
        this.channel = null;
        this.stepTime = 0;
        this.stepUpdateTime = 0;
        this.commands = [];
        this.historyCommands = [];
        this.rid = params.rid;
        this.gameId = params.gameId;
        this.name = params.name;
        this.type = params.type;
        this.createType = params.createType;
        this.maxPlayers = params.maxPlayers;
        this.owner = params.owner;
        this.isPrivate = params.isPrivate;
        this.customProperties = params.customProperties;
        this.playerList = params.playerList;
        this.teamList = params.teamList;
        this.channel = params.channel;
    }
    /**
     * 获取符合Cola.Room数据结构的对象
     */
    getRoomInfo() {
        const playerFormat = function (player) {
            return {
                uid: player.uid,
                gameId: player.gameId,
                name: player.name,
                teamId: player.teamId,
                customPlayerStatus: player.customPlayerStatus,
                customProfile: player.customProfile,
                matchAttributes: player.matchAttributes
            };
        };
        return {
            rid: this.rid,
            gameId: this.gameId,
            name: this.name,
            type: this.type,
            createType: this.createType,
            maxPlayers: this.maxPlayers,
            owner: this.owner,
            isPrivate: this.isPrivate,
            customProperties: this.customProperties,
            playerList: this.playerList.map(playerFormat),
            teamList: this.teamList,
            frameSyncState: this.frameSyncState,
            frameRate: this.frameRate,
            createTime: this.createTime,
            startGameTime: this.startGameTime,
            isForbidJoin: this.isForbidJoin,
        };
    }
    /**
     * 根据玩家uid返回玩家信息
     * @param uid
     */
    findPlayer(uid) {
        return this.playerList.filter(player => player.uid === uid)[0];
    }
    /**
     * 向房间内添加一位玩家
     * @param {Player} player Player实例
     */
    addPlayer(player) {
        this.playerList.push(player);
    }
    /**
     * 修改房间信息
     * @param {ChangeRoomInfoParams} params 修改房间信息参数
     */
    changeRoomInfo(params) {
        if (params.name)
            this.name = params.name;
        if (params.owner)
            this.owner = params.owner;
        if (params.isPrivate)
            this.isPrivate = params.isPrivate;
        if (params.customProperties)
            this.customProperties = params.customProperties;
        if (params.isForbidJoin)
            this.isForbidJoin = params.isForbidJoin;
        return this.getRoomInfo();
    }
    /**
     * 修改玩家状态
     * @param {string} uid
     * @param {number} customPlayerStatus 自定义玩家状态
     */
    changePlayerInfo(uid, customPlayerStatus) {
        const targetPlayer = this.findPlayer(uid);
        targetPlayer.changeCustomPlayerStatus(customPlayerStatus);
    }
}
exports.Room = Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vbW9kZWwvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSwrQkFBa0M7QUFDbEMsb0RBQTZDO0FBdUI1QyxDQUFDO0FBY0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBYSxJQUFJO0lBdUJiLFlBQW1CLE1BQXFCO1FBdEJqQyxRQUFHLEdBQVcsU0FBSSxFQUFFLENBQUM7UUFXckIsbUJBQWMsR0FBd0IsQ0FBQyxDQUFDO1FBQ3hDLGNBQVMsR0FBVyxtQkFBUyxDQUFDLGFBQWEsQ0FBQztRQUM1QyxlQUFVLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFckQsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFDOUIsWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBQzNCLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFDekIsb0JBQWUsR0FBZ0IsRUFBRSxDQUFDO1FBR3ZDLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsU0FB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