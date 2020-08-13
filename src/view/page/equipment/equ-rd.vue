<style lang="less">
  .title-margin {
    margin-bottom: 10px;
  }
</style>
<template>
  <div>
    <div class="clear" style="padding-bottom: 0">
      <Row>
        <Col :md="4" :lg="3" class="title-margin">
          <Select class="interval" size="small" clearable v-model="formItem.regionCode" placeholder="请选择行政区划"
                  @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.rdxzqh || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Select class="interval" size="small" clearable v-model="formItem.roadType" placeholder="请选择道路类型"
                  @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.dllx || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Input class="interval" size="small" clearable v-model="formItem.pointCode" placeholder="请输入设备或点位编号"
                 @on-change="queryChange"/>

        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Input class="interval" size="small" clearable v-model="formItem.roadName" placeholder="请输入道路名称"
                 @on-change="queryChange"/>

        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Checkbox size="small" v-model="formItem.abnormal" style="vertical-align: sub; margin-left: 8pt;">异常点位
          </Checkbox>
        </Col>
        <Col :md="24" :lg="9" class="title-margin">
          <ButtonGroup size="small">
            <Button ghost @click="search()" type="primary" icon="ios-search" :loading="loading" title="搜索"></Button>
            <Button ghost @click="insert()" type="primary" icon="md-add" title="添加"></Button>
            <Button ghost @click="remove()" type="primary" icon="md-close" title="删除"></Button>
            <Button ghost @click="reset()" type="primary" icon="ios-refresh" title="重置"></Button>
            <Button ghost v-if="userInfo && userInfo.role && userInfo.role === 'ROLE_DEVELOP'"
                    @click="updateAll()" type="primary" icon="ios-calculator-outline"
                    title="重新计算"></Button>
          </ButtonGroup>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="download()" type="error" icon="ios-cloud-download-outline" title="下载"></Button>
          </ButtonGroup>
        </Col>
      </Row>


    </div>
    <div>
      <Table
        ref="selection"
        :columns="columns"
        size="small"
        :data="content"
        border
        :loading="loading"
        :height="tableHeight"
        @on-row-dblclick="dblclick"
        :row-class-name="(row, index) => row.relationKakouIds && row.relationKakouIds.length ? 'include-imsi' : ''"
      />
      <div style="height: 32px;">
        <Page size="small" show-total show-elevator show-sizer :current.sync="pageInfo.page"
              :page-size.sync="pageInfo.size" :page-size-opts="[100,200,500,1000,5000]"
              :total="pageInfo.totalElements" @on-change="search"
              @on-page-size-change="(value) => {pageInfo.size = value;search();}"
              style="float: right;margin-top: 5px"/>
      </div>
    </div>

    <Modal :styles="{top: '20px'}" v-model="showSimpleModal" title="信息维护" width="700px">
      <Form ref="ref1558919005001" :model="editSimpleItem" :rules="ruleSimpleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editSimpleItem.id" placeholder="序号,自动生成"/>
        </FormItem>
        <FormItem label="道路名称" prop="roadName">
          <Input disabled v-model="editSimpleItem.roadName" placeholder="请输入道路名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口"
                 clearable/>
        </FormItem>
        <FormItem label="点位编号" prop="pointCode">
          <Input disabled v-model="editSimpleItem.pointCode" placeholder="请输入点位编号, 例如: 3700000001, 3700000002"
                 clearable/>
        </FormItem>
        <FormItem label="火星经度" prop="gcjLongitude">
          <Input v-model="editSimpleItem.gcjLongitude" placeholder="请输入火星经度, 例如: 118.123456789, 118.987654321" clearable
                 @on-blur="simpleUpdateGCJLongitude"/>
        </FormItem>
        <FormItem label="火星纬度" prop="gcjLatitude">
          <Input v-model="editSimpleItem.gcjLatitude" placeholder="请输入火星纬度, 例如: 34.123456789, 35.987654321" clearable
                 @on-blur="simpleUpdateGCJLatitude"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="() => (this.$set(this, 'showSimpleModal', false))"
                :loading="modalSimpleLoading">取消
        </Button>
        <Button type="primary" size="large" @click="submitSimple" :loading="modalSimpleLoading">确定</Button>
      </div>
    </Modal>

    <Modal :styles="{top: '20px'}" v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref1558919325000" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editItem.id" placeholder="序号,自动生成" clearable/>
        </FormItem>
        <FormItem label="行政区划" prop="regionCode">
          <Select v-model="editItem.regionCode" placeholder="请选择行政区划" clearable>
            <Option v-for="(value, key, index) in (dictionary.rdxzqh || {})" :key="index" :value="key" :label="value">
              <span>{{value}}</span><span style="float: right;">{{key}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="道路编号" prop="roadCode">
          <Input v-model="editItem.roadCode" placeholder="请输入道路编号, 例如: 3700000001, 3700000002" clearable/>
        </FormItem>
        <FormItem label="道路名称" prop="roadName">
          <Input v-model="editItem.roadName" placeholder="请输入道路名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口" clearable/>
        </FormItem>
        <FormItem label="道路类型" prop="roadType">
          <Select v-model="editItem.roadType" placeholder="请选择道路类型" clearable>
            <Option v-for="(value, key, index) in (dictionary.dllx || {})" :key="index" :value="key" :label="value">
              <span>{{value}}</span><span style="float: right;">{{key}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="设备编号" prop="machineCode">
          <Input v-model="editItem.machineCode" placeholder="请输入设备编号, 例如: 3700000001, 3700000002" clearable/>
        </FormItem>
        <FormItem label="点位编号" prop="pointCode">
          <Input v-model="editItem.pointCode" placeholder="请输入点位编号, 例如: 3700000001, 3700000002" clearable/>
        </FormItem>
        <FormItem label="IP地址" prop="ipAddress">
          <Input v-model="editItem.ipAddress" placeholder="请输入IP地址, 例如: 192.168.0.2, 192.168.0.3" clearable/>
        </FormItem>
        <FormItem label="采集方向" prop="shootingDirection">
          <Select v-model="editItem.shootingDirection" placeholder="请选择采集方向" clearable>
            <Option v-for="(value, key, index) in (dictionary.xsfx || {})" :key="index" :value="key" :label="value">
              <span>{{value}}</span><span style="float: right;">{{key}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="偏移角度" prop="offsetAngle">
          <Input v-model="editItem.offsetAngle" placeholder="请输入偏移角度, 例如: 118, 236" clearable/>
        </FormItem>
        <FormItem label="原始经度" prop="wgsLongitude">
          <Input v-model="editItem.wgsLongitude" placeholder="请输入原始经度, 例如: 118.123456789, 118.987654321" clearable/>
        </FormItem>
        <FormItem label="原始纬度" prop="wgsLatitude">
          <Input v-model="editItem.wgsLatitude" placeholder="请输入原始纬度, 例如: 34.123456789, 35.987654321" clearable/>
        </FormItem>
        <FormItem v-if="false" label="火星经度" prop="gcjLongitude">
          <Input v-model="editItem.gcjLongitude" placeholder="请输入火星经度, 例如: 118.123456789, 118.987654321" clearable/>
        </FormItem>
        <FormItem v-if="false" label="火星纬度" prop="gcjLatitude">
          <Input v-model="editItem.gcjLatitude" placeholder="请输入火星纬度, 例如: 34.123456789, 35.987654321" clearable/>
        </FormItem>
        <FormItem label="使用状态" prop="status">
          <Select v-model="editItem.status" placeholder="请选择使用状态" clearable>
            <Option v-for="(value, key, index) in dictionary.syzt" :key="index" :value="parseInt(key)" :label="value">
              <span>{{value}}</span><span style="float: right;">{{parseInt(key)}}</span>
            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="() => (this.$set(this, 'showModal', false))" :loading="modalLoading">
          取消
        </Button>
        <Button type="primary" size="large" @click="submit" :loading="modalLoading">确定</Button>
      </div>
    </Modal>

    <div>
      <createDrawer :options="args"></createDrawer>
    </div>
  </div>
</template>

<script>

  import createDrawer from '../components/connect';

  export default {
    name: 'equ-rd',
    components: {createDrawer: createDrawer},
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: []}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
      setTimeout(this.search(), 500);
    },
    computed: {},
    data() {
      return {
        tableHeight: 0,
        userInfo: {}, // 用户信息
        dictionary: {}, // 字典

        pageInfo: {totalElements: 0, page: 1, size: 100,}, // 展示分页信息
        formItem: {}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 50, align: 'center',},
          // {title: '序号', key: 'id', width: 70, align: 'center',},
          {
            title: '行政区划', key: 'regionCode', minWidth: 120, maxWidth: 150, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.rdxzqh && this.dictionary.rdxzqh[params.row.regionCode] || params.row.regionCode || '无'),
          },
          {
            title: '道路名称', key: 'roadName', minWidth: 150, maxWidth: 200, align: 'center',
            render: (h, params) => this.$createTooltip(h, params, 'right', {
              道路编号: params.row.roadCode || '无',
              道路类型: this.dictionary.dllx && this.dictionary.dllx[params.row.roadType] || params.row.roadType || '无'
            }, params.row.roadName),
          },
          {title: '设备编号', key: 'machineCode', width: 150, align: 'center',},
          {
            title: '点位编号', key: 'pointCode', width: 150, align: 'center', render: (h, params) => {
              return h('Dropdown', {}, [h('div', {}, params.row.pointCode), h('DropdownMenu', {slot: 'list',}, [
                h('DropdownItem', {
                  nativeOn: {
                    click: () => {
                      let devices = JSON.stringify(params.row);
                      let routeData = this.$router.resolve({
                        name: 'app_lpc_10_00_02',
                        query: {devices: devices, _t: new Date()}
                      });
                      window.open(routeData.href, 'name_blank', 'fullscreen=yes,location=no,toolbar=no,menubar=no,scrollbars=no,resizable=no,modal=no,alwaysRaised=no,status=no').focus();
                    },
                  }
                }, '数据预览'),
              ])]);
            }
          },
          {title: 'IP地址', key: 'ipAddress', minWidth: 95, maxWidth: 120, align: 'center',},
          {
            title: '采集方向', key: 'shootingDirection', width: 100, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.xsfx && this.dictionary.xsfx [params.row.shootingDirection] || this.dictionary.xsfx || '无'),
          },
          {title: '偏移角度', key: 'offsetAngle', width: 100, align: 'center',},
          {
            title: '原始经纬度', key: 'wgsLongitude', minWidth: 180, maxWidth: 250, align: 'center',
            render: (h, params) => {
              let slot = [h('p', {}, `火星经度: ${params.row.gcjLongitude}`), h('p', {}, `火星纬度: ${params.row.gcjLatitude}`)];
              let content = `${params.row.wgsLongitude || '0.000000'} / ${params.row.wgsLatitude || '0.000000'}`;
              return h('Tooltip', {
                nativeOn: {
                  click: () => {
                    this.updateSimple(params.row);
                  },
                },
                props: {placement: 'left', maxWidth: '200'}
              }, [h('div', {slot: 'content',}, slot), h('div', {}, content)])

            }
          },
          {title: '最后更新时间', key: 'lastUpdateTime', minWidth: 180, maxWidth: 250, align: 'center',},
          {title: '添加方式', key: 'resource', width: 100, align: 'center',},
          {
            title: '使用状态', key: 'status', width: 100, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.syzt && this.dictionary.syzt[params.row.status] || params.row.status),
          },
          {
            title: '操作', key: 'id', width: 140, align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'info', size: 'small'},
                  on: {click: () => this.update(params.row)}
                }, '修改'),
                h('Button', {
                  props: {type: 'error', size: 'small'},
                  on: {click: () => this.remove([params.row.id])}
                }, '删除')
              ]);
            },
          },
        ], // 展示字段
        content: [], // 数据

        editItem: {}, // 添加或修改内容
        showModal: false, // 显示修改内容的Modal框
        modalLoading: false, // 添加或修改,触发请求时的等待状态
        ruleValidate: {
          regionCode: [{required: true, type: 'string', message: '请选择行政区划!', trigger: 'change'},],
          roadCode: [{
            required: false,
            type: 'string',
            message: '请输入道路编号, 例如: 3700000001, 3700000002!',
            trigger: 'blur'
          },],
          roadName: [{
            required: true,
            type: 'string',
            message: '请输入道路名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口!',
            trigger: 'blur'
          },],
          roadType: [{required: false, type: 'string', message: '请选择道路类型!', trigger: 'change'},],
          machineCode: [{
            required: false,
            type: 'string',
            message: '请输入设备编号, 例如: 3700000001, 3700000002!',
            trigger: 'blur'
          },],
          pointCode: [{
            required: true,
            type: 'string',
            message: '请输入点位编号, 例如: 3700000001, 3700000002!',
            trigger: 'blur'
          },],
          ipAddress: [{
            required: false,
            type: 'string',
            message: '请输入IP地址, 例如: 192.168.0.2, 192.168.0.3!',
            trigger: 'blur'
          },],
          // shootingDirection: [{required: true, trigger: 'change', validator: (rule, value, callback) => !value || isNaN(value) ? callback(new Error('请选择行驶方向!')) : callback()},],
          wgsLongitude: [{
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => !value || isNaN(value) ? callback(new Error('请输入原始经度, 例如: 118.123456789, 118.987654321!')) : callback()
          },],
          wgsLatitude: [{
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => !value || isNaN(value) ? callback(new Error('请输入原始纬度, 例如: 34.123456789, 35.987654321!')) : callback()
          },],
          status: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, callback) => !value || isNaN(value) ? callback(new Error('请选择使用状态!')) : callback()
          },],
        }, // 添加或修改字段校验规则

        editSimpleItem: {}, // 添加或修改内容
        showSimpleModal: false, // 显示修改内容的Modal框
        modalSimpleLoading: false, // 添加或修改,触发请求时的等待状态
        ruleSimpleValidate: {
          gcjLongitude: [{required: true, type: 'string', trigger: 'blur',},],
          gcjLatitude: [{required: true, type: 'string', trigger: 'blur',},],
        }, // 添加或修改字段校验规则

        args: {kakouXhs: [], redianXhs: [], _t: new Date().getTime()},
      };
    },
    methods: {
      setHeight() {
        if(document.getElementsByClassName("clear").length>0){
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight-
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.$set(this, 'tableHeight',height-60);
        }
      },
      queryChange() {
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 400) {
            this.$set(this, 'pageInfo', {totalElements: 0, page: 1, size: 100,});
            this.$set(this, 'content', []);
            this.search();
          }
        }, 401)
      },
      reset() {
        this.$set(this, 'formItem', {})
        this.$set(this, 'pageInfo', {totalElements: 0, page: 1, size: 100,});
        this.search();
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        (this.formItem.regionCode) && (args.regionCode = this.formItem.regionCode);
        (this.formItem.roadType) && (args.roadType = this.formItem.roadType);
        (this.formItem.pointCode) && (args.pointCode = this.formItem.pointCode);
        (this.formItem.roadName) && (args.roadName = this.formItem.roadName);
        args.abnormal = this.formItem.abnormal || false;
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : 0;
        args.size = this.pageInfo.size ? this.pageInfo.size : 100;
        this.$set(this, 'loading', true);

        this.$http.post('/api/com/redian/selectNodes', args).then((response) => {
          if (!!response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this.pageInfo, 'totalElements', response.data.page.totalElements);
              this.$set(this, 'content', response.data.data);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'loading', false);
        }).catch(() => this.$set(this, 'loading', false));
      },
      dblclick(row) {
        if (!row) return;
        let args = {
          kakouXhs: row.relationKakouIds || [],
          redianXhs: row.pointCode && [row.pointCode] || [],
          _t: new Date().getTime()
        };
        this.$set(this, 'args', args);
      },
      insert() {
        this.$refs.ref1558919325000.resetFields();
        this.$set(this, 'editItem', {});
        this.$set(this.editItem, '_type', 'insert');
        this.$set(this, 'showModal', true);
      },
      updateSimple(row) {
        this.$refs.ref1558919005001.resetFields();
        this.$set(this, 'editSimpleItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editSimpleItem, '_type', 'update');
        this.$set(this.editSimpleItem, 'gcjLongitude', `${this.editSimpleItem.gcjLongitude}`);
        this.$set(this.editSimpleItem, 'gcjLatitude', `${this.editSimpleItem.gcjLatitude}`);
        this.$set(this, 'showSimpleModal', true);
      },
      simpleUpdateGCJLongitude() {
        let data = this.editSimpleItem.gcjLongitude;
        if (1 == data.split(',').length) {
          return;
        }
        let [x, y] = data.split(',');
        this.$set(this.editSimpleItem, 'gcjLongitude', x && x.trim() || '');
        this.$set(this.editSimpleItem, 'gcjLatitude', y && y.trim() || '');
      },
      simpleUpdateGCJLatitude() {
        let data = this.editSimpleItem.gcjLatitude;
        if (1 == data.split(',').length) {
          return;
        }
        let [y, x] = data.split(',');
        this.$set(this.editSimpleItem, 'gcjLongitude', x && x.trim() || '');
        this.$set(this.editSimpleItem, 'gcjLatitude', y && y.trim() || '');
      },
      update(row) {
        this.$refs.ref1558919325000.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editItem, '_type', 'update');
        this.$set(this, 'showModal', true);
      },
      updateAll() {
        this.$http.post('/api/com/redian/updateAllNode', {}).then((response) => {
          if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
            this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
            this.search();
          } else {
            this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
          }
        });
      },
      remove(ids) {
        (!ids) && (ids = this.$refs.selection.getSelection().map(n => n.id).join(','));
        if (ids) {
          this.$http.post('/api/com/redian/deleteNodes', {ids: ids}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              let deleteData = (response.data.data || []).map(it => it.id);
              for (let index = this.content.length - 1; index >= 0; index--) {
                if (-1 < deleteData.indexOf(this.content[index].id)) {
                  this.content.splice(index, 1);
                  this.$set(this.pageInfo, 'totalElements', this.pageInfo.totalElements - 1);
                }
              }
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      submitSimple() {
        this.$refs.ref1558919005001.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalSimpleLoading', true);
            this.$http.post('/api/com/redian/' + this.editSimpleItem['_type'] + 'SimpleNode', this.editSimpleItem).then((response) => {
              this.$set(this, 'modalSimpleLoading', false);
              if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {
                let newData = response.data.data;
                for (let index = 0; index < this.content.length; index++) {
                  if (newData.id === this.content[index].id) {
                    this.content.splice(index, 1, newData);
                    break;
                  }
                }
                this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
                this.$set(this, 'showSimpleModal', false);
                return true;
              } else if (!!response && response.status === 200 && (response.data.status & 0b00001111) !== 1) {
                this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
              } else {
                this.$Message.warning({closable: true, duration: 2, content: '请求失败!',});
              }
              return false;
            }).catch(() => {
              this.$set(this, 'modalSimpleLoading', false);
              return false;
            });
          } else {
            return false;
          }
        })
      },
      submit() {
        this.$refs.ref1558919325000.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalLoading', true);
            this.$http.post('/api/com/redian/' + this.editItem['_type'] + 'Node', this.editItem).then((response) => {
              this.$set(this, 'modalLoading', false);
              if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {
                let newData = response.data.data;
                let dealed = false;
                for (let index = 0; index < this.content.length; index++) {
                  if (newData.id === this.content[index].id) {
                    this.content.splice(index, 1, newData);
                    dealed = true;
                    break;
                  }
                }
                if (!dealed) {
                  this.content.splice(0, 0, newData);
                  this.$set(this.pageInfo, 'totalElements', this.pageInfo.totalElements + 1);
                }
                this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
                this.$set(this, 'showModal', false);
                return true;
              } else if (!!response && response.status === 200 && (response.data.status & 0b00001111) !== 1) {
                this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
              } else {
                this.$Message.warning({closable: true, duration: 2, content: '请求失败!',});
              }
              return false;
            }).catch(() => {
              this.$set(this, 'modalLoading', false);
              return false;
            });
          } else {
            return false;
          }
        })
      },
      download() {
        let args = `?_t=${new Date().getTime()}`;
        (this.formItem.regionCode) && (args += `&regionCode=${this.formItem.regionCode}`);
        (this.formItem.roadType) && (args += `&roadType=${this.formItem.roadType}`);
        (this.formItem.pointCode) && (args += `&pointCode=${this.formItem.pointCode}`);
        (this.formItem.roadName) && (args += `&roadName=${this.formItem.roadName}`);
        args += `&abnormal=${this.formItem.abnormal || false}`;
        window.location.href = "/api/com/redian/downloadNodes" + args;
      },
    },
  }
</script>
