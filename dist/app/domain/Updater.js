"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../util/constants");
const Cola_1 = require("../../types/Cola");
let Updater = /** @class */ (() => {
    class Updater {
        /**
         * 通过rid找到目标房间
         * @param rid 房间ID
         */
        static findRoom(rid) {
            return this.rooms.get(rid);
        }
        /**
         * 添加房间
         * @param {string} rid 房间ID
         * @param {Room} room Room实例
         */
        static addRoom(rid, room) {
            this.rooms.set(rid, room);
        }
        /**
         * 移除房间
         * @param {string} rid 房间ID
         */
        static removeRoom(rid) {
            this.rooms.delete(rid);
        }
        /**
         * 添加指令
         * @param {RoomId} rid
         * @param command
         */
        static addCommand(rid, command) {
            let room = this.rooms.get(rid);
            room.commands.push(command);
            console.log(`添加指令: rid=${rid} ${JSON.stringify(command)}`);
        }
        /**
         * 获取历史指令
         * @param {RoomId} rid
         * @returns {Command[][]}
         */
        static getHistoryCommands(rid) {
            return this.rooms.get(rid).historyCommands;
        }
        /**
         * 初始化
         */
        static init() {
            this.lateUpdate = Date.now();
            setInterval(() => {
                let now = Date.now();
                // 两次update之间的时间差
                let dt = now - this.lateUpdate;
                this.lateUpdate = now;
                this.update(dt);
            }, 0);
        }
        static update(dt) {
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
        static stepUpdate(room) {
            let commands = room.commands;
            // 记录到历史指令（用于重连）
            room.historyCommands.push(commands);
            room.commands = [];
            const data = {
                id: room.stepTime - 1,
                items: commands,
                isReplay: false,
            };
            console.log(`发帧: ${JSON.stringify(data)}`);
            // 发帧
            room.channel.pushMessage("onRecvFrame", data);
        }
    }
    // 分割房间
    Updater.rooms = new Map();
    // 上次更新时间（用来控制update更新）
    Updater.lateUpdate = 0;
    return Updater;
})();
exports.default = Updater;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9kb21haW4vVXBkYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUEwQztBQUUxQywyQ0FBd0M7QUFJeEM7SUFBQSxNQUFxQixPQUFPO1FBTTFCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBVztZQUNoQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFXLEVBQUUsSUFBVTtZQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVztZQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVyxFQUFFLE9BQWdCO1lBQ3BELElBQUksSUFBSSxHQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBVztZQUMxQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUM3QyxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsSUFBSTtZQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM3QixXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNmLElBQUksR0FBRyxHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDN0IsaUJBQWlCO2dCQUNqQixJQUFJLEVBQUUsR0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ1IsQ0FBQztRQUVPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBVTtZQUM5QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7Z0JBQUUsT0FBTztZQUNqQyxXQUFXO1lBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFVLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFdBQUksQ0FBQyxjQUFjLENBQUMsSUFBSTtvQkFBRSxPQUFPO2dCQUM3RCxVQUFVO2dCQUNWLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO2dCQUMxQixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksbUJBQVMsQ0FBQyxhQUFhLEVBQUU7b0JBQ2xELElBQUksQ0FBQyxjQUFjLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUM7b0JBQy9DLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdkI7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRDs7O1dBR0c7UUFDSyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVU7WUFDbEMsSUFBSSxRQUFRLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN4QyxnQkFBZ0I7WUFDaEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFbkIsTUFBTSxJQUFJLEdBQUc7Z0JBQ1gsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztnQkFDckIsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsUUFBUSxFQUFFLEtBQUs7YUFDaEIsQ0FBQztZQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUUzQyxLQUFLO1lBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7O0lBcEdELE9BQU87SUFDUSxhQUFLLEdBQXNCLElBQUksR0FBRyxFQUFnQixDQUFDO0lBQ2xFLHVCQUF1QjtJQUNSLGtCQUFVLEdBQVcsQ0FBQyxDQUFDO0lBa0d4QyxjQUFDO0tBQUE7a0JBdEdvQixPQUFPIn0=