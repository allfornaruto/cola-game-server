"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRemote = void 0;
function default_1(app) {
    return new ChatRemote(app);
}
exports.default = default_1;
class ChatRemote {
    constructor(app) {
        this.app = app;
        this.channelService = app.get('channelService');
        this.backendSessionService = app.get('backendSessionService');
    }
    /**
     * 将用户加入channel
     *
     * @param {Cola.PlayerInfo} playerInfo
     * @param {String} serverId Frontend Server Id
     * @param {String} channelName 频道名称
     *
     */
    async add(playerInfo, serverId, channelName, isHall) {
        return new Promise((resolve, _) => {
            console.log(`chatRemote add uid = ${playerInfo.uid} serverId = ${serverId} channelName = ${channelName}`);
            let flag = true;
            try {
                let channel = this.channelService.getChannel(channelName, true);
                const param = playerInfo;
                if (isHall) {
                    channel.pushMessage('onHallAdd', param);
                }
                else {
                    channel.pushMessage('onRoomAdd', param);
                }
                channel.add(playerInfo.uid, serverId);
            }
            catch (e) {
                console.error(e);
                flag = false;
            }
            finally {
                const res = {
                    status: flag
                };
                resolve(res);
            }
        });
    }
    /**
     * 获取某频道内的所有用户
     *
   * @param {String} sid Frontend Server Id
     * @param {String} channelName rid
     * @return {Array} users uids in channel
     *
     */
    async get(sid, channelName) {
        return new Promise(async (resolve, _) => {
            let userIds = [];
            let channel = this.channelService.getChannel(channelName);
            if (!!channel) {
                userIds = channel.getMembers();
            }
            console.log(`chatRemote.get userIds = ${JSON.stringify(userIds)}`);
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
     * @param {String} channelName channel name
     *
     */
    async kick(uid, sid, channelName) {
        const channel = this.channelService.getChannel(channelName, false);
        if (!!channel) {
            channel.leave(uid, sid);
        }
        const param = {
            uid,
            room: channelName
        };
        console.log(`[${uid}]被踢出频道[${channelName}] sid=${sid}`);
        channel.pushMessage('onKick', param);
    }
    /**
     * 通过uid查询玩家信息
     * @param serverId Frontend Server Id
     * @param uid
     */
    getUserByUid(serverId, uid) {
        console.log(`chatRemote getUserByUid serverId = ${serverId}, uid = ${uid}`);
        return new Promise((resolve, reject) => {
            this.backendSessionService.getByUid(serverId, uid, (err, result) => {
                console.log(`chatRemote backendSessionService.getByUid`);
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                const user = {
                    uid: result[0].uid,
                    gameId: result[0].settings.gameId,
                    name: result[0].settings.name,
                    customPlayerStatus: result[0].settings.customPlayerStatus,
                    customProfile: result[0].settings.customProfile
                };
                console.log(`promiseList user = ${JSON.stringify(user)}`);
                resolve(user);
            });
        });
    }
}
exports.ChatRemote = ChatRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NoYXQvcmVtb3RlL2NoYXRSZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxVQUFVO0lBS3JCLFlBQVksR0FBZ0I7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUEyQixFQUFFLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxNQUFnQjtRQUNuRyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLFVBQVUsQ0FBQyxHQUFHLGVBQWUsUUFBUSxrQkFBa0IsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUMxRyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBSTtnQkFDRixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sS0FBSyxHQUE0QixVQUFVLENBQUM7Z0JBQ2xELElBQUksTUFBTSxFQUFFO29CQUNWLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUN6QztxQkFBTTtvQkFDTCxPQUFP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