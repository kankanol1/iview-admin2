<template>
  <div>
    <div class="clear" style="padding-bottom: 10px">
      <ButtonGroup size="small" style="padding-left:10px;">
        <Button @click="search()" type="dashed" icon="ios-search">搜索</Button>
        <Button @click="insert()" type="dashed" icon="md-add">添加</Button>
        <Button @click="remove()" type="dashed" icon="md-close">删除</Button>
      </ButtonGroup>
    </div>

    <Table ref="selection" :columns="columns" :data="content" border :loading="loading" :max-height="tableHeight"/>

    <Modal v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref11560835865191" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="id">
          <Input disabled v-model="editItem.id" placeholder="序号,自动生成"/>
        </FormItem>
        <FormItem label="后台地址" prop="url">
          <Input v-model="editItem.url" placeholder="请输入后台地址" clearable/>
        </FormItem>
        <FormItem label="前台地址" prop="fnurl">
          <Input v-model="editItem.fnurl" placeholder="请输入前台地址" clearable/>
        </FormItem>
        <FormItem label="显示内容" prop="desc">
          <Input v-model="editItem.desc" placeholder="请输入显示内容" clearable/>
        </FormItem>
        <FormItem label="筛选" prop="filter">
          <Select clearable v-model="editItem.filter" placeholder="请选择筛选状态">
            <Option key="false" value="false" label="不筛选">不筛选</Option>
            <Option key="true" value="true" label="筛选">筛选</Option>
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
          {title: '后台地址', key: 'url', align: 'center',},
          {title: '前台地址', key: 'fnurl', align: 'center',},
          {title: '显示内容', key: 'desc', align: 'center',},
          {title: '筛选', key: 'filter', width: 60, align: 'center',},
          {
            title: '操作', key: 'id', width: 150, align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'dashed', size: 'small',},
                  on: {click: () => this.clone(params.row.id)}
                }, '克隆'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'dashed', size: 'small',},
                  on: {click: () => this.update(params.row)}
                }, '修改'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'dashed', size: 'small',},
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
          url: [{required: true, message: '后台地址不能为空', trigger: 'blur'}],
          fnurl: [{required: true, message: '前台地址不能为空', trigger: 'blur'}],
          desc: [{required: true, message: '显示内容不能为空', trigger: 'blur'}],
          filter: [{required: true, message: '筛选内容不能为空', trigger: 'blur'}],
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
        this.$http.post('/api/sys/urls/selectNodes', {page: 0, size: 999999}).then((response) => {
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
          this.$http.post('/api/sys/urls/cloneNode', {id: id}).then((response) => {
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
        this.$set(this.editItem, 'filter', this.editItem.filter + '');
        this.$set(this, 'showModal', true);
      },
      remove(ids) {
        (!ids) && (ids = this.$refs.selection.getSelection().map(n => n.id).join(','));
        if (ids) {
          this.$http.post('/api/sys/urls/deleteNodes', {ids: ids}).then((response) => {
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
            this.$http.post('/api/sys/urls/' + this.editItem['_type'] + 'Node', this.editItem).then((response) => {
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
