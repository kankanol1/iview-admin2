
<style lang="less">
  .title-margin {
    margin-bottom: 10px;
  }
</style>
<template>
  <div style="width: 100%;height: 100%;">
    <div class="clear" style="padding-bottom: 0" >
      <Row>
        <Col  :md="4" :lg="3" class="title-margin">
          <Select class="interval" size="small" clearable v-model="formItem.kkxzqh" placeholder="请选择卡口行政区划" @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.kkxzqh || {})" :key="key" :value="key" :label="value">{{value}}</Option>
          </Select>
        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Input class="interval" size="small" v-model="formItem.kakouRoadName"
                 placeholder="卡口路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口"
                 @on-change="queryChange" clearable/>
        </Col>

        <Col :md="4" :lg="3" class="title-margin">
          <Input class="interval" size="small" clearable v-model="formItem.kakouPointCodes" placeholder="请输入精确卡口编号" @on-change="queryChange"/>

        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Select class="interval" size="small" clearable v-model="formItem.rdxzqh" placeholder="请选择热点行政区划" @on-change="queryChange">
            <Option v-for="(value, key) in (dictionary.rdxzqh || {})" :key="key" :value="key" :label="value">{{value}}</Option>
          </Select>
        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Input class="interval" size="small" v-model="formItem.redianRoadName"
                 placeholder="热点路口名称, 例如: 北纬一路与东经三路路口, 北纬一路与东经四路路口"
                 @on-change="queryChange" clearable/>

        </Col>
        <Col :md="4" :lg="3" class="title-margin">
          <Input class="interval" size="small" clearable v-model="formItem.redianPointCodes" placeholder="请输入精确热点编号" @on-change="queryChange"/>

        </Col>
        <Col :md="24" :lg="6" class="title-margin">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search" title="搜索"></Button>
            <Button ghost @click="insert()" type="primary" icon="md-add" title="添加"></Button>
            <Button ghost @click="remove()" type="primary" icon="md-close" title="删除"></Button>
            <Button ghost @click="reset()" type="primary" icon="ios-refresh" title="重置"></Button>
            <Button ghost v-if="userInfo && userInfo.role && userInfo.role === 'ROLE_DEVELOP'" @click="updateAll()" type="primary" icon="ios-calculator-outline" title="重新计算"></Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
    <div >
      <div ref="ref_1562396677465" style="width: 100%; height: calc(100% - 32px); overflow-y: auto;">
        <Table ref="selection" :columns="columns" :data="content" border :loading="loading" :height="tableHeight"></Table>
      </div>
      <div style="height: 32px;">
        <Page size="small" show-total show-elevator show-sizer :page-size-opts="[100,200,300,500]"
              :current.sync="pageInfo.page" :page-size.sync="pageInfo.size"
              :total="pageInfo.totalElements" @on-change="search"
              @on-page-size-change="(value) => {pageInfo.size = value;search();}"
              style="float: right;margin-top: 5px"/>
      </div>
    </div>

    <Modal v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref1558919005000" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editItem.id" placeholder="序号,自动生成" clearable/>
        </FormItem>
        <FormItem label="热点位置" prop="redianPointCodes">
          <Select multiple v-model="editItem.redianPointCodes" placeholder="请选择热点位置" clearable filterable remote :remote-method="selectRedianDevices">
            <Option v-for="(value, index) in redianDevices" :key="index" :value="value.pointCode" :label="value.roadName">
              <span>{{value.roadName}}</span><span style="float: right;">{{value.pointCode}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="卡口位置" prop="kakouPointCodes">
          <Select multiple v-model="editItem.kakouPointCodes" placeholder="请选择卡口位置" clearable filterable remote :remote-method="selectKakouDevices">
            <Option v-for="(value, index) in kakouDevices" :key="index" :value="value.pointCode" :label="value.roadName">
              <span>{{value.roadName}}</span><span style="float: right;">{{value.pointCode}}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="使用状态" prop="used">
          <Select v-model="editItem.used" placeholder="请选择使用状态" clearable>
            <Option value="false" label="弃用">弃用</Option>
            <Option value="true" label="启用">启用</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="() => (this.$set(this, 'showModal', false))" :loading="modalLoading">取消</Button>
        <Button type="primary" size="large" @click="submit" :loading="modalLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  export default {
    name: 'equ-com-table',
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

        kakouDevices: {}, // 卡口编号
        redianDevices: {}, // 热点编号

        pageInfo: {totalElements: 0, page: 1, size: 100,}, // 展示分页信息
        formItem: {}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          // {title: '序号', key: 'id', width: 70, align: 'center',},
          {
            title: '热点信息', key: 'redianDevice', align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              编号: params.row.redianDevice.pointCode || '无',
              名称: params.row.redianDevice.roadName || '无',
              经度: params.row.redianDevice.wgsLongitude || '',
              纬度: params.row.redianDevice.wgsLatitude || '',
              最后更新时间: params.row.redianDevice.lastUpdateTime || '',
            }, params.row.redianDevice.roadName || params.row.redianDevice.pointCode),
          },
          {
            title: '卡口信息', key: 'kakouDevice', align: 'center',
            render: (h, params) => this.$createTooltip(h, params, params.index < this.pageInfo.sizeOfElements / 2 ? 'bottom' : 'top', {
              编号: params.row.kakouDevice.pointCode || '无',
              名称: params.row.kakouDevice.roadName || '无',
              经度: params.row.kakouDevice.wgsLongitude || '',
              纬度: params.row.kakouDevice.wgsLatitude || '',
              最后更新时间: params.row.kakouDevice.lastUpdateTime || '',
            }, params.row.kakouDevice.roadName || params.row.kakouDevice.pointCode),
          },
          {title: '距离(厘米)', key: 'distance', width: 150, align: 'center',},
          {title: '使用状态', key: 'used', width: 150, align: 'center', render: (h, params) => h('div', {}, params.row.used ? '使用' : '弃用'),},
          {
            title: '操作', key: 'id', width: 150, align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {props: {type: 'error', size: 'small'}, on: {click: () => this.remove([params.row.id])}}, '删除')
              ]);
            },
          },
        ], // 展示字段
        content: [], // 数据

        editItem: {}, // 添加或修改内容
        showModal: false, // 显示修改内容的Modal框
        modalLoading: false, // 添加或修改,触发请求时的等待状态
        ruleValidate: {
          redianPointCodes: [{
            required: true,
            message: '热点点位不能为空!',
            trigger: 'change',
            validator: (rule, value, callback) => value && value.length ? callback() : callback(new Error('热点点位不能为空!'))
          }],
          kakouPointCodes: [{
            required: true,
            message: '卡口点位不能为空!',
            trigger: 'change',
            validator: (rule, value, callback) => value && value.length ? callback() : callback(new Error('卡口点位不能为空!'))
          }],
          used: [{required: true, type: 'string', message: '使用状态不能为空!', trigger: 'change'}],
        }, // 添加或修改字段校验规则
      };
    },
    methods: {
      setHeight(){
        if(document.getElementsByClassName("clear").length>0){
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight-
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.$set(this, 'tableHeight',height-60);
        }
      },
      queryChange() {
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 1000) {
            this.$set(this, 'pageInfo', {totalElements: 0, page: 1, size: 100,});
            this.$set(this, 'content', []);
            this.search();
          }
        }, 1000)
      },
      reset() {
        this.$set(this, 'formItem', {})
        this.$set(this, 'pageInfo', {totalElements: 0, page: 1, size: 100,});
        this.search();
      },
      selectKakouDevices(query) {
        if (!query) {
          this.$set(this, 'kakouDevices', []);
          return;
        }
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 500) {
            this.$http.post('/api/com/kakou/selectNodes', {roadName: query, page: 0, size: 99999}).then((response) => {
              if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
                this.$set(this, 'kakouDevices', response.data.data || []);
              }
            });
          }
        }, 501)
      },
      selectRedianDevices(query) {
        if (!query) {
          this.$set(this, 'redianDevices', []);
          return;
        }
        this.formItem.queryLastUpdate = new Date().getTime();
        setTimeout(() => {
          if (new Date().getTime() - this.formItem.queryLastUpdate >= 500) {
            this.$http.post('/api/com/redian/selectNodes', {roadName: query, page: 0, size: 99999}).then((response) => {
              if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
                this.$set(this, 'redianDevices', response.data.data || []);
              }
            });
          }
        }, 501)
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : 0;
        args.size = this.pageInfo.size ? this.pageInfo.size : 100;
        (this.formItem.kkxzqh) && (args.kkxzqh = this.formItem.kkxzqh);
        (this.formItem.kakouRoadName) && (args.kakouRoadName = this.formItem.kakouRoadName);
        (this.formItem.kakouPointCodes) && (args.kakouPointCodes = this.formItem.kakouPointCodes);
        (this.formItem.rdxzqh) && (args.rdxzqh = this.formItem.rdxzqh);
        (this.formItem.redianRoadName) && (args.redianRoadName = this.formItem.redianRoadName);
        (this.formItem.redianPointCodes) && (args.redianPointCodes = this.formItem.redianPointCodes);
        this.$set(this, 'loading', true);
        this.$http.post('/api/com/rediankakougl/selectNodes', args).then((response) => {
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
      insert() {
        this.$refs.ref1558919005000.resetFields();
        this.$set(this, 'editItem', {});
        this.$set(this.editItem, '_type', 'insert');
        this.$set(this, 'showModal', true);
      },
      update(row) {
        this.$refs.ref1558919005000.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editItem, '_type', 'update');
        this.$set(this, 'showModal', true);
      },
      updateAll() {
        this.$http.post('/api/com/rediankakougl/updateAllNode', {}).then((response) => {
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
          this.$http.post('/api/com/rediankakougl/deleteNodes', {ids: ids}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              let deleteData = (response.data.data || []).map(it => it.id);
              for (let index = this.content.length - 1; index >= 0 ; index--) {
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
      submit() {
        this.$refs.ref1558919005000.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalLoading', true);
            let args = {};
            args.kakouPointCodes = this.editItem.kakouPointCodes.join(',');
            args.redianPointCodes = this.editItem.redianPointCodes.join(',');
            args.used = this.editItem.used;
            this.$http.post('/api/com/rediankakougl/' + this.editItem['_type'] + 'Node', args).then((response) => {
              this.$set(this, 'modalLoading', false);
              if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {

                let newDatas = response.data.data || [];
                newDatas.forEach(newData => {
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
                });

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
    },
  }
</script>

<style scoped>
</style>
