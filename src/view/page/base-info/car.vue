
<template>
  <div>
    <Form ref="ref_formItem" class="form-item-s" :model="formItem" :rules="rules" inline>
      <FormItem prop="pointCodes">
        <Select style="width: 120px;" class="interval" size="small" v-model="formItem.pointCodes" :max-tag-count="0"
                clearable multiple filterable remote :remote-method="selectDevices"
                placeholder="请选择点位信息" :loading="devicesCached.loading">
          <Option v-for="(value, index) in (devicesCached.devices || [])" :key="index" :value="value.pointCode"
                  :label="value.roadName">{{value.roadName}}
          </Option>
        </Select>
      </FormItem>
      <FormItem prop="cplx">
        <Select style="width: 120px" class="interval" size="default" clearable v-model="formItem.cplx"
                placeholder="请选择车牌类型" @on-change="queryChange">
          <Option v-for="(value, key) in (dictionary.cplx || {})" :key="key" :value="key" :label="value">{{value}}
          </Option>
        </Select>
      </FormItem>
      <FormItem prop="cphms">
        <Input style="width: 120px" class="interval" size="default" clearable v-model="formItem.cphms"
               placeholder="请输入车牌号码,多号码半角逗号间隔" @on-change="queryChange"/>
      </FormItem>
      <FormItem prop="datetimerange">
        <DatePicker class="interval" size="default" type="datetimerange" v-model="formItem.datetimerange"
                    placeholder="请选择时间范围"
                    style="width:280px" @on-change="queryChange"/>
      </FormItem>
      <FormItem>
        <ButtonGroup style="height: 30px" size="small">
          <Button style="height: 30px" ghost @click="search()" type="primary" icon="ios-search"
                  :loading="carOptions.loading">搜索
          </Button>
          <Button style="height: 30px" ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
        </ButtonGroup>
      </FormItem>

      <FormItem>
        <ButtonGroup style="height: 30px" size="small">
          <Button style="height: 30px" ghost @click="dealSelected()" type="success" icon="ios-search">入选当前内容</Button>
        </ButtonGroup>
      </FormItem>
      <FormItem>
        <Dropdown style="height: 30px" size="small">
          <Button ghost  style="height: 30px" type="success">
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
                <span>{{new Date(value.cjsjc).format('MM-dd HH:mm:ss')}}-{{value.cphm}}-{{value.device && value.device.roadName || '未知'}}&emsp;</span>
              </DropdownItem>
            </template>
          </DropdownMenu>
        </Dropdown>
      </FormItem>
    </Form>
    <carViewer ref="carViewer" :height="tableHeight" :options="carOptions" columnsType="full"></carViewer>
  </div>
</template>

<script>

  import carViewer from '../components/car'

  export default {
    name: 'car',
    components: {carViewer: carViewer},
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
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      let query = this.$router.currentRoute.query
      if (query && Object.keys(query).length) {
        (query.pointCodes) && (query.pointCodes = query.pointCodes.split(','));
        (query.rdbhs) && (query.rdbhs = query.rdbhs.split(','));
        (!isNaN(query.kssjc) && !isNaN(query.jssjc)) && (query.datetimerange = [new Date(query.kssjc + 0), new Date(query.jssjc + 0)])

        // console.log(query);

        this.$set(this, 'formItem', query)
        setTimeout(this.search(), 500)
        console.log('回溯访问!')
      } else {
        console.log('正常访问!')
      }

      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))))
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    computed: {},
    data() {
      return {
        tableHeight: 0,
        userInfo: {}, // 用户信息
        dictionary: {}, // 字典
        devicesCached: {devices: {}, loading: false}, // 卡口编号
        formItem: {
          cplx: '2',
          cphms: '鲁QG5E4X',
          datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]
        }, // 展示请求参数
        rules: {
          cphms: [
            {
              required: true,
              type: 'string',
              trigger: 'blur',
              validator: (rule, value, callback) => (value && typeof (value) === 'string' && value.length > 5 && value.split(',').length < 11) ? callback() : callback(new Error('请输入车辆信息,最多同时支持5组查询!'))
            }
          ]
        },

        carOptions: {
          pointCodes: '',
          cphms: '',
          cplx: '',
          kssjc: new Date().getTime(),
          jssjc: new Date().getTime(),
          loading: false,
          _t: new Date().getTime(),
          selection: true
        } // 车辆查询条件
      }
    },
    methods: {
      setHeight() {
        this.tableHeight = this.$setTableHeight();
      },
      selectDevices(query) {
        if (!query) {
          this.$set(this.devicesCached, 'devices', [])
          return
        }
        this.formItem.queryLastUpdate = new Date().getTime()
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 500) {
            this.$set(this.devicesCached, 'loading', true)
            this.$http.post('/api/com/kakou/selectNodes', {roadName: query, page: 0, size: 99999}).then((response) => {
              // getPassCarData({roadName: query, page: 0, size: 99999}).then((response) => {
              if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
                this.$set(this.devicesCached, 'devices', response.data.data || [])
              }
              this.$set(this.devicesCached, 'loading', false)
            }).catch(() => this.$set(this.devicesCached, 'loading', false))
          }
        }, 501)
      },
      queryChange() {
        this.formItem.queryLastUpdate = new Date().getTime()
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 1000) {
            this.search()
          }
        }, 1001)
      },
      reset() {
        this.$set(this, 'formItem', {
          cplx: '2',
          cphms: '',
          datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]
        })
        this.cleanSelected()
        this.search()
      },
      search() {
        this.$refs['ref_formItem'].validate((valid) => {
          if (valid) {
            let args = {};
            (this.formItem.pointCodes && this.formItem.pointCodes.length > 0) && (args.pointCodes = this.formItem.pointCodes.join(','));
            (this.formItem.cplx) && (args.cplx = this.formItem.cplx);
            (this.formItem.cphms) && (args.cphms = this.formItem.cphms);
            (this.formItem.datetimerange && this.formItem.datetimerange[0]) && (args.kssjc = this.formItem.datetimerange[0].getTime()); // 毫秒级时间戳
            (this.formItem.datetimerange && this.formItem.datetimerange[1]) && (args.jssjc = this.formItem.datetimerange[1].getTime()) // 毫秒级时间戳
            args._t = new Date().getTime()
            args.loading = false
            args.selection = true
            this.$set(this, 'carOptions', args)
          }
        })
      },
      selected() {
        return this.$refs && this.$refs.carViewer && this.$refs.carViewer.readSelected && this.$refs.carViewer.readSelected() || []
      },
      cleanSelected() {
        this.$refs && this.$refs.carViewer && this.$refs.carViewer.cleanSelected && this.$refs.carViewer.cleanSelected()
        this.$forceUpdate()
      },
      dealSelected() {
        this.$refs && this.$refs.carViewer && this.$refs.carViewer.dealSelected && this.$refs.carViewer.dealSelected()
        this.$forceUpdate()
        this.$Message.success({closable: true, duration: 1, content: '入选成功!'})
      },
      removeSelected(id) {
        this.$refs && this.$refs.carViewer && this.$refs.carViewer.removeSelected && this.$refs.carViewer.removeSelected(id)
        this.$forceUpdate()
      },
      manualAnalysis() {
        this.$router.push({
          name: 'car_check_table',
          params: {data: this.selected(), datetimerange: this.formItem.datetimerange}
        })
      }
    }
  }
</script>
