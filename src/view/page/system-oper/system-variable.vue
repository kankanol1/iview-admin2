<template>
  <div>
    <div class="clear" style="padding-bottom: 10px">
      <ButtonGroup size="small" style="padding-left:10px;">
        <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
        <Button ghost @click="insert()" type="success" icon="md-add">添加</Button>
        <Button ghost @click="remove()" type="error" icon="md-close">删除</Button>
      </ButtonGroup>
    </div>
    <Table ref="selection" :columns="columns" :data="content" border :loading="loading" :max-height="tableHeight"/>
    <Modal v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref11560835865191" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editItem.id" placeholder="序号,自动生成" clearable/>
        </FormItem>
        <FormItem label="变量名称" prop="type">
          <Input v-model="editItem.type" placeholder="请输入变量类型" clearable/>
        </FormItem>
        <FormItem label="变量名称" prop="key">
          <Input v-model="editItem.key" placeholder="请输入变量名称" clearable/>
        </FormItem>
        <FormItem label="变量描述" prop="description">
          <Input v-model="editItem.description" placeholder="请输入变量描述" clearable/>
        </FormItem>
        <FormItem label="默认值" prop="defaultValue">
          <Input v-model="editItem.defaultValue" placeholder="请输入默认值" clearable/>
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
    name: 'xxx',
    mounted() {
      this.setHeight();
      window.onresize = () => this.setHeight();
      this.search();
    },
    data() {
      return {
        tableHeight: 0,
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '序号', key: 'id', width: 70, align: 'center',},
          {title: '变量类型', key: 'type', width: 100, align: 'left',},
          {title: '变量名称', key: 'key', align: 'left',},
          {title: '描述信息', key: 'description', align: 'left',},
          {title: '默认值', key: 'defaultValue', align: 'left',},
          {
            title: '添加时间', key: 'addTimestamp', align: 'left',
            render: (h, params) => h('div', {}, new Date(params.row.addTimestamp).format('yyyy-MM-dd HH:mm:ss.SSS')),
          },
          {
            title: '操作', key: 'id', align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  on: {click: () => this.clone(params.row.id)}
                }, '克隆'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'info', size: 'small'},
                  on: {click: () => this.update(params.row)}
                }, '修改'),
                h('Button', {
                  props: {type: 'error', size: 'small'},
                  on: {click: () => this.remove(params.row.id)}
                }, '删除'),
              ]);
            },
          },
        ], // 展示字段
        content: [], // 数据

        editItem: {}, // 添加或修改内容
        showModal: false, // 显示修改内容的Modal框
        modalLoading: false, // 添加或修改,触发请求时的等待状态
        ruleValidate: {
          type: [{required: true, message: '变量类型不能为空', trigger: 'blur'}],
          key: [{required: true, message: '变量名称不能为空', trigger: 'blur'}],
          description: [{required: true, message: '变量描述不能为空', trigger: 'blur'}],
          defaultValue: [{required: true, message: '变量默认值不能为空', trigger: 'blur'}],
        }, // 添加或修改字段校验规则
      };
    },
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
    methods: {
      setHeight() {
        if (document.getElementsByClassName("clear").length > 0) {
          const height = document.getElementsByClassName("content-wrapper")[0].offsetHeight -
            document.getElementsByClassName("clear")[0].offsetHeight;
          this.tableHeight = height - 40;
        }
      },
      search() {
        this.$set(this, 'content', []); // 清空数据
        this.$http.post('/api/sys/variables/selectNodes', {}).then((response) => {
          if (!!response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              this.$set(this, 'content', response.data.data);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'loading', false);
        }).catch(() => this.$set(this, 'loading', false));
      },
      insert() {
        this.$refs.ref11560835865191.resetFields();
        this.$set(this, 'editItem', {});
        this.$set(this.editItem, '_type', 'insert');
        this.$set(this, 'showModal', true);
      },
      clone(id) {
        if (id) {
          this.$http.post('/api/sys/variables/cloneNode', {id: id}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.search();
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      update(row) {
        this.$refs.ref11560835865191.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this.editItem, '_type', 'update');
        this.$set(this, 'showModal', true);
      },
      remove(ids) {
        (!ids) && (ids = this.$refs.selection.getSelection().map(n => n.id).join(','));
        if (ids) {
          this.$http.post('/api/sys/variables/deleteNodes', {ids: ids}).then((response) => {
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
        this.$refs.ref11560835865191.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalLoading', true);
            this.$http.post('/api/sys/variables/' + this.editItem['_type'] + 'Node', this.editItem).then((response) => {
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

<style scoped></style>
