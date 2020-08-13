<style scoped lang="less">
  .table-box-1 {
    border: 1px solid #ddd;
    background-color: rgba(238, 238, 238, 0.7);
    position: absolute;
    left: 0;
    top: 0;
    width: 30%;
    z-index: 9;
  }

  .table-box-3 {
    border: 1px solid #ddd;
    background-color: rgba(238, 238, 238, 0.7);
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    z-index: 9;
  }

  .form-item-ss {
    //z-index: 999;
    //padding-bottom: 10px;
    .ivu-form-items {
      height: 34px;
      margin: 0;
      //overflow: hidden;
    }

    .times {
      //overflow: auto;
    }
  }

  .icon-1 {
    position: absolute;
    top: 10px;
    z-index: 9;
  }

  .icon-2 {
    position: absolute;
    top: 10px;
    z-index: 9;
  }

  .ivu-picker-panel-body {
    z-index: 99;
  }
</style>

<template>
  <div>
    <div class="clear">
      <Form ref="ref_formItem" class="form-item-s" :model="formItem" inline>
        <FormItem prop="datetimerange">
          <DatePicker class="interval" size="small" type="datetimerange" v-model="datetimerange" placeholder="请选择时间范围"
                      style="width: 300px" @on-change="queryChangeDatePicker"/>
        </FormItem>
        <FormItem prop="threshold" style="padding-left: 5pt;">
          <Input class="interval" size="small" clearable v-model="formItem.threshold" placeholder="全局时间阈值(单位是秒)"/>
        </FormItem>
        <FormItem>
          <ButtonGroup size="small" style="padding-left:0px;">
            <Button ghost @click="updateThreshold()" type="info" icon="ios-refresh" :loading="aggLoading">更新</Button>
          </ButtonGroup>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="insert()" type="success" icon="md-add" :loading="aggLoading">添加</Button>
            <Button ghost @click="remove()" type="error" icon="md-close" :loading="aggLoading">删除</Button>
            <Button ghost @click="search()" type="info" icon="ios-search" :loading="aggLoading">搜索</Button>
          </ButtonGroup>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button @click="resetContent()" icon="ios-refresh" :loading="aggLoading">重置内容</Button>
            <Button @click="resetMap()" icon="ios-refresh" :loading="aggLoading">重置地图</Button>
          </ButtonGroup>
        </FormItem>
      </Form>
    </div>
    <div style="height:calc(100vh - 140px)" :style="{overflowY: 'auto',position: 'relative'}">
      <div class="table-box-1" v-show="showBox1">
        <Table
          ref="selectPointColumns"
          highlight-row :columns="selectPointColumns"
          :data="selectPoint" border
          :max-height="(tableHeight/2)"
          :row-class-name="(row, index) => row.device && row.device.relationKakouIds && row.device.relationKakouIds.length ? 'include-imsi' : ''"
          @on-row-dblclick="update">
        </Table>
        <Table
          ref="selectContentColumns"
          highlight-row :columns="addDataColumns"
          :data="aggData" border
          :max-height="(tableHeight/2)"
          @on-row-click="rightSelectDataByContent"
          @on-row-dblclick="modalSelectDataByContent"
        />
      </div>

      <div class="table-box-3" v-show="showBox2" :style="{height:tableHeight+'px'}">
        <Form class="form-item-ss" ref="ref1592299001381" :model="insertItem" :rules="insertRuleValidate"
              :label-width="80">
          <FormItem class="ivu-form-items" label="起始序号" prop="index">
            <Input size="small" disabled v-model="insertItem.index" placeholder="序号" style="width: 150pt;"/>
          </FormItem>
          <FormItem class="ivu-form-items" label="组号" prop="group">
            <Input-number v-model="insertItem.group" placeholder="组号" size="small" clearable></Input-number>
            <Input v-model="insertItem.groupDesc" size="small" style="width: 100pt;" placeholder="组描述" clearable/>
          </FormItem>
          <FormItem label="點位位置">
            <div :style="{maxHeight: (tableHeight/3)+'px',overflowY: 'auto'}">
              <template v-for="(item) in selectCachePoint">
                <Input disabled size="small" style="width: 150pt;" :key="item.id" :value="item.roadName"/>
                <Button ghost size="small" type="warning" shape="circle" icon="md-close"
                        @click="clearSelectPoint(item.id)"/>
              </template>
            </div>
          </FormItem>
          <FormItem class="ivu-form-items" label="采集时间" prop="acquisition_time">
            <Date-picker size="small" v-model="insertItem.acquisition_time" type="datetime"
                         placeholder="选择采集时间"></Date-picker>
          </FormItem>
          <FormItem class="ivu-form-items" label="时间阈值" prop="temporal_threshold">
            <Input-number v-model="insertItem.temporal_threshold" placeholder="时间阈值" size="small"
                          clearable></Input-number>
          </FormItem>
          <FormItem class="ivu-form-items">
            <Button type="primary" size="small" @click="insertSubmit" :loading="insertModalLoading"
                    style="width: 120pt;">确定
            </Button>
          </FormItem>
        </Form>
      </div>
      <Icon type="md-reorder" class="icon-1" :style="{fontSize:'20px',left:showBox1?'30%':0}" @click="vShow1"/>
      <Icon type="md-reorder" class="icon-2" :style="{fontSize:'20px',right:showBox2?'30%':0}" @click="vShow2"/>
      <div class="clear" id="map_1592290707334" :style="{zIndex:8,width: '100%',height:'100%'}"></div>
    </div>

    <!-- 弹窗显示匹配信息 -->
    <!-- 详细信息 -->
    <Modal :styles="{top: '20px'}" v-model="infoShowModal" title="详细信息" width="100%">
      <Table ref="selection" highlight-row :columns="infomationColumns"
             :data="infomationData" border :loading="infoModalLoading"
             :height="600"
      ></Table>
      <div slot="footer">
        <Button type="primary" size="small" @click="() => (this.$set(this, 'infoShowModal', false))"
                :loading="infoModalLoading">确定
        </Button>
      </div>
    </Modal>
    <!-- 更新关联设备信息 -->
    <Modal v-model="editShowModal" title="信息维护" width="700px">
      <Form ref="ref1591330171148" :model="editItem" :rules="editRuleValidate" :label-width="120">
        <FormItem label="起始序号" prop="index">
          <Input disabled v-model="editItem.index" placeholder="序号" clearable/>
        </FormItem>
        <FormItem label="组号" prop="group">
          <Input-number v-model="editItem.group" placeholder="组号" size="small" clearable></Input-number>
          <Input v-model="editItem.groupDesc" size="small" style="width: 200pt;" placeholder="组描述" clearable/>
        </FormItem>
        <FormItem label="点位位置" prop="redianPointCodes">
          <Input disabled :value="editItem.roadName" placeholder="点位位置" clearable/>
        </FormItem>
        <FormItem label="采集时间" prop="acquisition_time">
          <Date-picker size="small" v-model="editItem.acquisition_time" type="datetime"
                       placeholder="选择采集时间"></Date-picker>
        </FormItem>
        <FormItem label="时间阈值" prop="temporal_threshold">
          <Input-number v-model="editItem.temporal_threshold" placeholder="时间阈值" size="small" clearable></Input-number>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="() => (this.$set(this, 'editShowModal', false))"
                :loading="editModalLoading">取消
        </Button>
        <Button type="primary" size="large" @click="updateSubmit" :loading="editModalLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import L from 'leaflet';
  import leafletAntPath from 'leaflet-ant-path';
  import imsiIcon from '@/assets/imsi.png';

  export default {
    name: "node04.01",
    components: {L, leafletAntPath},
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
      delete this.$Line;
      delete this.$map;
      delete this.$redIcon;
    },
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      window.oncontextmenu = e => e.preventDefault();
      // 初始化地图
      this.$redIcon = L.icon({iconUrl: imsiIcon, iconSize: [13, 20], popupAnchor: [0, -10],});
      this.$map = L.map('map_1592290707334', this.$leafletOption);
      L.tileLayer(this.$tileLayerUrl).addTo(this.$map);
      this.$Markers = [[], []]; // 节点打点集合[[点位],[串号]]
      this.$Line = null; // 划线内容
      this.$map.on('click', (e) => { // 鼠标单击事件
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
          this.$set(this, 'latlng', [this.latlng[0] || null, e.latlng]);
          let x = {}, y = {};
          [x.min, x.max] = [Math.min(this.latlng[0].lat, this.latlng[1].lat), Math.max(this.latlng[0].lat, this.latlng[1].lat)];
          [y.min, y.max] = [Math.min(this.latlng[0].lng, this.latlng[1].lng), Math.max(this.latlng[0].lng, this.latlng[1].lng)];
          let selected = (this.selectTemporaryPoint || []).filter(it => x.min <= it.gcjLatitude && it.gcjLatitude <= x.max)
            .filter(it => y.min <= it.gcjLongitude && it.gcjLongitude <= y.max);
          this.$set(this, 'selectCachePoint', selected);
          (!this.$rectangle) && (this.$rectangle = L.rectangle(this.latlng, {
            color: "#ff7800",
            weight: 1
          }).addTo(this.$map));
          this.$rectangle.setBounds(this.latlng);
          this.$rectangleAction = false;
        }
      });
      // 初始化.
      this.insert();
      this.resetMap();
    },
    data() {
      return {
        formItem: {},
        tableHeight: 0,
        showBox1: true,
        showBox2: true,
        index: 0, // 序索引
        group: 0, // 组索引

        datetimerange: [new Date(), new Date(new Date().getTime() - 5 * 86400000)], // 查询时间范围
        latlng: [], /**鼠标按下抬起时的经纬度[按下, 抬起]*/

        leftTableHeight: '200pt', /**地图左侧表格高度*/
        leftTableWidth: '320pt', /**地图左侧表格宽度*/
        rightTableWidth: '250pt', /**地图右侧表格宽度*/

        /*控制Modal显示指定进度*/ insertModalLoading: false,
        /*控制Modal显示状态*/ insertShowModal: false,
        /*控制Modal验证规则*/ insertRuleValidate: {
          group: [{required: true, trigger: 'change', type: 'number'}],
          redianPointCodes: [{
            required: true,
            trigger: 'change',
            type: 'object',
            validator: (rule, value, callback) => value && value.length ? callback() : callback(new Error('热点点位不能为空!'))
          }],
          acquisition_time: [{
            required: true,
            trigger: 'change',
            type: 'object',
            validator: (rule, value, callback) => value ? callback() : callback(new Error('采集时间不能为空!'))
          }],
          temporal_threshold: [{required: true, trigger: 'change', type: 'number'}],
        },
        /*控制Modal内容*/ insertItem: {},
        /*控制Modal设备下拉列表*/ redianDevices: [],

        /*控制Modal显示指定进度*/ editModalLoading: false,
        /*控制Modal显示状态*/ editShowModal: false,
        /*控制Modal验证规则*/ editRuleValidate: {
          group: [{required: true, trigger: 'change', type: 'number'}],
          acquisition_time: [{
            required: true,
            trigger: 'change',
            type: 'object',
            validator: (rule, value, callback) => value ? callback() : callback(new Error('采集时间不能为空!'))
          }],
          temporal_threshold: [{required: true, trigger: 'change', type: 'number'}],
        },
        /*控制Modal内容*/ editItem: {},

        /*选择的关联点位原始信息*/ selectTemporaryPoint: [],
        /*选择的关联点位緩存信息*/ selectCachePoint: [],
        /*选择的关联点位信息*/ selectPoint: [],
        /*选择的关联点位展示方式*/ selectPointColumns: [
          {type: 'selection', title: 'key', width: 50, align: 'center',},
          {title: '序', key: 'index', align: 'center', width: 50,},
          {title: '组', key: 'group', align: 'center', width: 50,},
          {
            title: '点位名称', key: 'kkbh', align: 'center', minWidth: 100,
            render: (h, params) => this.$createTooltip(h, params, 'right', {
              点位编号: params.row.device && params.row.device.pointCode || params.row.kkbh || '无',
              点位名称: params.row.device && params.row.device.roadName || '无',
              点位经度: params.row.device && params.row.device.wgsLongitude || '',
              点位纬度: params.row.device && params.row.device.wgsLatitude || '',
              最后更新时间: params.row.device && params.row.device.lastUpdateTime || '',
            }, params.row.device && params.row.device.roadName || params.row.kkbh || '无'),
          },
          {
            title: '采集时间', key: 'acquisition_time', align: 'center', minWidth: 100,
            render: (h, params) => h('div', {}, new Date(params.row.acquisition_time).format('MM-dd HH:mm:ss')),
          },
          {
            title: '时间阈值', key: 'temporal_threshold', align: 'center', minWidth: 100,
            render: (h, params) => h('div', {}, `${params.row.temporal_threshold} S`),
          },
        ],

        /** 聚合内容进度 */ aggLoading: false,
        /*聚合内容信息*/ aggData: [],
        /*聚合内容展示方式*/ addDataColumns: [
          {type: 'selection', title: 'key', width: 50, align: 'center',},
          {
            title: '内容', key: 'data', align: 'center', minWidth: 30,
            render: (h, params) => {
              return h('p', {
                on: {
                  click: () => {
                    this.$copyToClip(params.row.data);
                  },
                },
              }, params.row.data);
            },
          },
          {
            title: 'ICS', key: 'ICS', align: 'center', minWidth: 100, maxWidth: 100,
            render: (h, params) => h('div', {}, `${params.row.ics} / ${params.row.icsCount}`),
          },
          {
            title: 'GCS', key: 'GCS', align: 'center', minWidth: 100, maxWidth: 100,
            render: (h, params) => h('div', {}, `${params.row.gcs} / ${params.row.gcsCount}`),
          },
        ],

        /*控制Modal显示指定进度*/ infoModalLoading: false,
        /*控制详细信息Modal显示状态*/ infoShowModal: false,
        /*详细信息内容*/ infomationData: [],
        /*详细信息展示方式*/ infomationColumns: [],

        timeLimit: 5 * 366 * 86400000,
      }
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.tableHeight = height - 20 > 400 ? height - 20 : 400;
        }
      },
      vShow1() {
        this.$set(this, 'showBox1', !this.showBox1)
      },
      vShow2() {
        this.$set(this, 'showBox2', !this.showBox2)
      },
      queryChangeDatePicker() {
        delete this.formItem.lastActionContent;
      },
      updateThreshold() { // 中上方, 更新全局时间阈值
        this.selectPoint.forEach(it => this.$set(it, 'temporal_threshold', this.formItem.threshold || 150));
        this.$forceUpdate();
      },
      /**
       * 地图左侧浮层表格宽度调整.
       */
      leftFold() {
        this.$set(this, 'leftTableWidth', '320pt' === this.leftTableWidth ? '0pt' : '320pt');
      },
      /**
       * 地图右侧浮层表格宽度调整.
       */
      rightFold() {
        this.$set(this, 'rightTableWidth', '250pt' === this.rightTableWidth ? '0pt' : '250pt');
      },
      /**
       * 重置所有查询内容.
       */
      resetContent() {
        this.resetMap();
        ['selectCachePoint', 'selectPoint', 'aggData'].forEach(it => this.$set(this, it, []));
        ['index', 'group'].forEach(it => this.$set(this, it, 0));
        this.$set(this, 'formItem', {});
        this.insert();
      },
      /**
       * 还原点位显示.
       */
      resetMap() { // 清楚所有地图内容
        (this.$Markers || []).forEach(type => (type || []).forEach(node => this.$map.removeLayer(node)));
        (this.$Line) && (this.$map.removeLayer(this.$Line));

        if (this.selectTemporaryPoint && this.selectTemporaryPoint.length) {
          let data = this.selectTemporaryPoint;
          let marker = data.map(node => {
            let marker = L.marker([node.gcjLatitude, node.gcjLongitude,], {icon: this.$redIcon})
              .bindPopup(`编号:${node.pointCode}</br>名称:${node.roadName}</br>经度:${node.wgsLongitude}</br>维度:${node.wgsLatitude}</br>最后更新时间:${node.lastUpdateTime}`)
              .on('click', () => {
                this.$set(this, 'selectCachePoint', [node]);
              });
            return marker;
          });
          marker.forEach((_) => _.addTo(this.$map));
          this.$Markers = [marker, []];
          return false;
        }

        this.$set(this, 'aggLoading', true);
        this.$http.post('/api/com/redian/selectNodes', {page: 0, size: 99999}).then((response) => {
          let data = response.data.data || [];
          this.$set(this, 'selectTemporaryPoint', data);
          let marker = data.map(node => {
            let marker = L.marker([node.gcjLatitude, node.gcjLongitude,], {icon: this.$redIcon})
              .bindPopup(`编号:${node.pointCode}</br>名称:${node.roadName}</br>经度:${node.wgsLongitude}</br>维度:${node.wgsLatitude}</br>最后更新时间:${node.lastUpdateTime}`)
              .on('click', () => {
                this.$set(this, 'selectCachePoint', [node]);
              });
            return marker;
          });
          marker.forEach((_) => _.addTo(this.$map));
          this.$Markers = [marker, []];
          this.$set(this, 'aggLoading', false);
        }).catch(() => this.$set(this, 'aggLoading', false));
      },
      /**
       * 删除已经选择的内容.
       */
      clearSelectPoint(id) {
        for (let index = 0; index < this.selectCachePoint.length; index++) {
          if (this.selectCachePoint[index].id === id) {
            this.selectCachePoint.splice(index, 1);
            break;
          }
        }
      },
      insert() { // 中上方, 触发添加点位信息
        this.$refs.ref1592299001381.resetFields();
        this.$set(this, 'selectCachePoint', []);
        this.$set(this, 'insertShowModal', true);
        let args = {};
        args.index = this.index;
        args.group = this.group;
        args.temporal_threshold = 150;
        this.$set(this, 'insertItem', args);
      },
      insertSubmit() { // 中上方, 添加点位信息
        this.$refs.ref1592299001381.validate((valid) => {
          if (valid) {
            this.$set(this, 'insertModalLoading', true);
            let index = this.insertItem.index, group = this.insertItem.group, groupDesc = this.insertItem.groupDesc;
            groupDesc = groupDesc || (this.selectCachePoint || []).map(it => it.roadName).join(',');
            (this.selectCachePoint || []).forEach(it => {
              this.selectPoint.push({
                index: index,
                group: group,
                groupDesc: groupDesc,
                device: it,
                acquisition_time: this.insertItem.acquisition_time.getTime(), // 采集时间
                temporal_threshold: this.insertItem.temporal_threshold, // 时间阈值
                autoSelect: false
              });
              index = index + 1;
            });
            group = group + 1;
            this.$set(this, 'index', index);
            this.$set(this, 'group', group);
            this.$set(this, 'insertShowModal', false);
            this.$set(this, 'insertModalLoading', false);
            this.insert();
          } else {
            return false;
          }
        })
      },
      update(row) {
        this.$set(this.formItem, 'lastActionTime', new Date().getTime() + 250);
        this.$refs.ref1591330171148.resetFields();
        this.$set(this, 'editShowModal', true);
        let args = JSON.parse(JSON.stringify(row));
        args.acquisition_time = new Date(args.acquisition_time);
        args.roadName = args.device && args.device.roadName || '未知';
        this.$set(this, 'editItem', args);
      },
      updateSubmit() {
        this.$refs.ref1591330171148.validate((valid) => {
          if (valid) {
            this.$set(this, 'editModalLoading', true);
            this.selectPoint.filter(it => it.group == this.editItem.group).forEach(it => {
              if (it.index == this.editItem.index) {
                this.$set(it, 'group', this.editItem.group);
                this.$set(it, 'acquisition_time', this.editItem.acquisition_time.getTime());
                this.$set(it, 'temporal_threshold', this.editItem.temporal_threshold);
              }
              this.$set(it, 'groupDesc', this.editItem.groupDesc);
            });
            this.$set(this, 'editModalLoading', false);
            this.$set(this, 'editShowModal', false);
          } else {
            return false;
          }
        })
      },
      remove() {
        let ids = this.$refs.selectPointColumns.getSelection().map(n => n.index) || [];
        ids.forEach(it => {
          let index = this.selectPoint.length;
          for (let i = index - 1; i >= 0; i--) {
            if (this.selectPoint[i].index === it) {
              this.selectPoint.splice(i, 1);
              break;
            }
          }
        });
      },
      /**
       * 热点数据, 人工对比请求内容.
       * 对应后端: com.xyshzh.general.manager.server.app_com.controller.ComICR3ShujuController#artificialComparisonAboutRedian
       */
      search() {
        if (!this.selectPoint || !this.selectPoint.length) {
          return;
        }
        this.$set(this, 'aggLoading', true);
        let args = JSON.parse(JSON.stringify(this.selectPoint));
        args._dataType = 'Map';
        this.$http.post('/api/com/icr3/ACRD', args).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this, 'aggData', response.data.data);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'aggLoading', false);
        }).catch(() => this.$set(this, 'aggLoading', false));
      },
      rightSelectDataByContent(row) { // 中间下方, 单击聚合记录, 通过聚合记录查询该记录的采集记录
        this.$set(this.formItem, 'lastActionTime', new Date().getTime());
        if (row.data === this.formItem.lastActionContent) { // 判断记录是否是上次请求的内容
          return;
        }
        this.$set(this.formItem, 'lastActionContent', row.data); // 记录上次请求的内容
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastActionTime >= 250) {
            let icss = row.icss || [];
            let selectPoint = this.selectPoint.map(it => {
              this.$set(it, '_checked', -1 < icss.indexOf(it.index) ? true : false);
              return it;
            });
            this.$set(this, 'selectPoint', selectPoint);

            (this.$Markers || []).forEach(type => (type || []).forEach(node => this.$map.removeLayer(node)));
            (this.$Line) && (this.$map.removeLayer(this.$Line));

            this.$set(this, 'aggLoading', true);

            let args = {}; // 处理参数
            args.imsis = row.data;
            args.dataType = row.dataType;
            args.kssjc = this.datetimerange[0].getTime();
            args.jssjc = this.datetimerange[1].getTime();
            args.page = 0;
            args.size = 99999;
            if (args.jssjc - args.kssjc >= this.timeLimit) {
              this.$Message.warning({closable: true, duration: 1, content: '请选择合适的时间范围!',});
              return;
            }
            // 触发请求
            this.$http.post('/api/com/redianshuju/selectNodes', args).then((response) => {
              if (response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  let datas = (response.data.data || []);

                  let groups = {};
                  datas.forEach((_) => groups[_.rdbh] ? groups[_.rdbh].push(_) : groups[_.rdbh] = [_]);
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
                  let lines = datas.filter(_ => _.device && _.device.gcjLatitude && _.device.gcjLongitude)
                    .map(_ => [_.device.gcjLatitude, _.device.gcjLongitude]).reverse();
                  let path = L.polyline.antPath(lines, {
                    delay: 1500,
                    weight: 3,
                    dashArray: [10, 20],
                    color: 'red',
                    pulseColor: '#FFFFFF',
                  }).addTo(this.$map);
                  this.$Line = path;

                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'aggLoading', false);
            }).catch(() => this.$set(this, 'aggLoading', false));
          }
        }, 251);
      },
      modalSelectDataByContent() { // 中间下方, 双击记录, 查询详细记录
        this.$set(this.formItem, 'lastActionTime', new Date().getTime());
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastActionTime >= 250) {
            this.$set(this, 'infoShowModal', true);
            this.$set(this, 'infoModalLoading', true);
            // 处理详细信息展示表格的列信息
            let infomationColumns = {};
            let data = {
              title: '数据', key: 'data', align: 'center', minWidth: 50,
              render: (h, params) => {
                return h('p', {
                  on: {
                    click: () => {
                      this.$copyToClip(params.row.data, `复制成功:  ${params.row.data}`);
                    },
                  },
                }, params.row.data);
              },
            };
            (this.selectPoint || []).forEach(it => {
              if (!infomationColumns[it.group]) {
                infomationColumns[it.group] = {
                  title: it.groupDesc || `_${it.group}`,
                  key: it.group,
                  align: 'center',
                  minWidth: 50,
                };
              }
            });
            this.$set(this, 'infomationColumns', [data, ...(Object.values(infomationColumns).sort((a, b) => a.group > b.group))]);
            // 处理详细信息展示表格的内容信息
            let infomationData = {};
            (this.aggData || []).forEach(it => {
              let node = {data: it.data};
              (it.gcss || []).forEach(g => node[g] = '√');
              infomationData[it.data] = node;
            });
            this.$set(this, 'infomationData', Object.values(infomationData));
            // 停止加载状态
            this.$set(this, 'infoModalLoading', false);
          }
        }, 251);
      },
    }
  }
</script>

<style scoped>

</style>
