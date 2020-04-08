module.exports = {
  "appenders": {
    "console": {
      "type": "console"
    },
    "con-log": {
      "type": "file",
      "filename": "${opts:base}/logs/con-log-${opts:serverId}.log",
      "pattern": "connector",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "rpc-log": {
      "type": "file",
      "filename": "${opts:base}/logs/rpc-log-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "forward-log": {
      "type": "file",
      "filename": "${opts:base}/logs/forward-log-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "rpc-debug": {
      "type": "file",
      "filename": "${opts:base}/logs/rpc-debug-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "crash-log": {
      "type": "file",
      "filename": "${opts:base}/logs/crash.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "admin-log": {
      "type": "file",
      "filename": "${opts:base}/logs/admin.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "pinus": {
      "type": "file",
      "filename": "${opts:base}/logs/pinus-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "pinus-admin": {
      "type": "file",
      "filename": "${opts:base}/logs/pinus-admin.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    },
    "pinus-rpc": {
      "type": "file",
      "filename": "${opts:base}/logs/pinus-rpc-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5
    }
  },
  "categories": {
    "default": {
      "appenders": [
        "console",
        "pinus"
      ],
      "level": "info"
    },
    "con-log": {
      "appenders": [
        "con-log"
      ],
      "level": "info"
    },
    "rpc-log": {
      "appenders": [
        "rpc-log"
      ],
      "level": "info"
    },
    "forward-log": {
      "appenders": [
        "forward-log"
      ],
      "level": "info"
    },
    "rpc-debug": {
      "appenders": [
        "rpc-debug"
      ],
      "level": "info"
    },
    "crash-log": {
      "appenders": [
        "crash-log"
      ],
      "level": "info"
    },
    "admin-log": {
      "appenders": [
        "admin-log"
      ],
      "level": "info"
    },
    "pinus-admin": {
      "appenders": [
        "pinus-admin"
      ],
      "level": "info"
    },
    "pinus-rpc": {
      "appenders": [
        "pinus-rpc"
      ],
      "level": "info"
    }
  },
  "prefix": "${opts:serverId} ",
  "replaceConsole": true,
  "lineDebug": false,
  "errorStack": true
}
