<template>
  <div style="width: 100%;height: 100%;">
    <div class="clear" style="width: 100%;height: 20pt;">
      <Select class="interval" size="small" clearable v-model="formItem.kakouRegionCode" placeholder="请选择卡口行政区划" @on-change="queryChange">
        <Option v-for="(value, key) in (dictionary.kkxzqh || {})" :key="key" :value="key" :label="value">{{value}}</Option>
      </Select>
      <Input class="interval" size="small" v-model="formItem.kakouRoadName" placeholder="请输入路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口" @on-change="queryChange" clearable/>
      <Select class="interval" size="small" clearable v-model="formItem.redianRegionCode" placeholder="请选择热点行政区划" @on-change="queryChange">
        <Option v-for="(value, key) in (dictionary.rdxzqh || {})" :key="key" :value="key" :label="value">{{value}}</Option>
      </Select>
      <Input class="interval" size="small" v-model="formItem.redianRoadName" placeholder="请输入路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口" @on-change="queryChange" clearable/>
      <ButtonGroup size="small" style="padding-left:10px;">
        <Button ghost @click="search()" type="primary" icon="ios-search" :loading="formItem.kakouLoading || formItem.redianLoading">搜索</Button>
        <Button ghost @click="insert()" type="success" icon="md-add" :disabled="!kakouCache || !redianCache || !!isBund">绑定</Button>
        <Button ghost @click="remove()" type="error" icon="md-close" :disabled="!kakouCache || !redianCache || !isBund">解绑</Button>
        <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
        <Button ghost @click="noselect()" type="info" icon="ios-refresh">取消选择</Button>
      </ButtonGroup>
    </div>
    <div style="height: 5pt;"></div>
    <div style="height: 505pt; overflow-y: auto;">
      <div class="clear" id="map_1581472329131" style="width: 100%;height: 100%;"></div>
    </div>
  </div>
</template>

<script>

  import L from 'leaflet';
  import carIcon from '@/assets/car.png';
  import imsiIcon from '@/assets/imsi.png';

  export default {
    name: 'XXXX',
    watch: {
      kakouCache: {
        handler() {
          this.selectGL();
        },
        immediate: true
      },
      redianCache: {
        handler() {
          this.selectGL();
        },
        immediate: true
      },
    },
    props: {
      options: {type: Object, default: () => ({}),}
    },
    beforeCreate() { // 创建前
    },
    beforeDestroy() { // 释放前
      this.release();
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

        kakouCache: null, // 当前选中的卡口
        redianCache: null, // 当前选中的热点
        isBund: false,

        formItem: {kakouLoading: false, redianLoading: false,}, // 展示请求参数
      };
    },
    methods: {
      init() {
        this.release();
        if (!this.$map) {
          setTimeout(() => {
            // 初始化地图
            this.$blueIcon = L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
            this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
            this.$map = L.map('map_1581472329131', this.$leafletOption);
            this.$map.invalidateSize(true);
            // this.$map.addEventListener('moveend', () => { console.log("xu tie xia") });
            L.tileLayer(this.$tileLayerUrl).addTo(this.$map);
            this.$currentKakouCircle = {}; // 当前选中的卡口节点所显示的圆圈
            this.$currentRedianCircle = {}; // 当前选中的节点所显示的圆圈
            this.$kakouMarkers = []; // 卡口节点打点集合
            this.$redianMarkers = []; // 热点节点打点集合
            this.$lines = []; // 划线内容
            // 地图初始化完成
          }, 500);
        }
      },
      release() {
        delete this.$currentKakouCircle;
        delete this.$currentRedianCircle;
        delete  this.$kakouMarkers;
        delete this.$redianMarkers;
        delete this.$lines;
        (this.$map) && (this.$map.remove());
        delete this.$map;
        delete  this.$blueIcon;
        delete  this.$redIcon;
      },
      queryChange() {
        // 从地图中删除已有内容
        [...this.$kakouMarkers, ...this.$redianMarkers, ...this.$lines].forEach(node => this.$map.removeLayer(node));
        [this.$currentKakouCircle, this.$currentRedianCircle].forEach(node => this.$map.removeLayer(node));
        // 清空marker集合
        [this.$kakouMarkers, this.$redianMarkers] = [[], []]; // 卡口节点打点集合, 热点节点打点集合
        // 清空circle
        [this.$currentKakouCircle, this.$currentRedianCircle] = [{}, {}]; // 当前选中的卡口节点, 热点节点所显示的圆圈
      },
      reset() {
        this.$set(this, 'formItem', {kakouLoading: false, redianLoading: false,});
      },
      search() {
        this.queryChange();
        ['kakouLoading', 'redianLoading'].forEach(__ => this.$set(this.formItem, __, true));
        let [x, y] = [118.367292, 35.112697];
        this.$http.all([
          this.$http.post('/api/com/kakou/selectNodes', {regionCode: this.formItem.kakouRegionCode || '', roadName: this.formItem.kakouRoadName || '', page: 0, size: 99999}),
          this.$http.post('/api/com/redian/selectNodes', {regionCode: this.formItem.redianRegionCode || '', roadName: this.formItem.redianRoadName || '', page: 0, size: 99999}),
        ]).then((responses) => {
          if (responses) {
            let nodes = [];
            if (1 <= responses.length && responses[0].status === 200 && (responses[0].data.status & 0b00000111) === 0b00000001) {
              (responses[0].data.data) && nodes.push({
                arg: 'kakouCache',
                circle: '$currentKakouCircle',
                markers: '$kakouMarkers',
                color: 'blue',
                icon: this.$blueIcon,
                data: responses[0].data.data
              });
            }
            if (2 <= responses.length && responses[1].status === 200 && (responses[1].data.status & 0b00000111) === 0b00000001) {
              (responses[1].data.data) && nodes.push({
                arg: 'redianCache',
                circle: '$currentRedianCircle',
                markers: '$redianMarkers',
                color: 'red',
                icon: this.$redIcon,
                data: responses[1].data.data
              });
            }
            nodes.forEach(task => {
              this[task.markers] = task.data.map(node => {
                (node.wgsLongitude && node.wgsLatitude) && ([x, y] = [(x + node.wgsLongitude) / (x && 2 || 1), (y + node.wgsLatitude) / (y && 2 || 1)]);
                let marker = L.marker([node.gcjLatitude, node.gcjLongitude,], {icon: task.icon})
                  .bindPopup(`编号:${node.pointCode}</br>名称:${node.roadName}</br>经度:${node.wgsLongitude}</br>维度:${node.wgsLatitude}</br>最后更新时间:${node.lastUpdateTime}`)
                  .on('click', () => {
                    this.$set(this, task.arg, node);
                    (this[task.circle]) && (this.$map.removeLayer(this[task.circle]));
                    this[task.circle] = L.circle([node.gcjLatitude, node.gcjLongitude,], {
                      color: task.color, fillColor: '#f1a219c4', fillOpacity: 0.1, radius: 200
                    }).addTo(this.$map);
                  });
                return marker;
              });
              this[task.markers].forEach((_) => _.addTo(this.$map));
            });
          }
          (x && y) && (this.$map.panTo([y, x]));
          ['kakouLoading', 'redianLoading'].forEach(__ => this.$set(this.formItem, __, false));
        }).catch(() => {
          ['kakouLoading', 'redianLoading'].forEach(__ => this.$set(this.formItem, __, false));
        });
      },
      noselect() {
        [...this.$lines, this.$currentKakouCircle, this.$currentRedianCircle].forEach(node => this.$map.removeLayer(node));
        ['kakouCache', 'redianCache'].forEach(__ => this.$set(this, __, null));
      },
      selectGL() {
        if (this.kakouCache || this.redianCache) {
          this.$lines.forEach(node => this.$map.removeLayer(node));
          let [kakouPointCode, redianPointCode] = [this.kakouCache ? this.kakouCache.pointCode : '', this.redianCache ? this.redianCache.pointCode : ''];
          let filter1 = Object.values(this.options).filter(node => kakouPointCode ? node[0].pointCode === kakouPointCode : true);
          let filter2 = filter1.filter(node => redianPointCode ? node[1].pointCode === redianPointCode : false);

          if (filter2 && filter2.length) {
            filter2.forEach(_ => {
              let lineObject = L.polyline([[_[0].gcjLatitude, _[0].gcjLongitude], [_[1].gcjLatitude, _[1].gcjLongitude]], {color: '#000000'}).addTo(this.$map);
              this.$lines.push(lineObject);
            });
          }
          this.$set(this, 'isBund', (this.kakouCache && this.redianCache) ? filter2 && filter2.length : false);
        }
      },
      insert() {
        if (this.kakouCache && this.redianCache) {
          this.options[`${this.kakouCache.pointCode}-${this.redianCache.pointCode}`] = [this.kakouCache, this.redianCache];
          this.selectGL();
        }
      },
      remove() {
        if (this.kakouCache && this.redianCache) {
          delete this.options[`${this.kakouCache.pointCode}-${this.redianCache.pointCode}`];
          this.selectGL();
        }
      },
    },
  }
</script>

<style scoped>
</style>
