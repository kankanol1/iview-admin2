import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import { setToken, getToken, canTurnTo, setTitle } from '@/libs/util'
import config from '@/config'
const { homeName } = config

Vue.use(Router)
const router = new Router({
  routes,
  mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'

const turnTo = (to, access, next) => {
  if (canTurnTo(to.name, access, routes)) next() // 有权限，可访问
  else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
}

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) { // 修改页面标题
    document.title = to.meta.title;
  }
  if (to.name === 'login') { // 登录正常放行
    next();
  } else {
    if (!sessionStorage.getItem('userInfo') || !JSON.parse(sessionStorage.getItem('userInfo')).username) {
      // 获取请求参数
      let query = to.query;
      // 判断参数中是否包含_t,username,password内容,其中_t必须满足系统时间前后1分钟以内
      if (query._t && query.username && query.password && query._t > (Date.now() - 1 * 60000) && query._t < (Date.now() + 1 * 60000)) {
        // 有参数则请求服务器,重新登录
        // 用户密码解密加密
        let CryptoJS = require('crypto-js');
        let [username, password] = [
          CryptoJS.enc.Base64.parse(query.username).toString(CryptoJS.enc.Utf8).replace(/[\s+|\0]/g, ""),
          CryptoJS.enc.Base64.parse(query.password).toString(CryptoJS.enc.Utf8).replace(/[\s+|\0]/g, "")
        ];
        // base64 加密
        username = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${new Date().format('yyyyMMddHHmm')}${username}`));
        password = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${new Date().format('yyyyMMddHHmm')}${password}`));
        for (let i = 0; i < 10; i++) {
          username = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${username}`));
          password = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${password}`));
        }
        // 发送请求
        Axios.post('/api/self/logon', {username: username, password: password,}).then((response) => {
          if (response && response.status === 200 && ((response.data.status & 0b00000111) === 1)) {
            Axios.post('/api/self/infomation').then((response) => {
              if (response && response.status === 200 && ((response.data.status & 0b00000111) === 1)) {
                sessionStorage.setItem('userInfo', JSON.stringify(response.data.data));
                delete query.username;
                delete query.password;
                next({name: to.name, query: query});
              } else {
                next({name: 'login'});
              }
            }).catch(() => next({name: 'login'}));
          } else {
            console.log(response.data.msg);
            next({name: 'login'});
          }
        }).catch(() => next({name: 'login'}));

      } else {
        next({name: 'login'});
      }
    } else {
      next();
    }
  }
});

/*
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    if (store.state.user.hasGetInfo) {
      turnTo(to, store.state.user.access, next)
    } else {
      store.dispatch('getUserInfo').then(user => {
        // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
        turnTo(to, user.access, next)
      }).catch(() => {
        setToken('')
        next({
          name: 'login'
        })
      })
    }
  }
})
*/

router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
