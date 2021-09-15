"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSClient = void 0;
const egret = require("./ByteArray");
const WebSocket = require("ws");
/**
 * Created by govo on 15/8/14.
 *
 * Pinus Client for Egret, with protobuf support, with js ws client version 0.0.5
 * Github: https://github.com/govo/PinusForEgret.git
 *
 * Thanks to:
 * D-Deo @ https://github.com/D-Deo/pinus-flash-tcp.git
 * and yicaoyimu @ http://bbs.egret.com/forum.php?mod=viewthread&tid=2538&highlight=pinus
 */
class WSClient {
    constructor() {
        this.JS_WS_CLIENT_TYPE = "js-websocket";
        this.JS_WS_CLIENT_VERSION = "0.0.5";
        this.RES_OK = 200;
        this.RES_FAIL = 500;
        this.RES_OLD_CLIENT = 501;
        this.socket = null;
        this.callbacks = {};
        this.handlers = {};
        // Map from request id to route
        this.routeMap = {};
        this.heartbeatInterval = 0;
        this.heartbeatTimeout = 0;
        this.nextHeartbeatTimeout = 0;
        this.gapThreshold = 100;
        this.heartbeatId = null;
        this.heartbeatTimeoutId = null;
        this.handshakeCallback = null;
        this.initCallback = null;
        this._callbacks = {};
        this.reqId = 0;
        this.socket = null;
        this.callbacks = {};
        this.handlers = {};
        // Map from request id to route
        this.routeMap = {};
        this._message = new Message(this.routeMap);
        this._package = new Package();
        this.heartbeatInterval = 0;
        this.heartbeatTimeout = 0;
        this.nextHeartbeatTimeout = 0;
        this.gapThreshold = 100;
        this.heartbeatId = null;
        this.heartbeatTimeoutId = null;
        this.handshakeCallback = null;
        this.handshakeBuffer = {
            sys: {
                type: this.JS_WS_CLIENT_TYPE,
                version: this.JS_WS_CLIENT_VERSION,
            },
            user: {},
        };
        this.initCallback = null;
        this.reqId = 0;
        this.handlers[Package.TYPE_HANDSHAKE] = this.handshake;
        this.handlers[Package.TYPE_HEARTBEAT] = this.heartbeat;
        this.handlers[Package.TYPE_DATA] = this.onData;
        this.handlers[Package.TYPE_KICK] = this.onKick;
    }
    init(params, cb) {
        console.log("init", params);
        this.initCallback = cb;
        let host = params.host;
        let port = params.port;
        //
        // var url = 'ws://' + host;
        // if(port) {
        //    url +=  ':' + port;
        // }
        this.handshakeBuffer.user = params.user;
        this.handshakeCallback = params.handshakeCallback;
        this.initWebSocket(host, port, cb);
    }
    initWebSocket(host, port, cb) {
        console.log("[Pinus] connect to:", host, port);
        let onopen = event => {
            this.onConnect();
        };
        let onmessage = event => {
            this.onMessage(event);
        };
        let onerror = event => {
            this.onIOError(event);
        };
        let onclose = event => {
            this.onClose(event);
        };
        let url = "ws://" + host;
        if (port) {
            url += ":" + port;
        }
        let socket = new WebSocket(url);
        socket.binaryType = "arraybuffer";
        socket.onopen = onopen;
        socket.onmessage = onmessage;
        socket.onerror = onerror;
        socket.onclose = onclose;
        this.socket = socket;
    }
    on(event, fn) {
        (this._callbacks[event] = this._callbacks[event] || []).push(fn);
    }
    request(route, msg, cb) {
        if (arguments.length === 2 && typeof msg === "function") {
            cb = msg;
            msg = {};
        }
        else {
            msg = msg || {};
        }
        route = route || msg.route;
        if (!route) {
            return;
        }
        this.reqId++;
        if (this.reqId > 127) {
            this.reqId = 1;
        }
        let reqId = this.reqId;
        if (WSClient.DEBUG) {
            console.log(`REQUEST:route:${route} , reqId:${reqId}, msg:${JSON.stringify(msg.body)}`);
        }
        this.sendMessage(reqId, route, msg);
        this.callbacks[reqId] = cb;
        this.routeMap[reqId] = route;
    }
    notify(route, msg) {
        this.sendMessage(0, route, msg);
    }
    onMessage(event) {
        this.processPackage(this._package.decode(new egret.ByteArray(event.data)));
    }
    sendMessage(reqId, route, msg) {
        let byte;
        byte = this._message.encode(reqId, route, msg);
        byte = this._package.encode(Package.TYPE_DATA, byte);
        this.send(byte);
    }
    onConnect() {
        console.log("[Pinus] connect success");
        this.send(this._package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(this.handshakeBuffer))));
    }
    onClose(e) {
        this.emit(WSClient.EVENT_CLOSE, e);
    }
    onIOError(e) {
        this.emit(WSClient.EVENT_IO_ERROR, e);
    }
    onKick(event) {
        event = JSON.parse(Protocol.strdecode(event));
        this.emit(WSClient.EVENT_KICK, event);
    }
    onData(data) {
        // probuff decode
        let msg = this._message.decode(data);
        if (msg.id > 0) {
            msg.route = this.routeMap[msg.id];
            delete this.routeMap[msg.id];
            if (!msg.route) {
                return;
            }
        }
        // msg.body = this.deCompose(msg);
        this.processMessage(msg);
    }
    processMessage(msg) {
        if (!msg.id) {
            // server push message
            if (WSClient.DEBUG) {
                console.log(`EVENT: Route:${msg.route} Msg:${JSON.stringify(msg.body)}`);
            }
            this.emit(msg.route, msg.body);
            return;
        }
        if (WSClient.DEBUG) {
            console.log(`RESPONSE: Id:${msg.id} Msg:${JSON.stringify(msg.body)}`);
        }
        // if have a id then find the callback function with the request
        let cb = this.callbacks[msg.id];
        delete this.callbacks[msg.id];
        if (typeof cb !== "function") {
            return;
        }
        if (msg.body && msg.body.code === 500) {
            let obj = { code: 500, desc: "服务器内部错误", key: "INTERNAL_ERROR" };
            msg.body.error = obj;
        }
        cb(msg.body);
        return;
    }
    heartbeat(data) {
        if (!this.heartbeatInterval) {
            // no heartbeat
            return;
        }
        let obj = this._package.encode(Package.TYPE_HEARTBEAT);
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
        if (this.heartbeatId) {
            // already in a heartbeat interval
            return;
        }
        let self = this;
        self.heartbeatId = setTimeout(function () {
            self.heartbeatId = null;
            self.send(obj);
            self.nextHeartbeatTimeout = Date.now() + self.heartbeatTimeout;
            self.heartbeatTimeoutId = setTimeout(self.heartbeatTimeoutCb.bind(self, data), self.heartbeatTimeout);
        }, self.heartbeatInterval);
    }
    heartbeatTimeoutCb(data) {
        let gap = this.nextHeartbeatTimeout - Date.now();
        if (gap > this.gapThreshold) {
            this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb.bind(this, data), gap);
        }
        else {
            this.emit(WSClient.EVENT_HEART_BEAT_TIMEOUT, data);
            this._disconnect();
        }
    }
    off(event, fn) {
        this.removeAllListeners(event, fn);
    }
    removeAllListeners(event, fn) {
        // all
        if (0 === arguments.length) {
            this._callbacks = {};
            return;
        }
        // specific event
        let callbacks = this._callbacks[event];
        if (!callbacks) {
            return;
        }
        // remove all handlers
        if (event && !fn) {
            delete this._callbacks[event];
            return;
        }
        // remove specific handler
        let i = this.index(callbacks, fn._off || fn);
        if (~i) {
            callbacks.splice(i, 1);
        }
        return;
    }
    index(arr, obj) {
        if ([].indexOf) {
            return arr.indexOf(obj);
        }
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i] === obj)
                return i;
        }
        return -1;
    }
    async disconnect() {
        return await this._disconnect();
    }
    _disconnect() {
        return new Promise((resolve, _) => {
            if (this.socket)
                this.socket.close();
            this.socket = null;
            if (this.heartbeatId) {
                clearTimeout(this.heartbeatId);
                this.heartbeatId = null;
            }
            if (this.heartbeatTimeoutId) {
                clearTimeout(this.heartbeatTimeoutId);
                this.heartbeatTimeoutId = null;
            }
            resolve(true);
        });
    }
    processPackage(msg) {
        this.handlers[msg.type].apply(this, [msg.body]);
    }
    handshake(resData) {
        let data = JSON.parse(Protocol.strdecode(resData));
        if (data.code === this.RES_OLD_CLIENT) {
            this.emit(WSClient.EVENT_IO_ERROR, "client version not fullfill");
            return;
        }
        if (data.code !== this.RES_OK) {
            this.emit(WSClient.EVENT_IO_ERROR, "handshake fail");
            return;
        }
        this.handshakeInit(data);
        let obj = this._package.encode(Package.TYPE_HANDSHAKE_ACK);
        this.send(obj);
        if (this.initCallback) {
            this.initCallback(data);
            this.initCallback = null;
        }
    }
    handshakeInit(data) {
        if (data.sys) {
            Routedic.init(data.sys.dict);
            Protobuf.init(data.sys.protos);
        }
        if (data.sys && data.sys.heartbeat) {
            this.heartbeatInterval = data.sys.heartbeat * 1000; // heartbeat interval
            this.heartbeatTimeout = this.heartbeatInterval * 2; // max heartbeat timeout
        }
        else {
            this.heartbeatInterval = 0;
            this.heartbeatTimeout = 0;
        }
        if (typeof this.handshakeCallback === "function") {
            this.handshakeCallback(data.user);
        }
    }
    send(byte) {
        if (this.socket) {
            this.socket.send(byte.buffer);
        }
    }
    // private deCompose(msg){
    //    return JSON.parse(Protocol.strdecode(msg.body));
    // }
    emit(event, ...args) {
        let params = [].slice.call(arguments, 1);
        let callbacks = this._callbacks[event];
        if (callbacks) {
            callbacks = callbacks.slice(0);
            for (let i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, params);
            }
        }
        return this;
    }
}
exports.WSClient = WSClient;
WSClient.DEBUG = false;
WSClient.EVENT_IO_ERROR = "io-error";
WSClient.EVENT_CLOSE = "close";
WSClient.EVENT_KICK = "onKick";
WSClient.EVENT_HEART_BEAT_TIMEOUT = "heartbeat timeout";
class Package {
    encode(type, body) {
        let length = body ? body.length : 0;
        let buffer = new egret.ByteArray();
        buffer.writeByte(type & 0xff);
        buffer.writeByte((length >> 16) & 0xff);
        buffer.writeByte((length >> 8) & 0xff);
        buffer.writeByte(length & 0xff);
        if (body)
            buffer.writeBytes(body, 0, body.length);
        return buffer;
    }
    decode(buffer) {
        let type = buffer.readUnsignedByte();
        let len = ((buffer.readUnsignedByte() << 16) | (buffer.readUnsignedByte() << 8) | buffer.readUnsignedByte()) >>> 0;
        let body;
        if (buffer.bytesAvailable >= len) {
            body = new egret.ByteArray();
            if (len)
                buffer.readBytes(body, 0, len);
        }
        else {
            console.log("[Package] no enough length for current type:", type);
        }
        return { type: type, body: body, length: len };
    }
}
Package.TYPE_HANDSHAKE = 1;
Package.TYPE_HANDSHAKE_ACK = 2;
Package.TYPE_HEARTBEAT = 3;
Package.TYPE_DATA = 4;
Package.TYPE_KICK = 5;
class Message {
    constructor(routeMap) {
        this.routeMap = routeMap;
    }
    encode(id, route, msg) {
        let buffer = new egret.ByteArray();
        let type = id ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
        let byte = Protobuf.encode(route, msg) || Protocol.strencode(JSON.stringify(msg));
        let rot = Routedic.getID(route) || route;
        buffer.writeByte((type << 1) | (typeof rot === "string" ? 0 : 1));
        if (id) {
            // 7.x
            do {
                let tmp = id % 128;
                let next = Math.floor(id / 128);
                if (next !== 0) {
                    tmp = tmp + 128;
                }
                buffer.writeByte(tmp);
                id = next;
            } while (id !== 0);
            // 5.x
            //                var len:Array = [];
            //                len.push(id & 0x7f);
            //                id >>= 7;
            //                while(id > 0)
            //                {
            //                    len.push(id & 0x7f | 0x80);
            //                    id >>= 7;
            //                }
            //
            //                for (var i:int = len.length - 1; i >= 0; i--)
            //                {
            //                    buffer.writeByte(len[i]);
            //                }
        }
        if (rot) {
            if (typeof rot === "string") {
                buffer.writeByte(rot.length & 0xff);
                buffer.writeUTFBytes(rot);
            }
            else {
                buffer.writeByte((rot >> 8) & 0xff);
                buffer.writeByte(rot & 0xff);
            }
        }
        if (byte) {
            buffer.writeBytes(byte);
        }
        return buffer;
    }
    decode(buffer) {
        // parse flag
        let flag = buffer.readUnsignedByte();
        let compressRoute = flag & Message.MSG_COMPRESS_ROUTE_MASK;
        let type = (flag >> 1) & Message.MSG_TYPE_MASK;
        let route;
        // parse id
        let id = 0;
        if (type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE) {
            // 7.x
            let i = 0;
            let m;
            do {
                m = buffer.readUnsignedByte();
                id = id + (m & 0x7f) * Math.pow(2, 7 * i);
                i++;
            } while (m >= 128);
            // 5.x
            //                var byte:int = buffer.readUnsignedByte();
            //                id = byte & 0x7f;
            //                while(byte & 0x80)
            //                {
            //                    id <<= 7;
            //                    byte = buffer.readUnsignedByte();
            //                    id |= byte & 0x7f;
            //                }
        }
        // parse route
        if (type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY || type === Message.TYPE_PUSH) {
            if (compressRoute) {
                route = buffer.readUnsignedShort();
            }
            else {
                let routeLen = buffer.readUnsignedByte();
                route = routeLen ? buffer.readUTFBytes(routeLen) : "";
            }
        }
        else if (type === Message.TYPE_RESPONSE) {
            route = this.routeMap[id];
        }
        if (!id && !(typeof route === "string")) {
            route = Routedic.getName(route);
        }
        let body = Protobuf.decode(route, buffer) || JSON.parse(Protocol.strdecode(buffer));
        return { id: id, type: type, route: route, body: body };
    }
}
Message.MSG_FLAG_BYTES = 1;
Message.MSG_ROUTE_CODE_BYTES = 2;
Message.MSG_ID_MAX_BYTES = 5;
Message.MSG_ROUTE_LEN_BYTES = 1;
Message.MSG_ROUTE_CODE_MAX = 0xffff;
Message.MSG_COMPRESS_ROUTE_MASK = 0x1;
Message.MSG_TYPE_MASK = 0x7;
Message.TYPE_REQUEST = 0;
Message.TYPE_NOTIFY = 1;
Message.TYPE_RESPONSE = 2;
Message.TYPE_PUSH = 3;
class Protocol {
    static strencode(str) {
        let buffer = new egret.ByteArray();
        buffer.length = str.length;
        buffer.writeUTFBytes(str);
        return buffer;
    }
    static strdecode(byte) {
        return byte.readUTFBytes(byte.bytesAvailable);
    }
}
class Protobuf {
    static init(protos) {
        this._clients = (protos && protos.client) || {};
        this._servers = (protos && protos.server) || {};
    }
    static encode(route, msg) {
        let protos = this._clients[route];
        if (!protos)
            return null;
        return this.encodeProtos(protos, msg);
    }
    static decode(route, buffer) {
        let protos = this._servers[route];
        if (!protos)
            return null;
        return this.decodeProtos(protos, buffer);
    }
    static encodeProtos(protos, msg) {
        let buffer = new egret.ByteArray();
        for (let name in msg) {
            if (protos[name]) {
                let proto = protos[name];
                switch (proto.option) {
                    case "optional":
                    case "required":
                        buffer.writeBytes(this.encodeTag(proto.type, proto.tag));
                        this.encodeProp(msg[name], proto.type, protos, buffer);
                        break;
                    case "repeated":
                        if (!!msg[name] && msg[name].length > 0) {
                            this.encodeArray(msg[name], proto, protos, buffer);
                        }
                        break;
                }
            }
        }
        return buffer;
    }
    static decodeProtos(protos, buffer) {
        let msg = {};
        while (buffer.bytesAvailable) {
            let head = this.getHead(buffer);
            let name = protos.__tags[head.tag];
            switch (protos[name].option) {
                case "optional":
                case "required":
                    msg[name] = this.decodeProp(protos[name].type, protos, buffer);
                    break;
                case "repeated":
                    if (!msg[name]) {
                        msg[name] = [];
                    }
                    this.decodeArray(msg[name], protos[name].type, protos, buffer);
                    break;
            }
        }
        return msg;
    }
    static encodeTag(type, tag) {
        let value = this.TYPES[type] !== undefined ? this.TYPES[type] : 2;
        return this.encodeUInt32((tag << 3) | value);
    }
    static getHead(buffer) {
        let tag = this.decodeUInt32(buffer);
        return { type: tag & 0x7, tag: tag >> 3 };
    }
    static encodeProp(value, type, protos, buffer) {
        switch (type) {
            case "uInt32":
                buffer.writeBytes(this.encodeUInt32(value));
                break;
            case "int32":
            case "sInt32":
                buffer.writeBytes(this.encodeSInt32(value));
                break;
            case "float":
                // Float32Array
                let floats = new egret.ByteArray();
                floats.endian = egret.Endian.LITTLE_ENDIAN;
                floats.writeFloat(value);
                buffer.writeBytes(floats);
                break;
            case "double":
                let doubles = new egret.ByteArray();
                doubles.endian = egret.Endian.LITTLE_ENDIAN;
                doubles.writeDouble(value);
                buffer.writeBytes(doubles);
                break;
            case "string":
                buffer.writeBytes(this.encodeUInt32(value.length));
                buffer.writeUTFBytes(value);
                break;
            default:
                let proto = protos.__messages[type] || this._clients["message " + type];
                if (!!proto) {
                    let buf = this.encodeProtos(proto, value);
                    buffer.writeBytes(this.encodeUInt32(buf.length));
                    buffer.writeBytes(buf);
                }
                break;
        }
    }
    static decodeProp(type, protos, buffer) {
        switch (type) {
            case "uInt32":
                return this.decodeUInt32(buffer);
            case "int32":
            case "sInt32":
                return this.decodeSInt32(buffer);
            case "float":
                let floats = new egret.ByteArray();
                buffer.readBytes(floats, 0, 4);
                floats.endian = egret.Endian.LITTLE_ENDIAN;
                let float = buffer.readFloat();
                return floats.readFloat();
            case "double":
                let doubles = new egret.ByteArray();
                buffer.readBytes(doubles, 0, 8);
                doubles.endian = egret.Endian.LITTLE_ENDIAN;
                return doubles.readDouble();
            case "string":
                let length = this.decodeUInt32(buffer);
                return buffer.readUTFBytes(length);
            default:
                let proto = protos && (protos.__messages[type] || this._servers["message " + type]);
                if (proto) {
                    let len = this.decodeUInt32(buffer);
                    let buf;
                    if (len) {
                        buf = new egret.ByteArray();
                        buffer.readBytes(buf, 0, len);
                    }
                    return len ? Protobuf.decodeProtos(proto, buf) : false;
                }
                break;
        }
    }
    static isSimpleType(type) {
        return (type === "uInt32" ||
            type === "sInt32" ||
            type === "int32" ||
            type === "uInt64" ||
            type === "sInt64" ||
            type === "float" ||
            type === "double");
    }
    static encodeArray(array, proto, protos, buffer) {
        let isSimpleType = this.isSimpleType;
        if (isSimpleType(proto.type)) {
            buffer.writeBytes(this.encodeTag(proto.type, proto.tag));
            buffer.writeBytes(this.encodeUInt32(array.length));
            let encodeProp = this.encodeProp;
            for (let i = 0; i < array.length; i++) {
                encodeProp(array[i], proto.type, protos, buffer);
            }
        }
        else {
            let encodeTag = this.encodeTag;
            for (let j = 0; j < array.length; j++) {
                buffer.writeBytes(encodeTag(proto.type, proto.tag));
                this.encodeProp(array[j], proto.type, protos, buffer);
            }
        }
    }
    static decodeArray(array, type, protos, buffer) {
        let isSimpleType = this.isSimpleType;
        let decodeProp = this.decodeProp;
        if (isSimpleType(type)) {
            let length = this.decodeUInt32(buffer);
            for (let i = 0; i < length; i++) {
                array.push(decodeProp(type, protos, buffer));
            }
        }
        else {
            array.push(decodeProp(type, protos, buffer));
        }
    }
    static encodeUInt32(n) {
        let result = new egret.ByteArray();
        do {
            let tmp = n % 128;
            let next = Math.floor(n / 128);
            if (next !== 0) {
                tmp = tmp + 128;
            }
            result.writeByte(tmp);
            n = next;
        } while (n !== 0);
        return result;
    }
    static decodeUInt32(buffer) {
        let n = 0;
        for (let i = 0; i < buffer.length; i++) {
            let m = buffer.readUnsignedByte();
            n = n + (m & 0x7f) * Math.pow(2, 7 * i);
            if (m < 128) {
                return n;
            }
        }
        return n;
    }
    static encodeSInt32(n) {
        n = n < 0 ? Math.abs(n) * 2 - 1 : n * 2;
        return this.encodeUInt32(n);
    }
    static decodeSInt32(buffer) {
        let n = this.decodeUInt32(buffer);
        let flag = n % 2 === 1 ? -1 : 1;
        n = (((n % 2) + n) / 2) * flag;
        return n;
    }
}
Protobuf.TYPES = {
    uInt32: 0,
    sInt32: 0,
    int32: 0,
    double: 1,
    string: 2,
    message: 2,
    float: 5,
};
Protobuf._clients = {};
Protobuf._servers = {};
class Routedic {
    static init(dict) {
        this._names = dict || {};
        let _names = this._names;
        let _ids = this._ids;
        for (let name in _names) {
            _ids[_names[name]] = name;
        }
    }
    static getID(name) {
        return this._names[name];
    }
    static getName(id) {
        return this._ids[id];
    }
}
Routedic._ids = {};
Routedic._names = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGludXNGb3JFZ3JldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3RzL2NsaWVudC9QaW51c0ZvckVncmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyxnQ0FBZ0M7QUFFaEM7Ozs7Ozs7OztHQVNHO0FBRUgsTUFBYSxRQUFRO0lBc0NuQjtRQS9CUSxzQkFBaUIsR0FBVyxjQUFjLENBQUM7UUFDM0MseUJBQW9CLEdBQVcsT0FBTyxDQUFDO1FBRXZDLFdBQU0sR0FBVyxHQUFHLENBQUM7UUFDckIsYUFBUSxHQUFXLEdBQUcsQ0FBQztRQUN2QixtQkFBYyxHQUFXLEdBQUcsQ0FBQztRQUU3QixXQUFNLEdBQWMsSUFBSSxDQUFDO1FBQ3pCLGNBQVMsR0FBUSxFQUFFLENBQUM7UUFDcEIsYUFBUSxHQUFRLEVBQUUsQ0FBQztRQUMzQiwrQkFBK0I7UUFDdkIsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVkLHNCQUFpQixHQUFXLENBQUMsQ0FBQztRQUM5QixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IseUJBQW9CLEdBQVcsQ0FBQyxDQUFDO1FBQ2pDLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBQzNCLGdCQUFXLEdBQVEsSUFBSSxDQUFDO1FBQ3hCLHVCQUFrQixHQUFRLElBQUksQ0FBQztRQUUvQixzQkFBaUIsR0FBUSxJQUFJLENBQUM7UUFFOUIsaUJBQVksR0FBYSxJQUFJLENBQUM7UUFFOUIsZUFBVSxHQUFRLEVBQUUsQ0FBQztRQUVyQixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBTXhCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLCtCQUErQjtRQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFB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