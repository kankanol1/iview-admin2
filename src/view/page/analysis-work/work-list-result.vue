<template>
  <div style="width: 100%;height: 100%;">
    <div ref="ref_1567750920849" style="width:100%; height: 100%;">
      <div style="display: inline-block; height: 100%; width: calc(100% - 240pt - 400pt); min-width: 440px; overflow-y: auto;">
        <carViewer :options="carOptions" columnsType="simple"></carViewer>
      </div>
      <div style="display: inline-block; height: 100%; width: 240pt; overflow-y: auto;">
        <div style="width: 100%; height: calc(100% - 32px); overflow-y: auto;">
          <Table ref="selection" highlight-row :columns="columns_r2_agg" :data="content_r2_agg" border :loading="loading_r2_agg" :height="tableHeight"
                 @on-current-change="cascade" @on-row-dblclick="dbcascade"></Table>
        </div>
        <div style="height: 32px;">
          <Page size="small" show-total :page-size-opts="[100,200,500,1000,5000]"
                :current.sync="pageInfo_r2_agg.page" :page-size.sync="pageInfo_r2_agg.size"
                :total="pageInfo_r2_agg.totalElements" @on-change="search()"
                @on-page-size-change="(value) => {pageInfo_r2_agg.size = value;search();}"
                style="float: right;margin: 0px"/>
        </div>
      </div>
      <div style="display: inline-block; height: 100%; width: 400pt; overflow-y: auto;">
        <imsiViewer :options="imsiOptions" columnsType="simple"></imsiViewer>
      </div>
    </div>
    <div>
      <Modal :styles="{top: '20px'}" v-model="icr3Options.showModal" title="信息查阅" width="1200">
        <icr3 :args="icr3Options"></icr3>
        <div slot="footer"></div>
      </Modal>
    </div>
  </div>
</template>

<script>

  import carViewer from '../components/car';
  import imsiViewer from '../components/rd';
  import icr3 from '../human-car/components/com-detail-o';

  export default {
    name: 'work-list-result',
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
    },
    mounted() {
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    computed: {
      tableHeight: function () {
        return this.$refs['ref_1567750920849'] ? this.$refs['ref_1567750920849'].offsetHeight - 32 : 0;
      }
    },
    data() {
      return {
        userInfo: {},
        dictionary: {},

        icr3Options: {showModal: false,},

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
      }
    },
    methods: {
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
          this.$set(this, 'icr3Options', args);

        }
      },
      search() {
      },
      selectCars() {
        let args = {cplx: this.formItem_r2.cplx ? this.formItem_r2.cplx : '2', cphms: this.formItem.cphm, _t: new Date().getTime(), loading: false};
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
    },
  }
</script>

<style scoped></style>
