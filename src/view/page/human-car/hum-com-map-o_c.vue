<template>
  <div style="width: 100%;height: 100%;">
    <div style="height: 0pt"></div>
    <div class="clear" >
      <Form ref="ref_formItem_r2_agg" :model="formItem_r2_agg" :rules="formItem_r2_agg_rules" inline>
        <FormItem prop="cplx">
          <Select class="interval" size="small" v-model="formItem_r2_agg.cplx" placeholder="请选择车牌类型" @on-change="queryChange">
            <Option v-for="(value, key) in cplx" :key="key" :value="key" :label="value">{{value}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="cphms">
          <Input class="interval" size="small" clearable v-model="formItem_r2_agg.cphms" placeholder="请输入车牌号码,多号码半角逗号间隔" @on-change="queryChange"/>
        </FormItem>
        <FormItem prop="imsis">
          <Input class="interval" size="small" clearable v-model="formItem_r2_agg.imsis" placeholder="请输入IMSI,多号码半角逗号间隔" @on-change="queryChange"/>
        </FormItem>
        <FormItem prop="datetimerange">
          <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem_r2_agg.datetimerange" placeholder="请选择时间范围" style="width: 300px"
                      @on-change="queryChange"/>
        </FormItem>
        <FormItem>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          </ButtonGroup>
        </FormItem>
      </Form>
    </div>
    <div style="height: 5pt"></div>
    <div ref="ref_1562396677465" style="height: calc(100% - 10pt - var(--searchBar)); overflow-y: auto; position: relative;">
      <div
        :style="`position:absolute; left: 5pt; top: 5pt; width: calc(${tableWidth} + 0pt); height: calc(${tableHeight} + 0pt); background-color: rgba(255, 255, 255, 0.6); z-index: 401;`">
        <div style="width: 100%; height: 100%; overflow-y: auto;">
          <div style="width: 100%; height: calc(100% - 25px); overflow-y: auto;">
            <Table ref="selection" highlight-row :columns="columns_r2_agg" :data="content_r2_agg" border :loading="loading_r2_agg" :height="tableHeight / 2 - 13"
                   @on-row-click="oneClick" @on-row-dblclick="twoClick"></Table>
          </div>
          <div style="width: 100%;">
            <Page size="small" show-total :page-size-opts="[100,200,500,1000,5000]"
                  :current.sync="pageInfo_r2_agg.page" :page-size.sync="pageInfo_r2_agg.size"
                  :total="pageInfo_r2_agg.totalElements" @on-change="search"
                  @on-page-size-change="(value) => {pageInfo_r2_agg.size = value;search();}"
                  style="float: right;margin: 0px"/>
          </div>
        </div>
      </div>
      <div :style="`position:absolute; left: calc(${tableWidth} + 5pt); top: 5pt; background-color: rgba(255, 255, 255, 0); z-index: 402;`">
        <Icon style="font-size: 15pt;" type="md-reorder"
              @click="()=>{if(this.tableWidth == '250pt'){this.$set(this,'tableHeight','0pt');this.$set(this,'tableWidth','0pt');}else{this.$set(this,'tableHeight','200pt');this.$set(this,'tableWidth','250pt');}}"/>
      </div>
      <div class="clear" id="map_1556155828169" style="width: 100%;height: 100%;"></div>
    </div>
    <!-- 弹窗显示匹配信息 -->
    <div>
      <Modal :styles="{top: '20px'}" v-model="args.showModal" title="信息查阅" width="1200">
        <icr3 :args="args"></icr3>
        <div slot="footer"></div>
      </Modal>
    </div>
  </div>
</template>

<script>

  import icr3 from './components/com-detail-o';

  import L from 'leaflet';
  import leafletAntPath from 'leaflet-ant-path';
  import carIcon from '@/assets/car.png';
  import imsiIcon from '@/assets/imsi.png';
  import carImsiIcon from '@/assets/car_imsi.png';
  export default {
    name: "hum-com-map-o",
    components: {icr3: icr3, L, leafletAntPath},
    watch: {
      tableHeight: {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.setHeight();
          }
        },
        immediate: true
      },
    },
    computed: {},
    beforeDestroy() { // 释放前
      delete this.$Markers;
      delete this.$Lines;
      delete this.$map;
      delete this.$blueIcon;
      delete this.$redIcon;
      delete this.$greenIcon;
    },
    mounted() {
      this.setHeight();
      window.onresize = () =>this.setHeight();
      // 初始化地图
      this.initMap();

    },
    data() {
      return {
        tableHeight: '200pt',
        tableWidth: '250pt',

        cplx: {'加载失败': '加载失败'}, // 车牌类型

        args: {showModal: false,},

        pageInfo_r2_agg: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading_r2_agg: false, // 数据加载动作
        columns_r2_agg: [
          {title: '车牌号码', key: 'cphm', width: 75, align: 'center', render: (h, params) => h('div', {}, params.row.cphm),},
          {title: 'IMSI', key: 'imsi', width: 115, align: 'center', render: (h, params) => h('div', {}, params.row.imsi),},
          {
            title: 'CS', key: 'cs', align: 'center',
            render: (h, params) => h('div', {}, `${params.row.cs} / ${params.row.rdbh_cs} / ${params.row.kkbh_cs}`),
          },
          {
            title: '操作', width: 50, align: 'center', render: (h, params) => {
              return h('div', {}, [h('Button', {
                style: {marginRight: '5px'},
                domProps: {zIndex: 10000},
                props: {type: 'dashed', shape: "circle", size: 'small', icon: "ios-search"},
                on: {click: () => this.actionClick(params.row, params.index)}
              },),]);
            }
          },
        ], // 展示字段
        content_r2_agg: [], // 数据
        formItem_r2_agg: {imsis: '', cplx: '2', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]}, //展示请求参数
        formItem_r2_agg_rules: {
          cplx: [{required: true, type: 'string', message: '请选择车牌类型!', trigger: 'blur'}],
          cphms: [{
            required: true, type: 'string', trigger: 'blur',
            validator: (rule, value, callback) => {
              return (!this.formItem_r2_agg.cphms && !this.formItem_r2_agg.imsis) ? callback(new Error('请输入车牌号码,多号码半角逗号间隔!')) : callback();
            },
          }],
          imsis: [{
            required: true, type: 'string', trigger: 'blur',
            validator: (rule, value, callback) => {
              return (!this.formItem_r2_agg.cphms && !this.formItem_r2_agg.imsis) ? callback(new Error('请输入IMSI,多号码半角逗号间隔!')) : callback();
            },
          }],
          datetimerange: [{
            required: true, type: 'date', trigger: 'change',
            validator: (rule, value, callback) => {
              return (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!'));
            },
          }],
        },

        timer: {},
        tasker: {},

        timeLimit: 5 * 366 * 86400000,
      }
    },
    methods: {
      initMap(){
        this.$blueIcon = L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
        this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
        this.$greenIcon = L.icon({iconUrl: carImsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
        this.$map = L.map('map_1556155828169', this.$leafletOption);
        L.tileLayer(this.$tileLayerUrl).addTo(this.$map);
        this.$Markers = [[], [], []]; // 节点打点集合[[车辆],[串号],[重合]]
        this.$Lines = [[], [], []]; // 划线内容[[车辆],[串号],[重合]]
        // 地图初始化完成
        let dictionaries = ['cplx',];
        if (0 < dictionaries.filter(node => !sessionStorage.getItem(node)).length) {
          this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: dictionaries.filter((_) => !sessionStorage.getItem(_)).join(',')}).then((response) => {
            if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
              dictionaries.forEach((_) => (response.data.data[_]) && (sessionStorage.setItem(_, JSON.stringify(response.data.data[_]))));
            }
          });
        }
        dictionaries.forEach((_) => sessionStorage.getItem(_) && this.$set(this, _, JSON.parse(sessionStorage.getItem(_))));

        let query = this.$router.currentRoute.query;
        if (query.action && query.action == 'search') {
          (query.cplx) && (this.$set(this.formItem_r2_agg, 'cplx', query.cplx));
          (query.cphms) && (this.$set(this.formItem_r2_agg, 'cphms', query.cphms));
          (query.imsis) && (this.$set(this.formItem_r2_agg, 'imsis', query.imsis));
          (query.start && query.end) && (this.$set(this.formItem_r2_agg, 'datetimerange', [new Date(query.start * 1000), new Date(query.end * 1000)]));
          if (this.formItem_r2_agg.cplx && this.formItem_r2_agg.cphms || query.imsis) {
            this.search();
          }
        }
      },
      setHeight(){
        if(document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline").length > 0){
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;

          this.tableHeight = height-20;
        }
      },
      queryChange() {
      },
      reset() {
        this.$Markers.forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Lines.forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$set(this, 'formItem_r2_agg', {imsis: '', cplx: '2', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]});
        this.$set(this, 'pageInfo_r2_agg', JSON.parse(JSON.stringify(this.$pageInfo)));
        this.$set(this, 'content_r2_agg', []);
      },
      search() {
        this.$refs['ref_formItem_r2_agg'].validate((valid) => {
          if (valid) {
            if (!this.formItem_r2_agg.datetimerange || !this.formItem_r2_agg.datetimerange[0] || !this.formItem_r2_agg.datetimerange[1]) {
              console.log( this.formItem_r2_agg.datetimerange );
              this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
              return false;
            }
            if (this.formItem_r2_agg.datetimerange[1].getTime() - this.formItem_r2_agg.datetimerange[0].getTime() > this.timeLimit) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
              return false;
            }
            this.$set(this, 'content_r2_agg', []); // 清空数据
            let args = {};
            (this.formItem_r2_agg.cphms) && (args.cphms = this.formItem_r2_agg.cphms);
            (this.formItem_r2_agg.cplx) && (args.cplx = this.formItem_r2_agg.cplx);
            (this.formItem_r2_agg.imsis) && (args.imsis = this.formItem_r2_agg.imsis);
            args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
            args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
            args.page = this.pageInfo_r2_agg.page ? this.pageInfo_r2_agg.page - 1 : this.$pageInfo.page;
            args.size = this.pageInfo_r2_agg.size ? this.pageInfo_r2_agg.size : this.$pageInfo.size;
            this.$set(this, 'loading_r2_agg', true);

            this.$http.post('/api/com/icr2/selectAggNodes', args).then((response) => {
              if (!!response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.pageInfo_r2_agg, 'totalElements', response.data.page.totalElements);
                  this.$set(this, 'content_r2_agg', response.data.data);
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'loading_r2_agg', false);
            }).catch(() => this.$set(this, 'loading_r2_agg', false));
          }
        });
      },
      oneClick(row, index) {
        if (new Date().getTime() < this.timer[index]) {
          this.timer[index] = new Date().getTime();
          return false;
        }
        this.tasker[index] = 'click';
        this.timer[index] = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.timer[index] >= 250) {
            this.selectCarsAndImsi(row, index);
          }
        }, 251);
      },
      twoClick(row, index) {
        this.tasker[index] = 'dbclick';
        this.timer[index] = new Date().getTime() + 250;
        this.selectICR3(row, index);
      },
      actionClick(row, index) {
        this.tasker[index] = 'actionClick';
        this.timer[index] = new Date().getTime() + 250;

        let args = {cplx: row.cplx, cphms: row.cphm, imsis: row.imsi,};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
        args.showModal = true;
        this.$set(this, 'args', args);
      },
      selectCarsAndImsi(row, index) {
        this.selectCars(row, index);
        this.selectImsis(row, index);
      },
      selectCars(row, index) {
        [this.$Markers[0], this.$Markers[2], this.$Lines[0], this.$Lines[2]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Markers = [[], this.$Markers[1], []];
        this.$Lines = [[], this.$Lines[1], []];
        if (!this.formItem_r2_agg.datetimerange || !this.formItem_r2_agg.datetimerange[0] || !this.formItem_r2_agg.datetimerange[1]) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
          return false;
        }
        if (this.formItem_r2_agg.datetimerange[1].getTime() - this.formItem_r2_agg.datetimerange[0].getTime() > this.timeLimit) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
          return false;
        }

        let args = {page: 0, size: 9999, cplx: row.cplx, cphms: row.cphm};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳

        this.$http.post('/api/com/kakoushuju/selectNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            if (response.data.data) {
              let groups = {};
              response.data.data.forEach((_) => groups[_.kkbh] ? groups[_.kkbh].push(_) : groups[_.kkbh] = [_]);
              let markers = Object.keys(groups).map(_ => groups[_]).map((_) => {
                  let one = _[0];
                  return L.marker([one.device ? one.device.gcjLatitude : 0, one.device ? one.device.gcjLongitude : 0,], {icon: this.$blueIcon})
                    .bindPopup(`
                        车牌号码:${one.cphm || '未知'}<br/>
                        车辆类型:${this.cplx[one.cplx] || one.cplx || '未知'}<br/>
                        点位编号:${one.device ? one.device.pointCode : one.kkbh}<br/>
                        点位名称:${one.device ? one.device.roadName : '未知'}<br/>
                        点位经度:${one.device ? one.device.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.device ? one.device.wgsLatitude : '未知'}<br/>
                        采集时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        `)
                    .addTo(this.$map);
                }
              );
              this.$Markers[0].push(...markers);
              let lines = response.data.data.filter(_ => _.device && _.device.gcjLatitude && _.device.gcjLongitude)
                .map(_ => [_.device.gcjLatitude, _.device.gcjLongitude]).reverse();
              let path = L.polyline.antPath(lines, {delay: 1500, weight: 3, dashArray: [10, 20], color: 'blue', pulseColor: '#FFFFFF',}).addTo(this.$map);
              this.$Lines[0].push(path);
            }
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg || '网络链接失败,请重试!',});
          }
        });
      },
      selectImsis(row, index) {
        [this.$Markers[1], this.$Markers[2], this.$Lines[1], this.$Lines[2]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Markers = [this.$Markers[0], [], []];
        this.$Lines = [this.$Lines[0], [], []];
        if (!this.formItem_r2_agg.datetimerange || !this.formItem_r2_agg.datetimerange[0] || !this.formItem_r2_agg.datetimerange[1]) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
          return false;
        }
        if (this.formItem_r2_agg.datetimerange[1].getTime() - this.formItem_r2_agg.datetimerange[0].getTime() > this.timeLimit) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
          return false;
        }

        let args = {page: 0, size: 9999, imsis: row.imsi};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳

        this.$http.post('/api/com/redianshuju/selectNodes', args).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let groups = {};
            response.data.data.forEach((_) => groups[_.rdbh] ? groups[_.rdbh].push(_) : groups[_.rdbh] = [_]);
            let markers = Object.keys(groups).map(_ => groups[_]).map((_) => {
                let one = _[0];
                return L.marker([one.device ? one.device.gcjLatitude : 0, one.device ? one.device.gcjLongitude : 0,], {icon: this.$redIcon})
                  .bindPopup(`
                        手机串号:${one.imsi || '未知'}<br/>
                        点位编号:${one.device ? one.device.pointCode : one.rdbh}<br/>
                        点位名称:${one.device ? one.device.roadName : '未知'}<br/>
                        点位经度:${one.device ? one.device.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.device ? one.device.wgsLatitude : '未知'}<br/>
                        采集时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        `)
                  .addTo(this.$map);
              }
            );
            this.$Markers[1].push(...markers)
            let lines = response.data.data.filter(_ => _.device && _.device.gcjLatitude && _.device.gcjLongitude)
              .map(_ => [_.device.gcjLatitude, _.device.gcjLongitude]).reverse();
            let path = L.polyline.antPath(lines, {delay: 1500, weight: 3, dashArray: [10, 20], color: 'red', pulseColor: '#FFFFFF',}).addTo(this.$map);
            this.$Lines[0].push(path);
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg || '网络链接失败,请重试!',});
          }
        });
      },
      selectICR3(row, index) {
        [...this.$Markers, ...this.$Lines].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Markers = [[], [], []];
        this.$Lines = [[], [], []];
        let args = {page: 0, size: 999999, imsis: row.imsi, cplx: row.cplx, cphms: row.cphm,};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
        this.$http.post('/api/com/icr3/selectNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let [x, y, left_up, right_down] = [118.367292, 35.112697, [180, -90], [-180, 90]];
            let data = response.data.data.filter((record) => record.redianDevice && record.redianDevice.gcjLongitude && record.redianDevice.gcjLatitude)
              .filter(record => record.kakouDevice && record.kakouDevice.gcjLongitude && record.kakouDevice.gcjLatitude);
            let kkbhGroups = {};
            data.forEach((record) => {
              ([x, y] = [(x + record.kakouDevice.gcjLongitude) / 2, (y + record.kakouDevice.gcjLatitude) / 2]);
              ([x, y] = [(x + record.redianDevice.gcjLongitude) / 2, (y + record.redianDevice.gcjLatitude) / 2]);
              left_up = [Math.min(left_up[0], record.kakouDevice.gcjLongitude, record.redianDevice.gcjLongitude), Math.max(right_down[1], record.kakouDevice.gcjLatitude, record.redianDevice.gcjLatitude)];
              right_down = [Math.max(right_down[0], record.kakouDevice.gcjLongitude, record.redianDevice.gcjLongitude), Math.min(right_down[1], record.kakouDevice.gcjLatitude, record.redianDevice.gcjLatitude)];
              kkbhGroups[record.kkbh] ? kkbhGroups[record.kkbh].push(record) : kkbhGroups[record.kkbh] = [record];
            });
            let markers = Object.values(kkbhGroups).map((_) => {
              let one = _[0];
              let rdbhGroups = {};
              _.forEach((record) => rdbhGroups[record.rdbh] ? rdbhGroups[record.rdbh].push(record) : rdbhGroups[record.rdbh] = [record]);
              let imsis = Object.values(rdbhGroups).map((_) => {
                let one = _[0];
                return `
                        手机串号:${one.imsi || '未知'}<br/>
                        点位编号:${one.redianDevice ? one.redianDevice.pointCode : one.rdbh}<br/>
                        点位名称:${one.redianDevice ? one.redianDevice.roadName : '未知'}<br/>
                        点位经度:${one.redianDevice ? one.redianDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.redianDevice ? one.redianDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                    `;
              });
              return L.marker([one.kakouDevice ? one.kakouDevice.gcjLatitude : 0, one.kakouDevice ? one.kakouDevice.gcjLongitude : 0,], {icon: this.$greenIcon})
                .bindPopup(`
                        车牌号码:${one.cphm || '未知'}<br/>
                        车辆类型:${this.cplx[one.cplx] || one.cplx || '未知'}<br/>
                        点位编号:${one.kakouDevice ? one.kakouDevice.pointCode : one.rdbh}<br/>
                        点位名称:${one.kakouDevice ? one.kakouDevice.roadName : '未知'}<br/>
                        点位经度:${one.kakouDevice ? one.kakouDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.kakouDevice ? one.kakouDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>${_.splice(0, 10).map(_ => new Date(_.gcsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        <hr/>
                        ${imsis.splice(0, 5).join('<br/><hr/>')}
                        ${5 < imsis.length ? '......' : ''}
                        `)
                .addTo(this.$map);
            });
            this.$Markers[2].push(...markers);
            let lines = response.data.data.filter(record => record.kakouDevice && record.kakouDevice.gcjLongitude && record.kakouDevice.gcjLatitude)
              .map(record => [record.kakouDevice.gcjLatitude, record.kakouDevice.gcjLongitude]).reverse();
            let path = L.polyline.antPath(lines, {delay: 1500, weight: 3, dashArray: [10, 20], color: 'green', pulseColor: '#FFFFFF',}).addTo(this.$map);
            this.$Lines[0].push(path);
            this.$map.flyTo([y, x]);
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
          }
        });
      },
    }
  }
 /* export default {
    name: "node04.01",
    components: {icr3: icr3, L, leafletAntPath},
    watch: {
      mapHeight: {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.setHeight();
          }
        },
        immediate: true
      },
    },
    computed: {},
    beforeDestroy() { // 释放前
      delete this.$Markers;
      delete this.$Lines;
      delete this.$map;
      delete this.$blueIcon;
      delete this.$redIcon;
      delete this.$greenIcon;
    },
    mounted() {
      this.setHeight();
      window.onresize = () =>this.setHeight();
      // 初始化地图
      this.$blueIcon = L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$greenIcon = L.icon({iconUrl: carImsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$map = L.map('map_1556155828169', this.$leafletOption);
      L.tileLayer(this.$tileLayerUrl).addTo(this.$map);
      this.$Markers = [[], [], []]; // 节点打点集合[[车辆],[串号],[重合]]
      this.$Lines = [[], [], []]; // 划线内容[[车辆],[串号],[重合]]
      // 地图初始化完成
      let dictionaries = ['cplx',];
      if (0 < dictionaries.filter(node => !sessionStorage.getItem(node)).length) {
        this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: dictionaries.filter((_) => !sessionStorage.getItem(_)).join(',')}).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
            dictionaries.forEach((_) => (response.data.data[_]) && (sessionStorage.setItem(_, JSON.stringify(response.data.data[_]))));
          }
        });
      }
      dictionaries.forEach((_) => sessionStorage.getItem(_) && this.$set(this, _, JSON.parse(sessionStorage.getItem(_))));

      let query = this.$router.currentRoute.query;
      if (query.action && query.action == 'search') {
        (query.cplx) && (this.$set(this.formItem_r2_agg, 'cplx', query.cplx));
        (query.cphms) && (this.$set(this.formItem_r2_agg, 'cphms', query.cphms));
        (query.imsis) && (this.$set(this.formItem_r2_agg, 'imsis', query.imsis));
        (query.start && query.end) && (this.$set(this.formItem_r2_agg, 'datetimerange', [new Date(query.start * 1000), new Date(query.end * 1000)]));
        if (this.formItem_r2_agg.cplx && this.formItem_r2_agg.cphms || query.imsis) {
          this.search();
        }
      }
    },
    data() {
      return {
        tableHeight: '200pt',
        mapHeight: 0,
        tableWidth: '250pt',

        cplx: {'加载失败': '加载失败'}, // 车牌类型

        args: {showModal: false,},

        pageInfo_r2_agg: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading_r2_agg: false, // 数据加载动作
        columns_r2_agg: [
          {title: '车牌号码', key: 'cphm', width: 75, align: 'center', render: (h, params) => h('div', {}, params.row.cphm),},
          {title: 'IMSI', key: 'imsi', width: 115, align: 'center', render: (h, params) => h('div', {}, params.row.imsi),},
          {
            title: 'CS', key: 'cs', align: 'center',
            render: (h, params) => h('div', {}, `${params.row.cs} / ${params.row.rdbh_cs} / ${params.row.kkbh_cs}`),
          },
          {
            title: '操作', width: 50, align: 'center', render: (h, params) => {
              return h('div', {}, [h('Button', {
                style: {marginRight: '5px'},
                domProps: {zIndex: 10000},
                props: {type: 'dashed', shape: "circle", size: 'small', icon: "ios-search"},
                on: {click: () => this.actionClick(params.row, params.index)}
              },),]);
            }
          },
        ], // 展示字段
        content_r2_agg: [], // 数据
        formItem_r2_agg: {imsis: '', cplx: '2', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]}, //展示请求参数
        formItem_r2_agg_rules: {
          cplx: [{required: true, type: 'string', message: '请选择车牌类型!', trigger: 'blur'}],
          cphms: [{
            required: true, type: 'string', trigger: 'blur',
            validator: (rule, value, callback) => {
              return (!this.formItem_r2_agg.cphms && !this.formItem_r2_agg.imsis) ? callback(new Error('请输入车牌号码,多号码半角逗号间隔!')) : callback();
            },
          }],
          imsis: [{
            required: true, type: 'string', trigger: 'blur',
            validator: (rule, value, callback) => {
              return (!this.formItem_r2_agg.cphms && !this.formItem_r2_agg.imsis) ? callback(new Error('请输入IMSI,多号码半角逗号间隔!')) : callback();
            },
          }],
          datetimerange: [{
            required: true, type: 'date', trigger: 'change',
            validator: (rule, value, callback) => {
              return (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!'));
            },
          }],
        },

        timer: {},
        tasker: {},

        timeLimit: 5 * 366 * 86400000,
      }
    },
    methods: {
      setHeight(){
        if(document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline").length > 0){
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;

          this.mapHeight = height-20;
        }
      },
      queryChange() {
      },
      reset() {
        this.$Markers.forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Lines.forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$set(this, 'formItem_r2_agg', {imsis: '', cplx: '2', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]});
        this.$set(this, 'pageInfo_r2_agg', JSON.parse(JSON.stringify(this.$pageInfo)));
        this.$set(this, 'content_r2_agg', []);
      },
      search() {
        this.$refs['ref_formItem_r2_agg'].validate((valid) => {
          if (valid) {
            if (!this.formItem_r2_agg.datetimerange || !this.formItem_r2_agg.datetimerange[0] || !this.formItem_r2_agg.datetimerange[1]) {
              console.log( this.formItem_r2_agg.datetimerange );
              this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
              return false;
            }
            if (this.formItem_r2_agg.datetimerange[1].getTime() - this.formItem_r2_agg.datetimerange[0].getTime() > this.timeLimit) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
              return false;
            }
            this.$set(this, 'content_r2_agg', []); // 清空数据
            let args = {};
            (this.formItem_r2_agg.cphms) && (args.cphms = this.formItem_r2_agg.cphms);
            (this.formItem_r2_agg.cplx) && (args.cplx = this.formItem_r2_agg.cplx);
            (this.formItem_r2_agg.imsis) && (args.imsis = this.formItem_r2_agg.imsis);
            args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
            args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
            args.page = this.pageInfo_r2_agg.page ? this.pageInfo_r2_agg.page - 1 : this.$pageInfo.page;
            args.size = this.pageInfo_r2_agg.size ? this.pageInfo_r2_agg.size : this.$pageInfo.size;
            this.$set(this, 'loading_r2_agg', true);

            this.$http.post('/api/com/icr2/selectAggNodes', args).then((response) => {
              if (!!response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.pageInfo_r2_agg, 'totalElements', response.data.page.totalElements);
                  this.$set(this, 'content_r2_agg', response.data.data);
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'loading_r2_agg', false);
            }).catch(() => this.$set(this, 'loading_r2_agg', false));
          }
        });
      },
      oneClick(row, index) {
        if (new Date().getTime() < this.timer[index]) {
          this.timer[index] = new Date().getTime();
          return false;
        }
        this.tasker[index] = 'click';
        this.timer[index] = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.timer[index] >= 250) {
            this.selectCarsAndImsi(row, index);
          }
        }, 251);
      },
      twoClick(row, index) {
        this.tasker[index] = 'dbclick';
        this.timer[index] = new Date().getTime() + 250;
        this.selectICR3(row, index);
      },
      actionClick(row, index) {
        this.tasker[index] = 'actionClick';
        this.timer[index] = new Date().getTime() + 250;

        let args = {cplx: row.cplx, cphms: row.cphm, imsis: row.imsi,};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
        args.showModal = true;
        this.$set(this, 'args', args);
      },
      selectCarsAndImsi(row, index) {
        this.selectCars(row, index);
        this.selectImsis(row, index);
      },
      selectCars(row, index) {
        [this.$Markers[0], this.$Markers[2], this.$Lines[0], this.$Lines[2]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Markers = [[], this.$Markers[1], []];
        this.$Lines = [[], this.$Lines[1], []];
        if (!this.formItem_r2_agg.datetimerange || !this.formItem_r2_agg.datetimerange[0] || !this.formItem_r2_agg.datetimerange[1]) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
          return false;
        }
        if (this.formItem_r2_agg.datetimerange[1].getTime() - this.formItem_r2_agg.datetimerange[0].getTime() > this.timeLimit) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
          return false;
        }

        let args = {page: 0, size: 9999, cplx: row.cplx, cphms: row.cphm};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳

        this.$http.post('/api/com/kakoushuju/selectNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            if (response.data.data) {
              let groups = {};
              response.data.data.forEach((_) => groups[_.kkbh] ? groups[_.kkbh].push(_) : groups[_.kkbh] = [_]);
              let markers = Object.keys(groups).map(_ => groups[_]).map((_) => {
                  let one = _[0];
                  return L.marker([one.device ? one.device.gcjLatitude : 0, one.device ? one.device.gcjLongitude : 0,], {icon: this.$blueIcon})
                    .bindPopup(`
                        车牌号码:${one.cphm || '未知'}<br/>
                        车辆类型:${this.cplx[one.cplx] || one.cplx || '未知'}<br/>
                        点位编号:${one.device ? one.device.pointCode : one.kkbh}<br/>
                        点位名称:${one.device ? one.device.roadName : '未知'}<br/>
                        点位经度:${one.device ? one.device.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.device ? one.device.wgsLatitude : '未知'}<br/>
                        采集时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        `)
                    .addTo(this.$map);
                }
              );
              this.$Markers[0].push(...markers);
              let lines = response.data.data.filter(_ => _.device && _.device.gcjLatitude && _.device.gcjLongitude)
                .map(_ => [_.device.gcjLatitude, _.device.gcjLongitude]).reverse();
              let path = L.polyline.antPath(lines, {delay: 1500, weight: 3, dashArray: [10, 20], color: 'blue', pulseColor: '#FFFFFF',}).addTo(this.$map);
              this.$Lines[0].push(path);
            }
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg || '网络链接失败,请重试!',});
          }
        });
      },
      selectImsis(row, index) {
        [this.$Markers[1], this.$Markers[2], this.$Lines[1], this.$Lines[2]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Markers = [this.$Markers[0], [], []];
        this.$Lines = [this.$Lines[0], [], []];
        if (!this.formItem_r2_agg.datetimerange || !this.formItem_r2_agg.datetimerange[0] || !this.formItem_r2_agg.datetimerange[1]) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
          return false;
        }
        if (this.formItem_r2_agg.datetimerange[1].getTime() - this.formItem_r2_agg.datetimerange[0].getTime() > this.timeLimit) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
          return false;
        }

        let args = {page: 0, size: 9999, imsis: row.imsi};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳

        this.$http.post('/api/com/redianshuju/selectNodes', args).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let groups = {};
            response.data.data.forEach((_) => groups[_.rdbh] ? groups[_.rdbh].push(_) : groups[_.rdbh] = [_]);
            let markers = Object.keys(groups).map(_ => groups[_]).map((_) => {
                let one = _[0];
                return L.marker([one.device ? one.device.gcjLatitude : 0, one.device ? one.device.gcjLongitude : 0,], {icon: this.$redIcon})
                  .bindPopup(`
                        手机串号:${one.imsi || '未知'}<br/>
                        点位编号:${one.device ? one.device.pointCode : one.rdbh}<br/>
                        点位名称:${one.device ? one.device.roadName : '未知'}<br/>
                        点位经度:${one.device ? one.device.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.device ? one.device.wgsLatitude : '未知'}<br/>
                        采集时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        `)
                  .addTo(this.$map);
              }
            );
            this.$Markers[1].push(...markers)
            let lines = response.data.data.filter(_ => _.device && _.device.gcjLatitude && _.device.gcjLongitude)
              .map(_ => [_.device.gcjLatitude, _.device.gcjLongitude]).reverse();
            let path = L.polyline.antPath(lines, {delay: 1500, weight: 3, dashArray: [10, 20], color: 'red', pulseColor: '#FFFFFF',}).addTo(this.$map);
            this.$Lines[0].push(path);
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg || '网络链接失败,请重试!',});
          }
        });
      },
      selectICR3(row, index) {
        [...this.$Markers, ...this.$Lines].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Markers = [[], [], []];
        this.$Lines = [[], [], []];
        let args = {page: 0, size: 999999, imsis: row.imsi, cplx: row.cplx, cphms: row.cphm,};
        args.kssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[0]) ? this.formItem_r2_agg.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
        args.jssjc = (this.formItem_r2_agg.datetimerange && this.formItem_r2_agg.datetimerange[1]) ? this.formItem_r2_agg.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
        this.$http.post('/api/com/icr3/selectNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let [x, y, left_up, right_down] = [118.367292, 35.112697, [180, -90], [-180, 90]];
            let data = response.data.data.filter((record) => record.redianDevice && record.redianDevice.gcjLongitude && record.redianDevice.gcjLatitude)
              .filter(record => record.kakouDevice && record.kakouDevice.gcjLongitude && record.kakouDevice.gcjLatitude);
            let kkbhGroups = {};
            data.forEach((record) => {
              ([x, y] = [(x + record.kakouDevice.gcjLongitude) / 2, (y + record.kakouDevice.gcjLatitude) / 2]);
              ([x, y] = [(x + record.redianDevice.gcjLongitude) / 2, (y + record.redianDevice.gcjLatitude) / 2]);
              left_up = [Math.min(left_up[0], record.kakouDevice.gcjLongitude, record.redianDevice.gcjLongitude), Math.max(right_down[1], record.kakouDevice.gcjLatitude, record.redianDevice.gcjLatitude)];
              right_down = [Math.max(right_down[0], record.kakouDevice.gcjLongitude, record.redianDevice.gcjLongitude), Math.min(right_down[1], record.kakouDevice.gcjLatitude, record.redianDevice.gcjLatitude)];
              kkbhGroups[record.kkbh] ? kkbhGroups[record.kkbh].push(record) : kkbhGroups[record.kkbh] = [record];
            });
            let markers = Object.values(kkbhGroups).map((_) => {
              let one = _[0];
              let rdbhGroups = {};
              _.forEach((record) => rdbhGroups[record.rdbh] ? rdbhGroups[record.rdbh].push(record) : rdbhGroups[record.rdbh] = [record]);
              let imsis = Object.values(rdbhGroups).map((_) => {
                let one = _[0];
                return `
                        手机串号:${one.imsi || '未知'}<br/>
                        点位编号:${one.redianDevice ? one.redianDevice.pointCode : one.rdbh}<br/>
                        点位名称:${one.redianDevice ? one.redianDevice.roadName : '未知'}<br/>
                        点位经度:${one.redianDevice ? one.redianDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.redianDevice ? one.redianDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                    `;
              });
              return L.marker([one.kakouDevice ? one.kakouDevice.gcjLatitude : 0, one.kakouDevice ? one.kakouDevice.gcjLongitude : 0,], {icon: this.$greenIcon})
                .bindPopup(`
                        车牌号码:${one.cphm || '未知'}<br/>
                        车辆类型:${this.cplx[one.cplx] || one.cplx || '未知'}<br/>
                        点位编号:${one.kakouDevice ? one.kakouDevice.pointCode : one.rdbh}<br/>
                        点位名称:${one.kakouDevice ? one.kakouDevice.roadName : '未知'}<br/>
                        点位经度:${one.kakouDevice ? one.kakouDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.kakouDevice ? one.kakouDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>${_.splice(0, 10).map(_ => new Date(_.gcsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        <hr/>
                        ${imsis.splice(0, 5).join('<br/><hr/>')}
                        ${5 < imsis.length ? '......' : ''}
                        `)
                .addTo(this.$map);
            });
            this.$Markers[2].push(...markers);
            let lines = response.data.data.filter(record => record.kakouDevice && record.kakouDevice.gcjLongitude && record.kakouDevice.gcjLatitude)
              .map(record => [record.kakouDevice.gcjLatitude, record.kakouDevice.gcjLongitude]).reverse();
            let path = L.polyline.antPath(lines, {delay: 1500, weight: 3, dashArray: [10, 20], color: 'green', pulseColor: '#FFFFFF',}).addTo(this.$map);
            this.$Lines[0].push(path);
            this.$map.flyTo([y, x]);
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
          }
        });
      },
    }
  }*/
</script>

<style scoped>

</style>
