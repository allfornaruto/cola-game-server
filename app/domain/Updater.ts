import { Room } from "./model/Room";
import constants from "../util/constants";
import Command from "./model/Command";
import { Cola } from "../../types/Cola";

type RoomId = string;

class Updater {
  // 分割房间
  private rooms: Map<RoomId, Room> = new Map<string, Room>();
  // 上次更新时间（用来控制update更新）
  private lateUpdate: number = 0;

  /**
   * 通过rid找到目标房间
   * @param rid 房间ID
   */
  public findRoom(rid: string): Room {
    return this.rooms.get(rid);
  }

  /**
   * 添加房间
   * @param {string} rid 房间ID
   * @param {Room} room Room实例
   */
  public addRoom(rid: string, room: Room) {
    this.rooms.set(rid, room);
  }

  /**
   * 移除房间
   * @param {string} rid 房间ID
   */
  public removeRoom(rid: string) {
    const delRes = this.rooms.delete(rid);
    if (!delRes) console.warn(`移除房间失败，也许该房间在别的服务器上?`);
  }

  /**
   * 添加指令
   * @param {RoomId} rid
   * @param command
   */
  public addCommand(rid: RoomId, command: Command) {
    let room: Room = this.rooms.get(rid);
    room.commands.push(command);

    console.log(`添加指令: rid=${rid} ${JSON.stringify(command)}`);
  }

  /**
   * 获取历史指令
   * @param {RoomId} rid
   * @returns {Command[][]}
   */
  public getHistoryCommands(rid: RoomId) {
    return this.rooms.get(rid).historyCommands;
  }

  /**
   * 初始化
   */
  public init() {
    this.lateUpdate = Date.now();
    setInterval(() => {
      let now: number = Date.now();
      // 两次update之间的时间差
      let dt: number = now - this.lateUpdate;
      this.lateUpdate = now;
      this.update(dt);
    }, 0);
  }

  private update(dt: number) {
    if (this.rooms.size <= 0) return;
    // 遍历房间来更新帧
    this.rooms.forEach((room: Room) => {
      if (room.frameSyncState === Cola.FrameSyncState.STOP) return;
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
  private stepUpdate(room: Room) {
    let commands: Command[] = room.commands;
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
export const getUpdateInstance = (): Updater => {
  if (!updateInstance) {
    updateInstance = new Updater();
  }
  return updateInstance;
};
