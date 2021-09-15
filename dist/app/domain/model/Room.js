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
        this.rid = (0, uuid_1.v4)();
        this.frameSyncState = Cola_1.Cola.FrameSyncState.STOP;
        this.frameRate = constants_1.Constants.stepInterval;
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
     * 移除房间内的一位玩家
     * @param uid string
     * @returns 返回被移除的Player
     */
    removePlayer(uid) {
        const index = this.playerList.findIndex(player => player.uid === uid);
        const players = this.playerList.splice(index, 1);
        const player = players[0] ? players[0] : null;
        return player;
    }
    /**
     * 修改房间信息
     * @param {ChangeRoomInfoParams} params 修改房间信息参数
     */
    changeRoomInfo(params) {
        console.log(`Room.ts changeRoomInfo() params: ${JSON.stringify(params)}`);
        if (params.name)
            this.name = params.name;
        if (params.owner)
            this.owner = params.owner;
        if (typeof params.isPrivate === "boolean") {
            this.isPrivate = params.isPrivate;
            console.log(`Room.ts changeRoomInfo() this.isPrivate: ${this.isPrivate}`);
        }
        if (params.customProperties)
            this.customProperties = params.customProperties;
        if (typeof params.isForbidJoin === "boolean") {
            this.isForbidJoin = params.isForbidJoin;
            console.log(`Room.ts changeRoomInfo() this.isForbidJoin: ${this.isForbidJoin}`);
        }
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
        this.frameSyncState = Cola_1.Cola.FrameSyncState.START;
    }
    /**
     * 停止帧同步
     */
    stopFrameSync() {
        this.frameSyncState = Cola_1.Cola.FrameSyncState.STOP;
    }
}
exports.Room = Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vbW9kZWwvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSwrQkFBa0M7QUFDbEMsb0RBQWlEO0FBQ2pELDhDQUEyQztBQWtDM0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBYSxJQUFJO0lBdUJmLFlBQW1CLE1BQXFCO1FBdEJqQyxRQUFHLEdBQVcsSUFBQSxTQUFJLEdBQUUsQ0FBQztRQVdyQixtQkFBYyxHQUF3QixXQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztRQUMvRCxjQUFTLEdBQVcscUJBQVMsQ0FBQyxZQUFZLENBQUM7UUFDM0MsZUFBVSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRXBELGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBQzlCLFlBQU8sR0FBWSxJQUFJLENBQUM7UUFDeEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixtQkFBYyxHQUFXLENBQUMsQ0FBQztRQUMzQixhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLG9CQUFlLEdBQWdCLEVBQUUsQ0FBQztRQUd2QyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxL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