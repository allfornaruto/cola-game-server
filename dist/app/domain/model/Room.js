"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const uuid_1 = require("uuid");
const constants_1 = require("../../util/constants");
const Cola_1 = require("../../../types/Cola");
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
        this.frameSyncState = Cola_1.Cola.FrameSyncState.STOP;
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
                matchAttributes: player.matchAttributes,
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
    /**
     * 开始帧同步
     */
    startFrameSync() {
        this.frameSyncState = 1;
    }
    /**
     * 停止帧同步
     */
    stopFrameSync() {
        this.frameSyncState = 0;
    }
}
exports.Room = Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vbW9kZWwvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSwrQkFBa0M7QUFDbEMsb0RBQTZDO0FBQzdDLDhDQUEyQztBQWtDM0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBYSxJQUFJO0lBdUJmLFlBQW1CLE1BQXFCO1FBdEJqQyxRQUFHLEdBQVcsU0FBSSxFQUFFLENBQUM7UUFXckIsbUJBQWMsR0FBd0IsV0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7UUFDL0QsY0FBUyxHQUFXLG1CQUFTLENBQUMsYUFBYSxDQUFDO1FBQzVDLGVBQVUsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVwRCxpQkFBWSxHQUFZLEtBQUssQ0FBQztRQUM5QixZQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFDM0IsYUFBUSxHQUFjLEVBQUUsQ0FBQztRQUN6QixvQkFBZSxHQUFnQixFQUFFLENBQUM7UUFHdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxD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