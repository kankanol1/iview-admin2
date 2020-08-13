<template>
  <div style="width: 100%; height: 100%;">
    <div ref="ref_1561451427535" style="width: 100%; height: calc(100% - 32px); overflow-y: auto;">
      <Table ref="selection" highlight-row :columns="columns" :data="content" border :loading="loading" :height="detailTableHeight"></Table>
    </div>
    <div style="width: 100%; height: 32px;">
      <Page size="small" show-total :page-size-opts="[100,200,500,1000,2000]"
            :current.sync="pageInfo.page" :page-size.sync="pageInfo.size"
            :total="pageInfo.totalElements" @on-change="selectNodes"
            @on-page-size-change="(value) => {pageInfo.size = value;selectNodes();}"
            style="float: right;margin: 0px"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'XXXX',
    props: {
      args: {
        type: Object,
        default: () => ({cphms: '', cplx: '', imsis: '', kssjc: 0, jssjc: 0, showModal: false}),
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.coumputerDetailTableHeight);
    },
    mounted() {
      this.coumputerDetailTableHeight();
      window.addEventListener('resize', this.coumputerDetailTableHeight);

      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    computed: {},
    data() {
      return {
        detailTableHeight: 0,
        dictionary: {},
        pageInfo: {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,}, // 展示分页信息
        loading: false, // 数据加载动作
        columns: [
          {title: '车牌号码', key: 'cphm', width: 90, align: 'center',},
          {title: '车牌类型', key: 'cplx', align: 'center', render: (h, params) => h('div', {}, this.dictionary.cplx && this.dictionary.cplx[params.row.cplx] || params.row.cplx),},
          {
            title: '卡口名称', key: 'kkbh', align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              点位编号: params.row.kakouDevice && params.row.kakouDevice.pointCode || params.row.kkbh || '无',
              点位名称: params.row.kakouDevice && params.row.kakouDevice.roadName || '无',
              点位经度: params.row.kakouDevice && params.row.kakouDevice.wgsLongitude || '',
              点位纬度: params.row.kakouDevice && params.row.kakouDevice.gcjLatitude || '',
              最后更新时间: params.row.kakouDevice && params.row.kakouDevice.lastUpdateTime || '',
            }, params.row.kakouDevice && params.row.kakouDevice.roadName || params.row.kkbh || '无'),
          },
          {
            title: '行驶方向', key: 'xsfx', width: 100, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.xsfx && this.dictionary.xsfx[params.row.xsfx] || params.row.xsfx || '无'),
          },
          {title: '过车时间', key: 'gcsjc', align: 'center', render: (h, params) => h('div', {}, new Date(params.row.gcsjc).format('yyyy-MM-dd HH:mm:ss.SSS')),},
          {title: '采集时间', key: 'cjsjc', align: 'center', render: (h, params) => h('div', {}, new Date(params.row.cjsjc).format('yyyy-MM-dd HH:mm:ss.SSS')),},
          {
            title: '热点名称', key: 'rdbh', align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              点位编号: params.row.redianDevice && params.row.redianDevice.pointCode || params.row.rdbh || '无',
              点位名称: params.row.redianDevice && params.row.redianDevice.roadName || '无',
              点位经度: params.row.redianDevice && params.row.redianDevice.wgsLongitude || '',
              点位纬度: params.row.redianDevice && params.row.redianDevice.gcjLatitude || '',
              最后更新时间: params.row.redianDevice && params.row.redianDevice.lastUpdateTime || '',
            }, params.row.redianDevice && params.row.redianDevice.roadName || params.row.rdbh || '无'),
          },
          {title: 'IMSI', key: 'imsi', align: 'center',},
          {title: 'IMEI', key: 'imei', align: 'center',},
          {title: 'MSC / LAC / CID', key: 'msc', align: 'center', render: (h, params) => h('div', {}, `${params.row.msc || ''}  /  ${params.row.lac || ''}  /  ${params.row.cid || ''}`)},
          {title: '网络附着码', key: 'ach', align: 'center',},
        ], // 展示字段
        content: [], // 数据
      }
    },
    watch: {
      args(val) {
        if (val.cphms && val.cplx && val.imsis && val.kssjc && val.jssjc && val.showModal) {
          this.selectNodes();
        } else {
          this.reset();
        }
      },
    },
    methods: {
      coumputerDetailTableHeight() {
        this.$set(this, 'detailTableHeight', (document.documentElement.clientHeight || document.body.clientHeight || 180) - 180);
      },
      reset() {
        this.$set(this, 'loading', false);
        this.$set(this, 'content', []);
        this.$set(this, 'pageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,});
      },
      selectNodes() {
        this.$set(this, 'content', []);
        this.$set(this, 'pageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 100,});
        let args = JSON.parse(JSON.stringify(this.args));
        [args.page, args.size] = [this.pageInfo.page ? this.pageInfo.page - 1 : 0, this.pageInfo.size ? this.pageInfo.size : 100];
        this.$set(this, 'loading', true);
        this.$http.post('/api/com/icr3/selectNodes', args).then((response) => {
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
    },
  }
</script>
