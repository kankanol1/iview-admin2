<style lang="less">
  .title-margin {
    margin-bottom: 10px;
  }

  .map-box {
    position: relative;
    border: 1px solid #999;

    .map-info {

      width: 250px;
      position: absolute;
      right: 0;
      color: #000;
      background-color: rgba(255, 255, 255, 0.6);
      z-index: 99;
      padding: 10px;
    }

    .map-info:hover {
      background-color: #000;
      color: #fff;

    }
  }

  a.style {
    display: inline-block;
    border: 1px solid #2d8cf0;
    height: 23px;
    border-radius: 2px;
    vertical-align: middle;
    padding: 2px;
  }
</style>
<template>
  <div style="height:calc(100vh - 100px)">
    <div class="clear">
      <Row>
        <Col :md="6" :lg="3" class="title-margin">
          <Select
            class="interval"
            size="small"
            clearable
            v-model="formItem.kakouRegionCode"
            placeholder="请选择卡口行政区划"
            @on-change="queryChange"
          >
            <Option key="0" value="0" label="不选择">不选择</Option>
            <Option v-for="(value, key) in (dictionary.kkxzqh || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </Col>
        <Col :md="6" :lg="3" class="title-margin">
          <Input
            class="interval"
            size="small"
            v-model="formItem.kakouRoadName"
            placeholder="请输入路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口"
            @on-change="queryChange"
            clearable
          />
        </Col>
        <Col :md="6" :lg="3" class="title-margin">
          <Select
            class="interval"
            size="small"
            clearable
            v-model="formItem.redianRegionCode"
            placeholder="请选择热点行政区划"
            @on-change="queryChange"
          >
            <Option key="0" value="0" label="不选择">不选择</Option>
            <Option v-for="(value, key) in (dictionary.rdxzqh || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </Col>
        <Col :md="6" :lg="3" class="title-margin">
          <Input
            class="interval"
            size="small"
            v-model="formItem.redianRoadName"
            placeholder="请输入路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口"
            @on-change="queryChange"
            clearable
          />
        </Col>
        <Col :md="24" :lg="12" class="title-margin">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" :loading="formItem.kakouLoading || formItem.redianLoading">
              搜索
            </Button>
            <Button
              ghost
              @click="insert()"
              type="primary"
              :disabled="!kakouCache || !kakouCache.length || !redianCache || !redianCache.length || !!isBund"
            >
              绑定
            </Button>
            <Button
              ghost
              @click="remove()"
              type="primary"
              :disabled="!kakouCache || !kakouCache.length || !redianCache || !redianCache.length || !isBund"
            >
              解绑
            </Button>
            <Button ghost @click="reset()" type="primary">重置</Button>
            <Button ghost @click="noselect()" type="primary">取消选择</Button>
          </ButtonGroup>
          <Dropdown size="small">
            <a class="style" type="primary">
              已选卡口
              <Icon type="ios-arrow-down" style=""></Icon>
            </a>
            <DropdownMenu slot="list">
              <template v-for="(value, key, index) in kakouCache">
                <DropdownItem :key="index">
                  <span><Icon type="md-close" @click="removeSelectedKakouCache(value.pointCode)"/></span>
                  <span>&emsp;</span>
                  <span>{{value.pointCode || '未知'}}---{{value.roadName || '未知'}}</span>
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
          <Dropdown size="small">
            <a class="style" type="primary">
              已选热点
              <Icon type="ios-arrow-down" style=""></Icon>
            </a>
            <DropdownMenu slot="list">
              <template v-for="(value, key, index) in redianCache">
                <DropdownItem :key="index">
                  <span><Icon type="md-close" @click="removeSelectedRedianCache(value.pointCode)"/></span>
                  <span>&emsp;</span>
                  <span>{{value.pointCode || '未知'}}---{{value.roadName || '未知'}}</span>
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
        </Col>
      </Row>
    </div>
<!--    <div class="map-box" :style="{height:mapHeight+'px'}">-->
    <div class="map-box" style="height:calc(100vh - 140px)">
      <div class="map-info" v-show="kakouCache.length>0 || redianCache.length>0">
        <h3 style="height:20px">卡口信息:</h3>
        <table :style="{display:'block',overflowY:'auto',borderCollapse: 'collapse',maxHeight:(mapHeight/2-35)+'px'}">
          <tr>
            <td></td>
            <td></td>
          </tr>
          <template v-for="(value, key, index) in kakouCache">
            <tr :key="index" style="border-bottom: 1px solid #eee">
              <td style="padding-right: 10px">
                <Button ghost size="small" type="primary" shape="circle" icon="md-close"
                        @click="removeSelectedKakouCache(value.pointCode)"/>
              </td>
              <td>
                <p :key="`p1_${index}`">路口名称: {{value.roadName}}</p>
                <p :key="`p2_${index}`">设备编号: {{value.machineCode}}</p>
                <p :key="`p3_${index}`">点位编号: {{value.pointCode}}</p>
                <p :key="`p4_${index}`">对应经度: {{value.wgsLongitude}}</p>
                <p :key="`p5_${index}`">对应纬度: {{value.wgsLatitude}}</p>
                <p :key="`p6_${index}`">最后更新时间: {{value.lastUpdateTime}}</p>
              </td>
            </tr>
          </template>
        </table>
        <h3 style="margin-top:10px;height:20px">热点信息:</h3>
        <table :style="{ display:'block',overflowY:'auto',borderCollapse: 'collapse',maxHeight:(mapHeight/2-35)+'px'}">
          <tr>
            <td></td>
            <td></td>
          </tr>
          <template v-for="(value, key, index) in redianCache">
            <tr :key="index" style="border-bottom: 1px solid #eee">
              <td style="padding-right: 10px">
                <Button ghost size="small" type="primary" shape="circle" icon="md-close"
                        @click="removeSelectedRedianCache(value.pointCode)"/>
              </td>
              <td>
                <p :key="`p1_${index}`">路口名称: {{value.roadName}}</p>
                <p :key="`p2_${index}`">设备编号: {{value.machineCode}}</p>
                <p :key="`p3_${index}`">点位编号: {{value.pointCode}}</p>
                <p :key="`p4_${index}`">对应经度: {{value.wgsLongitude}}</p>
                <p :key="`p5_${index}`">对应纬度: {{value.wgsLatitude}}</p>
                <p :key="`p6_${index}`">最后更新时间: {{value.lastUpdateTime}}</p>
              </td>
            </tr>
          </template>
        </table>
      </div>
      <div id="equ-com-map" :style="{zIndex:98,width:'100%',height:'100%'}">
        <div id="latitude_and_longitude" :modal="coordinates">
          <span>经纬度坐标：({{coordinates[0].toFixed(2)}}，{{coordinates[1].toFixed(2)}})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import L from 'leaflet';
  import carIcon from '@/assets/car.png';
  import imsiIcon from '@/assets/imsi.png';

  export default {
    name: 'equ-com-map',
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
      mapHeight: {
        handler(curVal, oldVal) {
          /*if (curVal === oldVal){
            return false;
          } */
          // if (curVal) {
          this.setHeight();
        },
        immediate: true
      },
    },
    beforeDestroy() { // 释放前
      delete this.$currentKakouCircle;
      delete this.$currentRedianCircle;
      delete this.$kakouMarkers;
      delete this.$redianMarkers;
      delete this.$lines;
      delete this.$map;
      delete this.$blueIcon;
      delete this.$redIcon;
    },
    mounted() {

      this.setHeight();
      window.onresize = () => this.setHeight();
      // 取消鼠标右键菜单事件
      window.oncontextmenu = e => e.preventDefault();

      this.initMap();

      // 地图初始化完成
    },
    data() {
      return {
        coordinates: [0, 0],
        dictionary: {}, // 字典
        mapHeight: 0,
        kakouCache: [], // 当前选中的卡口
        redianCache: [], // 当前选中的热点
        isBund: false,

        latlng: [], /**鼠标按下抬起时的经纬度[按下, 抬起]*/
        formItem: {kakouLoading: false, redianLoading: false,}, // 展示请求参数
      };
    },
    methods: {
      initMap() {
        if (this.$map) {
          this.$map = undefined;
        }
        this.$blueIcon = L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
        this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
        this.$map = L.map('equ-com-map', this.$leafletOption);
        this.$map.on('click', (e) => { // 鼠标单击事件
          let latlng = `${e.latlng.lat}, ${e.latlng.lng}`;
          this.copyToClip(latlng, `复制成功  ${latlng}`);
          if (this.$rectangle) {
            this.$map.removeLayer(this.$rectangle);
            delete this.$rectangle;
            delete this.$rectangleAction;
          }
        });
        this.$map.on('mousedown', (e) => { // 鼠标按下事件
          if (2 === e.originalEvent.button) {
            this.$set(this, 'latlng', [e.latlng, e.latlng]);
            (!this.$rectangle) && (this.$rectangle = L.rectangle(this.latlng, {
              color: "#ff7800",
              weight: 1
            }).addTo(this.$map));
            this.$rectangleAction = true;
          }
        });
        this.$map.on('mousemove', (e) => { // 鼠标移动事件
          // document.getElementById('the_latitude_value').innerHTML = e.latlng.lat;
          // document.getElementById('the_longitude_value').innerHTML = e.latlng.lng;
          this.$set(this, 'coordinates', [e.latlng.lat, e.latlng.lng])
          if (this.$rectangleAction) {
            this.$set(this, 'latlng', [this.latlng[0] || e.latlng, e.latlng]);
            (!this.$rectangle) && (this.$rectangle = L.rectangle(this.latlng, {
              color: "#ff7800",
              weight: 1
            }).addTo(this.$map));
            this.$rectangle.setBounds(this.latlng);
          }
        });
        this.$map.on('mouseup', (e) => { // 鼠标抬起事件
          if (2 === e.originalEvent.button) {
            this.$set(this, 'latlng', [this.latlng[0] || e.latlng, e.latlng]);
            let x = {}, y = {};
            [x.min, x.max] = [Math.min(this.latlng[0].lat, this.latlng[1].lat), Math.max(this.latlng[0].lat, this.latlng[1].lat)];
            [y.min, y.max] = [Math.min(this.latlng[0].lng, this.latlng[1].lng), Math.max(this.latlng[0].lng, this.latlng[1].lng)];
            let selectedKakou = (this.$kakouMarkers || []).filter(it => it.options).map(it => it.options).filter(it => it.originData).map(it => it.originData)
              .filter(it => it.gcjLatitude).filter(it => it.gcjLongitude).filter(it => x.min <= it.gcjLatitude && it.gcjLatitude <= x.max)
              .filter(it => y.min <= it.gcjLongitude && it.gcjLongitude <= y.max);
            let selectedRedian = (this.$redianMarkers || []).filter(it => it.options).map(it => it.options).filter(it => it.originData).map(it => it.originData)
              .filter(it => it.gcjLatitude).filter(it => it.gcjLongitude).filter(it => x.min <= it.gcjLatitude && it.gcjLatitude <= x.max)
              .filter(it => y.min <= it.gcjLongitude && it.gcjLongitude <= y.max);
            this.$set(this, 'kakouCache', [...this.kakouCache, ...selectedKakou]);
            this.$set(this, 'redianCache', [...this.redianCache, ...selectedRedian]);
            let kakouCircle = (this.kakouCache || []).map(node => {
              return L.circle([node.gcjLatitude, node.gcjLongitude,], {
                color: 'blue', fillColor: '#f1a219c4', fillOpacity: 0.1, radius: 200, originData: node,
              });
            });
            let redianCircle = (this.redianCache || []).map(node => {
              return L.circle([node.gcjLatitude, node.gcjLongitude,], {
                color: 'red', fillColor: '#f1a219c4', fillOpacity: 0.1, radius: 200, originData: node,
              });
            });
            [...this.$currentKakouCircle, ...this.$currentRedianCircle].forEach(node => this.$map.removeLayer(node));
            [this.$currentKakouCircle, this.$currentRedianCircle] = [kakouCircle, redianCircle];
            [...this.$currentKakouCircle, ...this.$currentRedianCircle].forEach(node => node.addTo(this.$map));
            (!this.$rectangle) && (this.$rectangle = L.rectangle(this.latlng, {
              color: "#ff7800",
              weight: 1
            }).addTo(this.$map));
            this.$rectangle.setBounds(this.latlng);
            this.$rectangleAction = false;
          }
        });

        L.tileLayer(this.$tileLayerUrl).addTo(this.$map);
        this.$currentKakouCircle = []; // 当前选中的卡口节点所显示的圆圈
        this.$currentRedianCircle = []; // 当前选中的节点所显示的圆圈
        this.$kakouMarkers = []; // 卡口节点打点集合
        this.$redianMarkers = []; // 热点节点打点集合
        this.$lines = []; // 划线内容
        this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
            this.$set(this, 'dictionary', response.data.data);
          }
        });

      },
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          let height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.mapHeight=height - 30;
        }
      },
      copyToClip(content, message) {
        let aux = document.createElement('input');
        aux.setAttribute('value', content);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand('copy');
        document.body.removeChild(aux);
        if (!message) {
          this.$Message.success({closable: true, duration: 1, content: '复制成功',});
        } else {
          this.$Message.success({closable: true, duration: 1, content: message,});
        }
      },
      removeSelectedKakouCache(pointCode) {
        for (let index = this.kakouCache.length - 1; index >= 0; index--) {
          if (pointCode === this.kakouCache[index].pointCode) {
            this.kakouCache.splice(index, 1);
            if (this.$currentKakouCircle && this.$currentKakouCircle.length) {
              for (let offset = this.$currentKakouCircle.length - 1; offset >= 0; offset--) {
                if (pointCode === this.$currentKakouCircle[offset].options.originData.pointCode) {
                  this.$map.removeLayer(this.$currentKakouCircle[offset]);
                  this.$currentKakouCircle.splice(offset, 1);
                  break;
                }
              }
            }
            break;
          }
        }
      },
      removeSelectedRedianCache(pointCode) {
        for (let index = this.redianCache.length - 1; index >= 0; index--) {
          if (pointCode === this.redianCache[index].pointCode) {
            this.redianCache.splice(index, 1);
            if (this.$currentRedianCircle && this.$currentRedianCircle.length) {
              for (let offset = this.$currentRedianCircle.length - 1; offset >= 0; offset--) {
                if (pointCode === this.$currentRedianCircle[offset].options.originData.pointCode) {
                  this.$map.removeLayer(this.$currentRedianCircle[offset]);
                  this.$currentRedianCircle.splice(offset, 1);
                  break;
                }
              }
            }
            break;
          }
        }
      },
      queryChange() {
        // 从地图中删除已有内容
        [...this.$kakouMarkers, ...this.$redianMarkers, ...this.$lines].forEach(node => this.$map.removeLayer(node));
        [...this.$currentKakouCircle, ...this.$currentRedianCircle].forEach(node => this.$map.removeLayer(node));
        // 清空marker集合
        [this.$kakouMarkers, this.$redianMarkers] = [[], []]; // 卡口节点打点集合, 热点节点打点集合
        // 清空circle
        [this.$currentKakouCircle, this.$currentRedianCircle] = [[], []]; // 当前选中的卡口节点, 热点节点所显示的圆圈
      },
      reset() {
        this.$set(this, 'formItem', {kakouLoading: false, redianLoading: false,});
      },
      search() {
        this.queryChange();
        ['kakouLoading', 'redianLoading'].forEach(__ => this.$set(this.formItem, __, true));
        let [x, y] = [118.367292, 35.112697];
        this.$http.all([
          this.$http.post('/api/com/kakou/selectNodes', {
            regionCode: this.formItem.kakouRegionCode || '',
            roadName: this.formItem.kakouRoadName || '',
            page: 0,
            size: 99999
          }),
          this.$http.post('/api/com/redian/selectNodes', {
            regionCode: this.formItem.redianRegionCode || '',
            roadName: this.formItem.redianRoadName || '',
            page: 0,
            size: 99999
          }),
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
                let marker = L.marker([node.gcjLatitude, node.gcjLongitude,], {icon: task.icon, originData: node})
                  .bindPopup(`编号:${node.pointCode}</br>名称:${node.roadName}</br>经度:${node.wgsLongitude}</br>维度:${node.wgsLatitude}</br>最后更新时间:${node.lastUpdateTime}`)
                  .on('click', () => {
                    this.$set(this, task.arg, [node]);
                    [...this[task.circle]].forEach(node => this.$map.removeLayer(node))
                    let circle = L.circle([node.gcjLatitude, node.gcjLongitude,], {
                      color: task.color, fillColor: '#f1a219c4', fillOpacity: 0.1, radius: 200, originData: node,
                    }).addTo(this.$map);
                    this.$set(this, task.circle, [circle]);
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
        [...this.$lines, ...this.$currentKakouCircle, ...this.$currentRedianCircle].forEach(node => this.$map.removeLayer(node));
        ['kakouCache', 'redianCache'].forEach(__ => this.$set(this, __, []));
      },
      selectGL() {
        (this.$lines && this.$map) && (this.$lines.forEach(node => this.$map.removeLayer(node)));
        this.$lines = [];
        if (this.kakouCache && this.kakouCache.length || this.redianCache && this.redianCache.length) {
          let args = {};
          [args.page, args.size] = [0, 200];
          [args.kakouPointCodes, args.redianPointCodes] = [(this.kakouCache || []).map(it => it.pointCode).join(','), (this.redianCache || []).map(it => it.pointCode).join(',')];
          this.$http.post('/api/com/rediankakougl/selectNodes', args).then((response) => {
            if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
              response.data.data.forEach((_) => {
                let lineObject = L.polyline([[_.kakouDevice.gcjLatitude, _.kakouDevice.gcjLongitude], [_.redianDevice.gcjLatitude, _.redianDevice.gcjLongitude]], {color: '#000000'}).addTo(this.$map);
                this.$lines.push(lineObject);
              });
            }
            this.$set(this, 'isBund', (this.kakouCache && this.kakouCache.length && this.redianCache && this.redianCache.length) ? response.data.data && response.data.data.length : false);
          });
        }
      },
      insert() {
        if (this.kakouCache && this.kakouCache.length || this.redianCache && this.redianCache.length) {
          this.$http.post('/api/com/rediankakougl/insertNode', {
            kakouPointCodes: (this.kakouCache || []).map(it => it.pointCode).join(','),
            redianPointCodes: (this.redianCache || []).map(it => it.pointCode).join(','),
            used: true,
          }).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.selectGL();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      remove() {
        if (this.kakouCache && this.kakouCache.length || this.redianCache && this.redianCache.length) {
          this.$http.post('/api/com/rediankakougl/deleteNode', {
            kakouPointCodes: (this.kakouCache || []).map(it => it.pointCode).join(','),
            redianPointCodes: (this.redianCache || []).map(it => it.pointCode).join(','),
          }).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.selectGL();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
    },
  }
</script>

<style scoped>
  #latitude_and_longitude {
    font-size: 14px;
    font-weight: bold;
    padding: 0 10px;
    background-color: beige;
    z-index: 999;
    position: absolute;
    left: 0;
    bottom: 0;
  }
</style>
