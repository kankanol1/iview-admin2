<template>
  <div>
    <Form ref="ref_formItem" class="form-item-s"  :model="formItem" inline>
      <FormItem prop="datetimerange">
        <DatePicker class="interval" size="small" type="datetimerange" v-model="datetimerange" placeholder="请选择时间范围"
                    style="width: 300px" @on-change="queryChangeDatePicker"/>
      </FormItem>
      <FormItem prop="threshold" style="padding-left: 5pt;">
        <Input class="interval" size="small" clearable v-model="formItem.threshold" placeholder="全局时间阈值(单位是秒)"/>
      </FormItem>
      <FormItem>
        <ButtonGroup size="small" style="padding-left:0px;">
          <Button ghost @click="updateThreshold()" type="info" icon="ios-refresh">更新</Button>
        </ButtonGroup>
        <ButtonGroup size="small" style="padding-left:10px;">
          <Button ghost @click="insert()" type="success" icon="md-add">添加</Button>
          <Button ghost @click="remove()" type="error" icon="md-close">删除</Button>
          <Button ghost @click="search()" type="info" icon="ios-search" :loading="aggLoading">搜索</Button>
        </ButtonGroup>
      </FormItem>
    </Form>

    <Row>
      <Col span="11">
        <div>
          <div style="height: 50%; position: relative;">
            <Table
              ref="selectPointColumns" highlight-row :columns="selectPointColumns"
              :data="selectPoint" border :height="tableHeight / 2"
              :row-class-name="(row, index) => row.device && row.device.relationKakouIds && row.device.relationKakouIds.length ? 'include-imsi' : ''"
              @on-row-click="rightSelectDataByPointCode"
              @on-row-dblclick="update">
            </Table>
            <Button style="position:absolute;top:100px;right:0" size="small" @click="rightSelectDataByPointCodes()" type="info" icon="ios-search"></Button>
          </div>
          <div style="height: 50%;">
            <Table ref="selectContentColumns" highlight-row :columns="addDataColumns" :data="aggData" border
                   :height="tableHeight / 2"
                   @on-row-click="rightSelectDataByContent"
                   @on-row-dblclick="modalSelectDataByContent"
            />
          </div>
        </div>
      </Col>
      <Col span="13">
        <Table
          ref="selection"
          highlight-row :columns="rightSelectColumns"
          :data="rightSelectData" border
          :loading="rightSelectDataLoading"
          :height="tableHeight - 33"
          :row-class-name="(row, index) => row.device && row.device.relationKakouIds && row.device.relationKakouIds.length ? 'include-imsi' : ''"
        />
        <div style="background-color:#fff;height: 32px;border-bottom:1px solid #eee">
          <Page
            size="small"
            show-total
            :page-size-opts="[100,200,500,1000,2000]"
            :current.sync="rightPageInfo.page"
            :page-size.sync="rightPageInfo.size"
            :total="rightPageInfo.totalElements"
            @on-change="rightSelectDataChangePage()"
            @on-page-size-change="(value) => {rightPageInfo.size = value;rightSelectDataChangePage();}"
            style="float: right;"
          />
        </div>
      </Col>
    </Row>
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
    <!-- 添加关联设备信息 -->
    <Modal v-model="insertShowModal" title="信息维护" width="700px">
      <Form ref="ref1591330171147" :model="insertItem" :rules="insertRuleValidate" :label-width="120">
        <FormItem label="起始序号" prop="index">
          <Input disabled v-model="insertItem.index" placeholder="序号" clearable/>
        </FormItem>
        <FormItem label="组号" prop="group">
          <Input-number v-model="insertItem.group" placeholder="组号" size="small" clearable></Input-number>
          <Input v-model="insertItem.groupDesc" size="small" style="width: 200pt;" placeholder="组描述" clearable/>
        </FormItem>
        <FormItem label="點位位置" prop="redianPointCodes">
          <Select multiple v-model="insertItem.redianPointCodes" placeholder="请选择热点位置" clearable filterable remote
                  :remote-method="selectRedianDevices">
            <Option v-for="(value, index) in redianDevices" :key="index" :value="value.pointCode"
                    :label="value.roadName">
              <span>{{value.roadName}}</span><span style="float: right;">{{value.pointCode}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="采集时间" prop="acquisition_time">
          <Date-picker size="small" v-model="insertItem.acquisition_time" type="datetime"
                       placeholder="选择采集时间"></Date-picker>
        </FormItem>
        <FormItem label="时间阈值" prop="temporal_threshold">
          <Input-number v-model="insertItem.temporal_threshold" placeholder="时间阈值" size="small"
                        clearable></Input-number>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="() => (this.$set(this, 'insertShowModal', false))"
                :loading="insertModalLoading">取消
        </Button>
        <Button type="primary" size="large" @click="insertSubmit" :loading="insertModalLoading">确定</Button>
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
        <FormItem label="點位位置" prop="redianPointCodes">
          <Input disabled :value="editItem.roadName" placeholder="點位位置" clearable/>
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


  export default {
    name: 'node1',
    components: {},
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
    mounted() {
      this.setHeight();
      window.onresize = () =>this.setHeight();
    },
    computed: {},
    data() {
      return {
        formItem: {},

        index: 0, // 序索引
        group: 0, // 组索引

        datetimerange: [new Date(), new Date(new Date().getTime() - 5 * 86400000)], // 查询时间范围

        tableHeight: 0,

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

        /*选择的关联点位緩存信息*/ selectCachePoint: {},
        /*选择的关联点位信息*/ selectPoint: [],
        /*选择的关联点位展示方式*/ selectPointColumns: [
          {type: 'selection', title: 'key', width: 50, align: 'center',},
          {title: '序', key: 'index', align: 'center', minWidth: 50, maxWidth: 50,},
          {title: '组', key: 'group', align: 'center', minWidth: 50, maxWidth: 50,},
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
            title: '采集时间', key: 'acquisition_time', align: 'center', minWidth: 95, maxWidth: 95,
            render: (h, params) => h('div', {}, new Date(params.row.acquisition_time).format('MM-dd HH:mm:ss')),
          },
          {
            title: '时间阈值', key: 'temporal_threshold', align: 'center', minWidth: 95, maxWidth: 95,
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

        /*记录上次请求的内容*/ rightSelectDataQuery: {},
        /*分页信息*/ rightPageInfo: {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,},
        /*加载状态*/ rightSelectDataLoading: false,
        /*右侧表格数据内容*/ rightSelectData: [],
        /*右侧表格数据展示方式*/ rightSelectColumns: [
          {type: 'selection', title: 'key', width: 50, align: 'center',},
          {
            title: '采集时间', key: 'cjsjc', minWidth: 150, align: 'center',
            render: (h, params) => h('div', {}, new Date(params.row.cjsjc).format('yyyy-MM-dd HH:mm:ss.SSS')),
          },
          {
            title: 'IMSI', key: 'imsi', minWidth: 110, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.rightPageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              IMEI: params.row.imei || '未知',
              MSC: params.row.msc || '未知',
              LAC: params.row.lac || '未知',
              CID: params.row.cid || '未知',
            }, params.row.imsi),
          },
          {
            title: '点位名称', key: 'rdbh', align: 'center', minWidth: 100,
            render: (h, params) => this.$createTooltip(h, params, params.index < this.rightPageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              点位编号: params.row.device && params.row.device.pointCode || params.row.rdbh || '无',
              点位名称: params.row.device && params.row.device.roadName || '无',
              点位经度: params.row.device && params.row.device.wgsLongitude || '',
              点位纬度: params.row.device && params.row.device.wgsLatitude || '',
              最后更新时间: params.row.device && params.row.device.lastUpdateTime || '',
            }, params.row.device && params.row.device.roadName || params.row.rdbh || '无'),
          },
          {
            title: 'MSC / LAC / CID', key: 'lac', minWidth: 100, align: 'center',
            render: (h, params) => h('p', {}, `${params.row.msc || ''} / ${params.row.lac || ''} / ${params.row.cid || ''}`),
          },
          {title: '网络附着码', key: 'ach', minWidth: 80, align: 'center',},
        ],

        /*控制Modal显示指定进度*/ infoModalLoading: false,
        /*控制详细信息Modal显示状态*/ infoShowModal: false,
        /*详细信息内容*/ infomationData: [],
        /*详细信息展示方式*/ infomationColumns: [],
      }
    },
    methods: {
      setHeight(){
        if(document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline").length > 0){
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;
          this.tableHeight = height-20;
        }
      },
      queryChangeDatePicker() {
        delete this.formItem.lastActionContent;
      },
      updateThreshold() { // 中上方, 更新全局时间阈值
        this.selectPoint.forEach(it => this.$set(it, 'temporal_threshold', this.formItem.threshold || 150));
        this.$forceUpdate();
      },
      insert() { // 中上方, 触发添加点位信息
        this.$refs.ref1591330171147.resetFields();
        this.$set(this, 'insertShowModal', true);
        let args = {};
        args.index = this.index;
        args.group = this.group;
        args.temporal_threshold = 150;
        this.$set(this, 'insertItem', args);
      },
      selectRedianDevices(query) { // 查询点位信息
        if (!query) {
          this.$set(this, 'redianDevices', []);
          return;
        }
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 500) {
            this.$http.post('/api/com/redian/selectNodes', {roadName: query, page: 0, size: 99999}).then((response) => {
              if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
                this.$set(this, 'redianDevices', response.data.data || []);
              }
            });
          }
        }, 501)
      },
      insertSubmit() { // 中上方, 添加点位信息
        this.$refs.ref1591330171147.validate((valid) => {
          if (valid) {
            this.$set(this, 'insertModalLoading', true);
            let rs = (this.insertItem.redianPointCodes || []);
            this.$http.post('/api/com/redian/selectNodesByPointCode', {
              pointCodes: rs.join(','),
              page: 0,
              size: rs.length
            }).then((response) => {
              if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
                let index = this.insertItem.index, group = this.insertItem.group, groupDesc = this.insertItem.groupDesc;
                response.data.data.forEach(it => {
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
              }
              this.$set(this, 'insertModalLoading', false);
            }).catch(() => this.$set(this, 'insertModalLoading', false));
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
      rightSelectDataChangePage() {
        this.$set(this, 'rightSelectData', []); // 清空数据
        let args = this.rightSelectDataQuery; // 处理参数
        args.page = this.rightPageInfo.page && this.rightPageInfo.page - 1 || 0;
        args.size = this.rightPageInfo.size || 100;

        this.$set(this, 'rightSelectDataLoading', true); // 加载状态
        // 触发请求
        this.$http.post(args.queryUrl, args).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this.rightPageInfo, 'totalElements', response.data.page.totalElements);
              this.$set(this.rightPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
              this.$set(this, 'rightSelectData', response.data.data);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'rightSelectDataLoading', false);
        }).catch(() => this.$set(this, 'rightSelectDataLoading', false));
      },
      rightSelectDataByPointCode(row) { // 中间上方, 单击点位记录, 通过点位记录查询该点位的采集记录
        this.$set(this.formItem, 'lastActionTime', new Date().getTime());
        if (row.device.pointCode === this.formItem.lastActionContent) { // 判断记录是否是上次请求的内容
          return;
        }
        this.$set(this.formItem, 'lastActionContent', row.device.pointCode); // 记录上次请求的内容
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastActionTime >= 250) {
            this.$set(this, 'rightSelectData', []); // 清空数据
            this.$set(this, 'rightPageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,}); // 清空分页信息
            let args = {}; // 处理参数
            args.pointCodes = row.device.pointCode;
            args.startTimestamp = row.acquisition_time - row.temporal_threshold * 1000;
            args.endTimestamp = row.acquisition_time + row.temporal_threshold * 1000;
            args.page = this.rightPageInfo.page && this.rightPageInfo.page - 1 || 0;
            args.size = this.rightPageInfo.size || 100;
            args.queryUrl = '/api/com/redianshuju/selectPointCodeNodes';
            this.$set(this, 'rightSelectDataQuery', args); // 保留参数

            this.$set(this, 'rightSelectDataLoading', true); // 加载状态
            // 触发请求
            this.$http.post(args.queryUrl, args).then((response) => {
              if (response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.rightPageInfo, 'totalElements', response.data.page.totalElements);
                  this.$set(this.rightPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
                  this.$set(this, 'rightSelectData', response.data.data);
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'rightSelectDataLoading', false);
            }).catch(() => this.$set(this, 'rightSelectDataLoading', false));
          }
        }, 251);
      },
      rightSelectDataByPointCodes() { // 中间上方, 多选点位记录, 通过点位记录查询该点位的采集记录
        this.$set(this, 'rightSelectData', []); // 清空数据
        this.$set(this, 'rightPageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,}); // 清空分页信息

        let content = this.$refs.selectPointColumns.getSelection();
        if (!content || !content.length) {
          console.log(123);
          return;
        }
        let pointCodes = content.map(it => it.device && it.device.pointCode || '').join(',');
        let min = content.map(it => it.acquisition_time - it.temporal_threshold * 1000).reduce((a, b) => Math.min(a, b));
        let max = content.map(it => it.acquisition_time + it.temporal_threshold * 1000).reduce((a, b) => Math.max(a, b));

        let args = {}; // 处理参数
        args.pointCodes = pointCodes;
        args.startTimestamp = min;
        args.endTimestamp = max;
        args.page = this.rightPageInfo.page && this.rightPageInfo.page - 1 || 0;
        args.size = this.rightPageInfo.size || 100;
        args.queryUrl = '/api/com/redianshuju/selectPointCodeNodes';
        this.$set(this, 'rightSelectDataQuery', args); // 保留参数

        this.$set(this, 'rightSelectDataLoading', true); // 加载状态
        // 触发请求
        this.$http.post(args.queryUrl, args).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this.rightPageInfo, 'totalElements', response.data.page.totalElements);
              this.$set(this.rightPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
              this.$set(this, 'rightSelectData', response.data.data);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'rightSelectDataLoading', false);
        }).catch(() => this.$set(this, 'rightSelectDataLoading', false));
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

            this.$set(this, 'rightSelectData', []); // 清空数据
            this.$set(this, 'rightPageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,}); // 清空分页信息
            let args = {}; // 处理参数
            args.imsis = row.data;
            args.dataType = row.dataType;
            args.kssjc = this.datetimerange[0].getTime();
            args.jssjc = this.datetimerange[1].getTime();
            args.page = this.rightPageInfo.page && this.rightPageInfo.page - 1 || 0;
            args.size = this.rightPageInfo.size || 100;
            args.queryUrl = '/api/com/redianshuju/selectNodes';
            this.$set(this, 'rightSelectDataQuery', args); // 保留参数

            this.$set(this, 'rightSelectDataLoading', true); // 加载状态
            // 触发请求
            this.$http.post(args.queryUrl, args).then((response) => {
              if (response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.rightPageInfo, 'totalElements', response.data.page.totalElements);
                  this.$set(this.rightPageInfo, 'sizeOfElements', response.data.page.sizeOfElements);
                  this.$set(this, 'rightSelectData', response.data.data);
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'rightSelectDataLoading', false);
            }).catch(() => this.$set(this, 'rightSelectDataLoading', false));
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
                infomationColumns[it.group] = {title: it.groupDesc, key: it.group, align: 'center', minWidth: 50,};
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
    },
  }
</script>

<style scoped></style>
