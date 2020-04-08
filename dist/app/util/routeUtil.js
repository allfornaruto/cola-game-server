"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const dispatcher_1 = require("./dispatcher");
function chat(session, msg, app, cb) {
    let chatServers = app.getServersByType('chat');
    if (!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    if (!session.uid) {
        console.error(`session.uid 不存在`);
        return;
    }
    let res = dispatcher_1.dispatch(session.uid, chatServers);
    cb(null, res.id);
}
exports.chat = chat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3V0aWwvcm91dGVVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZDQUF1QztBQUd2QyxTQUFnQixJQUFJLENBQUMsT0FBZ0IsRUFBRSxHQUFRLEVBQUUsR0FBZ0IsRUFBRSxFQUE2QztJQUM1RyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFL0MsSUFBRyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN6QyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE9BQU87S0FDVjtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqQyxPQUFPO0tBQ1I7SUFDRCxJQUFJLEdBQUcsR0FBRyxxQkFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0MsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckIsQ0FBQztBQWJELG9CQWFDIn0=