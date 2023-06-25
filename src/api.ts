import axios, { AxiosInstance} from 'axios';
let proxyExists = false

// 创建 Axios 实例
export const api: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3000', // 设置 API 的基础 URL
  timeout: 5000, // 设置请求超时时间
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  // },
});

// 检查代理是否存在，并根据情况进行配置
if (proxyExists) {
  api.defaults.proxy = {
    host: 'your-proxy-host', // 设置代理的主机名
    port: 8080, // 设置代理的端口号
    // 可根据需要添加其他代理配置，例如身份验证等
  };
}

export async function getGameId(address:string,accessCode:string): Promise<string> {
  try {
    // GET 请求带参数
    const params = { pubkey: address, access_code: accessCode };
    const response = await api.get("/join",{params:params});
    if(response.status == 200){
      console.log("getGameId:",response.data.JoinResult.game_id)
      return response.data.JoinResult.game_id
    }
  } catch (error) {
    console.error('Error:', error);
    return ""
  }
}

export async function pollGetGameId(address:string): Promise<string> {
  try {
    // GET 请求带参数
    const url = `/join/${address}`
    const response = await api.get(url);
    if(response.status == 200){
      console.log("pollGetGameId:",response.data.JoinResult.game_id)
      return response.data.JoinResult.game_id
    }
    return 
  } catch (error) {
    console.error('Error:', error);
    return ""
  }
}

