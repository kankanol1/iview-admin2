<template>
  <div>
    <div class="clear" style="padding-bottom: 10px">
      <Row>
        <Col span="6">
          <Select class="interval" size="small" clearable v-model="formItem.officeRegionCode" placeholder="请选择行政区划">
            <Option v-for="(key) in Object.keys(tyxzqh).sort()" :key="key" :value="key" :label="tyxzqh[key]">{{tyxzqh[key]}}
            </Option>
          </Select>
        </Col>
        <Col span="18">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Button ghost @click="insert()" type="success" icon="md-add">添加</Button>
            <Button ghost @click="remove()" type="error" icon="md-close">删除</Button>
            <Button ghost @click="reset()" type="info" icon="ios-refresh">重置</Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>

    <Table
      ref="selection"
      :columns="columns"
      :data="content"
      border
      :loading="loading"
      :maxHeight="tableHeight"
    />
    <Page
      size="small"
      show-total show-elevator show-sizer :current.sync="pageInfo.page"
      :page-size.sync="pageInfo.size"
      :page-size-opts="[10, 20, 50, 100, 200]"
      :total="pageInfo.totalElements"
      @on-change="search"
      @on-page-size-change="(value) => {pageInfo.size = value;search();}"
      style="float: right;padding-top: 6px"
    />


    <Modal v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref1558919005001" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editItem.id" placeholder="序号,自动生成" clearable/>
        </FormItem>
        <FormItem label="行政区划" prop="officeRegionCode">
          <Select clearable v-model="editItem.officeRegionCode" placeholder="请选择行政区划">
            <Option v-for="(key) in Object.keys(tyxzqh).sort()" :key="key" :value="key" :label="tyxzqh[key]">
              {{tyxzqh[key]}}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="科室名称" prop="officeName">
          <Input v-model="editItem.officeName" placeholder="请输入科室名称" clearable/>
        </FormItem>
        <FormItem label="科室描述" prop="officeDescription">
          <Input v-model="editItem.officeDescription" placeholder="请输入科室描述" clearable/>
        </FormItem>
        <FormItem label="科室负责人" prop="officeLeader">
          <Input v-model="editItem.officeLeader" placeholder="请输入科室负责人" clearable/>
        </FormItem>
        <FormItem label="联系方式" prop="officeLeaderTel">
          <Input v-model="editItem.officeLeaderTel" placeholder="请输入联系方式" clearable/>
        </FormItem>
        <FormItem label="隐藏状态" prop="isHidden" v-if="userInfo && userInfo.role && userInfo.role == 'ROLE_DEVELOP'">
          <Select clearable v-model="editItem.isHidden" placeholder="请选择隐藏状态">
            <Option key="false" value="false" label="不隐藏">不隐藏</Option>
            <Option key="true" value="true" label="隐藏">隐藏</Option>
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
  </div>
</template>

<script>
  export default {
    name: 'room-org',
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
      (sessionStorage.getItem('userInfo')) && (this.$set(this, 'userInfo', JSON.parse(sessionStorage.getItem('userInfo'))));
      let zidian = ['tyxzqh',];
      zidian.forEach(node => sessionStorage.getItem(node) && this.$set(this, node, JSON.parse(sessionStorage.getItem(node))));
      if (0 < zidian.filter(node => !sessionStorage.getItem(node)).length) {
        this.$http.post('/api/com/dictionaries/selectNodes', {
          xzqh: this.$regioncode,
          lxmcs: zidian.filter(node => !sessionStorage.getItem(node)).join(',')
        }).then((response) => {
          if (response && response.status === 200 && (response.data.status & 0b00000111) === 0b00000001) {
            zidian.forEach((node) => {
              if (response.data.data[node]) {
                this.$set(this, node, response.data.data[node]);
                sessionStorage.setItem(node, JSON.stringify(response.data.data[node]));
              }
            });
          }
        });
      }
      setTimeout(this.search(), 500);
    },
    data() {
      return {
        userInfo: {},
        tyxzqh: {'加载失败': '加载失败'}, // 行驶方式
        tableHeight:0,
        pageInfo: {totalElements: 0, sizeOfElements: 0, page: 1, size: 20,}, // 展示分页信息
        formItem: {}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {
            title: '行政区划',
            key: 'officeRegionCode',
            align: 'center',
            render: (h, params) => h('div', {}, this.tyxzqh[params.row.officeRegionCode] || params.row.officeRegionCode),
          },
          {title: '科室名称', key: 'officeName', align: 'center',},
          {title: '科室描述', key: 'officeDescription', align: 'center',},
          {title: '科室负责人', key: 'officeLeader', align: 'center',},
          {title: '联系方式', key: 'officeLeaderTel', align: 'center',},
          {
            title: '操作', key: 'id', width: 150, align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'info', size: 'small'},
                  on: {click: () => this.update(params.row)}
                }, '编辑'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'error', size: 'small'},
                  on: {click: () => this.remove(params.row.id)}
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
          officeRegionCode: [{required: true, type: 'string', message: '行政区划不能为空!', trigger: 'blur'}],
          officeName: [{required: true, type: 'string', message: '科室名称不能为空!', trigger: 'blur'}],
          officeDescription: [{required: true, type: 'string', message: '科室描述不能为空!', trigger: 'blur'}],
        }, // 添加或修改字段校验规则
      };
    },
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("ivu-page mini")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.tableHeight = height - 40;
        }
      },
      reset() {
        this.$set(this, 'formItem', {});
        this.$set(this, 'pageInfo', {totalElements: 0, sizeOfElements: 0, page: 1, size: 20,});
        this.search();
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        let args = {};
        (this.formItem.officeRegionCode) && (args.officeRegionCode = this.formItem.officeRegionCode);
        args.page = this.pageInfo.page ? this.pageInfo.page - 1 : this.$pageInfo.page;
        args.size = this.pageInfo.size ? this.pageInfo.size : this.$pageInfo.size;
        this.$set(this, 'loading', true);

        this.$http.post('/api/sys/offices/selectNodes', args).then((response) => {
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
      insert() {
        this.$refs.ref1558919005001.resetFields();
        this.$set(this, 'editItem', {});
        this.$set(this.editItem, '_type', 'insert');
        this.$set(this, 'showModal', true);
      },
      update(row) {
        this.$refs.ref1558919005001.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editItem, '_type', 'update');
        this.$set(this, 'showModal', true);
      },
      remove(ids) {
        (!ids) && (ids = this.$refs.selection.getSelection().map(n => n.id).join(','));
        if (ids) {
          this.$http.post('/api/sys/offices/deleteNodes', {ids: ids}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      submit() {
        this.$refs.ref1558919005001.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalLoading', true);
            this.$http.post('/api/sys/offices/' + this.editItem['_type'] + 'Node', this.editItem).then((response) => {
              this.$set(this, 'modalLoading', false);
              if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {
                this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
                this.$set(this, 'showModal', false);
                this.search();
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
