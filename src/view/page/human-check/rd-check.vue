<template>
  <div>
    <Form ref="ref_formItem" :model="formItem" inline>
      <FormItem prop="threshold" style="padding-left: 285pt;">
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
      <Col span="8">
        <Table
          ref="selection"
          highlight-row :columns="selectColumns"
          :data="selectData" border :height="tableHeight - 1"
          :row-class-name="(row, index) => row.device && row.device.relationKakouIds && row.device.relationKakouIds.length ? 'include-imsi' : ''"
          @on-row-click="leftCurrentSelectData"
        />
      </Col>
      <Col span="8">
        <Table
          ref="selectPointColumns" highlight-row :columns="selectPointColumns"
          :data="selectPoint" border :height="tableHeight / 2"
          :row-class-name="(row, index) => row.device && row.device.relationRedianIds && row.device.relationRedianIds.length ? 'include-car' : ''"
          @on-row-click="rightSelectDataByPointCode"
          @on-row-dblclick="update"
        />
        <Button
          style="position: absolute;right:0;top: 120px"
          size="small"
          @click="rightSelectDataByPointCodes()"
          type="info"
          icon="ios-search"
        />
        <Table
          ref="selectContentColumns" highlight-row :columns="addDataColumns" :data="aggData" border
          :height="tableHeight / 2"
          @on-row-click="rightSelectDataByContent"
          @on-row-dblclick="modalSelectDataByContent"
        />
      </Col>
      <Col span="8">
        <Table
          ref="selection"
          highlight-row :columns="rightSelectColumns"
          :data="rightSelectData" border
          :loading="rightSelectDataLoading"
          :height="tableHeight - 33"
          :row-class-name="(row, index) => row.device && row.device.relationRedianIds && row.device.relationRedianIds.length ? 'include-car' : ''"
        />
        <Page
          size="small" show-total :page-size-opts="[100,200,500,1000,2000]"
          :current.sync="rightPageInfo.page"
          :page-size.sync="rightPageInfo.size"
          :total="rightPageInfo.totalElements"
          @on-change="rightSelectDataChangePage()"
          @on-page-size-change="(value) => {rightPageInfo.size = value;rightSelectDataChangePage();}"
          style="float: right;margin: 0"
        />
      </Col>
    </Row>
    <!-- <div ref="ref_1591338474146" style="width:100%; height: calc(100% - 10pt - var(&#45;&#45;searchBar));">
       <div style="display: inline-block; height: 100%; width: 290pt; max-width: 290pt; overflow-y: auto;">
         <Table ref="selection" highlight-row :columns="selectColumns" :data="selectData" border
                :height="tableHeight - 1"
                :row-class-name="(row, index) => row.device && row.device.relationKakouIds && row.device.relationKakouIds.length ? 'include-imsi' : ''"
                @on-row-click="leftCurrentSelectData"
         ></Table>
       </div>
       <div style="display: inline-block; height: 100%; width: 290pt; max-width: 290pt; overflow-y: auto;">
         <div style="height: 50%; position: relative;">
           <div style="width: 100%; height: 100%; overflow-y: auto;">
             <Table ref="selectPointColumns" highlight-row :columns="selectPointColumns"
                    :data="selectPoint" border :height="tableHeight / 2"
                    :row-class-name="(row, index) => row.device && row.device.relationRedianIds && row.device.relationRedianIds.length ? 'include-car' : ''"
                    @on-row-click="rightSelectDataByPointCode"
                    @on-row-dblclick="update">
             </Table>
           </div>
           <div style="position: absolute; top: 120pt; right: 0pt; height: 15pt; width: 25pt;">
             <Button size="small" @click="rightSelectDataByPointCodes()" type="info" icon="ios-search"></Button>
           </div>
         </div>
         <div style="height: 50%;">
           <div style="width: 100%; height: 100%; overflow-y: auto;">
             <Table ref="selectContentColumns" highlight-row :columns="addDataColumns" :data="aggData" border
                    :height="tableHeight / 2"
                    @on-row-click="rightSelectDataByContent"
                    @on-row-dblclick="modalSelectDataByContent"
             ></Table>
           </div>
         </div>
       </div>
       <div style="display: inline-block; height: 100%; width: calc(100% - 290pt - 290pt); overflow-y: auto;">
         <div style="width: 100%; height: calc(100% - 32px); overflow-y: auto;">
           <Table ref="selection" highlight-row :columns="rightSelectColumns" :data="rightSelectData" border
                  :loading="rightSelectDataLoading" :height="tableHeight - 33"
                  :row-class-name="(row, index) => row.device && row.device.relationRedianIds && row.device.relationRedianIds.length ? 'include-car' : ''"
           ></Table>
           <Page size="small" show-total :page-size-opts="[100,200,500,1000,2000]"
                 :current.sync="rightPageInfo.page" :page-size.sync="rightPageInfo.size"
                 :total="rightPageInfo.totalElements" @on-change="rightSelectDataChangePage()"
                 @on-page-size-change="(value) => {rightPageInfo.size = value;rightSelectDataChangePage();}"
                 style="float: right;margin: 0px"/>
         </div>
       </div>
     </div>-->

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
                  :remote-method="selectKakouDevices">
            <Option v-for="(value, index) in kakouDevices" :key="index" :value="value.pointCode"
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
    name: 'rd-check',
    components: {},
    watch: {},
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      this.$set(this, 'selectData', (this.$router.currentRoute.params && this.$router.currentRoute.params.data || []).sort(((a, b) => a.cjsjc < b.cjsjc)));
      this.$set(this, 'datetimerange', (this.$router.currentRoute.params && this.$router.currentRoute.params.datetimerange || [new Date(), new Date()]));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });

      for (let group = 0; group < this.selectData.length; group++) {
        this.selectData[group]['group'] = group;
      }
      this.$set(this, 'group', this.selectData.length);

      const rs = (this.selectData || []).filter(it => it.device).map(it => it.device).filter(it => it.relationKakouIds)
        .map(it => it.relationKakouIds).reduce((a, b) => a.concat(b), []);

      this.$http.post('/api/com/kakou/selectNodesByPointCode', {
        pointCodes: Array.from(new Set(rs)).join(','),
        page: 0,
        size: rs.length
      }).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
          response.data.data.forEach(it => this.selectCachePoint[it.pointCode] = it);
          let index = 0;
          (this.selectData || []).filter(it => it.device && it.device.relationKakouIds).forEach(it => { // 筛选有关联关系的内容
            let relationKakouIds = it.device.relationKakouIds; // 获取关联关系
            let groupDesc = (relationKakouIds || []).filter(it => this.selectCachePoint[it]).map(it => this.selectCachePoint[it]).map(it => it.roadName).join(',');
            (relationKakouIds || []).filter(__ => this.selectCachePoint[__]).forEach(__ => { // 判断关联关系是有效的
              let device = this.selectCachePoint[__]; // 获取点位信息
              this.selectPoint.push({
                index: index,
                group: it.group,
                groupDesc: groupDesc,
                device: device,
                acquisition_time: it.cjsjc,
                temporal_threshold: 300,
                autoSelect: true
              });
              index = index + 1;
            });
          });
          this.$set(this, 'index', index);
        }
      });

    },
    computed: {},
    data() {
      return {
        dictionary: {}, // 字段
        formItem: {},

        index: 0, // 序索引
        group: 0, // 组索引

        datetimerange: [], // 查询时间范围

        currentSelectData: {}, // 當前選中的內容

        tableHeight: 0,
        /*路由接收到的数据*/ selectData: [],
        /*路由过来的数据展示方式*/ selectColumns: [
          {type: 'selection', title: 'key', width: 50, align: 'center',},
          {title: '组', key: '_index', align: 'center', minWidth: 30, maxWidth: 30,},
          {
            title: '采集时间', key: 'cjsjc', minWidth: 95, maxWidth: 95, align: 'center',
            render: (h, params) => h('div', {}, new Date(params.row.cjsjc).format('MM-dd HH:mm:ss')),
          },
          {
            title: 'IMSI', key: 'imsi', minWidth: 70, maxWidth: 70, align: 'center',
            render: (h, params) => {
              let slot = [h('p', {}, `IMEI: ${params.row.imei || '未知'}`),
                h('p', {}, `MSC: ${params.row.msc || '未知'}`),
                h('p', {}, `LAC: ${params.row.lac || '未知'}`),
                h('p', {}, `CID: ${params.row.cid || '未知'}`),
                h('p', {}, `ACH: ${params.row.ach || '未知'}`),];
              let content = params.row.imsi || '未知';
              return h('Tooltip', {
                nativeOn: {
                  click: () => {
                    this.$copyToClip(content);
                  },
                },
                props: {placement: 'right', maxWidth: '300'}
              }, [h('div', {slot: 'content',}, slot), h('div', {}, content)]);
            },
          },
          {
            title: '点位名称', key: 'kkbh', align: 'center', minWidth: 100,
            render: (h, params) => this.$createTooltip(h, params, 'left', {
              点位编号: params.row.device && params.row.device.pointCode || params.row.kkbh || '无',
              点位名称: params.row.device && params.row.device.roadName || '无',
              点位经度: params.row.device && params.row.device.wgsLongitude || '',
              点位纬度: params.row.device && params.row.device.wgsLatitude || '',
              最后更新时间: params.row.device && params.row.device.lastUpdateTime || '',
            }, params.row.device && params.row.device.roadName || params.row.kkbh || '无'),
          },
        ],

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
        /*控制Modal设备下拉列表*/ kakouDevices: [],

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
          {title: '序', key: 'index', align: 'center', minWidth: 30, maxWidth: 30,},
          {title: '组', key: 'group', align: 'center', minWidth: 30, maxWidth: 30,},
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
            title: '时间阈值', key: 'temporal_threshold', align: 'center', minWidth: 60, maxWidth: 60,
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
            title: '车牌号码', key: 'cphm', minWidth: 70, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, 'right', {号牌颜色: params.row.hpys || '',}, params.row.cphm || ''),
          },
          {title: '号牌颜色', key: 'hpys', minWidth: 70, align: 'center',},
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
          // {title: '行驶速度', key: 'sudu', minWidth: 60, align: 'center'},
          // {title: '车道编号', key: 'cdbh', minWidth: 80, align: 'center',},
          {
            title: '行驶方向', key: 'xsfx', minWidth: 80, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.xsfx && this.dictionary.xsfx[params.row.xsfx] || params.row.xsfx),
          },
          {
            title: '车辆信息', key: 'clpp', align: 'center', minWidth: 100,
            render: (h, params) => this.$createTooltip(h, params, 'left', {
              车辆品牌: params.row.clpp || '无',
              车身颜色: this.dictionary.csys && this.dictionary.csys[params.row.csys] || params.row.csys || '无',
              号牌颜色: params.row.hpys || '无',
              行驶速度: params.row.sudu || '无',
              车道编号: params.row.cdbh || '无',
            }, params.row.clpp || this.dictionary.csys && this.dictionary.csys[params.row.csys] || params.row.csys || params.row.hpys),
          },
        ],

        /*控制Modal显示指定进度*/ infoModalLoading: false,
        /*控制详细信息Modal显示状态*/ infoShowModal: false,
        /*详细信息内容*/ infomationData: [],
        /*详细信息展示方式*/ infomationColumns: [],
      }
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;
          this.$set(this, 'tableHeight', height - 30);
        }
      },
      updateThreshold() { // 中上方, 更新全局时间阈值
        this.selectPoint.forEach(it => this.$set(it, 'temporal_threshold', this.formItem.threshold || 150));
        this.$forceUpdate();
      },
      leftCurrentSelectData(row) { // 左侧记录点击后, 记录该条记录
        this.$set(this, 'currentSelectData', row);
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
      selectKakouDevices(query) { // 查询点位信息
        if (!query) {
          this.$set(this, 'kakouDevices', []);
          return;
        }
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 500) {
            this.$http.post('/api/com/kakou/selectNodes', {roadName: query, page: 0, size: 99999}).then((response) => {
              if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
                this.$set(this, 'kakouDevices', response.data.data || []);
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
            this.$http.post('/api/com/kakou/selectNodesByPointCode', {
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
       * 卡口数据, 人工对比请求内容.
       * 对应后端: com.xyshzh.general.manager.server.app_com.controller.ComICR3ShujuController#artificialComparisonAboutKakou
       */
      search() {
        if (!this.selectPoint || !this.selectPoint.length) {
          return;
        }
        this.$set(this, 'aggLoading', true);
        let args = JSON.parse(JSON.stringify(this.selectPoint));
        args._dataType = 'Map';
        this.$http.post('/api/com/icr3/ACKK', args).then((response) => {
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
            args.queryUrl = '/api/com/kakoushuju/selectPointCodeNodes';
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
        args.queryUrl = '/api/com/kakoushuju/selectPointCodeNodes';
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
            let icss = row.icss || {};
            let selectPoint = this.selectPoint.map(it => {
              this.$set(it, '_checked', icss[it.index] ? true : false);
              return it;
            });
            this.$set(this, 'selectPoint', selectPoint);

            this.$set(this, 'rightSelectData', []); // 清空数据
            this.$set(this, 'rightPageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,}); // 清空分页信息
            let args = {}; // 处理参数
            args.cphms = row.data;
            args.cplx = row.dataType;
            args.kssjc = this.datetimerange[0].getTime();
            args.jssjc = this.datetimerange[1].getTime();
            args.page = this.rightPageInfo.page && this.rightPageInfo.page - 1 || 0;
            args.size = this.rightPageInfo.size || 100;
            args.queryUrl = '/api/com/kakoushuju/selectNodes';
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
              for (let ele in (it.gcss || {})) {
                node[ele] = (it.gcss[ele] || []).sort((a, b) => a - b).map(_ => new Date(_).format('yyyy-MM-dd HH:mm:ss')).join(',') || '√';
              }
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

<style lang="less">
  .ivu-table-column-center {
    .ivu-table-cell {
      padding: 0;
    }
  }
</style>
