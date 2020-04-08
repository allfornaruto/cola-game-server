"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.JS_WS_CLIENT_TYPE = 'js-websocket';
        this.JS_WS_CLIENT_VERSION = '0.0.5';
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
            'sys': {
                type: this.JS_WS_CLIENT_TYPE,
                version: this.JS_WS_CLIENT_VERSION
            },
            'user': {}
        };
        this.initCallback = null;
        this.reqId = 0;
        this.handlers[Package.TYPE_HANDSHAKE] = this.handshake;
        this.handlers[Package.TYPE_HEARTBEAT] = this.heartbeat;
        this.handlers[Package.TYPE_DATA] = this.onData;
        this.handlers[Package.TYPE_KICK] = this.onKick;
    }
    init(params, cb) {
        console.log('init', params);
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
        console.log('[Pinus] connect to:', host, port);
        let onopen = (event) => {
            this.onConnect();
        };
        let onmessage = (event) => {
            this.onMessage(event);
        };
        let onerror = (event) => {
            this.onIOError(event);
        };
        let onclose = (event) => {
            this.onClose(event);
        };
        let url = 'ws://' + host;
        if (port) {
            url += ':' + port;
        }
        let socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';
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
        if (arguments.length === 2 && typeof msg === 'function') {
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
        console.log('[Pinus] connect success');
        this.send(this._package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(this.handshakeBuffer))));
    }
    onClose(e) {
        console.error('[Pinus] connect close:', e);
        // this.emit(Pinus.EVENT_CLOSE,e);
    }
    onIOError(e) {
        // this.emit(Pinus.EVENT_IO_ERROR, e);
        console.error('socket error: ', e);
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
        if (typeof cb !== 'function') {
            return;
        }
        if (msg.body && msg.body.code === 500) {
            let obj = { 'code': 500, 'desc': '服务器内部错误', 'key': 'INTERNAL_ERROR' };
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
            console.error('server heartbeat timeout', data);
            // this.emit(WSClient.EVENT_HEART_BEAT_TIMEOUT,data);
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
            console.warn('[Pinus] client disconnect ...');
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
            // this.emit(WSClient.EVENT_IO_ERROR, 'client version not fullfill');
            return;
        }
        if (data.code !== this.RES_OK) {
            // this.emit(WSClient.EVENT_IO_ERROR, 'handshake fail');
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
        if (typeof this.handshakeCallback === 'function') {
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
WSClient.EVENT_IO_ERROR = 'io-error';
WSClient.EVENT_CLOSE = 'close';
WSClient.EVENT_KICK = 'onKick';
WSClient.EVENT_HEART_BEAT_TIMEOUT = 'heartbeat timeout';
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
        let len = (buffer.readUnsignedByte() << 16 | buffer.readUnsignedByte() << 8 | buffer.readUnsignedByte()) >>> 0;
        let body;
        if (buffer.bytesAvailable >= len) {
            body = new egret.ByteArray();
            if (len)
                buffer.readBytes(body, 0, len);
        }
        else {
            console.log('[Package] no enough length for current type:', type);
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
        buffer.writeByte((type << 1) | ((typeof (rot) === 'string') ? 0 : 1));
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
            if (typeof rot === 'string') {
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
                id = id + ((m & 0x7f) * Math.pow(2, (7 * i)));
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
                route = routeLen ? buffer.readUTFBytes(routeLen) : '';
            }
        }
        else if (type === Message.TYPE_RESPONSE) {
            route = this.routeMap[id];
        }
        if (!id && !(typeof (route) === 'string')) {
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
        this._clients = protos && protos.client || {};
        this._servers = protos && protos.server || {};
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
                    case 'optional':
                    case 'required':
                        buffer.writeBytes(this.encodeTag(proto.type, proto.tag));
                        this.encodeProp(msg[name], proto.type, protos, buffer);
                        break;
                    case 'repeated':
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
                case 'optional':
                case 'required':
                    msg[name] = this.decodeProp(protos[name].type, protos, buffer);
                    break;
                case 'repeated':
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
            case 'uInt32':
                buffer.writeBytes(this.encodeUInt32(value));
                break;
            case 'int32':
            case 'sInt32':
                buffer.writeBytes(this.encodeSInt32(value));
                break;
            case 'float':
                // Float32Array
                let floats = new egret.ByteArray();
                floats.endian = egret.Endian.LITTLE_ENDIAN;
                floats.writeFloat(value);
                buffer.writeBytes(floats);
                break;
            case 'double':
                let doubles = new egret.ByteArray();
                doubles.endian = egret.Endian.LITTLE_ENDIAN;
                doubles.writeDouble(value);
                buffer.writeBytes(doubles);
                break;
            case 'string':
                buffer.writeBytes(this.encodeUInt32(value.length));
                buffer.writeUTFBytes(value);
                break;
            default:
                let proto = protos.__messages[type] || this._clients['message ' + type];
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
            case 'uInt32':
                return this.decodeUInt32(buffer);
            case 'int32':
            case 'sInt32':
                return this.decodeSInt32(buffer);
            case 'float':
                let floats = new egret.ByteArray();
                buffer.readBytes(floats, 0, 4);
                floats.endian = egret.Endian.LITTLE_ENDIAN;
                let float = buffer.readFloat();
                return floats.readFloat();
            case 'double':
                let doubles = new egret.ByteArray();
                buffer.readBytes(doubles, 0, 8);
                doubles.endian = egret.Endian.LITTLE_ENDIAN;
                return doubles.readDouble();
            case 'string':
                let length = this.decodeUInt32(buffer);
                return buffer.readUTFBytes(length);
            default:
                let proto = protos && (protos.__messages[type] || this._servers['message ' + type]);
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
        return (type === 'uInt32' ||
            type === 'sInt32' ||
            type === 'int32' ||
            type === 'uInt64' ||
            type === 'sInt64' ||
            type === 'float' ||
            type === 'double');
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
            n = n + ((m & 0x7f) * Math.pow(2, (7 * i)));
            if (m < 128) {
                return n;
            }
        }
        return n;
    }
    static encodeSInt32(n) {
        n = n < 0 ? (Math.abs(n) * 2 - 1) : n * 2;
        return this.encodeUInt32(n);
    }
    static decodeSInt32(buffer) {
        let n = this.decodeUInt32(buffer);
        let flag = ((n % 2) === 1) ? -1 : 1;
        n = ((n % 2 + n) / 2) * flag;
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
    float: 5
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGludXNGb3JFZ3JldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3RzL2NsaWVudC9QaW51c0ZvckVncmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscUNBQXFDO0FBQ3JDLGdDQUFnQztBQUVoQzs7Ozs7Ozs7O0dBU0c7QUFLSCxNQUFhLFFBQVE7SUF5Q2pCO1FBakNRLHNCQUFpQixHQUFXLGNBQWMsQ0FBQztRQUMzQyx5QkFBb0IsR0FBVyxPQUFPLENBQUM7UUFFdkMsV0FBTSxHQUFXLEdBQUcsQ0FBQztRQUNyQixhQUFRLEdBQVcsR0FBRyxDQUFDO1FBQ3ZCLG1CQUFjLEdBQVcsR0FBRyxDQUFDO1FBRzdCLFdBQU0sR0FBYyxJQUFJLENBQUM7UUFDekIsY0FBUyxHQUFRLEVBQUUsQ0FBQztRQUNwQixhQUFRLEdBQVEsRUFBRSxDQUFDO1FBQzNCLCtCQUErQjtRQUN2QixhQUFRLEdBQUcsRUFBRSxDQUFDO1FBRWQsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBQzlCLHFCQUFnQixHQUFXLENBQUMsQ0FBQztRQUM3Qix5QkFBb0IsR0FBVyxDQUFDLENBQUM7UUFDakMsaUJBQVksR0FBVyxHQUFHLENBQUM7UUFDM0IsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsdUJBQWtCLEdBQVEsSUFBSSxDQUFDO1FBRS9CLHNCQUFpQixHQUFRLElBQUksQ0FBQztRQUU5QixpQkFBWSxHQUFhLElBQUksQ0FBQztRQUU5QixlQUFVLEdBQVEsRUFBRSxDQUFDO1FBRXJCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFRdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxRQUFR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