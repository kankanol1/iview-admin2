// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import {directive as clickOutside} from 'v-click-outside-x'
import installPlugin from '@/plugin'
import './index.less'
// import "../my-theme/dist/iview.css";
import '@/assets/icons/iconfont.css'
import TreeTable from 'tree-table-vue'
import VOrgTree from 'v-org-tree'
import 'v-org-tree/dist/v-org-tree.css'

import Axios from './axios/index';
// import Axios from '@/libs/api.request';
// import Axios from '@/libs/api.request';
import 'leaflet/dist/leaflet.css';

Vue.prototype.$http = Axios;


// 实际打包时应该不引入mock
/* eslint-disable */
if (process.env.NODE_ENV !== 'production') require('@/mock')

Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(TreeTable)
Vue.use(VOrgTree)

Vue.prototype.$setTableHeight = ()=> {
  if (document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline").length > 0) {
    const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
      document.getElementsByClassName("ivu-page mini")[0].offsetHeight -
      document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;
    return  height;
  }else{
    return 0;
  }
}



/**
 * @description 注册admin内置插件
 */
installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
/**
 * 注册指令
 */
importDirective(Vue)
Vue.directive('clickOutside', clickOutside)

// 模块信息
Vue.prototype.$models = {1: '人车拟合', 2: '制毒窝点'};

// 默认分页大小
Vue.prototype.$pageSizeOpts = [100, 200, 500, 1000, 2000];
// 默认分页信息
Vue.prototype.$pageInfo = {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,};
// 顶级行政区划
Vue.prototype.$regioncode = '371300000000';

// 地图地址
Vue.prototype.$leafletOption = {
  center: [35.112697, 118.367292,],
  zoom: 10,
  minZoom: 3,
  maxZoom: 19,
  zoomReverse: false,
  zoomControl: false,
  attributionControl: false,
  preferCanvas: true,
  keyboard: true,
};
Vue.prototype.$tileLayerUrl = 'http://mt3.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil';
// Vue.prototype.$tileLayerUrl = '/api/sys/map/selectNodes?x={x}&y={y}&z={z}';
// Vue.prototype.$tileLayerUrl = 'http://p3.map.gtimg.com/maptilesv2/{z}/{Math.Floor(x / 16.0)}/{Math.Floor(y / 16.0)}/{x}_{y}.png';

const Message = require('iview').Message;
Vue.prototype.$copyToClip = (content, message) => {
  let aux = document.createElement('input');
  aux.setAttribute('value', content);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand('copy');
  document.body.removeChild(aux);
  if (!message) {
    Message.success({closable: true, duration: 1, content: '复制成功',});
  } else {
    Message.success({closable: true, duration: 1, content: message,});
  }
},

  Date.prototype.format = function (format) {
    // yyyy-MM-dd HH:mm:ss.SSS
    let date = {
      "yyyy": `${this.getFullYear()}`,
      "yy": (`${this.getFullYear()}`).substr(2),
      "MM": this.getMonth() + 1 < 10 ? `0${this.getMonth() + 1}` : `${this.getMonth() + 1}`,
      "dd": this.getDate() < 10 ? `0${this.getDate()}` : `${this.getDate()}`,
      "HH": this.getHours() < 10 ? `0${this.getHours()}` : `${this.getHours()}`,
      "mm": this.getMinutes() < 10 ? `0${this.getMinutes()}` : `${this.getMinutes()}`,
      "m": this.getMinutes() < 10 ? `0` : `${parseInt(this.getMinutes() / 10)}`,
      "ss": this.getSeconds() < 10 ? `0${this.getSeconds()}` : `${this.getSeconds()}`,
      "SSS": this.getMilliseconds() < 100 ? (this.getMilliseconds() < 10 ? `00${this.getMilliseconds()}` : `0${this.getMilliseconds()}`) : `${this.getMilliseconds()}`,
      "SS": (this.getMilliseconds() < 100 ? (this.getMilliseconds() < 10 ? `00${this.getMilliseconds()}` : `0${this.getMilliseconds()}`) : `${this.getMilliseconds()}`).substr(0, 2),
      "S": (this.getMilliseconds() < 100 ? (this.getMilliseconds() < 10 ? `00${this.getMilliseconds()}` : `0${this.getMilliseconds()}`) : `${this.getMilliseconds()}`).substr(0, 1),
    };
    for (let k in date) {
      if (format.indexOf(k) > -1) {
        format = format.replace(k, date[k]);
      }
    }
    return format;
  }

Vue.prototype.$createTooltip = (h, params, placement, slotMaps, content) => {
  let slot = slotMaps && Object.keys(slotMaps).length ? Object.keys(slotMaps).map(_ => h('p', {}, `${_}: ${slotMaps[_]}`)) : [];
  return h('Tooltip', {props: {placement: placement, maxWidth: '300', transfer: true}}, [h('div', {slot: 'content',}, slot), h('div', {}, content)]);
}

window.compile = (code) => {
  if (code === '') return '';
  let content = String.fromCharCode(code.charCodeAt(0) + code.length);
  for (let i = 1; i < code.length; i++) {
    content += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
  }
  return content;
}

window.uncompile = (code) => {
  let content = String.fromCharCode(code.charCodeAt(0) - code.length);
  for (let i = 1; i < code.length; i++) {
    content += String.fromCharCode(code.charCodeAt(i) - content.charCodeAt(i - 1));
  }
  return content;
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
