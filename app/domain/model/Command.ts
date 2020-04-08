// 客户端指令
export default class Command {
    // 用户名
    public playerName: string;
    // 具体指令
    public direction: number;
    // 第几帧
    public stepTime: number;

    public constructor(playerName: string, direction: number, stepTime: number) {
        this.playerName = playerName;
        this.direction = direction;
        this.stepTime = stepTime;
    }
}
