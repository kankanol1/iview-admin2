/*
迁移时间: 2019/03/07 15:00
作者: Shengjun Liu
*/
import Axios from 'axios'

const Qs = require('querystring');

// `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
// 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
Axios.defaults.baseURL = '';

Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

Axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'

// 跨域请求时是否需要使用凭证
Axios.defaults.withCredentials = true

// `responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
Axios.defaults.responseType = 'json'

// `paramsSerializer` 是一个负责 `params` 序列化的函数
Axios.defaults.paramsSerializer = (params) => {
  // console.log("Axios.defaults.paramsSerializer")
  if (params && typeof(params) !== 'string' && params._dataType !== 'Map') {
    return Qs.stringify(params)
  } else {
    return params;
  }
}

// `validateStatus` 定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 rejecte
Axios.defaults.validateStatus = (status) => {
  return status === 200;
  // return status >= 200 && status < 300; // 默认的
}

const CancelToken = Axios.CancelToken;

// 取消请求执行方法
// var cancel;
// `cancelToken` 指定用于取消请求的 cancel token
// Axios.defaults.cancelToken = new CancelToken((c) => {
//     cancel = c;
// })

let IGNORE = ['/api/self/logon', '/api/self/infomation', '/api/system/common/timestamp'];

// 添加请求拦截器
Axios.interceptors.request.use(
  (config) => {
    // console.log("Axios.interceptors.request.request")
    if (config.method === 'post') {
      if (config.data && typeof(config.data) === "object" && config.data._dataType !== 'Map') {
        config.data = Qs.stringify(config.data);
      }
    }
    // 用户登陆正常, 则全部释放
    if (sessionStorage.getItem("userInfo")) {
      return config;
    } else {
      // 用户请求登陆, 则释放
      if (IGNORE.indexOf(config.url) >= 0) {
        return config;
      } else {
        window.location.href = '/home';
        config.cancelToken = new CancelToken((c) => c("取消执行."));
        return config;
      }
    }
  },
  (error) => {
    // console.log("Axios.interceptors.request.error")
    return Promise.reject(error)
  }
)

const Message = require('iview').Message;

// 添加响应拦截器
Axios.interceptors.response.use(
  (response) => {
    // console.log("Axios.interceptors.response.response")
    return response;
  },
  (error) => {
    // console.log("Axios.interceptors.response.error")
    if (error.response) {
      switch (error.response.status) {
        case 401:
          window.location.href = '/login';
          break;
        case 403:
          Message.warning({closable: true, duration: 2, content: '暂无权限，请确认!',});
          break;
        default:
          Message.warning({closable: true, duration: 2, content: '请求失败，请重试!',});
          break;
      }
    } else {
      Message.warning({closable: true, duration: 2, content: '网络连接失败，请重试!',});
    }
    return Promise.reject(error);
  }
)

export default Axios
