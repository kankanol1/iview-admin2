
<template>
  <div>
      <Form ref="ref_formItem" class="form-item-s" :model="formItem" :rules="rules" inline>
        <FormItem prop="pointCodes">
          <label>
            <Select
              style="width: 180px;"
              class="interval"
              size="default"
              v-model="formItem.pointCodes"
              :max-tag-count="0"
              clearable
              multiple
              filterable
              remote
              :remote-method="selectDevices"
              placeholder="请选择点位信息"
              :loading="devicesCached.loading"
            >
              <Option
                v-for="(value, index) in (devicesCached.devices || [])"
                :key="index"
                :value="value.pointCode"
                :label="value.roadName"
              >
                {{value.roadName}}
              </Option>
            </Select>
          </label>
        </FormItem>
        <FormItem prop="imsis">
          <label>
            <Input
              style="width: 180px;"
              class="interval"
              size="default"
              clearable
              v-model="formItem.imsis"
              placeholder="请输入IMSI,多号码半角逗号间隔"
              @on-change="queryChange"
            />
          </label>
        </FormItem>
        <FormItem prop="datetimerange">
          <DatePicker
            class="interval"
            size="default"
            type="datetimerange"
            v-model="formItem.datetimerange"
            placeholder="请选择时间范围"
            style="width: 280px"
            @on-change="queryChange"
          />
        </FormItem>
        <FormItem>
          <ButtonGroup style="height: 30px" size="small">
            <Button
              style="height: 30px"
              ghost
              @click="search()"
              type="primary"
              icon="ios-search"
              :loading="imsiOptions.loading">搜索
            </Button>
            <Button style="height: 30px" ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          </ButtonGroup>
        </FormItem>

        <FormItem>
          <ButtonGroup size="small" style="height: 30px">
            <Button style="height: 30px" ghost @click="dealSelected()" type="success" icon="ios-search">入选当前内容</Button>
          </ButtonGroup>
        </FormItem>
        <FormItem>
          <Dropdown size="small">
            <Button type="success" ghost style="height: 30px">
              已选择内容
              <Icon type="ios-arrow-down" style=""></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem v-if="selected() && selected().length" @click.native="manualAnalysis()"
                            style="float: right;">手工比较&emsp;>>>&emsp;
              </DropdownItem>
              <template v-for="(value, key, index) in selected()">
                <DropdownItem :key="index">
                  <span><Icon type="md-close" @click="removeSelected(value.xh)"/></span>
                  <span>&emsp;</span>
                  <span>{{new Date(value.cjsjc).format('MM-dd HH:mm:ss')}}-{{value.imsi}}-{{value.device && value.device.roadName || '未知'}}&emsp;</span>
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
        </FormItem>
      </Form>
      <imsiViewer :height="tableHeight" ref="imsiViewerRef" :options="imsiOptions" columnsType="full"/>
  </div>
</template>

<script>

import imsiViewer from '../components/rd'

export default {
  name: 'rd',
  components: { imsiViewer: imsiViewer },
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
  mounted () {
    this.setHeight();
    window.onresize = () => this.setHeight();
    let query = this.$router.currentRoute.query
    if (query && Object.keys(query).length) {
      this.$set(this, 'formItem', query);
      (this.formItem.kkbhs) && (this.$set(this.formItem, 'kkbhs', this.formItem.kkbhs.split(',')));
      (this.formItem.pointCodes) && (this.$set(this.formItem, 'pointCodes', this.formItem.pointCodes.split(',')));
      (!isNaN(this.formItem.kssjc) && !isNaN(this.formItem.jssjc)) && (this.$set(this.formItem, 'datetimerange', [new Date(this.formItem.kssjc + 0), new Date(this.formItem.jssjc + 0)]))
      setTimeout(this.search(), 500)
      console.log('回溯访问!')
    } else {
      console.log('正常访问!')
    }

    (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))))
    this.$http.post('/api/com/dictionaries/selectNodes', { xzqh: this.$regioncode, lxmcs: [] }).then((response) => {
      if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
        this.$set(this, 'dictionary', response.data.data)
      }
    })
  },
  computed: {},
  data () {
    return {
      userInfo: {}, // 用户信息
      dictionary: {},
      tableHeight:0,
      devicesCached: { devices: {}, loading: false }, // 卡口编号
      formItem: {
        imsis: '460020681314438',
        datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]
      }, // 展示请求参数

      columns: [

        { type: 'selection', width: 60, align: 'center' },
        {
          title: '热点名称',
          key: 'rdbh',
          align: 'center',
          render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
            热点编号: params.row.rdbh || '无',
            热点名称: params.row.comRedian ? params.row.comRedian.lkmc : '无',
            经度: params.row.comRedian ? params.row.comRedian.ysjdx : '',
            纬度: params.row.comRedian ? params.row.comRedian.yswdy : ''
          }, params.row.comRedian && params.row.comRedian.lkmc || params.row.rdbh || '无')
        },
        { title: 'IMSI', key: 'imsi', width: 150, align: 'center' },
        { title: 'IMEI', key: 'imei', width: 150, align: 'center' },
        { title: 'MSC', key: 'msc', width: 150, align: 'center' },
        { title: 'LAC', key: 'lac', width: 150, align: 'center' },
        { title: 'CID', key: 'cid', width: 150, align: 'center' },
        { title: '网络附着码', key: 'ach', align: 'center' },
        {
          title: '采集时间',
          key: 'cjsjc',
          align: 'center',
          render: (h, params) => h('div', {}, new Date(params.row.cjsjc).format('yyyy-MM-dd HH:mm:ss.SSS'))
        }

      ], // 展示字段

      rules: {
        imsis: [{ required: true, type: 'string', message: 'IMSI不能为空!', trigger: 'blur' }],
        datetimerange: [{
          required: true,
          message: '请选择时间范围!',
          type: 'date',
          trigger: 'change',
          validator: (rule, value, callback) => {
            return (value && value.length == 2 && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!'))
          }
        }]
      }, // 添加或修改字段校验规则

      imsiOptions: {
        pointCodes: '', // 点位编号
        imsis: '',
        kssjc: new Date().getTime(),
        jssjc: new Date().getTime(),
        loading: false,
        _t: new Date().getTime(),
        selection: true
      }
    }
  },
  methods: {
    setHeight() {
      this.tableHeight = this.$setTableHeight();
    },
    selectDevices (query) {
      if (!query) {
        this.$set(this.devicesCached, 'devices', [])
        return
      }
      this.formItem.queryLastUpdate = new Date().getTime()
      setTimeout(() => {
        if (new Date().getTime() - this.formItem.queryLastUpdate >= 500) {
          this.$set(this.devicesCached, 'loading', true)
          this.$http.post('/api/com/redian/selectNodes', { roadName: query, page: 0, size: 99999 }).then((response) => {
            if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
              this.$set(this.devicesCached, 'devices', response.data.data || [])
            }
            this.$set(this.devicesCached, 'loading', false)
          }).catch(() => this.$set(this.devicesCached, 'loading', false))
        }
      }, 501)
    },
    queryChange () {
      this.formItem.queryLastUpdate = new Date().getTime()
      setTimeout(() => {
        if (new Date().getTime() - this.formItem.queryLastUpdate >= 1000) {
          this.search()
        }
      }, 1001)
    },
    reset () {
      this.$set(this, 'formItem', { datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()] })
      this.cleanSelected()
      this.search()
    },
    search () {
      this.$refs['ref_formItem'].validate((valid) => {
        if (valid) {
          let args = {};
          (this.formItem.pointCodes && this.formItem.pointCodes.length > 0) && (args.pointCodes = this.formItem.pointCodes.join(','));
          (this.formItem.imsis) && (args.imsis = this.formItem.imsis);
          (this.formItem.datetimerange && this.formItem.datetimerange[0]) && (args.kssjc = this.formItem.datetimerange[0].getTime()); // 毫秒级时间戳
          (this.formItem.datetimerange && this.formItem.datetimerange[1]) && (args.jssjc = this.formItem.datetimerange[1].getTime()) // 毫秒级时间戳
          args._t = new Date().getTime()
          args.loading = false
          args.selection = true
          this.$set(this, 'imsiOptions', args)
        }
      })
    },
    selected () {
      return this.$refs && this.$refs.imsiViewerRef && this.$refs.imsiViewerRef.readSelected && this.$refs.imsiViewerRef.readSelected() || []
    },
    cleanSelected () {
      this.$refs && this.$refs.imsiViewerRef && this.$refs.imsiViewerRef.cleanSelected && this.$refs.imsiViewerRef.cleanSelected()
      this.$forceUpdate()
    },
    dealSelected () {
      this.$refs && this.$refs.imsiViewerRef && this.$refs.imsiViewerRef.dealSelected && this.$refs.imsiViewerRef.dealSelected()
      this.$forceUpdate()
      this.$Message.success({ closable: true, duration: 1, content: '入选成功!' })
    },
    removeSelected (id) {
      this.$refs && this.$refs.imsiViewerRef && this.$refs.imsiViewerRef.removeSelected && this.$refs.imsiViewerRef.removeSelected(id)
      this.$forceUpdate()
    },
    manualAnalysis () {
      this.$router.push({
        name: 'car_check_table',
        params: { data: this.selected(), datetimerange: this.formItem.datetimerange }
      })
    }
  }
}
</script>
