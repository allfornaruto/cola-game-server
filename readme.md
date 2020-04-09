# cola-game-server

## 安装、运行、测试

```shell
npm install
npm run start
npm run test
```

## 客户端JS-SDK文档

### 初始化并与服务器建立WebSocket连接

> new ColaClient(init, options)

* init  `{Cola.Init}`  初始化必传参数
	* gameId `{string}` 游戏ID
	* playerInfo `{Cola.PlayerInfo}` 玩家信息
		* uid `{string}` 用户uid
		* gameId `{string}` 游戏ID
		* name `{string}` 游戏用户昵称
		* teamId `{string}` 房间内队伍ID
		* customPlayerStatus `{number}` 自定义玩家状态
		* customProfile `{string}` 自定义玩家信息
		* matchAttributes `{Cola.MatchAttribute}` 匹配属性列表
			* name `{string}` 属性名称
			* value `{number}` 属性值
	* gateHost `{string}` 游戏服务器地址
	* gatePort `{number}` 游戏服务器端口
* options  `{Cola.ColaOptions}` 初始化可选参数
	* debug `{boolean}` 是否开启日志调试，默认false

```typescript
import ColaClient from "./tests/client/Cola";
import { Cola } from "./types/Cola";

const playerInfo: Cola.PlayerInfo = {
  uid: "111111",
  gameId: "dnf",
  name: "测试用户-A",
  teamId: "1",
  customPlayerStatus: 0,
  customProfile: JSON.stringify({ hp: 100, mp: 80 }),
  matchAttributes: []
};
const init: Cola.Init = {
  gateHost: "127.0.0.1",
  gatePort: 3100,
  gameId: "dnf",
  playerInfo: playerInfo
};
const options: Cola.ColaOptions = {
  debug: true
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
```

### 玩家进入游戏大厅

```typescript
await cola.enterHall();
```

### 玩家创建房间

```typescript
const myRoom: Cola.Params.CreateRoom = {
  name: "room-1977",
  type: "0",
  createType: 0,
  maxPlayers: 2,
  isPrivate: false,
  customProperties: "",
  teamList: [],
};
const roomInfo: Cola.Room = await cola.createRoom(myRoom);
```

### 进入房间

> enterRoom(rid: string): Promise<Cola.Room>

* rid `{string}` 房间ID

```typescript
const roomInfo: Cola.Room = await cola.enterRoom(rid);
```

### 在房间内发送消息给指定用户

> sendMsg(uidList: string[], content: string): Promise<Cola.Status>

* uidList `{string[]}` 用户uid数组
* content `{string}` 发送内容

```typescript
const sendResult: Cola.Status = await cola.sendMsg(["222222"], "Hello cola");
```

## Cola类型文档

### Init

> Cola客户端初始化参数

```typescript
interface Init {
	// 游戏ID
	gameId: string;
	// 玩家信息
	playerInfo: PlayerInfo;
	// 游戏服务器地址
	gateHost: string;
	// 游戏服务器端口
	gatePort: number;
}
```

### Event

> 事件监听类型

```typescript
type Event = "io-error" | "close" | "onKick" | "heartbeat timeout" | "onRoomCreate" | "onHallAdd" | "onRoomAdd" | "onChat";
```

### EventRes.OnHallAdd

> 玩家加入大厅事件

```typescript
interface OnHallAdd extends PlayerInfo {

}
```

### EventRes.OnRoomCreate

> 房间创建事件

```typescript
interface OnRoomCreate extends Room {

}
```

### EventRes.OnRoomAdd

> 玩家加入房间事件

```typescript
interface OnRoomAdd extends PlayerInfo {

}
```

### EventRes.OnKick

> 玩家离开房间事件

```typescript
interface OnKick {
	// 用户uid
	uid: string;
	// 房间id
	rid: string;
}
```

### EventRes.OnChat

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

### Params.CreateRoom

>  创建房间请求参数

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
}
```

### CreateRoomType

> 创建房间方式

```typescript
enum CreateRoomType {
	// 普通创建
	COMMON_CREATE = 0,
	// 匹配创建
	MATCH_CREATE = 1
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
	MATCH_CREATE = 1
}
```

### FrameSyncState

> 房间帧同步状态

```typescript
enum FrameSyncState {
	// 未开始帧同步
	STOP = 0,
	// 已开始帧同步
	START = 1
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

## 服务端文档

> TODO


