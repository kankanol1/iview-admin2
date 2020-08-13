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
      options: {
        type: Object,
        default: () => ({source: '', sourceType: '', target: '', targetType: '', startTimestamp: 0, endTimestamp: 0, showModal: false, _t: new Date().getTime()}),
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
          {
            title: '数据集一',
            align: 'center',
            children: [
              {
                title: '采集时间', key: 'sourceAcquisitionTime', align: 'center',
                render: (h, params) => this.$createTooltip(h, params, 'right', {
                  停留开始时间: new Date(params.row.sourceStartTime).format('yyyy-MM-dd HH:mm:ss.SSS'),
                  停留结束时间: new Date(params.row.sourceEndTime).format('yyyy-MM-dd HH:mm:ss.SSS'),
                }, new Date(params.row.sourceAcquisitionTime).format('yyyy-MM-dd HH:mm:ss.SSS')),
              },
              {
                title: '热点名称', key: 'sourcePointCode', align: 'center',
                render: (h, params) => this.$createTooltip(h, params, 'right', {
                  点位编号: params.row.sourceDevice && params.row.sourceDevice.pointCode || params.row.sourcePointCode || '无',
                  点位名称: params.row.sourceDevice && params.row.sourceDevice.roadName || '无',
                  点位经度: params.row.sourceDevice && params.row.sourceDevice.wgsLongitude || '',
                  点位纬度: params.row.sourceDevice && params.row.sourceDevice.gcjLatitude || '',
                  最后更新时间: params.row.sourceDevice && params.row.sourceDevice.lastUpdateTime || '',
                }, params.row.sourceDevice && params.row.sourceDevice.roadName || params.row.sourcePointCode || '无'),
              },
              {title: 'IMSI', key: 'sourceImsi', align: 'center',},
              {title: 'IMEI', key: 'sourceImei', align: 'center',},
              {
                title: 'MSC / LAC / CID',
                key: 'sourceMsc',
                align: 'center',
                render: (h, params) => h('div', {}, `${params.row.sourceMsc || ''}  /  ${params.row.sourceLac || ''}  /  ${params.row.sourceCid || ''}`)
              },
              {title: '网络附着码', key: 'sourceAch', align: 'center',},
            ]
          },
          {
            title: '数据集二',
            align: 'center',
            children: [
              {
                title: '采集时间', key: 'targetAcquisitionTime', align: 'center',
                render: (h, params) => this.$createTooltip(h, params, 'left', {
                  停留开始时间: new Date(params.row.targetStartTime).format('yyyy-MM-dd HH:mm:ss.SSS'),
                  停留结束时间: new Date(params.row.targetEndTime).format('yyyy-MM-dd HH:mm:ss.SSS'),
                }, new Date(params.row.targetAcquisitionTime).format('yyyy-MM-dd HH:mm:ss.SSS')),
              },
              {
                title: '热点名称', key: 'targetPointCode', align: 'center',
                render: (h, params) => this.$createTooltip(h, params, 'left', {
                  点位编号: params.row.targetDevice && params.row.targetDevice.pointCode || params.row.targetPointCode || '无',
                  点位名称: params.row.targetDevice && params.row.targetDevice.roadName || '无',
                  点位经度: params.row.targetDevice && params.row.targetDevice.wgsLongitude || '',
                  点位纬度: params.row.targetDevice && params.row.targetDevice.gcjLatitude || '',
                  最后更新时间: params.row.targetDevice && params.row.targetDevice.lastUpdateTime || '',
                }, params.row.targetDevice && params.row.targetDevice.roadName || params.row.targetPointCode || '无'),
              },
              {title: 'IMSI', key: 'targetImsi', align: 'center',},
              {title: 'IMEI', key: 'targetImei', align: 'center',},
              {
                title: 'MSC / LAC / CID',
                key: 'targetMsc',
                align: 'center',
                render: (h, params) => h('div', {}, `${params.row.targetMsc || ''}  /  ${params.row.targetLac || ''}  /  ${params.row.targetCid || ''}`)
              },
              {title: '网络附着码', key: 'targetAch', align: 'center',},
            ]
          },
        ], // 展示字段
        content: [], // 数据
      }
    },
    watch: {
      options(val, old) {
        if (val._t !== old._t && val.source && val.target) {
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
        let args = JSON.parse(JSON.stringify(this.options));
        [args.page, args.size] = [this.pageInfo.page ? this.pageInfo.page - 1 : 0, this.pageInfo.size ? this.pageInfo.size : 100];
        this.$set(this, 'loading', true);
        this.$http.post('/api/com/data/4/associated/data/4/redian/selectDetailNodes', args).then((response) => {
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
