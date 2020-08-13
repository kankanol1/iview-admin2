<template>
  <div>
    <div class="clear">
      <Row>
        <Col :md="3" :lg="3">
          <Select class="interval" size="small" clearable v-model="formItem.regionCode" placeholder="请选择行政区划"
                  @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.kkxzqh || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </Col>
        <Col :md="3" :lg="3">
          <Input class="interval" size="small" clearable v-model="formItem.pointCode" placeholder="请输入设备或点位编号"
                 @on-change="queryChange"/>
        </Col>
        <Col :md="3" :lg="3">
          <Input class="interval" size="small" clearable v-model="formItem.roadName" placeholder="请输入路口名称"
                 @on-change="queryChange"/>
        </Col>
        <Col :md="10" :lg="10">
          <DatePicker
            class="interval"
            size="small"
            type="datetimerange"
            v-model="formItem.datetimerange"
            placeholder="请选择时间范围"
            style="min-width: 280px"
          />
        </Col>
        <Col  :md="4" :lg="4">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search" :loading="loading" title="搜索"></Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh" title="重置"></Button>
            <Button ghost @click="dataCount()" type="primary" icon="ios-speedometer-outline" title="开始统计" :loading="loading">
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
    <Table
      ref="ref_1568024756662"
      :columns="columns"
      :data="content"
      border
      :loading="loading"
      :height="tableHeight"
      :row-class-name="(row, index) => row.relationRedianIds && row.relationRedianIds.length ? 'include-car' : ''"
      @on-row-dblclick="dblclick"
    />
    <Page
      size="small"
      show-total
      show-elevator
      show-sizer
      :current.sync="pageInfo.page"
      :page-size.sync="pageInfo.size"
      :page-size-opts="[10,20,50,100,500]"
      :total="pageInfo.totalElements"
      @on-change="search"
      @on-page-size-change="(value) => {pageInfo.size = value;search();}"
      style="float: right;padding-top: 10px"
    />
    <createDrawer :options="createDrawerOptions"/>
  </div>
</template>

<script>
  import createDrawer from '../components/connect';

  export default {
    name: 'kakou-statics',
    components: {createDrawer: createDrawer},
    watch: {
      tableHeight: {
        handler(curVal, oldVal) {
          if (curVal === oldVal) return false;
          if (curVal) {
            this.setHeight();
          }
        },
        immediate: true,
      }
    },
    mounted() {
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {
        xzqh: this.$regioncode,
        lxmcs: ['kkxzqh']
      }).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
      this.search();
      this.setHeight();
      window.onresize = () => this.setHeight();
    },
    computed: {},
    data() {
      return {
        tableHeight: 0,
        userInfo: {}, // 用户信息
        dictionary: {}, // 字典

        pageInfo: {totalElements: 0, page: 1, size: 20,}, // 展示分页信息
        formItem: {datetimerange: [new Date(new Date().getTime() - 2 * 60 * 60 * 1000), new Date()]}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '序号', key: 'id', width: 70, align: 'center',},
          {
            title: '行政区划', key: 'regionCode', minWidth: 120, maxWidth: 150, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.kkxzqh && this.dictionary.kkxzqh[params.row.regionCode] || params.row.regionCode || '无'),
          },
          {
            title: '路口名称', key: 'roadName', minWidth: 150, maxWidth: 250, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              路口编号: params.row.roadCode || '无',
              道路类型: this.dictionary.dllx && this.dictionary.dllx[params.row.roadType] || params.row.roadType || '无'
            }, params.row.roadName),
          },
          {title: '设备编号', key: 'machineCode', minWidth: 150, maxWidth: 200, align: 'center',},
          {title: '点位编号', key: 'pointCode', minWidth: 150, maxWidth: 200, align: 'center',},
          {
            title: '原始经纬度', key: 'wgsLongitude', minWidth: 150, maxWidth: 250, align: 'center',
            render: (h, params) => h('div', {}, `${params.row.wgsLongitude || ''} / ${params.row.wgsLatitude || ''}`),
          },
          {title: 'c', key: 'c', width: 80, align: 'center',},
          {title: 'c0.5', key: 'c0', width: 80, align: 'center',},
          {title: 'c1', key: 'c1', width: 80, align: 'center',},
          {title: 'c2', key: 'c2', width: 80, align: 'center',},
          {title: 'c5', key: 'c5', width: 80, align: 'center',},
          {title: 'c12', key: 'c12', width: 80, align: 'center',},
        ], // 展示字段
        content: [], // 数据
        createDrawerOptions: {kakouXhs: [], redianXhs: [], _t: new Date().getTime()},
      };
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight -
            document.getElementsByClassName("ivu-page mini")[0].offsetHeight -
            30;
          this.$set(this, 'tableHeight', height);
        }
      },
      queryChange() {
        this.$set(this, 'pageInfo', {totalElements: 0, page: 1, size: 20,});
        this.$set(this, 'content', []);
      },
      reset() {
        this.$set(this, 'formItem', {datetimerange: [new Date(new Date().getTime() - 2 * 60 * 60 * 1000), new Date()]})
        this.queryChange();
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        (this.formItem.regionCode) && (args.regionCode = this.formItem.regionCode);
        (this.formItem.pointCode) && (args.pointCode = this.formItem.pointCode);
        (this.formItem.roadName) && (args.roadName = this.formItem.roadName);
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : 0;
        args.size = this.pageInfo.size ? this.pageInfo.size : 20;
        this.$set(this, 'loading', true);

        this.$http.post('/api/com/kakou/selectNodes', args).then((response) => {
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
      },
      dataCount() {
        let args = {};
        if (this.formItem.datetimerange && this.formItem.datetimerange[0] && this.formItem.datetimerange[1]) {
          [args.startTimestamp, args.endTimestamp] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()];
          if (args.endTimestamp - args.startTimestamp > 12 * 60 * 60 * 1000) {
            this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持12小时上限,请选择合适的时间范围.',});
            return;
          }
        } else {
          this.$Message.warning({closable: true, duration: 2, content: '请选择合适的时间范围.',});
          return;
        }
        let pointCodes = this.$refs.ref_1568024756662.getSelection().map(n => n.pointCode);
        if (!pointCodes || 0 === pointCodes.length || 100 < pointCodes.length) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择适当的点位信息, 支持100点位上限.',});
          return;
        }
        args.pointCodes = pointCodes.join(',');

        this.$set(this, 'loading', true);

        this.$http.post('/api/com/kakoushuju/countRecords', args).then((response) => {
          if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 0b00000001) {
            let data = {};
            response.data.data.forEach(__ => data[__.pointCode] = __);
            this.content.forEach(__ => {
              if (data[__.pointCode]) {
                let currentRecord = data[__.pointCode];
                Object.keys(currentRecord).forEach(k => this.$set(__, k, currentRecord[k]));
              }
            });
            this.$forceUpdate();
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
          }
          this.$set(this, 'loading', false);
        }).catch(() => this.$set(this, 'loading', false));
      },
      dblclick(row) {
        if (!row) return;
        let args = {
          kakouXhs: row.pointCode && [row.pointCode] || [],
          redianXhs: row.relationRedianIds || [],
          _t: new Date().getTime()
        };
        this.$set(this, 'createDrawerOptions', args);
      },
    },
  }
</script>

