<style lang="less">
  .out-box {
    width: 100%;
    overflow: auto;
  }

  .inner-box {
    min-width: 800px;
  }

  .table-box {
    display: flex;
    /*width: 100%;*/
    /*overflow: auto;*/
  }

  .table-box > div {
    flex: 1;
    width: 28%;

    height: 100%;
  }

  .table-box > div:nth-child(1),
  .table-box > div:nth-child(3) {
    width: 38%;
    min-width: 450px;
  }

  .table-box > div:nth-child(2) {
    width: 28%;
    min-width: 300px;
  }
</style>
<template>
  <div>
    <Form ref="ref_formItem_r2" class="form-item-s" :model="formItem_r2" :rules="formItem_r2_rules" inline>
      <FormItem prop="cplx">
        <Select class="interval" size="small" v-model="formItem_r2.cplx" placeholder="请选择车牌类型" @on-change="queryChange">
          <Option v-for="(value, key) in (dictionary.cplx || {})" :key="key" :value="key" :label="value">{{value}}
          </Option>
        </Select>
      </FormItem>
      <FormItem prop="cphms">
        <Input class="interval" size="small" clearable v-model="formItem_r2.cphms" placeholder="请输入车牌号码,多号码半角逗号间隔"
               @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="imsis">
        <Input class="interval" size="small" clearable v-model="formItem_r2.imsis" placeholder="请输入IMSI,多号码半角逗号间隔"
               @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="datetimerange">
        <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem_r2.datetimerange"
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
        <carViewer :options="carOptions" columnsType="simple" :height="tableBoxHeight"></carViewer>
      </Col>
      <Col span='6'>
        <div :style="{height: (tableBoxHeight/2)+'px'}">
          <Table
            ref="selection"
            highlight-row
            :columns="columns_r2_agg" :data="content_r2_agg" border
            :loading="loading_r2_agg"
            :height="tableBoxHeight / 2 - 32"
            @on-current-change="cascade"
            @on-row-dblclick="dbcascade"
          />
          <Page
            size="small" show-total
            :page-size-opts="[100,200,500,1000,5000]"
            :current.sync="pageInfo_r2_agg.page"
            :page-size.sync="pageInfo_r2_agg.size"
            :total="pageInfo_r2_agg.totalElements"
            @on-change="selectAggNodes"
            @on-page-size-change="(value) => {pageInfo_r2_agg.size = value;selectAggNodes();}"
            style="float: right;margin: 0px"
          />
        </div>
        <div :style="{height: (tableBoxHeight/2)+'px'}">
          <Table
            ref="selection"
            highlight-row
            :columns="columns_r2"
            :data="content_r2" border
            :loading="loading_r2"
            :height="tableBoxHeight / 2 - 32"
            @on-current-change="cascade"
            @on-row-dblclick="dbcascade"
          />
          <Page
            size="small"
            show-total
            :page-size-opts="[100,200,500,1000,5000]"
            :current.sync="pageInfo_r2.page"
            :page-size.sync="pageInfo_r2.size"
            :total="pageInfo_r2.totalElements"
            @on-change="selectSimpleNodes"
            @on-page-size-change="(value) => {pageInfo_r2.size = value;selectSimpleNodes();}"
            style="float: right;margin: 0px"
          />
        </div>
      </Col>
      <Col span="9">
        <imsiViewer :options="imsiOptions" columnsType="simple" :height="tableBoxHeight"/>
      </Col>
    </Row>
    <Modal :styles="{top: '20px'}" v-model="args.showModal" title="信息查阅" width="1200">
      <icr3 :args="args"></icr3>
      <div slot="footer"></div>
    </Modal>

  </div>
</template>

<script>

  import carViewer from '../components/car';
  import imsiViewer from '../components/rd';
  import icr3 from './components/com-detail-o';

  export default {
    name: 'node03.01',
    components: {icr3: icr3, carViewer: carViewer, imsiViewer: imsiViewer},
    watch: {
      'formItem.cphm': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectCars();
          }
        },
        immediate: true
      },
      'formItem.imsi': {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.selectImsis();
          }
        },
        immediate: true
      },
      tableBoxHeight: {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.setHeight()
          }
        },
        immediate: true
      },
    },
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    computed: {},
    data() {
      return {
        tableBoxHeight: 0,
        tableHeight: 0,
        userInfo: {},
        dictionary: {},

        args: {showModal: false,},

        formItem_r2: {
          imsis: '',
          cplx: '2',
          datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]
        }, // 展示请求参数
        formItem_r2_rules: {
          cplx: [{required: true, type: 'string', message: '请选择车牌类型!', trigger: 'blur'}],
          cphms: [{
            required: true, type: 'string', trigger: 'blur',
            validator: (rule, value, callback) => {
              return (!this.formItem_r2.cphms && !this.formItem_r2.imsis) ? callback(new Error('请输入车牌号码,多号码半角逗号间隔!')) : callback();
            },
          }],
          imsis: [{
            required: true, type: 'string', trigger: 'blur',
            validator: (rule, value, callback) => {
              return (!this.formItem_r2.cphms && !this.formItem_r2.imsis) ? callback(new Error('请输入IMSI,多号码半角逗号间隔!')) : callback();
            },
          }],
          datetimerange: [{
            required: true, type: 'date', trigger: 'change',
            validator: (rule, value, callback) => {
              return (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!'));
            },
          }],
        },
        pageInfo_r2: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading_r2: false, // 数据加载动作
        columns_r2: [
          {
            title: '车牌号码', key: 'cphm', width: 70, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo_r2.sizeOfElements / 2 ? 'bottom' : 'top', {
              车牌类型: this.dictionary.cplx && this.dictionary.cplx[params.row.cplx] || params.row.cplx || '无',
            }, params.row.cphm),
          },
          {title: 'IMSI', key: 'imsi', width: 110, align: 'center',},
          {
            title: 'CS',
            key: 'cs',
            minWidth: 70,
            align: 'center',
            render: (h, params) => h('div', {}, `${params.row.cs} / ${params.row.rdbh_cs} / ${params.row.kkbh_cs}`),
          },
          {title: '日期', key: 'riqi', width: 60, align: 'center',},
        ], // 展示字段
        content_r2: [], // 数据

        pageInfo_r2_agg: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading_r2_agg: false, // 数据加载动作
        columns_r2_agg: [
          {
            title: '车牌号码', key: 'cphm', width: 70, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo_r2_agg.sizeOfElements / 2 ? 'bottom' : 'top', {
              车牌类型: this.dictionary.cplx && this.dictionary.cplx[params.row.cplx] || params.row.cplx || '无',
            }, params.row.cphm),
          },
          {title: 'IMSI', key: 'imsi', width: 110, align: 'center',},
          {
            title: 'CS', key: 'cs', minWidth: 70, align: 'center',
            render: (h, params) => h('div', {}, `${params.row.cs} / ${params.row.rdbh_cs} / ${params.row.kkbh_cs}`),
          },
        ], // 展示字段
        content_r2_agg: [], // 数据

        formItem: {cplx: '', cphm: '', imsi: ''}, //展示请求参数

        carOptions: {},
        imsiOptions: {},

        timeLimit: 5 * 366 * 86400000,
      }
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("content-wrapper").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight
            - document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;
          this.tableBoxHeight = height-30;
        }
      },
      queryChange() {
        // 清空上一次的查询内容.
        ['content_r2', 'content_r2_agg'].forEach(node => this.$set(this, node, []));
        // 清空上一次的查询参数信息.
        ['formItem'].forEach(node => this.$set(this, node, {cplx: '', cphm: '', imsi: ''}));
        // 清空上一次的分页信息.
        ['pageInfo_r2', 'pageInfo_r2_agg'].forEach(node => this.$set(this, node, JSON.parse(JSON.stringify(this.$pageInfo))));
        // 清空加载状态.
        ['loading_r2', 'loading_r2_agg'].forEach(node => this.$set(this, node, false));
        this.selectCars();
        this.selectImsis();
      },
      reset() {
        this.$set(this, 'formItem_r2', {
          cplx: '2',
          datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]
        });
        this.queryChange();
      },
      cascade(currentRow) {
        if (currentRow) {
          (currentRow.cphm && currentRow.cphm !== this.formItem.cphm) && (this.$set(this.formItem, 'cphm', currentRow.cphm));
          (currentRow.imsi && currentRow.imsi !== this.formItem.imsi) && (this.$set(this.formItem, 'imsi', currentRow.imsi));
        }
      },
      dbcascade(currentRow) {
        if (currentRow) {
          let args = {cplx: currentRow.cplx, cphms: currentRow.cphm, imsis: currentRow.imsi,};
          args.kssjc = (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[0]) ? this.formItem_r2.datetimerange[0].getTime() : new Date(new Date().getTime() - 30 * 86400000).getTime(); // 毫秒级时间戳
          args.jssjc = (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[1]) ? this.formItem_r2.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
          args.showModal = true;
          this.$set(this, 'args', args);
        }
      },
      search() {
        this.selectAggNodes();
        this.selectSimpleNodes();
      },
      selectCars() {
        let args = {
          cplx: this.formItem_r2.cplx ? this.formItem_r2.cplx : '2',
          cphms: this.formItem.cphm,
          _t: new Date().getTime(),
          loading: false
        };
        if (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[0] && this.formItem_r2.datetimerange[1]) { // 毫秒级时间戳
          [args].forEach(_ => [_.kssjc, _.jssjc] = [this.formItem_r2.datetimerange[0].getTime(), this.formItem_r2.datetimerange[1].getTime()]);
        }
        this.$set(this, 'carOptions', args);
      },
      selectImsis() {
        let args = {imsis: this.formItem.imsi, _t: new Date().getTime(), loading: false};
        if (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[0] && this.formItem_r2.datetimerange[1]) { // 毫秒级时间戳
          [args].forEach(_ => [_.kssjc, _.jssjc] = [this.formItem_r2.datetimerange[0].getTime(), this.formItem_r2.datetimerange[1].getTime()]);
        }
        this.$set(this, 'imsiOptions', args);
      },
      selectAggNodes() {
        this.$refs['ref_formItem_r2'].validate((valid) => {
          if (valid) {
            if (!this.formItem_r2.datetimerange || !this.formItem_r2.datetimerange[0] || !this.formItem_r2.datetimerange[1]) {
              this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
              return false;
            }
            if (this.formItem_r2.datetimerange[1].getTime() - this.formItem_r2.datetimerange[0].getTime() > this.timeLimit) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
              return false;
            }
            this.$set(this, 'content_r2_agg', []); // 清空数据
            let args = {};
            (this.formItem_r2.cphms) && (args.cphms = this.formItem_r2.cphms);
            (this.formItem_r2.cplx) && (args.cplx = this.formItem_r2.cplx);
            (this.formItem_r2.imsis) && (args.imsis = this.formItem_r2.imsis);
            args.kssjc = (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[0]) ? this.formItem_r2.datetimerange[0].getTime() : new Date(new Date().getTime() - 15 * 86400000).getTime(); // 毫秒级时间戳
            args.jssjc = (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[1]) ? this.formItem_r2.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
            args.page = this.pageInfo_r2_agg.page ? this.pageInfo_r2_agg.page - 1 : this.$pageInfo.page;
            args.size = this.pageInfo_r2_agg.size ? this.pageInfo_r2_agg.size : this.$pageInfo.size;
            this.$set(this, 'loading_r2_agg', true);

            this.$http.post('/api/com/icr2/selectAggNodes', args).then((response) => {
              if (!!response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.pageInfo_r2_agg, 'totalElements', response.data.page.totalElements);
                  this.$set(this.pageInfo_r2_agg, 'sizeOfElements', response.data.page.sizeOfElements);
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
      selectSimpleNodes() {
        this.$refs['ref_formItem_r2'].validate((valid) => {
          if (valid) {
            if (!this.formItem_r2.datetimerange || !this.formItem_r2.datetimerange[0] || !this.formItem_r2.datetimerange[1]) {
              this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
              return false;
            }
            if (this.formItem_r2.datetimerange[1].getTime() - this.formItem_r2.datetimerange[0].getTime() > this.timeLimit) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
              return false;
            }
            this.$set(this, 'content_r2', []); // 清空数据
            let args = {};
            (this.formItem_r2.cphms) && (args.cphms = this.formItem_r2.cphms);
            (this.formItem_r2.cplx) && (args.cplx = this.formItem_r2.cplx);
            (this.formItem_r2.imsis) && (args.imsis = this.formItem_r2.imsis);
            args.kssjc = (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[0]) ? this.formItem_r2.datetimerange[0].getTime() : new Date(new Date().getTime() - 15 * 86400000).getTime(); // 毫秒级时间戳
            args.jssjc = (this.formItem_r2.datetimerange && this.formItem_r2.datetimerange[1]) ? this.formItem_r2.datetimerange[1].getTime() : new Date().getTime(); // 毫秒级时间戳
            args.page = this.pageInfo_r2.page ? this.pageInfo_r2.page - 1 : this.$pageInfo.page;
            args.size = this.pageInfo_r2.size ? this.pageInfo_r2.size : this.$pageInfo.size;
            this.$set(this, 'loading_r2', true);

            this.$http.post('/api/com/icr2/selectSimpleNodes', args).then((response) => {
              if (!!response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 0b00000001) {
                  this.$set(this.pageInfo_r2, 'totalElements', response.data.page.totalElements);
                  this.$set(this.pageInfo_r2, 'sizeOfElements', response.data.page.sizeOfElements);
                  this.$set(this, 'content_r2', response.data.data);
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }
              this.$set(this, 'loading_r2', false);
            }).catch(() => this.$set(this, 'loading_r2', false));
          }
        });
      },
    },
  }
</script>

<style scoped></style>
