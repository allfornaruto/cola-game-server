"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatch = void 0;
const crc = require("crc");
function dispatch(uid, connectors) {
    let index = Math.abs(crc.crc32(uid)) % connectors.length;
    return connectors[index];
}
exports.dispatch = dispatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC91dGlsL2Rpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQTJCO0FBRzNCLFNBQWdCLFFBQVEsQ0FBQyxHQUFXLEVBQUcsVUFBd0I7SUFDM0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUN6RCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBSEQsNEJBR0MifQ==