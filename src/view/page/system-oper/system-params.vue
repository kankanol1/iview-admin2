<template>
  <div style="width: 100%;height: 100%;">
    <div class="clear" style="padding-bottom: 10px">
      <Row>
        <Col span="6">
          <Select class="interval" size="small" clearable v-model="formItem.env" placeholder="请选择环境类型">
            <Option v-for="(value) in envs" :key="value" :value="value" :label="value">{{value}}</Option>
          </Select>
        </Col>
        <Col span="18">
          <ButtonGroup size="small" style="padding-left:10px;">
            <Button ghost @click="search()" type="primary" icon="ios-search">搜索</Button>
            <Poptip v-model="poptipVisible" size="small" title="请输入环境名称:">
              <div slot="content">
                <Input v-model="newEnv" placeholder="请输入环境名称" style="width: 300px; margin-right: 5pt;"/>
                <Button size="small" ghost type="success" @click="insert()">添加</Button>
              </div>
              <Button size="small" ghost type="success" icon="md-add">添加</Button>
            </Poptip>
            <Button ghost @click="remove()" type="error" icon="md-close">删除</Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
    <Table ref="selection" :columns="columns" :data="content" border :loading="loading" :max-height="tableHeight"/>
    <Modal v-model="showModal" title="信息维护" width="700px">
      <Form ref="ref1561616978165" :model="editItem" :rules="ruleValidate" :label-width="120">
        <FormItem label="序号" prop="xh">
          <Input disabled v-model="editItem.xh" placeholder="序号,自动生成" clearable/>
        </FormItem>
        <FormItem label="变量名称" prop="key">
          <Input v-model="editItem.key" placeholder="请输入变量名称" disabled/>
        </FormItem>
        <FormItem label="变量描述" prop="description">
          <Input v-model="editItem.description" placeholder="请输入变量描述" disabled/>
        </FormItem>
        <FormItem label="变量取值" prop="value">
          <Input v-model="editItem.value" placeholder="请输入变量取值" clearable/>
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
      this.$http.post('/api/sys/arguments/dictionaryForEnv', {}).then((response) => {
        if (!!response && response.status === 200 && (response.data.status & 0b00001111) === 1) {
          (response.data.data) && (this.$set(this, 'envs', response.data.data));
          this.$set(this.formItem, 'env', (this.envs && this.envs.length) ? this.envs [0] : '');
        }
      });
    },
    data() {
      return {
        // 历史环境集合.
        envs: [],
        // 添加新环境时, 用于临时保存新环境名称.
        newEnv: '',
        // Poptip 显示状态
        poptipVisible: false,
        tableHeight: 0,
        formItem: {}, // 展示请求参数
        loading: false, // 数据加载动作
        columns: [
          {type: 'selection', width: 60, align: 'center',},
          {title: '序号', key: 'id', width: 70, align: 'center',},
          {title: '运行环境', key: 'environment', width: 100, align: 'left',},
          {
            title: '变量名称',
            key: 'variable',
            align: 'left',
            render: (h, params) => h('div', {}, params.row.variable.key),
          },
          {
            title: '描述信息',
            key: 'variable',
            align: 'left',
            render: (h, params) => h('div', {}, params.row.variable.description),
          },
          {title: '变量取值', key: 'value', align: 'left',},
          {
            title: '添加时间', key: 'addTimestamp', align: 'left',
            render: (h, params) => h('div', {}, (params.row.addTimestamp) ? new Date(params.row.addTimestamp).format('yyyy-MM-dd HH:mm:ss.SSS') : ''),
          },
          {
            title: '操作', key: 'id', width: 100, align: 'center',
            render: (h, params) => {
              return h('div', [h('Button', {
                props: {type: 'info', size: 'small',},
                on: {click: () => this.update(params.row)}
              }, '修改'),]);
            },
          },
        ], // 展示字段
        content: [], // 数据

        editItem: {}, // 添加或修改内容
        showModal: false, // 显示修改内容的Modal框
        modalLoading: false, // 添加或修改,触发请求时的等待状态
        ruleValidate: {}, // 添加或修改字段校验规则
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
        this.$http.post('/api/sys/arguments/selectNodes', this.formItem).then((response) => {
          if (!!response && response.status === 200) {
            if ((response.data.status & 0b00001111) === 0b00000001) {
              response.data.data.forEach(node => node.environment = node.environment || this.formItem.env);
              this.$set(this, 'content', response.data.data);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          }
          this.$set(this, 'loading', false);
        }).catch(() => this.$set(this, 'loading', false));
      },
      insert() {
        if (this.newEnv) {
          if (this.envs.indexOf(this.newEnv) > -1) {
            this.$Message.warning({closable: true, duration: 2, content: '运行环境已存在!',});
            return;
          }
          this.$http.post('/api/sys/arguments/createEnv', {env: this.newEnv}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.envs.push(this.newEnv);
              this.$set(this, 'newEnv', '');
              this.$set(this, 'poptipVisible', false);
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        } else {
          this.$Message.warning({closable: true, duration: 2, content: '请输入正确环境名称!',});
        }
      },
      update(row) {
        this.$refs.ref1561616978165.resetFields();
        this.$set(this, 'editItem', JSON.parse(JSON.stringify(row)));
        this.$set(this, 'showModal', true);
      },
      remove() {
        if (this.formItem.env) {
          this.$http.post('/api/sys/arguments/releaseEnv', {env: this.formItem.env}).then((response) => {
            if (response && response.status && (response.data.status & 0b00000111) === 0b00000001) {
              this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
              this.$set(this, 'envs', this.envs.filter(node => node !== this.formItem.env));
            } else {
              this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
            }
          });
        }
      },
      submit() {
        this.$refs.ref1561616978165.validate((valid) => {
          if (valid) {
            this.$set(this, 'modalLoading', true);
            this.$http.post('/api/sys/arguments/updateNode', this.editItem).then((response) => {
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
