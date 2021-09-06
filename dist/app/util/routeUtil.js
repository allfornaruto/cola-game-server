"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const dispatcher_1 = require("./dispatcher");
function game(session, msg, app, cb) {
    let gameServers = app.getServersByType("game");
    if (!gameServers || gameServers.length === 0) {
        cb(new Error("can not find game servers."));
        return;
    }
    if (!session.uid) {
        console.error(`session.uid 不存在`);
        return;
    }
    let res = (0, dispatcher_1.dispatch)(session.uid, gameServers);
    cb(null, res.id);
}
exports.game = game;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3V0aWwvcm91dGVVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF3QztBQUd4QyxTQUFnQixJQUFJLENBQUMsT0FBZ0IsRUFBRSxHQUFRLEVBQUUsR0FBZ0IsRUFBRSxFQUEyQztJQUM1RyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFL0MsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM1QyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE9BQU87S0FDUjtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqQyxPQUFPO0tBQ1I7SUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFBLHFCQUFRLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM3QyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuQixDQUFDO0FBYkQsb0JBYUMifQ==