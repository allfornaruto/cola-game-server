"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRemote = void 0;
const Updater_1 = require("../../../domain/Updater");
const updateInstance = (0, Updater_1.getUpdateInstance)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZVJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhbWUvcmVtb3RlL2dhbWVSZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEscURBQTREO0FBRTVELE1BQU0sY0FBYyxHQUFHLElBQUEsMkJBQWlCLEdBQUUsQ0FBQztBQUUzQyxtQkFBeUIsR0FBZ0I7SUFDdkMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFVBQVU7SUFLckIsWUFBWSxHQUFnQjtRQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUErQixFQUFFLE1BQWMsRUFBRSxRQUFnQjtRQUN0RixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQWEsTUFBTSxlQUFlLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDekgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLElBQUk7Z0JBQ0YsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLEtBQUssR0FBNEIsVUFBVSxDQUFDO2dCQUNsRCxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxLQUFL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