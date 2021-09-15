namespace TestUtils {
  export const getLog = (customData: any) => {
    const data = customData;
    return (message: string, payload?: object) => {
      try {
        console.log(JSON.stringify(Object.assign({}, data, { message, payload: payload ? JSON.stringify(payload) : "" })));
      } catch (e) {
        console.error(e);
      }
    };
  };
}

export default TestUtils;
