# cola-game-server

## 安装、运行、测试

```shell
npm install
# 运行并测试
pinus start --directory dist --env test
npm run test

# 运行不同的环境
pinus start --directory dist --env development
pinus start --directory dist --env production --daemon

# 查看端口占用状态
netstat -ano|findstr [port]
```

## 客户端文档

- test/client
- types/Cola.ts

### 初始化并与服务器建立 WebSocket 连接

> new ColaClient(init, options)

- init `{Cola.Init}` 初始化必传参数
  - gameId `{string}` 游戏 ID
  - playerInitInfo `{Cola.playerInitInfo}` 玩家初始化信息
    - uid `{string}` 用户 uid
    - gameId `{string}` 游戏 ID
    - name `{string}` 游戏用户昵称
  - gateHost `{string}` 游戏服务器地址
  - gatePort `{number}` 游戏服务器端口
- options `{Cola.ColaOptions}` 初始化可选参数
  - debug `{boolean}` 是否开启日志调试，默认 false

```typescript
import ColaClient from "./tests/client/Cola";
import { Cola } from "./types/Cola";

const playerInfo: Cola.PlayerInfo = {
  uid: "111111",
  gameId: "dnf",
  name: "测试用户-A",
};
const init: Cola.Init = {
  gateHost: "127.0.0.1",
  gatePort: 3100,
  gameId: "dnf",
  playerInitInfo: playerInfo,
};
const options: Cola.ColaOptions = {
  debug: true,
};

const cola = new ColaClient(init, options);
```

### 关闭连接

```typescript
await colaA.close();
```

### 事件处理

```typescript
// 错误处理
cola.listen("io-error", event => console.log(event));
// 连接关闭处理
cola.listen("close", event => console.log(event));
// 心跳超时处理
cola.listen("heartbeat timeout", event => console.log(event));
// 监听其他玩家加入大厅
cola.listen("onHallAdd", async (event: Cola.EventRes.OnHallAdd) => console.log(event));
// 监听其他玩家创建房间
cola.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => console.log(event));
// 监听其他玩家进入房间
cola.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => console.log(event));
// 监听其他玩家离开房间
cola.listen("onKick", (event: Cola.EventRes.OnKick) => console.log(event));
// 监听玩家发送消息
cola.listen("onChat", async (event: Cola.EventRes.OnChat) => console.log(event));
// 监听房间信息变化
cola.listen("onChangeRoom", async (event: Cola.EventRes.OnChangeRoom) => console.log(event));
// 监听玩家自定义状态变化
cola.listen("onChangeCustomPlayerStatus", async (event: Cola.EventRes.OnChangeCustomPlayerStatus) => console.log(event));
```

### 玩家进入游戏大厅

```typescript
await cola.enterHall();
```

### 玩家创建房间

> createRoom(params: Cola.Params.CreateRoom): Promise<Cola.Room> {

- params `{Cola.Params.CreateRoom}` 创建房间参数
  - name `{string}` 房间名称
  - type `{string}` 房间类型
  - createType `{Cola.CreateRoomType}` 创建房间方式
    - 0 `{number}` 普通创建
    - 1 `{number}` 匹配创建
  - maxPlayers `{number}` 房间最大玩家数量
  - isPrivate `{boolean}` 是否私有
  - customProperties `{string}` 房间自定义属性
  - teamList `{TeamInfo[]}` 团队属性
    - id: `{string}` 队伍 ID
    - name: `{string}` 队伍名称
    - minPlayers: `{number}` 队伍最小人数
    - maxPlayers: `{number}` 队伍最大人数
  - playerInfoExtra `{PlayerInfoExtra}` 加入房间用户额外信息参数
    - teamId `{string}` 房间内队伍 id
    - customPlayerStatus `{number}` 自定义玩家状态
    - customProfile `{string}` 自定义玩家信息
    - matchAttributes `{MatchAttribute[]}` 匹配属性列表
      - name `{string}` 属性名称
      - value `{number}` 属性值

```typescript
const playerInfoExtra: Cola.PlayerInfoExtra = {
  teamId: "1",
  customPlayerStatus: 0,
  customProfile: JSON.stringify({ hp: 100, mp: 80 }),
  matchAttributes: [],
};
const myRoom: Cola.Params.CreateRoom = {
  name: "room-1977",
  type: "0",
  createType: 0,
  maxPlayers: 2,
  isPrivate: false,
  customProperties: "",
  teamList: [],
  playerInfoExtra: playerInfoExtra,
};
const roomInfo: Cola.Room = await cola.createRoom(myRoom);
```

### 进入房间

> enterRoom(params: Cola.Params.EnterRoom): Promise<Cola.Room>

- params `{Cola.Params.EnterRoom}` 进入房间请求参数
  - rid `{string}` 房间 ID
  - playerInfoExtra `{Cola.playerInfoExtra}` 加入房间用户额外信息参数
    - teamId `{string}` 房间内队伍 id
    - customPlayerStatus `{number}` 自定义玩家状态
    - customProfile `{string}` 自定义玩家信息
    - matchAttributes `{MatchAttribute[]}` 匹配属性列表
      - name `{string}` 属性名称
      - value `{number}` 属性值

```typescript
const roomInfo: Cola.Room = await cola.enterRoom({
  rid,
  playerInfoExtra: playerInfoExtra,
});
```

### 根据房间 ID 获取房间信息

> getRoomByRoomId(params: Cola.Request.GetRoomByRoomId): Promise<Cola.Room>

- params `{Cola.Request.GetRoomByRoomId}` 请求参数
  - rid `{string}` 房间 ID

```typescript
const roomInfo = await cola.getRoomByRoomId({ rid: "123" });
```

### 房主修改房间信息

- 修改成功后，房间内全部成员都会收到一条修改房间广播 onChangeRoom，Room 实例将更新。
- 只有房主有权限修改房间

> changeRoom(params: Cola.Params.ChangeRoom): Promise<Cola.Room>

- params `{Cola.Params.ChangeRoom}` 修改房间信息参数
  - name `{string}` 房间名称（可选）
  - owner `{string}` 房主 ID（可选）
  - isPrivate `{boolean}` 是否私有（可选）
  - customProperties `{string}` 自定义房间属性（可选）
  - isForbidJoin `{boolean}` 是否禁止加入房间（可选）

```typescript
const newRoomInfo: Cola.Room = await cola.changeRoom({
  name: "新de房间名",
  owner: "新房主id",
});
```

### 修改玩家自定义状态

- 修改玩家状态是修改 Player 中的 customPlayerStatus 字段，玩家的状态由开发者自定义。
- 修改成功后，房间内全部成员都会收到一条修改玩家状态广播 onChangeCustomPlayerStatus，Room 实例将更新。

> changeCustomPlayerStatus(customPlayerStatus: number): Promise<Cola.Status>

- customPlayerStatus `{number}` 修改玩家状态参数

```typescript
const status: Cola.Status = await cola.changeCustomPlayerStatus(1);
```

### 开始帧同步

- 房间内任意一个玩家成功调用该接口将导致全部玩家开始接收帧广播
- 调用成功后房间内全部成员将收到 onStartFrameSync 广播。该接口会修改房间帧同步状态为“已开始帧同步”

> startFrameSync(): Promise<Cola.Status>

```typescript
const status: Cola.Status = await cola.startFrameSync();
```

### 发送帧数据参数

- 必须在调用 startFrameSync 之后才可调用该方法

```typescript
const status: Cola.Status = await cola.startFrameSync();
if (status) {
  cola.sendFrame(JSON.stringify({ progress: 99 }));
}
```

### 停止帧同步

- 房间内任意一个玩家成功调用该接口将导致全部玩家停止接收帧广播
- 调用成功后房间内全部成员将收到 onStopFrameSync 广播。该接口会修改房间帧同步状态为“已停止帧同步”

> stopFrameSync(): Promise<Cola.Status>

```typescript
const status: Cola.Status = await cola.stopFrameSync();
```

### 在房间内发送消息给指定用户

> sendMsg(uidList: string[], content: string): Promise<Cola.Status>

- uidList `{string[]}` 用户 uid 数组
- content `{string}` 发送内容

```typescript
const sendResult: Cola.Status = await cola.sendMsg(["222222"], "Hello cola");
```

## Cola 类型文档

### Init

> Cola 客户端初始化参数

```typescript
interface Init {
  // 游戏ID
  gameId: string;
  // 玩家初始化信息
  PlayerInitInfo: PlayerInitInfo;
  // 游戏服务器地址
  gateHost: string;
  // 游戏服务器端口
  gatePort: number;
}
```

### Event

> 自定义事件名称

```typescript
type Event =
  | "io-error"
  | "close"
  | "onKick"
  | "heartbeat timeout"
  | "onRoomCreate"
  | "onHallAdd"
  | "onRoomAdd"
  | "onChangeRoom"
  | "onChangeCustomPlayerStatus"
  | "onChat"
  | "onRecvFrame"
  | "onStartFrameSync"
  | "onStopFrameSync";
```

#### EventRes.OnKick

> 玩家离开房间事件

```typescript
interface OnKick {
  // 用户uid
  uid: string;
  // 房间id
  rid: string;
}
```

#### EventRes.OnRoomCreate

> 房间创建事件

```typescript
interface OnRoomCreate extends Room {}
```

#### EventRes.OnHallAdd

> 玩家加入大厅事件

```typescript
interface OnHallAdd extends PlayerInitInfo {}
```

#### EventRes.OnRoomAdd

> 玩家加入房间事件

```typescript
interface OnRoomAdd extends PlayerInfo {}
```

#### EventRes.OnChangeRoom

> 房间信息变更事件

```typescript
interface OnChangeRoom extends Room {}
```

#### EventRes.onChangeCustomPlayerStatus

> 玩家自定义状态变更事件

```typescript
interface OnChangeCustomPlayerStatus {
  // 玩家uid
  changePlayerId: string;
  // 玩家自定义状态
  customPlayerStatus: number;
  // 房间信息
  roomInfo: Room;
}
```

#### EventRes.OnChat

> 玩家发送消息事件

```typescript
interface OnChat {
  // 消息内容
  msg: string;
  // 消息发送者uid
  from: string;
  // 消息接收者uid数组
  target: string[];
}
```

#### EventRes.onRecvFrame

> 房间帧消息广播事件

```typescript
interface Frame {
  id: number;
  items: Command[];
  isReplay: boolean;
}
interface onRecvFrame extends Frame {}
```

#### EventRes.onStartFrameSync

> 房间开始帧同步事件

```typescript
type onStartFrameSync = "startFrame";
```

#### EventRes.onStartFrameSync

> 房间停止帧同步事件

```typescript
type onStopFrameSync = "stopFrame";
```

### Params

#### Params.CreateRoom

> 创建房间请求参数

```typescript
interface CreateRoom {
  // 房间名称
  name: string;
  // 房间类型
  type: string;
  // 创建房间方式
  createType: CreateRoomType;
  // 房间最大玩家数量
  maxPlayers: number;
  // 是否私有
  isPrivate: boolean;
  // 房间自定义属性
  customProperties: string;
  // 团队属性
  teamList: TeamInfo[];
  // 加入房间用户额外信息参数
  playerInfoExtra: PlayerInfoExtra;
}
```

#### Params.EnterRoom

> 进入房间请求参数

```typescript
export interface EnterRoom {
  // 房间ID
  rid: string;
  // 加入房间用户额外信息参数
  playerInfoExtra: PlayerInfoExtra;
}
```

#### Params.ChangeRoom

> 房主修改房间信息

```typescript
interface ChangeRoom {
  // 房间名称（可选）
  name?: string;
  // 房主ID（可选）
  owner?: string;
  // 是否私有（可选）
  isPrivate?: boolean;
  // 自定义房间属性（可选）
  customProperties?: string;
  // 是否禁止加入房间（可选）
  isForbidJoin?: boolean;
}
```

### CreateRoomType

> 创建房间方式

```typescript
enum CreateRoomType {
  // 普通创建
  COMMON_CREATE = 0,
  // 匹配创建
  MATCH_CREATE = 1,
}
```

### TeamInfo

> 团队属性

```typescript
interface TeamInfo {
  // 队伍ID
  id: string;
  // 队伍名称
  name: string;
  // 队伍最小人数
  minPlayers: number;
  // 队伍最大人数
  maxPlayers: number;
}
```

### PlayerInfoExtra

> 加入房间用户额外信息参数

```typescript
interface PlayerInfoExtra {
  // 房间内队伍id
  teamId: string;
  // 自定义玩家状态
  customPlayerStatus: number;
  // 自定义玩家信息
  customProfile: string;
  // 匹配属性列表
  matchAttributes: MatchAttribute[];
}
```

### PlayerInitInfo

> 玩家初始化信息

```typescript
interface PlayerInitInfo {
  // 用户uid
  uid: string;
  // 游戏id
  gameId: string;
  // 游戏用户昵称
  name: string;
}
```

### PlayerInfo

> 玩家信息参数

```typescript
interface PlayerInfo {
  // 用户uid
  uid: string;
  // 游戏id
  gameId: string;
  // 游戏用户昵称
  name: string;
  // 房间内队伍id
  teamId: string;
  // 自定义玩家状态
  customPlayerStatus: number;
  // 自定义玩家信息
  customProfile: string;
  // 匹配属性列表
  matchAttributes: MatchAttribute[];
}
```

### MatchAttribute

> 匹配属性

```typescript
interface MatchAttribute {
  // 属性名称
  name: string;
  // 属性值
  value: number;
}
```

### Room

> 房间信息

```typescript
interface Room {
  // 房间ID
  rid: string;
  // 游戏ID
  gameId: string;
  // 房间名称
  name: string;
  // 房间类型
  type: string;
  // 创建房间方式
  createType: CreateRoomType;
  // 房间最大玩家数量
  maxPlayers: number;
  // 房主Id
  owner: string;
  // 是否私有
  isPrivate: boolean;
  // 房间自定义属性
  customProperties: string;
  // 玩家列表
  playerList: PlayerInfo[];
  // 团队属性
  teamList: TeamInfo[];
  // 房间帧同步状态
  frameSyncState: FrameSyncState;
  // 帧率
  frameRate: number;
  // 房间创建时的时间戳（单位：秒）
  createTime: number;
  // 开始帧同步时的时间戳（单位：秒）
  startGameTime: number;
  // 是否禁止加入房间
  isForbidJoin: boolean;
}
```

### CreateRoomType

> 创建房间方式

```typescript
enum CreateRoomType {
  // 普通创建
  COMMON_CREATE = 0,
  // 匹配创建
  MATCH_CREATE = 1,
}
```

### FrameSyncState

> 房间帧同步状态

```typescript
enum FrameSyncState {
  // 未开始帧同步
  STOP = 0,
  // 已开始帧同步
  START = 1,
}
```

### Status

> 接口调用状态

```typescript
interface Status {
  // 成功or失败
  status: boolean;
}
```
