<style>
  .table-box-2{
   border:1px solid #ddd;
    background-color:rgba(238,238,238,0.7);
    position: absolute;
    top:0;width: 30%;
    left:0;
    z-index: 9;
  }
  .icon-1{
    position: absolute;
    top:10px;
    z-index: 9;
  }
</style>
<template>
  <div>
    <div class="clear">
      <Form class="form-item-s" ref="ref_formItem" :model="formItem" :rules="formItem_rules" inline>
        <FormItem prop="imsis">
          <Input class="interval" size="small" clearable v-model="formItem.imsis" placeholder="请输入IMSI,多号码半角逗号间隔"
                 @on-change="queryChange"/>
        </FormItem>
        <FormItem prop="datetimerange">
          <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.datetimerange"
                      placeholder="请选择时间范围" style="width: 300px" @on-change="queryChange"/>
        </FormItem>
        <FormItem>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          </ButtonGroup>
          <ButtonGroup size="small" style="padding-left:25px;">
            <Button ghost @click="clear()" type="warning" icon="ios-refresh">清屏</Button>
          </ButtonGroup>
        </FormItem>
      </Form>
    </div>
    <div  style="height:calc(100vh - 140px)"  :style="{ overflowY: 'auto',position: 'relative'}">
      <div class="table-box-2" v-show="showBox">
        <Table
          ref="selection" highlight-row :columns="columns" :data="content" border :loading="loading"
          :max-height="tableHeight / 2 - 13"
          @on-row-click="singleRowClick"
          @on-row-dblclick="doubleRowClick"
        />
        <Page
          size="small" show-total
          :page-size-opts="[100,200,400,800,2000]"
          :current.sync="pageInfo.page" :page-size.sync="pageInfo.size"
          :total="pageInfo.totalElements" @on-change="search"
          @on-page-size-change="(value) => {pageInfo.size = value;search();}"
          style="float: right;margin: 0px"
        />
      </div>
      <Icon type="md-reorder" class="icon-1" :style="{fontSize:'20px',left:showBox?'30%':0}" @click="vShow"/>
      <div id="map_1556155828169" style="z-index:8;width:100%;height:100%"></div>
    </div>
    <!-- 弹窗显示匹配信息 -->

    <Modal :styles="{top: '20px'}" v-model="associatedDataOptions.showModal" title="信息查阅" width="1200">
      <associatedData :options="associatedDataOptions"/>
      <div slot="footer"/>
    </Modal>

  </div>
</template>

<script>

  import associatedData from './components/detail1';

  import L from 'leaflet';
  import leafletAntPath from 'leaflet-ant-path';
  import carIcon from '@/assets/car.png';
  import imsiIcon from '@/assets/imsi.png';
  import carImsiIcon from '@/assets/car_imsi.png';

  export default {
    name: "node02",
    components: {associatedData: associatedData, L, leafletAntPath},
    watch: {
      tableHeight: {
        handler(curVal, oldVal) {
            this.setHeight();
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
      window.onresize = () => this.setHeight();
      window.oncontextmenu = e => e.preventDefault();

      // 初始化地图
      this.$blueIcon = L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$greenIcon = L.icon({iconUrl: carImsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      L.tileLayer(this.$tileLayerUrl).addTo(this.$map = L.map('map_1556155828169', this.$leafletOption));
      this.$Markers = [[], [], []]; // 节点打点集合[[源],[目标],[重合]]
      this.$Lines = [[], [], []]; // 划线内容[[源],[目标],[重合]]
      // 地图初始化完成
    },
    data() {
      return {
        tableHeight: 0,
        showBox:true,
        associatedDataOptions: {showModal: false,},

        formItem: {
          imsis: '460011208910962',
          datetimerange: [new Date(new Date().getTime() - 2 * 86400000), new Date()],
        }, // 展示请求参数
        formItem_rules: {
          imsis: [{required: true, type: 'string', message: '请填写IMSI号码!', trigger: 'blur',}],
          datetimerange: [{
            required: true, type: 'date', trigger: 'change',
            validator: (rule, value, callback) => (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!')),
          }],
        },
        pageInfo: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading: false, // 数据加载动作
        columns: [
          {title: '源号码', key: 'source', minWidth: 100, align: 'center',},
          {title: '目标号码', key: 'target', minWidth: 100, align: 'center',},
          {
            title: '概率',
            key: 'probability',
            minWidth: 50,
            align: 'center',
            render: (h, params) => h('div', {}, params.row.probability.toFixed(7)),
          },
          {
            title: '操作', minWidth: 50, align: 'center', render: (h, params) => {
              return h('div', {}, [h('Button', {
                style: {marginRight: '5px'},
                domProps: {zIndex: 10000},
                props: {type: 'dashed', shape: "circle", size: 'small', icon: "ios-search"},
                on: {click: () => this.magnifyingGlass(params.row, params.index)}
              },),]);
            }
          },
        ], // 展示字段
        content: [], // 数据

        timer: {},
        tasker: {},
      }
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.tableHeight = height-20;
        }
      },
      vShow() {
        this.$set(this, 'showBox', !this.showBox)
      },
      queryChange() {
        this.$Markers.forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        this.$Lines.forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => this.$set(this.formItem, node, ''));
        this.$set(this, 'content', []);
        this.$set(this, 'loading', false);
        this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
      },
      reset() {
        this.$set(this, 'formItem', {
          imsis: '',
          datetimerange: [new Date(new Date().getTime() - 2 * 86400000), new Date()],
        });
        this.queryChange();
      },
      clear() {
        [...this.$Markers, ...this.$Lines].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        [this.$Markers, this.$Lines] = [[[], [], []], [[], [], []]];
      },
      /**
       * 触发绘制记录轨迹.
       * @param row 当前选中记录
       * @param index 当前选中记录索引
       */
      singleRowClick(currentRow, index) {
        if (!currentRow) return false;
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime());
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastUpdateTimestamp > 300) {
            this.$set(this.formItem, 'action', this.selectImsisRecords.name);
            [this.$Markers[2], this.$Lines[2]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
            [this.$Markers[2], this.$Lines[2]] = [[], []];
            if (currentRow.source !== this.formItem.source || 0 == this.$Markers[0].length || 0 == this.$Lines[0].length) {
              ['sourceType', 'source',].forEach(node => this.$set(this.formItem, node, currentRow[node] || undefined));
              this.$set(this.formItem, 'sourceIndex', index);
              this.selectImsisRecords('source', index);
            }
            if (currentRow.target !== this.formItem.target || 0 == this.$Markers[1].length || 0 == this.$Lines[1].length) {
              ['targetType', 'target',].forEach(node => this.$set(this.formItem, node, currentRow[node] || undefined));
              this.$set(this.formItem, 'targetIndex', index);
              this.selectImsisRecords('target', index);
            }
          }
        }, 301);
      },
      /**
       * 触发绘制重合轨迹.
       * @param row 当前选中记录
       * @param index 当前选中记录索引
       */
      doubleRowClick(currentRow, index) {
        if (!currentRow) return false;
        this.$set(this.formItem, 'action', this.selectRelationship.name);
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime() + 100);
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => this.$set(this.formItem, node, currentRow[node] || undefined));
        this.$set(this.formItem, `${this.selectRelationship.name}Index`, index);
        this.selectRelationship(currentRow, index);
      },
      /**
       * 绘制重合轨迹表格.
       * @param row 当前选中记录
       */
      magnifyingGlass(row) {
        if (!row) return false;
        if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 2 * 86400000) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持2天上限,请选择合适的时间范围.',});
          return false;
        }
        setTimeout(() => (row.target === this.formItem.target) && (this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime() + 100)), 100);

        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime() + 100);
        let args = {showModal: true, _t: new Date().getTime()};
        [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => args[node] = row[node]);
        this.$set(this, 'associatedDataOptions', args);
      },
      /**
       * 获取概率信息.
       */
      search() {
        this.$refs['ref_formItem'].validate((valid) => {
          if (valid) {
            if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 2 * 86400000) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持2天上限,请选择合适的时间范围.',});
              return false;
            }
            this.$set(this, 'loading', true);
            let args = {};
            [args.source, args.sourceType] = [this.formItem.imsis, ''];
            [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()];
            [args.page, args.size] = [this.pageInfo.page && this.pageInfo.page - 1 || 0, this.pageInfo.size && this.pageInfo.size || 100];
            this.$http.post('/api/com/data/4/associated/data/4/redian/selectNodes', args).then((response) => {
              if (!!response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.pageInfo, 'totalElements', response.data.page.totalElements);
                  this.$set(this.pageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
                  this.$set(this, 'content', response.data.data);
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'loading', false);
            }).catch(() => this.$set(this, 'loading', false));
          }
        });
      },
      /**
       * 绘制记录轨迹.
       * @param row 当前选中记录
       * @param index 当前选中记录索引
       */
      selectImsisRecords(position, index) {
        if (this.formItem.datetimerange && 2 === this.formItem.datetimerange.length && (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 2 * 86400000)) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持2天上限,请选择合适的时间范围.',});
          return false;
        }

        // 释放之前内容
        [this.$Markers['source' === position ? 0 : 1], this.$Lines['source' === position ? 0 : 1]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        [this.$Markers['source' === position ? 0 : 1], this.$Lines['source' === position ? 0 : 1]] = [[], []];

        let args = {page: 0, size: 9999, imsis: this.formItem[`${position}`]};
        [args.kssjc, args.jssjc] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳

        let [x, y, left_up, right_down] = [/*this.$map.getCenter().lng, this.$map.getCenter().lat,*/ 118.367292, 35.112697, [180, -90], [-180, 90]];
        this.$http.post('/api/com/redianshuju/selectNodes', args).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let groups = {};
            response.data.data.filter(node => node.device.gcjLongitude && node.device.gcjLatitude).forEach(record => {
              ([x, y] = [(x + record.device.gcjLongitude) / 2, (y + record.device.gcjLatitude) / 2]);
            });
            response.data.data.forEach((_) => groups[_.rdbh] ? groups[_.rdbh].push(_) : groups[_.rdbh] = [_]);
            let markers = Object.keys(groups).map(_ => groups[_]).map((_) => {
                let one = _[0];
                return L.marker([one.device ? one.device.gcjLatitude : 0, one.device ? one.device.gcjLongitude : 0,], {icon: 'source' === position ? this.$redIcon : this.$blueIcon})
                  .bindPopup(`
                        手机串号:${one.imsi || '未知'}<br/>
                        点位编号:${one.device ? one.device.pointCode : one.rdbh}<br/>
                        点位名称:${one.device ? one.device.roadName : '未知'}<br/>
                        点位经度:${one.device ? one.device.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.device ? one.device.wgsLatitude : '未知'}<br/>
                        采集时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        `);
              }
            );
            if (this.formItem[`${position}Index`] === index && this.selectImsisRecords.name === this.formItem.action) {
              this.$Markers['source' === position ? 0 : 1] = markers;
              let lines = response.data.data.filter(_ => _.device && _.device.gcjLatitude && _.device.gcjLongitude).map(_ => [_.device.gcjLatitude, _.device.gcjLongitude]).reverse();
              let path = L.polyline.antPath(lines, {
                delay: 1500,
                weight: 3,
                dashArray: [10, 20],
                color: 'source' === position ? 'OrangeRed' : 'blue',
                pulseColor: '#FFFFFF',
              })
                .addTo(this.$map);
              this.$Lines['source' === position ? 0 : 1] = [path];
              this.$map.flyTo([y, x]);
              [this.$Markers['source' === position ? 0 : 1], this.$Lines['source' === position ? 0 : 1]].forEach(_ => _.forEach(_ => _.addTo(this.$map)));
            }
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg || '网络链接失败,请重试!',});
          }
        });
      },
      /**
       * 绘制重合轨迹.
       * @param row 当前选中记录
       * @param index 当前选中记录索引
       */
      selectRelationship(row, index) {
        if (this.formItem.datetimerange && 2 === this.formItem.datetimerange.length && (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 2 * 86400000)) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持2天上限,请选择合适的时间范围.',});
          return;
        }

        [...this.$Markers, ...this.$Lines].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));

        [this.$Markers, this.$Lines] = [[[], [], []], [[], [], []]];
        let args = {page: 0, size: 999, _t: new Date().getTime()};
        [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => args[node] = row[node]);
        this.$http.post('/api/com/data/4/associated/data/4/redian/selectDetailNodes', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let [x, y, left_up, right_down] = [118.367292, 35.112697, [180, -90], [-180, 90]];
            let data = (response.data.data || []).filter((record) => record.sourceDevice && record.sourceDevice.gcjLongitude && record.sourceDevice.gcjLatitude)
              .filter(record => record.targetDevice && record.targetDevice.gcjLongitude && record.targetDevice.gcjLatitude);
            let pointCodeGroups = {};
            data.forEach((record) => {
              ([x, y] = [(x + record.targetDevice.gcjLongitude) / 2, (y + record.targetDevice.gcjLatitude) / 2]);
              ([x, y] = [(x + record.sourceDevice.gcjLongitude) / 2, (y + record.sourceDevice.gcjLatitude) / 2]);
              left_up = [Math.min(left_up[0], record.targetDevice.gcjLongitude, record.sourceDevice.gcjLongitude), Math.max(right_down[1], record.targetDevice.gcjLatitude, record.sourceDevice.gcjLatitude)];
              right_down = [Math.max(right_down[0], record.targetDevice.gcjLongitude, record.sourceDevice.gcjLongitude), Math.min(right_down[1], record.targetDevice.gcjLatitude, record.sourceDevice.gcjLatitude)];
              pointCodeGroups[record.sourcePointCode] ? pointCodeGroups[record.sourcePointCode].push(record) : pointCodeGroups[record.sourcePointCode] = [record];
            });
            let markers = Object.values(pointCodeGroups).map((_) => {
              let one = _[0];
              return L.marker([one.sourceDevice ? one.sourceDevice.gcjLatitude : 0, one.sourceDevice ? one.sourceDevice.gcjLongitude : 0,], {icon: this.$greenIcon})
                .bindPopup(`
                        IMSI号码:${one.sourceImsi || '未知'}<br/>
                        点位编号:${one.sourceDevice ? one.sourceDevice.pointCode : one.sourcePointCode}<br/>
                        点位名称:${one.sourceDevice ? one.sourceDevice.roadName : '未知'}<br/>
                        点位经度:${one.sourceDevice ? one.sourceDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.sourceDevice ? one.sourceDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>
                        ${_.slice(0, 3).map(_ => `${new Date(_.sourceStartTime).format('yyyy-MM-dd HH:mm:ss')} ~ ${new Date(_.sourceEndTime).format('yyyy-MM-dd HH:mm:ss')}`).join('<br/>')}
                        <br/>
                        ${3 < _.length ? '......' : ''}
                        <hr/>
                        IMSI号码:${one.targetImsi || '未知'}<br/>
                        点位编号:${one.targetDevice ? one.targetDevice.pointCode : one.targetPointCode}<br/>
                        点位名称:${one.targetDevice ? one.targetDevice.roadName : '未知'}<br/>
                        点位经度:${one.targetDevice ? one.targetDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.targetDevice ? one.targetDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>
                        ${_.slice(0, 3).map(_ => `${new Date(_.targetStartTime).format('yyyy-MM-dd HH:mm:ss')} ~ ${new Date(_.targetEndTime).format('yyyy-MM-dd HH:mm:ss')}`).join('<br/>')}
                        <br/>
                        ${3 < _.length ? '......' : ''}
                        <hr/>
                        `);
            });
            if (this.formItem[`${this.selectRelationship.name}Index`] === index && this.selectRelationship.name === this.formItem.action) {
              this.$Markers[2] = markers;
              let lines = data.map(record => [record.sourceDevice.gcjLatitude, record.sourceDevice.gcjLongitude]).reverse();
              let path = L.polyline.antPath(lines, {
                delay: 1500,
                weight: 3,
                dashArray: [10, 20],
                color: 'green',
                pulseColor: '#FFFFFF',
              }).addTo(this.$map);
              this.$Lines[2] = [path];
              this.$map.flyTo([y, x]);
              [this.$Markers[2], this.$Lines[2]].forEach(_ => _.forEach(_ => _.addTo(this.$map)));
              this.$set(this.formItem, 'action', undefined);
              this.$set(this.formItem, `${this.selectRelationship.name}Index`, undefined);
            }
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
          }
        });
      },
    }
  }
</script>

<style scoped></style>
