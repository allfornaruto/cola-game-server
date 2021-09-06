module.exports = {
  development: {
    gate: [
      {
        id: "gate-server-1",
        host: "127.0.0.1",
        clientPort: 3100,
        frontend: true,
        args: " --inspect=10001",
      },
    ],
    connector: [
      {
        id: "connector-server-1",
        host: "127.0.0.1",
        port: 4200,
        clientHost: "www.allfornaruto.cn",
        clientPort: 3200,
        frontend: true,
        args: " --inspect=10010",
      },
      {
        id: "connector-server-2",
        host: "127.0.0.1",
        port: 4201,
        clientHost: "www.allfornaruto.cn",
        clientPort: 3201,
        frontend: true,
        args: " --inspect=10011",
      },
    ],
    game: [
      {
        id: "game-server-1",
        host: "127.0.0.1",
        port: 3300,
        args: "--inspect=10020",
      },
    ],
  },
  production: {
    gate: [
      {
        id: "gate-server-1",
        host: "127.0.0.1",
        clientPort: 3100,
        frontend: true,
        args: " --inspect=10001",
      },
    ],
    connector: [
      {
        id: "connector-server-1",
        host: "127.0.0.1",
        port: 4200,
        clientHost: "www.allfornaruto.cn",
        clientPort: 3200,
        frontend: true,
        args: " --inspect=10010",
      },
      {
        id: "connector-server-2",
        host: "127.0.0.1",
        port: 4201,
        clientHost: "www.allfornaruto.cn",
        clientPort: 3201,
        frontend: true,
        args: " --inspect=10011",
      },
    ],
    game: [
      {
        id: "game-server-1",
        host: "127.0.0.1",
        port: 3300,
        args: "--inspect=10020",
      },
    ],
  },
};
