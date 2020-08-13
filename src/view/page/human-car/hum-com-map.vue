<template>
  <div>
    <div class="clear">
      <Form ref="ref_formItem" class="form-item-s" :model="formItem" :rules="formItem_rules" inline>
        <FormItem prop="cplx">
          <Select class="interval" size="small" v-model="formItem.cplx" placeholder="请选择车牌类型" @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.cplx || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </FormItem>
        <FormItem prop="cphms">
          <Input class="interval" size="small" clearable v-model="formItem.cphms" placeholder="请输入车牌号码"
                 @on-change="queryChange"/>
        </FormItem>
        <FormItem prop="imsis">
          <Input class="interval" size="small" clearable v-model="formItem.imsis" placeholder="请输入IMSI号码"
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
        <FormItem>
          <Dropdown size="small" style="padding-left:10px;">
            <a href="javascript:void(0)">
              自定义点位关系
              <Icon type="ios-arrow-down" style=""></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="setCustomRelationsModal(true)">添加自定义关系</DropdownItem>
              <template v-for="(value, key, index) in customRelations">
                <DropdownItem :key="index">{{value[0].roadName}}->{{value[1].roadName}}
                  <Icon type="md-close" @click="deleteCustomRelations(key)" style="float: right;"/>
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
        </FormItem>
      </Form>
    </div>

    <div style="height:calc(100vh - 140px)" :style="{ overflowY: 'auto',position: 'relative'}">
      <div
        style="border:1px solid #ddd;background-color:rgba(238,238,238,0.7);position: absolute;top:0;width: 30%;z-index: 999"
        v-show="showBox">
        <Table
          ref="selection"
          highlight-row :columns="columns" :data="content"
          border :loading="loading" :max-height="tableHeight / 2 - 13"
          @on-row-click="singleRowClick"
          @on-row-dblclick="doubleRowClick"
        />
        <Page
          size="small" show-total :page-size-opts="[100,200,400,800,2000]"
          :current.sync="pageInfo.page" :page-size.sync="pageInfo.size"
          :total="pageInfo.totalElements" @on-change="search"
          @on-page-size-change="(value) => {pageInfo.size = value;search();}"
          style="float: right;margin: 0px"
        />
      </div>
      <Icon type="md-reorder"
            :style="{fontSize:'20px',left:showBox?'30%':0,position: 'absolute',top:'10px',zIndex: 999}" @click="vShow"/>
      <div id="map_1556155828169" :style="{width: '100%',height: '100%'}"></div>
    </div>
    <!-- 弹窗显示匹配信息 -->
    <Modal :styles="{top: '20px'}" v-model="associatedDataOptions.showModal" title="信息查阅" width="1200">
      <associatedData :options="associatedDataOptions"/>
      <div slot="footer"/>
    </Modal>
    <Modal :styles="{top: '20px'}" v-model="customRelationsModal" title="自定义点位关系" width="1200">
      <div style="height: 700px;">
        <relationsData ref="relationsData" :options="customRelations"></relationsData>
      </div>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>
<script>
  import associatedData from './components/com-detail';
  import relationsData from './components/equ-rd-way-map';

  import L from 'leaflet';
  import leafletAntPath from 'leaflet-ant-path';
  import carIcon from '@/assets/car.png';
  import imsiIcon from '@/assets/imsi.png';
  import carImsiIcon from '@/assets/car_imsi.png';

  export default {
    name: "node04",
    components: {associatedData: associatedData, L, leafletAntPath, relationsData},
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
      window.oncontextmenu=e=>e.preventDefault();

      // 初始化地图
      this.$blueIcon = L.icon({iconUrl: carIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$greenIcon = L.icon({iconUrl: carImsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      L.tileLayer(this.$tileLayerUrl).addTo(this.$map = L.map('map_1556155828169', this.$leafletOption));
      this.$Markers = [[], [], []]; // 节点打点集合[[源],[目标],[重合]]
      this.$Lines = [[], [], []]; // 划线内容[[源],[目标],[重合]]
      // 地图初始化完成
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    data() {
      return {
        tableHeight: 0,
        tableWidth: '250pt',
        showBox: true,
        userInfo: {},
        dictionary: {},

        associatedDataOptions: {showModal: false,},

        formItem: {
          cplx: '2',
          cphms: '鲁QR28L1',
          imsis: '',
          datetimerange: [new Date(new Date().getTime() - 2 * 86400000), new Date()],
        }, // 展示请求参数
        formItem_rules: {
          cplx: [{
            required: true, type: 'string', message: '请选择车牌类型!', trigger: 'blur',
            validator: (rule, value, callback) => ((this.formItem.cplx && this.formItem.cphms) || this.formItem.imsis) ? callback() : callback(new Error()),
          },],
          cphms: [{
            required: true, type: 'string', message: '请填写车牌号码!', trigger: 'blur',
            validator: (rule, value, callback) => ((this.formItem.cplx && this.formItem.cphms) || this.formItem.imsis) ? callback() : callback(new Error()),
          }],
          imsis: [{
            required: true, type: 'string', message: '请填写IMSI号码!', trigger: 'blur',
            validator: (rule, value, callback) => ((this.formItem.cplx && this.formItem.cphms) || this.formItem.imsis) ? callback() : callback(new Error()),
          }],
          datetimerange: [{
            required: true, type: 'date', trigger: 'change',
            validator: (rule, value, callback) => (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!')),
          }],
        },
        pageInfo: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading: false, // 数据加载动作
        columns: [
          {
            title: '源号码', key: 'source', minWidth: 70, maxWidth: 75, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, 'right', {
              类型: this.dictionary.cplx && this.dictionary.cplx[params.row.sourceType] || params.row.sourceType || '无',
            }, params.row.source),
          },
          {title: '目标号码', key: 'target', minWidth: 70, align: 'center',},
          {
            title: '概率',
            key: 'probability',
            minWidth: 70,
            maxWidth: 75,
            align: 'center',
            render: (h, params) => h('div', {}, params.row.probability.toFixed(8)),
          },
          {
            title: '操作', minWidth: 50, maxWidth: 60, align: 'center', render: (h, params) => {
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

        customRelation: {}, // 自定义关系
        customRelations: {}, // 自定义关系集合
        customRelationsModal: false,

        timer: {},
        tasker: {},
      }
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.tableHeight = height - 20;
        }
      },
      vShow() {
        this.$set(this, 'showBox', !this.showBox)
      },
      setCustomRelationsModal(value) {
        this.$set(this, 'customRelationsModal', value);
        this.$refs.relationsData.init();
      },
      deleteCustomRelations(key) {
        (key) && (delete this.customRelations[key]);
        this.$forceUpdate();
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
          cplx: '2',
          cphms: '',
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
            this.$set(this.formItem, 'action', this.selectImsisRecords.name + this.selectCarsRecords.name);
            [this.$Markers[2], this.$Lines[2]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
            [this.$Markers[2], this.$Lines[2]] = [[], []];
            if (currentRow.source !== this.formItem.source || 0 == this.$Markers[0].length || 0 == this.$Lines[0].length) {
              ['sourceType', 'source',].forEach(node => this.$set(this.formItem, node, currentRow[node] || undefined));
              this.$set(this.formItem, 'sourceIndex', index);
              this.selectCarsRecords('source', index);
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
        if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
          return false;
        }
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
        if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
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
      getMapping() {
        return Object.values(this.customRelations).map(node => `${node[0].pointCode}->${node[1].pointCode}`).join(',');
      },
      search() {
        this.$refs['ref_formItem'].validate((valid) => {
          if (valid) {
            if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
              return false;
            }
            this.$set(this, 'loading', true);
            let args = {};
            args.mapping = this.getMapping();
            (this.formItem.cphms && this.formItem.cplx) && ([args.source, args.sourceType] = [this.formItem.cphms, this.formItem.cplx]);
            (this.formItem.imsis) && ([args.target, args.targetType] = [this.formItem.imsis, '']);
            [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()];
            [args.page, args.size] = [this.pageInfo.page && this.pageInfo.page - 1 || 0, this.pageInfo.size && this.pageInfo.size || 100];
            this.$http.post('/api/com/data/4/associated/data/4/kakou/$/redian/selectNodes', args).then((response) => {
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
      selectCarsRecords(position, index) {
        if (this.formItem.datetimerange && 2 === this.formItem.datetimerange.length && (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000)) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
          return false;
        }

        // 释放之前内容
        [this.$Markers['source' === position ? 0 : 1], this.$Lines['source' === position ? 0 : 1]].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));
        [this.$Markers['source' === position ? 0 : 1], this.$Lines['source' === position ? 0 : 1]] = [[], []];

        let args = {page: 0, size: 9999, cphms: this.formItem[`${position}`], cplx: this.formItem[`${position}Type`]};
        [args.kssjc, args.jssjc] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳
        let [x, y, left_up, right_down] = [/*this.$map.getCenter().lng, this.$map.getCenter().lat,*/ 118.367292, 35.112697, [180, -90], [-180, 90]];
        this.$http.post('/api/com/kakoushuju/selectNodes', args).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            response.data.data.filter(node => node.device && node.device.gcjLongitude && node.device.gcjLatitude).forEach(record => {
              ([x, y] = [(x + record.device.gcjLongitude) / 2, (y + record.device.gcjLatitude) / 2]);
            });
            let groups = {};
            response.data.data.forEach((_) => groups[_.kkbh] ? groups[_.kkbh].push(_) : groups[_.kkbh] = [_]);
            let markers = Object.keys(groups).map(_ => groups[_]).map((_) => {
                let one = _[0];
                return L.marker([one.device ? one.device.gcjLatitude : 0, one.device ? one.device.gcjLongitude : 0,], {icon: 'source' === position ? this.$redIcon : this.$blueIcon})
                  .bindPopup(`
                        号牌号码:${one.cphm || '未知'}<br/>
                        点位编号:${one.device ? one.device.pointCode : one.kkbh}<br/>
                        点位名称:${one.device ? one.device.roadName : '未知'}<br/>
                        点位经度:${one.device ? one.device.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.device ? one.device.wgsLatitude : '未知'}<br/>
                        采集时间:<br/>${_.splice(0, 10).map(_ => new Date(_.cjsjc).format('yyyy-MM-dd HH:mm:ss')).join('<br/>')}<br/>
                        ${10 < _.length ? '......' : ''}
                        `);
              }
            );
            if (this.formItem[`${position}Index`] === index && (this.selectImsisRecords.name + this.selectCarsRecords.name) === this.formItem.action) {
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
       * 绘制记录轨迹.
       * @param row 当前选中记录
       * @param index 当前选中记录索引
       */
      selectImsisRecords(position, index) {
        if (this.formItem.datetimerange && 2 === this.formItem.datetimerange.length && (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000)) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
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
            response.data.data.filter(node => node.device && node.device.gcjLongitude && node.device.gcjLatitude).forEach(record => {
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
            if (this.formItem[`${position}Index`] === index && (this.selectImsisRecords.name + this.selectCarsRecords.name) === this.formItem.action) {
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
        if (this.formItem.datetimerange && 2 === this.formItem.datetimerange.length && (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000)) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
          return;
        }

        [...this.$Markers, ...this.$Lines].forEach(_ => _.forEach(_ => this.$map.removeLayer(_)));

        [this.$Markers, this.$Lines] = [[[], [], []], [[], [], []]];
        let args = {page: 0, size: 999, _t: new Date().getTime()};
        args.mapping = this.getMapping();
        [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => args[node] = row[node]);
        this.$http.post('/api/com/data/4/associated/data/4/kakou/$/redian/selectDetailNodes', args).then((response) => {
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
                        号牌号码:${one.sourcePlateNumber || '未知'}<br/>
                        点位编号:${one.sourceDevice ? one.sourceDevice.pointCode : one.sourcePointCode}<br/>
                        点位名称:${one.sourceDevice ? one.sourceDevice.roadName : '未知'}<br/>
                        点位经度:${one.sourceDevice ? one.sourceDevice.wgsLongitude : '未知'}<br/>
                        点位纬度:${one.sourceDevice ? one.sourceDevice.wgsLatitude : '未知'}<br/>
                        时间:<br/>
                        ${_.slice(0, 3).map(_ => `${new Date(_.sourceStartTime).format('yyyy-MM-dd HH:mm:ss')} ~ ${new Date(_.sourceEndTime).format('yyyy-MM-dd HH:mm:ss')}`).join('<br/>')}
                        <br/>
                        ${3 < _.length ? '......' : ''}
                        <hr/>
                        号牌号码:${one.targetImsi || '未知'}<br/>
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
