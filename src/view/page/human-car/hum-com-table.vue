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
    <Row>
      <Col span="9">
        <carViewer :options="sourceCarOptions" columnsType="simple" :height="tableBoxHeight"></carViewer>
      </Col>
      <Col span="6">
        <Table ref="selection" highlight-row :columns="columns" :data="content" border :loading="loading"
               :height="tableBoxHeight - 32"
               @on-row-click="singleRowClick" @on-row-dblclick="doubleRowClick"></Table>

          <Page size="small" show-total :current.sync="pageInfo.page"
                :page-size.sync="pageInfo.size" :page-size-opts="[50,100,200,300,500]"
                :total="pageInfo.totalElements" @on-change="search()"
                @on-page-size-change="(value) => {pageInfo.size = value;search();}"
                style="float: right;margin-top: 5px"/>

      </Col>
      <Col span="9">
        <imsiViewer :options="targetImsiOptions" columnsType="simple" :height="tableBoxHeight"></imsiViewer>
      </Col>
    </Row>
    <Modal :styles="{top: '20px'}" v-model="associatedDataOptions.showModal" title="信息查阅" width="1200">
      <associatedData :options="associatedDataOptions"></associatedData>
      <div slot="footer"></div>
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

  import carViewer from '../components/car';
  import imsiViewer from '../components/rd';
  import associatedData from './components/com-detail';
  import relationsData from './components/equ-rd-way-map';

  export default {
    name: 'node03',
    components: {
      associatedData: associatedData,
      carViewer: carViewer,
      imsiViewer: imsiViewer,
      relationsData: relationsData
    },
    watch: {
      'formItem.sourceType': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectCarsRecords('source');
          }
        },
        immediate: true
      },
      'formItem.source': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectCarsRecords('source');
          }
        },
        immediate: true
      },
      'formItem.targetType': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectImsisRecords('target');
          }
        },
        immediate: true
      },
      'formItem.target': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectImsisRecords('target');
          }
        },
        immediate: true
      },
      tableBoxHeight: {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.initTable()
          }
        },
        immediate: true
      },
    },
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
    },
    computed: {},
    data() {
      return {
        tableHeight: 0,
        tableBoxHeight: 0,
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
            title: '源号码', key: 'source', minWidth: 70, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, 'bottom', {
              类型: this.dictionary.cplx && this.dictionary.cplx[params.row.sourceType] || params.row.sourceType || '无',
            }, params.row.source),
          },
          {title: '目标号码', key: 'target', minWidth: 70, align: 'center',},
          {
            title: '概率',
            key: 'probability',
            minWidth: 50,
            align: 'center',
            render: (h, params) => h('div', {}, params.row.probability.toFixed(8)),
          },
        ], // 展示字段
        content: [], // 数据

        customRelation: {}, // 自定义关系
        customRelations: {}, // 自定义关系集合
        customRelationsModal: false,

        sourceCarOptions: undefined,
        targetImsiOptions: undefined,
      }
    },
    methods: {
      initTable() {
        this.$set(this, 'tableHeight', this.$refs['ref_1561451427535'] ? this.$refs['ref_1561451427535'].offsetHeight : 0);
        window.onresize = () => {
          this.$set(this, 'tableHeight', this.$refs['ref_1561451427535'] ? this.$refs['ref_1561451427535'].offsetHeight : 0);
        };
        (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
        this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
            this.$set(this, 'dictionary', response.data.data);
          }
        });
        this.setHeight();
      },
      setHeight() {
        const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight
          - document.getElementsByClassName("clear")[0].offsetHeight;
        this.tableBoxHeight = height - 40;
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
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => this.$set(this.formItem, node, ''));
        this.$set(this, 'content', []);
        this.$set(this, 'loading', false);
        this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
        ['sourceCarOptions', 'targetImsiOptions'].forEach(node => this.$set(this, node, {}));
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
      singleRowClick(currentRow) {
        if (!currentRow) return false;
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime());
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastUpdateTimestamp > 300) {
            ['sourceType', 'source', 'targetType', 'target',].forEach(node => this.$set(this.formItem, node, currentRow[node] || ''));
          }
        }, 301);
      },
      doubleRowClick(currentRow) {
        if (!currentRow) return false;
        if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 5 * 86400000) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持5天上限,请选择合适的时间范围.',});
          return false;
        }
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime() + 100);
        let args = {showModal: true, _t: new Date().getTime()};
        args.mapping = this.getMapping();
        [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => args[node] = currentRow[node]);
        this.$set(this, 'associatedDataOptions', args);
      },
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
      selectCarsRecords(position) {
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime());
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastUpdateTimestamp > 300) {
            let query = {_t: new Date().getTime(), loading: false};
            if (!this.formItem.datetimerange || 2 !== this.formItem.datetimerange.length) return false;
            [query.kssjc, query.jssjc] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()];
            if (!this.formItem[position] || !this.formItem[`${position}Type`]) return false;
            [query.cplx, query.cphms] = [this.formItem[`${position}Type`], this.formItem[`${position}`]];
            this.$set(this, `${position}CarOptions`, query);
          }
        }, 301);
      },
      selectImsisRecords(position) {
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime());
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.lastUpdateTimestamp > 300) {
            let query = {_t: new Date().getTime(), loading: false};
            if (!this.formItem.datetimerange || 2 !== this.formItem.datetimerange.length) return false;
            [query.kssjc, query.jssjc] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()];
            if (!this.formItem[position]) return false;
            [query.imsis] = [this.formItem[`${position}`]];
            this.$set(this, `${position}ImsiOptions`, query);
          }
        }, 301);
      },
    },
  }
</script>

<style scoped></style>
