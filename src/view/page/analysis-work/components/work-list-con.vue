<template>
  <Modal draggable v-model="options.showModal" title="信息查阅" width="1300" :styles="{top: '20px'}">
    <div style="width: 100%; height: 500px;">
      <div class="clear" style="height: 20pt;">
        <Select class="interval" size="small" clearable v-model="formItem.kkxzqh" placeholder="请选择卡口行政区划" @on-change="queryChange">
          <Option v-for="(value, key) in (dictionary.kkxzqh || {})" :key="key" :value="key" :label="value">{{value}}</Option>
        </Select>
        <Input class="interval" size="small" v-model="formItem.kklkmc" placeholder="请输入路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口" clearable/>
        <Select class="interval" size="small" clearable v-model="formItem.rdxzqh" placeholder="请选择热点行政区划" @on-change="queryChange">
          <Option v-for="(value, key) in (dictionary.rdxzqh || {})" :key="key" :value="key" :label="value">{{value}}</Option>
        </Select>
        <Input class="interval" size="small" v-model="formItem.rdlkmc" placeholder="请输入路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口" clearable/>
        <ButtonGroup size="small" style="padding-left:10px;">
          <Button ghost @click="search()" type="primary" icon="ios-search" :loading="formItem.kloading || formItem.rloading">搜索</Button>
          <Button ghost @click="insert()" type="success" icon="md-add" :disabled="!kk || !rd || !!isBund">绑定</Button>
          <Button ghost @click="remove()" type="error" icon="md-close" :disabled="!kk || !rd || !isBund">解绑</Button>
          <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          <Button ghost @click="noselect()" type="info" icon="ios-refresh">取消画布选择</Button>
        </ButtonGroup>
        <ButtonGroup size="small" style="padding-left:20px;">
          <Button ghost @click="cleanAll()" type="info" icon="ios-refresh" :disabled="!options.correlations || !options.correlations.length">清空关联信息</Button>
          <Button ghost @click="searchDw()" type="info" icon="ios-refresh" :disabled="!options.correlations || !options.correlations.length">预览关联信息</Button>
        </ButtonGroup>
      </div>
      <div style="height: 5pt"></div>
      <div ref="ref_1562396677465" style="height: 475px; width: 100%; overflow-y: auto;">
        <div class="clear" id="map_1569228519715" style="width: 100%;height: 100%;"></div>
      </div>
    </div>
    <div slot="footer">
      <Button type="text" size="small" @click="() => (this.$set(this.options, 'showModal', false))">取消</Button>
      <Button type="primary" size="small" @click="submit()">确定</Button>
    </div>
    <div>
      <createDrawer :options="createDrawerOptions"></createDrawer>
    </div>
  </Modal>
</template>

<script>
  import createDrawer from '../../components/connect';
  import L from 'leaflet';
  import carIcon from '@/assets/car.png';
  import imsiIcon from '@/assets/imsi.png';

  export default {
    name: 'wor-list-con',
    props: {
      options: {
        type: Object,
        default: () => ({id: null, correlations: [], _t: new Date().getTime(), showModal: true}),
      },

    },
    components: {createDrawer: createDrawer,},
    watch: {
      kk: {
        handler() {
          this.selectGL();
        },
        immediate: true
      },
      rd: {
        handler() {
          this.selectGL();
        },
        immediate: true
      },
      'options.showModal': {
        handler(curVal) {
          if (curVal && !this.$map) {
            setTimeout(() => {
              // 初始化地图
              this.$blueIcon = this.$blueIcon || L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
              this.$redIcon = this.$redIcon || L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
              this.$map = this.$map || L.map('map_1569228519715', this.$leafletOption);
              L.tileLayer(this.$tileLayerUrl).addTo(this.$map);
              this.$kkCircle = {}; // 当前选中的卡口节点所显示的圆圈
              this.$rdCircle = {}; // 当前选中的热点节点所显示的圆圈
              this.$kkMarkers = []; // 卡口节点打点集合
              this.$rdMarkers = []; // 热点节点打点集合
              this.$lines = []; // 划线内容
              // 地图初始化完成
            }, 500);
          } else {
            this.reset();
            this.queryChange();
          }
        },
        immediate: true,
      }
    },
    beforeDestroy() { // 释放前
      this.deleteAll();
    },
    mounted() {
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    data() {
      return {
        dictionary: {}, // 字典

        kk: null, // 当前选中的卡口
        rd: null, // 当前选中的热点
        isBund: false,

        formItem: {kloading: false, rloading: false,}, // 展示请求参数

        createDrawerOptions: {},
      };
    },
    methods: {
      deleteAll() {
        delete this.$kkCircle;
        delete this.$rdCircle;
        delete this.$kkMarkers;
        delete this.$rdMarkers;
        delete this.$lines;
        delete this.$map;
        delete this.$blueIcon;
        delete this.$redIcon;
      },
      queryChange() {
        // 从地图中删除已有内容
        this.$kkMarkers && this.$kkMarkers.forEach(node => this.$map && this.$map.removeLayer(node));
        this.$rdMarkers && this.$rdMarkers.forEach(node => this.$map && this.$map.removeLayer(node));
        this.$lines && this.$lines.forEach(node => this.$map && this.$map.removeLayer(node));
        [this.$kkCircle, this.$rdCircle].filter(node => node).forEach(node => this.$map && this.$map.removeLayer(node));
        // 清空marker集合
        this.$kkMarkers = [];
        this.$rdMarkers = [];
        // 清空circle
        this.$kkCircle = {};
        this.$rdCircle = {};
      },
      reset() {
        this.$set(this, 'formItem', {kloading: false, rloading: false,})
      },
      /**清空关联信息*/
      cleanAll() {
        this.$lines.forEach(node => this.$map.removeLayer(node));
        this.$set(this.options, 'correlations', []);
        this.$set(this, 'isBund', false);
      },
      /**搜索点位信息*/
      search() {
        this.queryChange();
        this.$set(this.formItem, 'kloading', true);
        this.$set(this.formItem, 'rloading', true);
        let [x, y] = [0, 0];
        this.$http.all([
          this.$http.post('/api/com/kakou/selectNodes', {xzqh: this.formItem.kkxzqh || '', lkmc: this.formItem.kklkmc || '', page: 0, size: 99999}),
          this.$http.post('/api/com/redian/selectNodes', {xzqh: this.formItem.rdxzqh || '', lkmc: this.formItem.rdlkmc || '', page: 0, size: 99999}),
        ]).then((responses) => {
          if (responses && 2 == responses.length) {
            let [kr, rr] = [responses[0], responses[1]];
            if (kr && kr.status === 200 && (kr.data.status & 0b00000111) === 0b00000001) {
              kr.data.data.forEach((_) => {
                (_.ysjdx && _.yswdy) && ([x, y] = [(x + _.yswdy) / (x && 2 || 1), (y + _.ysjdx) / (y && 2 || 1)]);
                let marker = L.marker([_.hxwdy, _.hxjdx,], {icon: this.$blueIcon})
                  .bindPopup(`编号:${_.kkbh}</br>名称:${_.lkmc}</br>经度:${_.ysjdx}</br>维度:${_.yswdy}`)
                  .on('click', () => {
                    this.$set(this, 'kk', _);
                    (this.$kkCircle) && (this.$map.removeLayer(this.$kkCircle));
                    this.$kkCircle = L.circle([_.hxwdy, _.hxjdx,], {color: 'blue', fillColor: '#f1a219c4', fillOpacity: 0.1, radius: 200}).addTo(this.$map);
                  });
                this.$kkMarkers.push(marker);
              });
              this.$kkMarkers.forEach((_) => _.addTo(this.$map));
            }
            if (rr && rr.status === 200 && (rr.data.status & 0b00000111) === 0b00000001) {
              rr.data.data.forEach((_) => {
                (_.ysjdx && _.yswdy) && ([x, y] = [(x + _.yswdy) / (x && 2 || 1), (y + _.ysjdx) / (y && 2 || 1)]);
                let marker = L.marker([_.hxwdy, _.hxjdx,], {icon: this.$redIcon})
                  .bindPopup(`编号:${_.rdbh}</br>名称:${_.lkmc}</br>经度:${_.ysjdx}</br>维度:${_.yswdy}`)
                  .on('click', () => {
                    this.$set(this, 'rd', _);
                    (this.$rdCircle) && (this.$map.removeLayer(this.$rdCircle));
                    this.$rdCircle = L.circle([_.hxwdy, _.hxjdx,], {color: 'red', fillColor: '#f1a219c4', fillOpacity: 0.1, radius: 200}).addTo(this.$map);
                  });
                this.$rdMarkers.push(marker);
              });
              this.$rdMarkers.forEach((_) => _.addTo(this.$map));
            }
          }
          this.$set(this.formItem, 'kloading', false);
          this.$set(this.formItem, 'rloading', false);
          (0 != x && 0 != y) && (this.$map.panTo([x, y]));
        }).catch(() => {
          this.$set(this.formItem, 'kloading', false);
          this.$set(this.formItem, 'rloading', false);
        });
      },
      /**取消选择*/
      noselect() {
        this.$lines.forEach(node => this.$map.removeLayer(node));
        [this.$kkCircle, this.$rdCircle].forEach(node => this.$map.removeLayer(node));
        this.$set(this, 'kk', null);
        this.$set(this, 'rd', null);
      },
      /**获取关联信息*/
      selectGL() {
        if (this.rd && this.kk) {
          this.$lines.forEach(node => this.$map.removeLayer(node));
          if (-1 < this.options.correlations.indexOf(`${this.kk.kkbh}->${this.rd.rdbh}`)) {
            let lineObject = L.polyline([[this.kk.hxwdy, this.kk.hxjdx], [this.rd.hxwdy, this.rd.hxjdx]], {color: '#000000'}).addTo(this.$map);
            this.$lines.push(lineObject);
            this.$set(this, 'isBund', true);
          } else {
            this.$set(this, 'isBund', false);
          }
        }
      },
      /**
       * 查询点位信息.
       */
      searchDw() {
        //*[`卡口点位->热点点位`,`卡口点位->热点点位`,......]*/
        let peers = this.options.correlations || [];
        //*[[/*卡口点位, 热点点位*/],[/*卡口点位, 热点点位*/],[/*卡口点位, 热点点位*/],......]*/
        let peerpeers = peers.map(__ => __.split('->')).filter(__ => 2 === __.length).map(__ => [__[0].split(','), __[1].split(',')]);
        this.$set(this, 'createDrawerOptions', {kakouXhs: undefined, redianXhs: undefined, correlations: peerpeers, _t: new Date().getTime()});
      },
      /**添加关联*/
      insert() {
        if (this.rd && this.kk) {
          if (-1 === this.options.correlations.indexOf(`${this.kk.kkbh}->${this.rd.rdbh}`)) {
            this.options.correlations.push(`${this.kk.kkbh}->${this.rd.rdbh}`);
            this.selectGL();
          }
        }
      },
      /**移除关联*/
      remove() {
        if (this.rd && this.kk) {
          if (-1 < this.options.correlations.indexOf(`${this.kk.kkbh}->${this.rd.rdbh}`)) {
            this.options.correlations.splice(this.options.correlations.indexOf(`${this.kk.kkbh}->${this.rd.rdbh}`), 1);
            this.selectGL();
          }
        }
      },
      /**保存修改*/
      submit() {
        let args = {id: this.options.id, correlations: (this.options.correlations || []).join(',')};
        this.$http.post('/api/com/task/simple/updateCorrelations', args).then((response) => {
          if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
            this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
            this.$set(this.options, 'showModal', false);
            this.$emit('on-ok');
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
          }
        }).catch(() => {
        });
      },
    },
  }
</script>
