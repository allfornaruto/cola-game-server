import { Room } from "./model/Room";
import constants from "../util/constants";
import Command from "./model/Command";

export default class Updater {
    // 分割房间
    private static rooms: Map<string, Room> = new Map<string, Room>();
    // 上次更新时间（用来控制update更新）
    private static lateUpdate: number = 0;

    /**
     * 通过rid找到目标房间
     * @param rid 房间ID
     */
    public static findRoom(rid: string): Room {
      return this.rooms.get(rid);
    }

    /**
     * 添加房间
     * @param {string} rid 房间ID
     * @param {Room} room Room实例
     */
    public static addRoom(rid: string, room: Room) {
        this.rooms.set(rid, room);
    }

    /**
     * 移除房间
     * @param {string} rid 房间ID
     */
    public static removeRoom(rid: string) {
        this.rooms.delete(rid);
    }

    /**
     * 添加命令
     * @param {string} channelName
     * @param command
     */
    public static addCommand(channelName: string, command: Command) {
        let room: Room = this.rooms.get(channelName);
        room.commands.push(command);
    }

    /**
     * 获取历史命令
     * @param {string} channelName
     * @returns {Command[][]}
     */
    public static getHistoryCommands(channelName: string) {
        return this.rooms.get(channelName).historyCommands;
    }

    /**
     * 初始化
     */
    public static init() {
        this.lateUpdate = Date.now();
        setInterval(() => {
            let now: number = Date.now();
            // 两次update之间的时间差
            let dt: number = now - this.lateUpdate;
            this.lateUpdate = now;
            this.update(dt);
        }, 0);
    }

    private static update(dt: number) {
        if (this.rooms.size <= 0) return;
        // 遍历房间来更新帧
        this.rooms.forEach((room: Room) => {
            // 大于一帧的间隔
            room.stepUpdateTime += dt;
            if (room.stepUpdateTime >= constants.STEP_INTERVAL) {
                room.stepUpdateTime -= constants.STEP_INTERVAL;
                room.stepTime++;
                this.stepUpdate(room);
            }
        });
    }

    /**
     * 更新一帧
     * @param {Room} room
     */
    private static stepUpdate(room: Room) {
        // 过滤指令
        let uids: string[] = room.channel.getMembers();
        let commands: Command[] = [];
        for (let uid of uids) {
            commands.push(new Command(uid, undefined, room.stepTime));
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
