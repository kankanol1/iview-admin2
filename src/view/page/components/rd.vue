<style>
  .ivu-table .include-imsi td{
    /*background-color: #2db7f5;*/
    background-color: #2d8cf0;
    /*background-color: #ff6600;*/
    color:#fff;
  }
</style>
<template>
  <div style="width: 100%; height: 100%;">
    <div ref="ref_1567749465782" >
      <Table
        ref="selection"
        border :columns="columns"
        :data="content" :loading="options.loading" :height="tableCurrentHeight"
        :row-class-name="rowClassName"
        @on-row-dblclick="dblclick">
      </Table>
    </div>
    <div style="height: 32px; overflow-y: hidden;">
      <Page size="small" show-total show-elevator show-sizer :current.sync="pageInfo.page"
            :page-size.sync="pageInfo.size" :page-size-opts="[100,200,500,1000,2000]"
            :total="pageInfo.totalElements" @on-change="search"
            @on-page-size-change="(value) => {pageInfo.size = value;search();}"
            style="float: right;margin-top: 5px"/>
    </div>
    <createDrawer :options="drawerOptions"></createDrawer>
  </div>
</template>
<script>

  import createDrawer from './connect'

  export default {
  components: {
    createDrawer: createDrawer
  },
  mounted () {
    if (!this.height) {
      this.$set(this, 'tableHeight', this.$refs['ref_1567749465782'] ? this.$refs['ref_1567749465782'].offsetHeight : 0)
      window.onresize = () => {
        this.$set(this, 'tableHeight', this.$refs['ref_1567749465782'] ? this.$refs['ref_1567749465782'].offsetHeight : 0)
      }
    }
  },
  computed: {
    tableCurrentHeight: function () {
      return this.height ? this.height - 32 : this.tableHeight
    },
    columns: function () {
      let columns = []
      if (this.columnsType === 'full') {
        columns.push(...(this.options.selection ? this.simpleColumns : this.simpleColumns.filter(it => it.title != 'key')))
      } else if (this.columnsType === 'simple') {
        for (let c of this.simpleColumns) {
          if (['key', 'MSC / LAC / CID'].indexOf(c.title) === -1) {
            columns.push(c)
          }
        }
      }
      return columns
    }
  },
  props: {
    options: {
      type: Object,
      default: () => ({
        pointCodes: '', // 点位编号
        imsis: '',
        kssjc: new Date().getTime(),
        jssjc: new Date().getTime(),
        loading: false,
        _t: new Date().getTime(),
        selection: false
      })
    },
    columnsType: {
      type: String,
      default: 'simple',
      validator (value) {
        return ['simple', 'full'].indexOf(value) > -1
      }
    },
    height: {
      type: Number,
      default: undefined
    },
    queryURL: {
      type: String,
      default: '/api/com/redianshuju/selectNodes'
    }
  },
  watch: {
    options (val, old) {
      if (val._t !== old._t && (val.pointCodes || val.imsis)) {
        this.search()
      } else {
        this.reset()
      }
    }
  },
  data () {
    return {
      tableHeight: 0,
      pageInfo: { totalElements: 0, sizeOfElements: 0, page: 1, size: 100 },
      simpleColumns: [
        { type: 'selection', title: 'key', width: 50, align: 'center' },
        {
          title: '采集时间',
          key: 'cjsjc',
          minWidth: 150,
          align: 'center',
          render: (h, params) => h('div', {}, new Date(params.row.cjsjc).format('yyyy-MM-dd HH:mm:ss.SSS'))
        },
        {
          title: 'IMSI',
          key: 'imsi',
          minWidth: 110,
          align: 'center',
          render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
            IMEI: params.row.imei || '未知',
            MSC: params.row.msc || '未知',
            LAC: params.row.lac || '未知',
            CID: params.row.cid || '未知'
          }, params.row.imsi)
        },
        {
          title: '点位名称',
          key: 'rdbh',
          align: 'center',
          minWidth: 100,
          render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
            点位编号: params.row.device && params.row.device.pointCode || params.row.rdbh || '无',
            点位名称: params.row.device && params.row.device.roadName || '无',
            点位经度: params.row.device && params.row.device.wgsLongitude || '',
            点位纬度: params.row.device && params.row.device.wgsLatitude || '',
            最后更新时间: params.row.device && params.row.device.lastUpdateTime || ''
          }, params.row.device && params.row.device.roadName || params.row.rdbh || '无')
        },
        {
          title: 'MSC / LAC / CID',
          key: 'lac',
          minWidth: 100,
          align: 'center',
          render: (h, params) => h('p', {}, `${params.row.msc || ''} / ${params.row.lac || ''} / ${params.row.cid || ''}`)
        },
        { title: '网络附着码', key: 'ach', minWidth: 80, align: 'center' }
      ],
      content: [],
      selectedData: {}, // 保存用于人工比较的数据

      drawerOptions: {}
    }
  },
  methods: {
    rowClassName(row, index){
      return (row.device && row.device.relationKakouIds && row.device.relationKakouIds.length > 0) ? 'include-imsi' : '';
    },
    reset () {
      this.$set(this.options, 'loading', false)
      this.$set(this, 'content', [])
      this.cleanSelected()
      this.$set(this, 'pageInfo', { totalElements: 0, sizeOfElements: 0, page: 1, size: 100 })
    },
    search () {
      // 清空数据
      this.$set(this, 'content', [])
      // 处理参数
      let args = JSON.parse(JSON.stringify(this.options));
      [args.page, args.size] = [this.pageInfo.page && this.pageInfo.page - 1 || 0, this.pageInfo.size || 100]
      // 加载状态
      this.$set(this.options, 'loading', true)
      // 触发请求
      this.$http.post(this.queryURL, args).then((response) => {
        if (!!response && response.status === 200) {
          if ((response.data.status & 0b00001111) === 0b00000001) {
            this.$set(this.pageInfo, 'totalElements', response.data.page.totalElements)
            this.$set(this.pageInfo, 'sizeOfElements', response.data.page.sizeOfElements)
            this.$set(this, 'content', response.data.data)
          } else {
            this.$Message.warning({ closable: true, duration: 2, content: response.data.msg })
          }
        }
        this.$set(this.options, 'loading', false)
      }).catch(() => this.$set(this.options, 'loading', false))
    },
    dblclick (row) {
      if (!row) return
      let args = { kakouXhs: row.device.relationKakouIds || [], redianXhs: row.rdbh && [row.rdbh] || [], _t: new Date().getTime() }
      this.$set(this, 'drawerOptions', args)
    },
    cleanSelected () {
      this.$set(this, 'selectedData', {})
    },
    removeSelected (id) {
      delete this.selectedData[id]
    },
    dealSelected () {
      if (!this.options.selection) {
        return
      }
      let data = this.$refs.selection.getSelection()
      data.forEach(_ => this.selectedData[_.xh] = _)
      return this.selectedData
    },
    readSelected () {
      return Object.values(this.selectedData)
    }
  }
}
</script>
