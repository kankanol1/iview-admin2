<template>
  <div>
    <Card title="密码修改" style="max-width: 400pt;margin: 20pt auto;">
      <Form ref="ref_1561995094408" :model="formItem" :rules="ruleValidate" :label-width="80">
        <FormItem label="旧密码" prop="password">
          <Row>
            <Col span="20">
              <Input v-model="formItem.password" placeholder="旧密码" type="password"/>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="新密码" prop="newPassword">
          <Row>
            <Col span="20">
              <Input v-model="formItem.newPassword" placeholder="密码" type="password"/>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="密码确认" prop="repeatPassword">
          <Row>
            <Col span="20">
              <Input v-model="formItem.repeatPassword" placeholder="密码确认" type="password"/>
            </Col>
          </Row>
        </FormItem>
        <FormItem label="验证码" prop="verificationCode">
          <Row>
            <Col span="20">
              <Input v-model="formItem.verificationCode" placeholder="密码确认" type="text" style="width: 200px;"/>
              <img id="verificationCodeId" width="80px" height="30px" style="margin-left: 20px;vertical-align: bottom;"
                   src="/api/sys/image/verification/code/getResetImage?t=1577687017494" v-on:click="reflushVerification()"/>
            </Col>
          </Row>
        </FormItem>
        <FormItem>
          <Row>
            <Col span="20">
              <Button type="primary" long @click="submit">提交</Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>
<script>

  export default {
    name:'pwd-change',
    components: {},
    data() {
      return {
        formItem: {password: '', newPassword: '', repeatPassword: '',},
        ruleValidate: {
          password: [
            {required: true, message: '旧密码不能为空', trigger: 'blur'},
          ],
          newPassword: [
            {required: true, message: '新密码不能为空', trigger: 'blur'}
          ],
          repeatPassword: [
            {required: true, message: '密码确认不能为空', trigger: 'blur'},
            {
              required: true, trigger: 'blur',
              validator: (rule, value, callback) => this.formItem.newPassword === this.formItem.repeatPassword ? callback() : callback(new Error('两次输入密码不一致!')),
            }
          ],
          verificationCode: [
            {required: true, message: '验证码不能为空', trigger: 'blur'},
          ],
        },
        loading: false,
      }
    },
    mounted() {
    },
    methods: {
      reflushVerification() {
        let url = '/api/sys/image/verification/code/getResetImage';
        document.getElementById('verificationCodeId').setAttribute('src', url + '?t=' + new Date().getTime());
      },
      submit() {
        this.$set(this, 'loading', true);
        let CryptoJS = require('crypto-js');
        // base64 加密
        let time = new Date().format('yyyyMMddHHmm');
        let p1_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${time}${this.formItem.password}`));
        let p2_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${time}${this.formItem.newPassword}`));
        let verificationCode = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${time}${this.formItem.verificationCode}`));
        for (let i = 0; i < 10; i++) {
          p1_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${p1_base64}`));
          p2_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`Y${i}${p2_base64}`));
          verificationCode = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`Y${i}${verificationCode}`));
        }
        this.$refs['ref_1561995094408'].validate((valid) => {
          if (valid && !!this.formItem) {
            this.$http.post("/api/self/resetPassword", {password: p1_base64, newPassword: p2_base64, verificationCode: verificationCode}).then((response) => {
              if (!!response && response.status === 200) {
                if ((response.data.status & 0b00001111) === 1) {
                  this.$Message.success({closable: true, duration: 2, content: response.data.msg,});
                  this.$refs.ref_1561995094408.resetFields();
                  sessionStorage.clear();
                  this.$router.push({name: 'root'});
                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                  this.reflushVerification();
                }
              }
              this.$set(this, 'loading', false);
            }).catch((error) => this.$set(this, 'loading', false));
          }
        });
      },
    }
  }
</script>
<style></style>
