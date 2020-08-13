<template>
  <div>
      <Form ref="ref_formItem" :model="formItem" :rules="rules" inline>
        <FormItem prop="imsis1">
          <Input class="interval" size="small" clearable v-model="formItem.imsis1" placeholder="请输入手机串号,多号码半角逗号间隔" style="width: 200px"/>
        </FormItem>
        <FormItem prop="imsis2">
          <Input class="interval" size="small" clearable v-model="formItem.imsis2" placeholder="请输入手机串号,多号码半角逗号间隔" style="width: 200px"/>
        </FormItem>
        <FormItem prop="datetimerange">
          <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.datetimerange" placeholder="请选择时间范围" style="width: 300px"/>
        </FormItem>
        <FormItem>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search" :loading="imsiOptions1.loading || imsiOptions2.loading">搜索</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          </ButtonGroup>
        </FormItem>
      </Form>
    <Row>
      <Col span="12">
        <imsiViewer :options="imsiOptions1" columnsType="full" :height="tableHeight"/>
      </Col>
      <Col span="12">
        <imsiViewer :options="imsiOptions2" columnsType="full" :height="tableHeight"/>
      </Col>
    </Row>
  </div>
</template>

<script>

  import imsiViewer from '../components/rd';

  export default {
    name: 'XXXX',
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
    components: {
      imsiViewer: imsiViewer
    },
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      let query = this.$router.currentRoute.query;
      if (query && Object.keys(query).length) {
        this.$set(this, 'formItem', query);
        (this.formItem.kkbhs) && (this.$set(this.formItem, 'kkbhs', this.formItem.kkbhs.split(',')));
        (this.formItem.rdbhs) && (this.$set(this.formItem, 'rdbhs', this.formItem.rdbhs.split(',')));
        (!isNaN(this.formItem.kssjc) && !isNaN(this.formItem.jssjc)) && (this.$set(this.formItem, 'datetimerange', [new Date(this.formItem.kssjc + 0), new Date(this.formItem.jssjc + 0)]));
        setTimeout(this.search(), 500);
        console.log('回溯访问!');
      } else {
        console.log('正常访问!');
      }

      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    data() {
      return {
        tableHeight: 0,
        userInfo: {}, // 用户信息
        dictionary: {},

        formItem: {imsis1: '', imsis2: '', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]}, // 展示请求参数
        rules: {
          imsis1: [
            {
              required: true, type: 'string', trigger: 'blur',
              validator: (rule, value, callback) => (value && typeof(value) === 'string' && 10 < value.length && 11 > value.split(',').length) ? callback() : callback(new Error('请输入IMSI,最多同时支持5组查询!')),
            }
          ],
          imsis2: [
            {
              required: true, type: 'string', trigger: 'blur',
              validator: (rule, value, callback) => (value && typeof(value) === 'string' && 10 < value.length && 11 > value.split(',').length) ? callback() : callback(new Error('请输入IMSI,最多同时支持5组查询!')),
            }
          ],
          datetimerange: [{
            required: true, type: 'date', trigger: 'change',
            validator: (rule, value, callback) => (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!')),
          }],
        },

        imsiOptions1: {},
        imsiOptions2: {},

      };
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-form ivu-form-label-right ivu-form-inline")[0].offsetHeight;

          this.tableHeight = height - 20;
        }
      },
      reset() {
        this.$set(this, 'formItem', {imsis1: '', imsis2: '', datetimerange: [new Date(new Date().getTime() - 30 * 86400000), new Date()]})
        this.search();
      },
      search() {
        this.$refs['ref_formItem'].validate((valid) => {
          if (valid) {
            let args1 = {imsis: this.formItem.imsis1, _t: new Date().getTime(), loading: false};
            let args2 = {imsis: this.formItem.imsis2, _t: new Date().getTime(), loading: false};
            if (this.formItem.datetimerange && this.formItem.datetimerange[0] && this.formItem.datetimerange[1]) { // 毫秒级时间戳
              [args1, args2].forEach(_ => [_.kssjc, _.jssjc] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()]);
            }
            this.$set(this, 'imsiOptions1', args1);
            this.$set(this, 'imsiOptions2', args2);
          }
        });
      },
    },
  }
</script>

<style scoped>
</style>
