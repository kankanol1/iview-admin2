<template>
  <div>
    <Form ref="ref_formItem" class="form-item-s"  :model="formItem" :rules="formItem_rules" inline>
      <FormItem prop="imsis">
        <Input class="interval" size="small" clearable v-model="formItem.imsis" placeholder="请输入IMSI,多号码半角逗号间隔"
               @on-change="queryChange"/>
      </FormItem>
      <FormItem class="times" prop="datetimerange">
        <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.datetimerange"
                    placeholder="请选择时间范围" style="width: 300px" @on-change="queryChange"/>
      </FormItem>
      <FormItem>
        <ButtonGroup size="small" style="padding-left:10px;">
          <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
          <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
        </ButtonGroup>
      </FormItem>
    </Form>

    <Row>
      <Col span="9">
        <imsiViewer :options="sourceImsiOptions" columnsType="simple" :height="tableHeight"/>
      </Col>
      <Col span="6">
        <Table
          ref="selection"
          highlight-row :columns="columns"
          :data="content"
          border
          :loading="loading"
          :height="tableHeight - 32"
          @on-row-click="singleRowClick"
          @on-row-dblclick="doubleRowClick"
        />
        <Page
          size="small"
          show-total
          :current.sync="pageInfo.page"
          :page-size.sync="pageInfo.size"
          :page-size-opts="[50,100,200,300,500]"
          :total="pageInfo.totalElements"
          @on-change="search()"
          @on-page-size-change="(value) => {pageInfo.size = value;search();}"
          style="float: right;padding-top: 5px"
        />
      </Col>
      <Col span="9">
        <imsiViewer :options="targetImsiOptions" columnsType="simple" :height="tableHeight"/>
      </Col>
    </Row>
    <Modal :styles="{top: '20px'}" v-model="associatedDataOptions.showModal" title="信息查阅" width="1200">
      <associatedData :options="associatedDataOptions"/>
      <div slot="footer"></div>
    </Modal>

  </div>
</template>

<script>

  import imsiViewer from '../components/rd';
  import associatedData from './components/detail1';

  export default {
    name: 'node1',
    components: {associatedData: associatedData, imsiViewer: imsiViewer,},
    watch: {
      'formItem.sourceType': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectImsisRecords('source');
          }
        },
        immediate: true
      },
      'formItem.source': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectImsisRecords('source');
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
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
    },
    computed: {},
    data() {
      return {
        tableHeight: 0,
        userInfo: {},
        dictionary: {},

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
            render: (h, params) => h('div', {}, params.row.probability.toFixed(8)),
          },
        ], // 展示字段
        content: [], // 数据

        sourceImsiOptions: undefined,
        targetImsiOptions: undefined,
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
      queryChange() {
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => this.$set(this.formItem, node, ''));
        this.$set(this, 'content', []);
        this.$set(this, 'loading', false);
        this.$set(this, 'pageInfo', JSON.parse(JSON.stringify(this.$pageInfo)));
        ['sourceImsiOptions', 'targetImsiOptions',].forEach(node => this.$set(this, node, {}));
      },
      reset() {
        this.$set(this, 'formItem', {
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
        if (this.formItem.datetimerange[1].getTime() - this.formItem.datetimerange[0].getTime() > 2 * 86400000) {
          this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持2天上限,请选择合适的时间范围.',});
          return false;
        }
        this.$set(this.formItem, 'lastUpdateTimestamp', new Date().getTime() + 100);
        let args = {showModal: true, _t: new Date().getTime()};
        [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]; // 毫秒级时间戳
        ['sourceType', 'source', 'targetType', 'target',].forEach(node => args[node] = currentRow[node]);
        this.$set(this, 'associatedDataOptions', args);
      },
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
