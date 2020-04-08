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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nNGpzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vY29uZmlnL2xvZzRqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2YsV0FBVyxFQUFFO1FBQ1gsU0FBUyxFQUFFO1lBQ1QsTUFBTSxFQUFFLFNBQVM7U0FDbEI7UUFDRCxTQUFTLEVBQUU7WUFDVCxNQUFNLEVBQUUsTUFBTTtZQUNkLFVBQVUsRUFBRSxnREFBZ0Q7WUFDNUQsU0FBUyxFQUFFLFdBQVc7WUFDdEIsWUFBWSxFQUFFLE9BQU87WUFDckIsUUFBUSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxPQUFPO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYjtRQUNELFNBQVMsRUFBRTtZQUNULE1BQU0sRUFBRSxNQUFNO1lBQ2QsVUFBVSxFQUFFLGdEQUFnRDtZQUM1RCxZQUFZLEVBQUUsT0FBTztZQUNyQixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLE9BQU87YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsTUFBTSxFQUFFLE1BQU07WUFDZCxVQUFVLEVBQUUsb0RBQW9EO1lBQ2hFLFlBQVksRUFBRSxPQUFPO1lBQ3JCLFFBQVEsRUFBRTtnQkFDUixNQUFNLEVBQUUsT0FBTzthQUNoQjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2I7UUFDRCxXQUFXLEVBQUU7WUFDWCxNQUFNLEVBQUUsTUFBTTtZQUNkLFVBQVUsRUFBRSxrREFBa0Q7WUFDOUQsWUFBWSxFQUFFLE9BQU87WUFDckIsUUFBUSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxPQUFPO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYjtRQUNELFdBQVcsRUFBRTtZQUNYLE1BQU0sRUFBRSxNQUFNO1lBQ2QsVUFBVSxFQUFFLDZCQUE2QjtZQUN6QyxZQUFZLEVBQUUsT0FBTztZQUNyQixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLE9BQU87YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsTUFBTSxFQUFFLE1BQU07WUFDZCxVQUFVLEVBQUUsNkJBQTZCO1lBQ3pDLFlBQVksRUFBRSxPQUFPO1lBQ3JCLFFBQVEsRUFBRTtnQkFDUixNQUFNLEVBQUUsT0FBTzthQUNoQjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEVBQUU7WUFDUCxNQUFNLEVBQUUsTUFBTTtZQUNkLFVBQVUsRUFBRSw4Q0FBOEM7WUFDMUQsWUFBWSxFQUFFLE9BQU87WUFDckIsUUFBUSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxPQUFPO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUM7U0FDYjtRQUNELGFBQWEsRUFBRTtZQUNiLE1BQU0sRUFBRSxNQUFNO1lBQ2QsVUFBVSxFQUFFLG1DQUFtQztZQUMvQyxZQUFZLEVBQUUsT0FBTztZQUNyQixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLE9BQU87YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQztTQUNiO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsTUFBTSxFQUFFLE1BQU07WUFDZCxVQUFVLEVBQUUsa0RBQWtEO1lBQzlELFlBQVksRUFBRSxPQUFPO1lBQ3JCLFFBQVEsRUFBRTtnQkFDUixNQUFNLEVBQUUsT0FBTzthQUNoQjtZQUNELFNBQVMsRUFBRSxDQUFDO1NBQ2I7S0FDRjtJQUNELFlBQVksRUFBRTtRQUNaLFNBQVMsRUFBRTtZQUNULFdBQVcsRUFBRTtnQkFDWCxTQUFTO2dCQUNULE9BQU87YUFDUjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsV0FBVyxFQUFFO2dCQUNYLFNBQVM7YUFDVjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsV0FBVyxFQUFFO2dCQUNYLFNBQVM7YUFDVjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsV0FBVyxFQUFFO2dCQUNYLGFBQWE7YUFDZDtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFO2dCQUNYLFdBQVc7YUFDWjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFO2dCQUNYLFdBQVc7YUFDWjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFO2dCQUNYLFdBQVc7YUFDWjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsV0FBVyxFQUFFO2dCQUNYLGFBQWE7YUFDZDtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFO2dCQUNYLFdBQVc7YUFDWjtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCO0tBQ0Y7SUFDRCxRQUFRLEVBQUUsbUJBQW1CO0lBQzdCLGdCQUFnQixFQUFFLElBQUk7SUFDdEIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsWUFBWSxFQUFFLElBQUk7Q0FDbkIsQ0FBQSJ9