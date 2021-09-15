import { Room } from "./model/Room";
import { Constants } from "../util/constants";
import Command from "./model/Command";
import { Cola } from "../../types/Cola";

type RoomId = string;

class Updater {
  // 分割房间
  private rooms: Map<RoomId, Room> = new Map<string, Room>();
  // 上次更新时间（用来控制update更新）
  private lateUpdate: number = 0;

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
  public getRoomList(params: {
    gameId: string;
    pageNo: number;
    pageSize: number;
    roomType?: string;
    isDesc?: boolean;
    filterPrivate?: boolean;
  }): Room[] {
    try {
      let { gameId, pageNo, pageSize, roomType, isDesc, filterPrivate } = params;

      console.log(
        `Updater.ts gameId: ${gameId}, pageNo: ${pageNo}, pageSize: ${pageSize}, roomType: ${roomType}, isDesc: ${isDesc}, filterPrivate: ${filterPrivate}`
      );

      // 默认为1
      if (pageNo < 1) pageNo = 1;
      // 默认为10，最大20
      if (pageSize < 1) pageSize = 10;
      if (pageSize > 20) pageSize = 20;

      let tmp: Room[] = [];
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
            } else {
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
            } else {
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
    } catch (e) {
      console.error(e);
    }
  }

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
      if (room.stepUpdateTime >= Constants.stepInterval) {
        room.stepUpdateTime -= Constants.stepInterval;
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
