"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRemote = void 0;
const Updater_1 = require("../../../domain/Updater");
const updateInstance = Updater_1.getUpdateInstance();
function default_1(app) {
    return new GameRemote(app);
}
exports.default = default_1;
class GameRemote {
    constructor(app) {
        this.app = app;
        this.channelService = app.get("channelService");
        this.backendSessionService = app.get("backendSessionService");
    }
    /**
     * 将用户加入大厅channel
     * @param {Cola.PlayerInitInfo} playerInfo 玩家初始化信息
     * @param {string} gameId gameId作为大厅channel
     * @param {String} serverId Frontend Server Id
     */
    async addToHall(playerInfo, gameId, serverId) {
        return new Promise((resolve, _) => {
            console.log(`gameRemote addToHall playerInfo = ${JSON.stringify(playerInfo)} gameId = ${gameId} serverId = ${serverId}`);
            let flag = true;
            try {
                let channel = this.channelService.getChannel(gameId, true);
                const param = playerInfo;
                channel.pushMessage("onHallAdd", param);
                channel.add(playerInfo.uid, serverId);
            }
            catch (e) {
                console.error(e);
                flag = false;
            }
            finally {
                const res = {
                    status: flag,
                };
                resolve(res);
            }
        });
    }
    /**
     * 获取某频道内的所有玩家信息
     *
     * @param {String} channelName 房间名
     * @return {Array} 频道内的玩家信息数组
     *
     */
    async get(channelName) {
        return new Promise(async (resolve, _) => {
            let userIds = [];
            let channel = this.channelService.getChannel(channelName);
            if (!!channel) {
                userIds = channel.getMembers();
            }
            console.log(`gameRemote.get userIds = ${JSON.stringify(userIds)}`);
            const userList = [];
            for (const uid of userIds) {
                let result = null;
                try {
                    const targetServerId = channel.getMember(uid)["sid"];
                    result = await this.getUserByUid(targetServerId, uid);
                }
                catch (e) {
                    console.error(`this.getUserByUid fail`);
                    console.error(e.message);
                }
                finally {
                    userList.push(result);
                }
            }
            console.log(`channelName = ${channelName}, userList = ${JSON.stringify(userList)}`);
            resolve(userList);
        });
    }
    /**
     * 将用户踢出某频道
     *
     * @param {String} uid unique id for user
     * @param {String} sid Frontend Server Id
     * @param {String} rid channel name
     *
     */
    async kick(uid, sid, rid) {
        const channel = this.channelService.getChannel(rid);
        console.log(`before channelMembers = ${JSON.stringify(channel.getMembers())}`);
        if (!!channel) {
            channel.leave(uid, sid);
        }
        const param = {
            uid,
            rid,
        };
        console.log(`after channelMembers = ${JSON.stringify(channel.getMembers())}`);
        console.log(`[${uid}]被踢出频道，rid = [${rid}]，sid = ${sid}`);
        channel.pushMessage("onKick", param);
    }
    /**
     * 通过uid查询玩家信息
     * @param serverId Frontend Server Id
     * @param uid
     */
    getUserByUid(serverId, uid) {
        console.log(`gameRemote getUserByUid serverId = ${serverId}, uid = ${uid}`);
        return new Promise((resolve, reject) => {
            this.backendSessionService.getByUid(serverId, uid, (err, result) => {
                console.log(`gameRemote backendSessionService.getByUid`);
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                const user = {
                    uid: result[0].uid,
                    gameId: result[0].settings.gameId,
                    name: result[0].settings.name,
                    teamId: result[0].settings.teamId,
                    customPlayerStatus: result[0].settings.customPlayerStatus,
                    customProfile: result[0].settings.customProfile,
                    matchAttributes: result[0].settings.matchAttributes,
                };
                console.log(`promiseList user = ${JSON.stringify(user)}`);
                resolve(user);
            });
        });
    }
    /**
     * 移除房间
     * @param rid 房间id
     */
    destroyRoom(rid) {
        updateInstance.removeRoom(rid);
    }
}
exports.GameRemote = GameRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZVJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhbWUvcmVtb3RlL2dhbWVSZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEscURBQTREO0FBRTVELE1BQU0sY0FBYyxHQUFHLDJCQUFpQixFQUFFLENBQUM7QUFFM0MsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxVQUFVO0lBS3JCLFlBQVksR0FBZ0I7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBK0IsRUFBRSxNQUFjLEVBQUUsUUFBZ0I7UUFDdEYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3pILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixJQUFJO2dCQUNGLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxLQUFLLEdBQTRCLFVBQVUsQ0FBQztnQkFDbEQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFD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