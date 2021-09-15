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
            console.log(`Updater.ts gameId: ${gameId}, pageNo: ${pageNo}, pageSize: ${pageSize}, roomType: ${roomType}, isDesc: ${isDesc}, filterPrivate: ${filterPrivate}`);
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
                console.log(`Updater.ts getRoomList() room.name: ${room.name}`);
                // 返回房间列表中不包含私有房间
                if (filterPrivate) {
                    if (room.gameId === gameId && room.isPrivate === false) {
                        if (roomType) {
                            if (room.type === roomType) {
                                console.log(`Updater.ts 1 push room.name: ${room.name}`);
                                tmp.push(room);
                            }
                        }
                        else {
                            console.log(`Updater.ts 2 push room.name: ${room.name}`);
                            tmp.push(room);
                        }
                    }
                }
                // 返回房间列表中包含私有房间
                else {
                    if (room.gameId === gameId) {
                        if (roomType) {
                            if (room.type === roomType) {
                                console.log(`Updater.ts 3 push room.name: ${room.name}`);
                                tmp.push(room);
                            }
                        }
                        else {
                            console.log(`Updater.ts 4 push room.name: ${room.name}`);
                            tmp.push(room);
                        }
                    }
                }
            }
            // 按房间创建时间倒序
            if (isDesc) {
                tmp = tmp.sort((a, b) => b.createTime - a.createTime);
            }
            const result = tmp.splice((pageNo - 1) * pageSize, pageSize);
            console.log(`Updater.ts result count: ${result.length}`);
            return result;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9kb21haW4vVXBkYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpREFBOEM7QUFFOUMsMkNBQXdDO0FBSXhDLE1BQU0sT0FBTztJQUFiO1FBQ0UsT0FBTztRQUNDLFVBQUssR0FBc0IsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFDM0QsdUJBQXVCO1FBQ2YsZUFBVSxHQUFXLENBQUMsQ0FBQztJQThLakMsQ0FBQztJQTVLQzs7Ozs7Ozs7O09BU0c7SUFDSSxXQUFXLENBQUMsTUFPbEI7UUFDQyxJQUFJO1lBQ0YsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBRTNFLE9BQU8sQ0FBQyxHQUFHLENBQ1Qsc0JBQXNCLE1BQU0sYUFBYSxNQUFNLGVBQWUsUUFBUSxlQUFlLFFBQVEsYUFBYSxNQUFNLG9CQUFvQixhQUFhLEVBQUUsQ0FDcEosQ0FBQztZQUVGLE9BQU87WUFDUCxJQUFJLE1BQU0sR0FBRyxDQUFDO2dCQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDM0IsYUFBYTtZQUNiLElBQUksUUFBUSxHQUFHLENBQUM7Z0JBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNoQyxJQUFJLFFBQVEsR0FBRyxFQUFFO2dCQUFFLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFakMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDO1lBQ3JCLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEUsaUJBQWlCO2dCQUNqQixJQUFJLGFBQWEsRUFBRTtvQkFDakIsSUFBSSxJQUFJLENB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