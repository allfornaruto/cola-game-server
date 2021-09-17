"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestUtils;
(function (TestUtils) {
    TestUtils.getLog = (customData) => {
        const data = customData;
        return (message, payload) => {
            try {
                console.log(JSON.stringify(Object.assign({}, data, { message, payload: payload ? JSON.stringify(payload) : "" })));
            }
            catch (e) {
                console.error(e);
            }
        };
    };
})(TestUtils || (TestUtils = {}));
exports.default = TestUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvdGVzdFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBVSxTQUFTLENBV2xCO0FBWEQsV0FBVSxTQUFTO0lBQ0osZ0JBQU0sR0FBRyxDQUFDLFVBQWUsRUFBRSxFQUFFO1FBQ3hDLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUN4QixPQUFPLENBQUMsT0FBZSxFQUFFLE9BQWdCLEVBQUUsRUFBRTtZQUMzQyxJQUFJO2dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEg7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQVhTLFNBQVMsS0FBVCxTQUFTLFFBV2xCO0FBRUQsa0JBQWUsU0FBUyxDQUFDIn0=