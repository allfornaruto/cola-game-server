/**
 * 客户端指令
 */
export default class Command {
  // 用户Id
  public playerId: string;
  // 用户帧内容
  public direction: string;
  // 第几帧
  public stepTime: number;

  public constructor(playerId: string, direction: string, stepTime: number) {
    this.playerId = playerId;
    this.direction = direction;
    this.stepTime = stepTime;
  }
}
