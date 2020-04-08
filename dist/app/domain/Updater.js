"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../util/constants");
const Command_1 = require("./model/Command");
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
         * 添加命令
         * @param {string} channelName
         * @param command
         */
        static addCommand(channelName, command) {
            let room = this.rooms.get(channelName);
            room.commands.push(command);
        }
        /**
         * 获取历史命令
         * @param {string} channelName
         * @returns {Command[][]}
         */
        static getHistoryCommands(channelName) {
            return this.rooms.get(channelName).historyCommands;
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
            // 过滤指令
            let uids = room.channel.getMembers();
            let commands = [];
            for (let uid of uids) {
                commands.push(new Command_1.default(uid, undefined, room.stepTime));
            }
            // 将一帧内的所有指令复制一份发给每位用户
            for (let roomCommand of room.commands) {
                for (let command of commands) {
                    if (roomCommand.playerName === command.playerName) {
                        command.direction = roomCommand.direction;
                    }
                }
            }
            // 记录到历史指令（用于重连）
            room.historyCommands.push(commands);
            room.commands = [];
            // 发帧
            room.channel.apushMessage("onMessage", { commands: commands });
        }
    }
    // 分割房间
    Updater.rooms = new Map();
    // 上次更新时间（用来控制update更新）
    Updater.lateUpdate = 0;
    return Updater;
})();
exports.default = Updater;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9kb21haW4vVXBkYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUEwQztBQUMxQyw2Q0FBc0M7QUFFdEM7SUFBQSxNQUFxQixPQUFPO1FBTXhCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBVztZQUNoQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFXLEVBQUUsSUFBVTtZQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBbUIsRUFBRSxPQUFnQjtZQUMxRCxJQUFJLElBQUksR0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxXQUFtQjtZQUNoRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUN2RCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsSUFBSTtZQUNkLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzdCLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2IsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixpQkFBaUI7Z0JBQ2pCLElBQUksRUFBRSxHQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFVO1lBQzVCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztnQkFBRSxPQUFPO1lBQ2pDLFdBQVc7WUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO2dCQUM5QixVQUFVO2dCQUNWLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO2dCQUMxQixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksbUJBQVMsQ0FBQyxhQUFhLEVBQUU7b0JBQ2hELElBQUksQ0FBQyxjQUFjLElBQUksbUJBQVMsQ0FBQyxhQUFhLENBQUM7b0JBQy9DLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDekI7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRDs7O1dBR0c7UUFDSyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVU7WUFDaEMsT0FBTztZQUNQLElBQUksSUFBSSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDL0MsSUFBSSxRQUFRLEdBQWMsRUFBRSxDQUFDO1lBQzdCLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNsQixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQzdEO1lBQ0Qsc0JBQXNCO1lBQ3RCLEtBQUssSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbkMsS0FBSyxJQUFJLE9BQU8sSUFBSSxRQUFRLEVBQUU7b0JBQzFCLElBQUksV0FBVyxDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsVUFBVSxFQUFFO3dCQUMvQyxPQUFPLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUM7cUJBQzdDO2lCQUNKO2FBQ0o7WUFDRCxnQkFBZ0I7WUFDaEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsS0FBSztZQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7O0lBckdELE9BQU87SUFDUSxhQUFLLEdBQXNCLElBQUksR0FBRyxFQUFnQixDQUFDO0lBQ2xFLHVCQUF1QjtJQUNSLGtCQUFVLEdBQVcsQ0FBQyxDQUFDO0lBbUcxQyxjQUFDO0tBQUE7a0JBdkdvQixPQUFPIn0=