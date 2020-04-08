module.exports = {
    "development": {
        "gate": [{
                "id": "gate-server-1",
                "host": "127.0.0.1",
                "clientPort": 3100,
                "frontend": true,
                "args": " --inspect=10001"
            }],
        "connector": [{
                "id": "connector-server-1",
                "host": "127.0.0.1",
                "port": 4200,
                "clientHost": "127.0.0.1",
                "clientPort": 3200,
                "frontend": true,
                "args": " --inspect=10010"
            }, {
                "id": "connector-server-2",
                "host": "127.0.0.1",
                "port": 4202,
                "clientHost": "127.0.0.1",
                "clientPort": 3202,
                "frontend": true,
                "args": " --inspect=10011"
            }],
        "game": [{
                "id": "game-server-1",
                "host": "127.0.0.1",
                "port": 3300,
                "args": "--inspect=10020"
            }]
    },
    "production": {
        "gate": [{
                "id": "gate-server-1",
                "host": "127.0.0.1",
                "clientPort": 3100,
                "frontend": true,
                "args": " --inspect=10001"
            }],
        "connector": [{
                "id": "connector-server-1",
                "host": "127.0.0.1",
                "port": 4200,
                "clientHost": "127.0.0.1",
                "clientPort": 3200,
                "frontend": true,
                "args": " --inspect=10010"
            }, {
                "id": "connector-server-2",
                "host": "127.0.0.1",
                "port": 4201,
                "clientHost": "127.0.0.1",
                "clientPort": 3201,
                "frontend": true,
                "args": " --inspect=10011"
            }],
        "game": [{
                "id": "game-server-1",
                "host": "127.0.0.1",
                "port": 3300,
                "args": "--inspect=10020"
            }]
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2NvbmZpZy9zZXJ2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDZixhQUFhLEVBQUU7UUFDYixNQUFNLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsZUFBZTtnQkFDckIsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsTUFBTSxFQUFFLGtCQUFrQjthQUMzQixDQUFDO1FBQ0YsV0FBVyxFQUFFLENBQUM7Z0JBQ1osSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE1BQU0sRUFBRSxJQUFJO2dCQUNaLFlBQVksRUFBRSxXQUFXO2dCQUN6QixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLE1BQU0sRUFBRSxrQkFBa0I7YUFDM0IsRUFBRTtnQkFDRCxJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixNQUFNLEVBQUUsV0FBVztnQkFDbkIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsTUFBTSxFQUFFLGtCQUFrQjthQUMzQixDQUFDO1FBQ0YsTUFBTSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsaUJBQWlCO2FBQzFCLENBQUM7S0FDSDtJQUNELFlBQVksRUFBRTtRQUNaLE1BQU0sRUFBRSxDQUFDO2dCQUNQLElBQUksRUFBRSxlQUFlO2dCQUNyQixNQUFNLEVBQUUsV0FBVztnQkFDbkIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixNQUFNLEVBQUUsa0JBQWtCO2FBQzNCLENBQUM7UUFDRixXQUFXLEVBQUUsQ0FBQztnQkFDWixJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixNQUFNLEVBQUUsV0FBVztnQkFDbkIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsTUFBTSxFQUFFLGtCQUFrQjthQUMzQixFQUFFO2dCQUNELElBQUksRUFBRSxvQkFBb0I7Z0JBQzFCLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixNQUFNLEVBQUUsSUFBSTtnQkFDWixZQUFZLEVBQUUsV0FBVztnQkFDekIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixNQUFNLEVBQUUsa0JBQWtCO2FBQzNCLENBQUM7UUFDRixNQUFNLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsZUFBZTtnQkFDckIsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxpQkFBaUI7YUFDMUIsQ0FBQztLQUNIO0NBQ0YsQ0FBQSJ9