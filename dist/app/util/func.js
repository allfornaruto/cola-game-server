"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOtherPlayerSession = void 0;
/**
 * 修改其他玩家的session
 * @param serverId Frontend Server Id
 * @param uid
 */
async function changeOtherPlayerSession(backendSessionService, serverId, uid, cb) {
    return new Promise((resolve, _) => {
        backendSessionService.getByUid(serverId, uid, (err, session) => {
            cb(session[0], resolve);
        });
    });
}
exports.changeOtherPlayerSession = changeOtherPlayerSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC91dGlsL2Z1bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSx3QkFBd0IsQ0FBQyxxQkFBNEMsRUFBRSxRQUFnQixFQUFFLEdBQVcsRUFBRSxFQUEwRDtJQUNwTCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2hDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQzdELEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFORCw0REFNQyJ9