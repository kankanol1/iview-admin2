<template>
  <div style="width: 100%;height: 100%;">
    <div style="height: 0pt"></div>
    <div class="clear" style="width: 100%;height: var(--searchBar);">
      <Form ref="ref_formItem" :model="formItem" :rules="formItem_rules" inline>
        <FormItem prop="cplx">
          <Select class="interval" size="small" v-model="formItem.cplx" placeholder="请选择车牌类型" @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.cplx || {})" :key="key" :value="key" :label="value">{{value}}
            </Option>
          </Select>
        </FormItem>
        <FormItem prop="cphms">
          <Input class="interval" size="small" clearable v-model="formItem.cphms" placeholder="请输入车牌号码,多号码半角逗号间隔"
                 @on-change="queryChange"/>
        </FormItem>
        <FormItem prop="imsis">
          <Input class="interval" size="small" clearable v-model="formItem.imsis" placeholder="请输入IMSI,多号码半角逗号间隔"
                 @on-change="queryChange"/>
        </FormItem>
        <FormItem prop="datetimerange">
          <DatePicker class="interval" size="small" type="datetimerange" v-model="formItem.datetimerange"
                      placeholder="请选择时间范围" style="width: 300px" @on-change="queryChange"/>
        </FormItem>
        <FormItem>
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
            <Button ghost @click="insert()" type="primary" icon="ios-search">添加</Button>
          </ButtonGroup>
        </FormItem>
      </Form>
    </div>
    <div style="height: 5pt"></div>
    <div style="width:100%; height: 100%;">
      <div ref="ref_1561451427535" style="width: 100%; height: calc(100% - 32px); overflow-y: auto;">
        <Table ref="selection" highlight-row :columns="columns" :data="content" border :loading="loading"
               :height="tableHeight"></Table>
      </div>
      <div style="height: 32px;">
        <Page size="small" show-total :page-size-opts="[10,20,50,100,500]"
              :current.sync="pageInfo.page" :page-size.sync="pageInfo.size"
              :total="pageInfo.totalElements" @on-change="search"
              @on-page-size-change="(value) => {pageInfo.size = value;search();}"
              style="float: right;margin: 0px"/>
      </div>
    </div>
    <div>
      <Modal :styles="{top: '30px'}" v-model="editModal.show" title="添加任务" width="900">
        <Form ref="ref1567494011584" :model="editModal.editItem" :rules="editModal.ruleValidate" :label-width="120">
          <FormItem label="描述信息" prop="msxx">
            <Input v-model="editModal.editItem.msxx" placeholder="描述信息" clearable/>
          </FormItem>
          <FormItem label="车牌类型" prop="cplx">
            <Select v-model="editModal.editItem.cplx" placeholder="请选择车牌类型">
              <Option v-for="(value, key) in (dictionary.cplx || {})" :key="key" :value="key" :label="value">{{value}}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="车牌号码" prop="cphms">
            <Input v-model="editModal.editItem.cphms" placeholder="请输入车牌号码,多号码半角逗号间隔" clearable/>
          </FormItem>
          <FormItem label="手机串号" prop="imsis">
            <Input v-model="editModal.editItem.imsis" placeholder="请输入IMSI,多号码半角逗号间隔" clearable/>
          </FormItem>
          <FormItem label="计算时差(毫秒)" prop="range">
            <Input v-model="editModal.editItem.range" placeholder="请输入计算时差(毫秒)" clearable/>
          </FormItem>
          <FormItem label="查询时间范围" prop="datetimerange">
            <DatePicker style="width: 100%;" type="datetimerange" v-model="editModal.editItem.datetimerange"
                        placeholder="请选择时间范围"/>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="() => (this.$set(this.editModal, 'show', false))"
                  :loading="editModal.loading">取消
          </Button>
          <Button type="primary" size="large" @click="submit" :loading="editModal.loading">确定</Button>
        </div>
      </Modal>
    </div>
    <div>
      <createDrawer :options="createDrawerOptions"></createDrawer>
      <glMap :options="glMapOptions" @on-ok="search()"></glMap>
    </div>
    <div>

    </div>
  </div>
</template>

<script>
  import createDrawer from '../components/connect';
  import glMap from './components/work-list-con';

  export default {
    name: 'work-list-old',
    components: {createDrawer: createDrawer, glMap: glMap},
    watch: {},
    mounted() {
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      this.$http.post('/api/com/dictionaries/selectNodes', {xzqh: this.$regioncode, lxmcs: ['cplx']}).then((response) => {
        if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
          this.$set(this, 'dictionary', response.data.data);
        }
      });
    },
    computed: {
      tableHeight: function () {
        return this.$refs['ref_1561451427535'] ? this.$refs['ref_1561451427535'].offsetHeight - 32 : 0;
      }
    },
    data() {
      return {
        userInfo: {},
        dictionary: {},

        formItem: {imsis: '', cplx: '2', cphms: '', datetimerange: []}, // 展示请求参数
        formItem_rules: {},
        pageInfo: JSON.parse(JSON.stringify(this.$pageInfo)), // 展示分页信息
        loading: false, // 数据加载动作
        columns: [
          {title: '描述信息', key: 'msxx', minWidth: 100, maxWidth: 120, align: 'center',},
          {
            title: '车牌类型', key: 'cplx', minWidth: 100, maxWidth: 150, align: 'center',
            render: (h, params) => h('div', {}, this.dictionary.cplx && this.dictionary.cplx[params.row.cplx] || params.row.cplx),
          },
          {
            title: '车牌号码', key: 'cphms', width: 80, align: 'center',
            render: (h, params) => h('div', {}, (params.row.cphms || '').split(',').map(__ => h('p', {}, __))),
          },
          {
            title: '手机串号', key: 'imsis', width: 120, align: 'center',
            render: (h, params) => h('div', {}, (params.row.imsis || '').split(',').map(__ => h('p', {}, __))),
          },
          {
            title: '关联信息', key: 'correlations', minWidth: 150, align: 'center',
            render: (h, params) => h('div', {}, [...(params.row.correlationsDisplay || '').split(',').map(__ => {
              return h('p', {}, [h('span', {on: {click: () => this.searchDw(params.row.correlations)}}, __),]);
            }), h('a', {on: {click: () => this.updateGlMap(params.row.id, params.row.correlations)},}, '修改或添加'),]),
          },
          {title: '计算时差(毫秒)', key: 'range', width: 100, align: 'center',},
          {
            title: '时间范围', minWidth: 120, maxWidth: 130, align: 'center',
            render: (h, params) => h('div', {}, [h('p', {}, `${new Date(params.row.starttime).format('yyyy-MM-dd HH:mm:ss')}`), h('p', {}, `${new Date(params.row.endtime).format('yyyy-MM-dd HH:mm:ss')}`)]
            ),
          },
          {title: '执行进度', key: 'progress', minWidth: 60, maxWidth: 80, align: 'center',},
          {title: '执行状态', key: 'statusmc', minWidth: 80, maxWidth: 100, align: 'center',},
          {
            title: '操作', key: 'id', minWidth: 100, maxWidth: 140, align: 'center',
            render: (h, params) => {
              return h(
                'div', {},
                [
                  h('Button', {
                    style: {marginRight: '5px'}, domProps: {zIndex: 10000, title: '表格展示',},
                    props: {type: 'dashed', shape: "circle", size: 'small', icon: "md-list"},
                    on: {click: () => this.showTable(params.row.id, params.row)}
                  }),
                  h('Button', {
                    style: {marginRight: '5px'}, domProps: {zIndex: 10000, title: '地图展示',},
                    props: {type: 'dashed', shape: "circle", size: 'small', icon: "md-pin"},
                    on: {click: () => this.showMap(params.row.id, params.row)}
                  }),
                  h('Button', {
                    style: {marginRight: '5px'}, domProps: {zIndex: 10000, title: '重新计算',},
                    props: {type: 'dashed', shape: "circle", size: 'small', icon: "md-refresh"},
                    on: {click: () => this.resubmit(params.row.id)}
                  }),
                  h('Button', {
                    style: {marginRight: '5px'}, domProps: {zIndex: 10000, title: '释放任务',},
                    props: {type: 'dashed', shape: "circle", size: 'small', icon: "md-close"},
                    on: {click: () => this.delete(params.row.id)}
                  })
                ]
              );
            }
          }
        ], // 展示字段
        content: [], // 数据

        editModal: {
          editItem: {},
          ruleValidate: {
            msxx: [{required: true, type: 'string', message: '请输入任务描述信息!', trigger: 'change',}],
            cplx: [{required: true, type: 'string', message: '请选择车牌类型!', trigger: 'change'}],
            cphms: [{
              required: true, type: 'string', trigger: 'blur',
              validator: (rule, value, callback) => {
                return (!this.editModal.editItem.cphms && !this.editModal.editItem.imsis) ? callback(new Error('请输入车牌号码,多号码半角逗号间隔!')) : callback();
              },
            }],
            imsis: [{
              required: true, type: 'string', trigger: 'blur',
              validator: (rule, value, callback) => {
                return (!this.editModal.editItem.cphms && !this.editModal.editItem.imsis) ? callback(new Error('请输入IMSI,多号码半角逗号间隔!')) : callback();
              },
            }],
            range: [{required: true, message: '请输入计算时差(毫秒)!', trigger: 'change',}],
            datetimerange: [{
              required: true, type: 'date', trigger: 'change',
              validator: (rule, value, callback) => {
                return (value && 2 == value.length && value[0] && value[1]) ? callback() : callback(new Error('请选择时间范围!'));
              },
            }],
          },
          show: false,
          loading: false,
        },

        createDrawerOptions: {},
        glMapOptions: {},
      }
    },
    methods: {
      reset() {
        this.$set(this, 'formItem', {imsis: '', cplx: '2', cphms: '', datetimerange: []});
      },
      queryChange() {
        this.$set(this, 'content', []);
      },
      /**
       * 通过任务ID, 使用表格方式展示结果内容.
       * @param id 任务ID
       * @param row 记录详情
       */
      showTable(id, row) {
        if ('success' === row.status) {
          this.$router.push({path: '03', query: row});
        } else {
          this.$Message.warning({closable: true, duration: 1, content: '当前状态不可查阅!',});
        }
      },
      /**
       * 通过任务ID, 使用地图方式展示结果内容.
       * @param id 任务ID
       * @param row 记录详情
       */
      showMap(id, row) {
        if ('success' === row.status) {
          this.$router.push({path: '03', query: row});
        } else {
          this.$Message.warning({closable: true, duration: 1, content: '当前状态不可查阅!',});
        }
      },
      /**
       * 加载任务列表.
       */
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        args.cplx = this.formItem.cplx || '2';
        (this.formItem.cphms) && (args.cphms = this.formItem.cphms);
        (this.formItem.imsis) && (args.imsis = this.formItem.imsis);
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : 0;
        args.size = this.pageInfo.size ? this.pageInfo.size : 10;
        if (this.formItem.datetimerange && this.formItem.datetimerange[0] && this.formItem.datetimerange[1]) {
          [args.starttime, args.endtime] = [this.formItem.datetimerange[0].getTime(), this.formItem.datetimerange[1].getTime()];
        }
        this.$set(this, 'loading', true);
        this.$http.post('/api/com/task/simple/selectNodes', args).then((response) => {
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
      /**
       * 查询点位信息.
       * @param _correlations 关联信息,卡口->热点,卡口->热点,卡口->热点,......
       */
      searchDw(_correlations) {
        let correlations = (_correlations || '').split(',').map(__ => __.split('->')) /*[[卡口, 热点],[卡口, 热点],......]*/
          .filter(__ => 2 === __.length).map(__ => [__[0].split(','), __[1].split(',')]);
        this.$set(this, 'createDrawerOptions', {correlations: correlations, _t: new Date().getTime()});
      },
      /**
       * 重新启动任务.
       * ids 主键ID.
       */
      resubmit(id) {
        if (!id) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择重新计算内容.',});
          return;
        }
        this.$http.post('/api/com/task/simple/resubmitNode', {id: id}).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 1) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
        });
      },
      /**
       * 释放任务.
       * @param ids 主键ID, 多组逗号间隔.
       */
      delete(ids) {
        if (!ids) {
          this.$Message.warning({closable: true, duration: 2, content: '请选择待释放内容.',});
          return;
        }
        this.$http.post('/api/com/task/simple/deleteNodes', {ids: ids}).then((response) => {
          if (response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 1) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
        });
      },
      /** 触发添加按钮 */
      insert() {
        this.$refs.ref1567494011584.resetFields();
        this.$set(this.editModal, 'editItem', {});
        this.$set(this.editModal.editItem, '_type', 'insert');
        this.$set(this.editModal, 'loading', false);
        this.$set(this.editModal, 'show', true);
      },
      /** 触发修改或添加关联信息 */
      updateGlMap(id, correlations) {
        let args = {id: id, correlations: (correlations + '').split(','), _t: new Date().getTime(), showModal: true};
        this.$set(this, 'glMapOptions', args);
      },
      /** 提交任务 */
      submit() {
        this.$refs.ref1567494011584.validate((valid) => {
          if (valid) {
            if (this.editModal.editItem.cphms && this.editModal.editItem.cphms.split(',').filter(__ => 7 > __.length || 9 < __.length).length) {
              this.$Message.warning({closable: true, duration: 2, content: '请核实车牌号码信息.',});
              return;
            }
            if (this.editModal.editItem.imsis && this.editModal.editItem.imsis.split(',').filter(__ => 14 != __.length && 15 != __.length).length) {
              this.$Message.warning({closable: true, duration: 2, content: '请核实手机串号信息.',});
              return;
            }
            this.$set(this.editModal, 'loading', true);
            this.editModal.editItem.starttime = this.editModal.editItem.datetimerange[0].getTime();
            this.editModal.editItem.endtime = this.editModal.editItem.datetimerange[1].getTime();
            if (this.editModal.editItem.endtime - this.editModal.editItem.starttime > 270 * 86400000) {
              this.$Message.warning({closable: true, duration: 2, content: '时间范围过大,支持270天上限,请选择合适的时间范围.',});
              return;
            }
            this.$http.post('/api/com/task/simple/' + this.editModal.editItem['_type'] + 'Node', this.editModal.editItem).then((response) => {
              this.$set(this.editModal, 'loading', false);
              if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {
                this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
                this.$set(this.editModal, 'show', false);
                this.search();
                return true;
              } else if (!!response && response.status === 200 && (response.data.status & 0b00001111) !== 1) {
                this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
              } else {
                this.$Message.warning({closable: true, duration: 2, content: '请求失败!',});
              }
              return false;
            }).catch(() => {
              this.$set(this.editModal, 'loading', false);
              return false;
            });
          } else {
            return false;
          }
        })
      },
    },
  }
</script>

<style scoped></style>
