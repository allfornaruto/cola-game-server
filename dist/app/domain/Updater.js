"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdateInstance = void 0;
const constants_1 = require("../util/constants");
const Cola_1 = require("../../types/Cola");
class Updater {
    constructor() {
        // 分割房间
        this.rooms = new Map();
        // 上次更新时间（用来控制update更新）
        this.lateUpdate = 0;
    }
    /**
     * 获取房间列表
     * @param {string} params.gameId 游戏Id
     * @param {number} params.pageNo 页号, 默认为1
     * @param {number} params.pageSize 每页数量, 默认值为10，最大值为20
     * @param {string} params.roomType 房间类型, 可选参数
     * @param {boolean} params.isDesc 是否按照房间创建时间倒序, 可选参数
     * @param {boolean} filterPrivate 是否需要过滤私有房间（可选）true: 返回房间列表中不包含私有房间，false: 返回房间列表中包含私有房间
     * @returns {Room[]} 房间列表
     */
    getRoomList(params) {
        try {
            let { gameId, pageNo, pageSize, roomType, isDesc, filterPrivate } = params;
            // 默认为1
            if (pageNo < 1)
                pageNo = 1;
            // 默认为10，最大20
            if (pageSize < 1)
                pageSize = 10;
            if (pageSize > 20)
                pageSize = 20;
            let tmp = [];
            for (const [roomId, room] of this.rooms) {
                // 返回房间列表中不包含私有房间
                if (filterPrivate) {
                    if (room.gameId === gameId && room.isPrivate === false) {
                        if (roomType) {
                            if (room.type === roomType)
                                tmp.push(room);
                        }
                        else {
                            tmp.push(room);
                        }
                    }
                }
                // 返回房间列表中包含私有房间
                else {
                    if (room.gameId === gameId) {
                        if (roomType) {
                            if (room.type === roomType)
                                tmp.push(room);
                        }
                        else {
                            tmp.push(room);
                        }
                    }
                }
            }
            // 按房间创建时间倒序
            if (isDesc) {
                tmp = tmp.sort((a, b) => b.createTime - a.createTime);
            }
            return tmp.splice((pageNo - 1) * pageSize, pageSize);
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 通过rid找到目标房间
     * @param rid 房间ID
     */
    findRoom(rid) {
        return this.rooms.get(rid);
    }
    /**
     * 添加房间
     * @param {string} rid 房间ID
     * @param {Room} room Room实例
     */
    addRoom(rid, room) {
        this.rooms.set(rid, room);
    }
    /**
     * 移除房间
     * @param {string} rid 房间ID
     */
    removeRoom(rid) {
        const delRes = this.rooms.delete(rid);
        if (!delRes)
            console.warn(`移除房间失败，也许该房间在别的服务器上?`);
    }
    /**
     * 添加指令
     * @param {RoomId} rid
     * @param command
     */
    addCommand(rid, command) {
        let room = this.rooms.get(rid);
        room.commands.push(command);
        console.log(`添加指令: rid=${rid} ${JSON.stringify(command)}`);
    }
    /**
     * 获取历史指令
     * @param {RoomId} rid
     * @returns {Command[][]}
     */
    getHistoryCommands(rid) {
        return this.rooms.get(rid).historyCommands;
    }
    /**
     * 初始化
     */
    init() {
        this.lateUpdate = Date.now();
        setInterval(() => {
            let now = Date.now();
            // 两次update之间的时间差
            let dt = now - this.lateUpdate;
            this.lateUpdate = now;
            this.update(dt);
        }, 0);
    }
    update(dt) {
        if (this.rooms.size <= 0)
            return;
        // 遍历房间来更新帧
        this.rooms.forEach((room) => {
            if (room.frameSyncState === Cola_1.Cola.FrameSyncState.STOP)
                return;
            // 大于一帧的间隔
            room.stepUpdateTime += dt;
            if (room.stepUpdateTime >= constants_1.Constants.stepInterval) {
                room.stepUpdateTime -= constants_1.Constants.stepInterval;
                room.stepTime++;
                this.stepUpdate(room);
            }
        });
    }
    /**
     * 更新一帧
     * @param {Room} room
     */
    stepUpdate(room) {
        let commands = room.commands;
        // 记录到历史指令（用于重连）
        room.historyCommands.push(commands);
        room.commands = [];
        const data = {
            id: room.stepTime - 1,
            items: commands,
            isReplay: false,
        };
        // 发帧
        room.channel.pushMessage("onRecvFrame", data);
    }
}
let updateInstance;
const getUpdateInstance = () => {
    if (!updateInstance) {
        updateInstance = new Updater();
    }
    return updateInstance;
};
exports.getUpdateInstance = getUpdateInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9kb21haW4vVXBkYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpREFBOEM7QUFFOUMsMkNBQXdDO0FBSXhDLE1BQU0sT0FBTztJQUFiO1FBQ0UsT0FBTztRQUNDLFVBQUssR0FBc0IsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFDM0QsdUJBQXVCO1FBQ2YsZUFBVSxHQUFXLENBQUMsQ0FBQztJQThKakMsQ0FBQztJQTVKQzs7Ozs7Ozs7O09BU0c7SUFDSSxXQUFXLENBQUMsTUFPbEI7UUFDQyxJQUFJO1lBQ0YsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQzNFLE9BQU87WUFDUCxJQUFJLE1BQU0sR0FBRyxDQUFDO2dCQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDM0IsYUFBYTtZQUNiLElBQUksUUFBUSxHQUFHLENBQUM7Z0JBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNoQyxJQUFJLFFBQVEsR0FBRyxFQUFFO2dCQUFFLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFakMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDO1lBQ3JCLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUN2QyxpQkFBaUI7Z0JBQ2pCLElBQUksYUFBYSxFQUFFO29CQUNqQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO3dCQUN0RCxJQUFJLFFBQVEsRUFBRTs0QkFDWixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtnQ0FBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUM1Qzs2QkFBTTs0QkFD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