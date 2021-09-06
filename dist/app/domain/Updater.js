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
            if (room.stepUpdateTime >= constants_1.default.STEP_INTERVAL) {
                room.stepUpdateTime -= constants_1.default.STEP_INTERVAL;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9kb21haW4vVXBkYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpREFBMEM7QUFFMUMsMkNBQXdDO0FBSXhDLE1BQU0sT0FBTztJQUFiO1FBQ0UsT0FBTztRQUNDLFVBQUssR0FBc0IsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFDM0QsdUJBQXVCO1FBQ2YsZUFBVSxHQUFXLENBQUMsQ0FBQztJQWlHakMsQ0FBQztJQS9GQzs7O09BR0c7SUFDSSxRQUFRLENBQUMsR0FBVztRQUN6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTyxDQUFDLEdBQVcsRUFBRSxJQUFVO1FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksVUFBVSxDQUFDLEdBQVc7UUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxVQUFVLENBQUMsR0FBVyxFQUFFLE9BQWdCO1FBQzdDLElBQUksSUFBSSxHQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxrQkFBa0IsQ0FBQyxHQUFXO1FBQ25DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDO0lBQzdDLENBQUM7SUFFRDs7T0FFRztJQUNJLElBQUk7UUFDVCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2YsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzdCLGlCQUFpQjtZQUNqQixJQUFJLEVBQUUsR0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFTyxNQUFNLENBQUMsRUFBVTtRQUN2QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7WUFBRSxPQUFPO1FBQ2pDLFdBQVc7UUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO1lBQ2hDLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxXQUFJLENBQUMsY0FBYyxDQUFDLElBQUk7Z0JBQUUsT0FBTztZQUM3RCxVQUFVO1lBQ1YsSUFBSSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7WUFDMUIsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLG1CQUFTLENBQUMsYUFBYSxFQUFFO2dCQUNsRCxJQUFJLENBQUMsY0FBYyxJQUFJLG1CQUFTLENBQUMsYUFBYSxDQUFDO2dCQUMvQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSyxVQUFVLENBQUMsSUFBVTtRQUMzQixJQUFJLFFBQVEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hDLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVuQixNQUFNLElBQUksR0FBRztZQUNYLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7WUFDckIsS0FBSyxFQUFFLFFBQVE7WUFDZixRQUFRLEVBQUUsS0FBSztTQUNoQixDQUFDO1FBRUYsS0FBSztRQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDO0NBQ0Y7QUFFRCxJQUFJLGNBQWMsQ0FBQztBQUNaLE1BQU0saUJBQWlCLEdBQUcsR0FBWSxFQUFFO0lBQzdDLElBQUksQ0FBQyxjQUFjLEVBQUU7UUFDbkIsY0FBYyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7S0FDaEM7SUFDRCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDLENBQUM7QUFMVyxRQUFBLGlCQUFpQixxQkFLNUIifQ==