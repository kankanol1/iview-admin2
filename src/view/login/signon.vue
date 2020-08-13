<template>
  <div style="width: 100%; height: 100%; position: relative;">
    <div :style="{backgroundImage: 'url(' + backgroup + ')', backgroundSize: '100%, 100%',
    width: '100%', height: '100%', zIndex: -99999999, position: 'absolute', top: '0px', left: '0px',
    filter: 'grayscale(0.8) blur(1px) opacity(0.15)' }"></div>
    <div style="position: absolute; top: 20pt; left: 20pt;">
      <p><span>当前系统时间:</span><span style="margin-left: 20pt;" id="time"></span></p>
      <p><span>当前系统时间戳:</span><span style="margin-left: 10pt;" id="timestamp"></span></p>
    </div>
    <div style="width: 100%; height: calc(100% - 30px); display: flex; justify-content: center; align-items: center;">
      <div style="width: 400px;">
        <img src="../../assets/logo.jpg" height="154" width="409"/>
        <div style="height: 10pt;"></div>
        <Form ref="formInline" :model="userinfo" :rules="ruleInline">
          <FormItem prop="username">
            <Input id="username" type="text" v-model="userinfo.username" placeholder="登录名称" @on-keydown.enter="jump('password')">
            <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="password">
            <Input id="password" type="password" v-model="userinfo.password" placeholder="登录口令" @on-keydown.enter="submit('formInline')">
            <Icon type="ios-lock-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Button id="submit" type="primary" @click="submit('formInline')" style="width: 100%;" :loading="loading" @on-keydown.enter="submit('formInline')">登录</Button>
          </FormItem>
        </Form>
      </div>
    </div>
    <div style="width: 100%; height: 20pt;">
      <div style="display: flex; align-items: center; lign-content: center; justify-items: center; justify-content: center;">
        浏览器下载:
        <a href="/software/49.0.2623.112_x86_chrome_installer.exe">
          <span style="font-size: 9pt;color:#a52a2a;">Windows XP X86,&nbsp;&nbsp;</span>
        </a>
        <a href="/software/74.0.3729.108_x86_chrome_installer.exe">
          <span style="font-size: 9pt;color:#a52a2a;">Windows 7/10 X86,&nbsp;&nbsp;</span>
        </a>
        <a href="/software/75.0.3759.4_x64_chrome_installer.exe">
          <span style="font-size: 9pt;color:#a52a2a;">Windows 7/10 X64,&nbsp;&nbsp;</span>
        </a>
        <a href="/software/74.0.3729.108_x64_chrome_installer.dmg">
          <span style="font-size: 9pt;color:#a52a2a;">Mac X64</span>;
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import backgroup from '@/assets/backgroup.jpeg';
  export default {
    name: "signin",
    data() {
      return {
        backgroup: backgroup,
        userinfo: {},
        ruleInline: {
          username: [
            {required: true, message: '请正确填写您的登录名称!', trigger: 'blur'},
            {type: 'string', min: 3, message: '请正确填写您的登录名称,最小长度为3位有效字符!', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请正确填写您的登录密码!', trigger: 'blur'},
            {type: 'string', min: 3, message: '请正确填写您的登录密码,最小长度为3位有效字符!', trigger: 'blur'}
          ]
        },
        loading: false,
      };
    },
    mounted() {
      this.getTime();
    },
    methods: {
      jump(id) {
        document.getElementById(id).getElementsByTagName('input')[0].focus();
      },
      getTime() {
        setTimeout(() => {
          if ('app_signon' === this.$router.currentRoute.name) { // 只在登陆页有效
            this.$http.post('/api/system/common/timestamp', {}).then((response) => {
              if (response && response.status === 200 && ((response.data.status & 0b00000111) === 1)) {
                (document.getElementById('time')) && (document.getElementById('time').innerText = response.data.data.time);
                (document.getElementById('timestamp')) && (document.getElementById('timestamp').innerText = response.data.data.timestamp);
                if ('app_signon' === this.$router.currentRoute.name) {
                  this.getTime();
                }
              }
            });
          }
        }, 1000);
      },
      submit(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let CryptoJS = require('crypto-js');
            // base64 加密
            let username = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${new Date().format('yyyyMMddHHmm')}${this.userinfo.username}`));
            let password = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${new Date().format('yyyyMMddHHmm')}${this.userinfo.password}`));
            for (let i = 0; i < 10; i++) {
              username = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${username}`));
              password = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`X${i}${password}`));
            }

            this.$set(this, 'loading', true);
            this.$http.post('/api/self/logon', {username: username, password: password,}).then((response) => {

              this.$set(this, 'loading', false);

              if (response && response.status === 200) {
                if ((response.data.status & 0b00000111) === 1) { // 登录成功

                  this.$set(this, 'loading', true);
                  this.$http.post('/api/self/infomation').then((response) => {

                    this.$set(this, 'loading', false);

                    if (response && response.status === 200) {
                      if ((response.data.status & 0b00000111) === 1) { // 登录成功
                        sessionStorage.setItem('userInfo', JSON.stringify(response.data.data));
                        this.$router.push({name: 'root'});
                      } else {
                        this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                      }
                    }

                  }).catch(() => this.$set(this, 'loading', false));

                } else {
                  this.$Message.warning({closable: true, duration: 2, content: response.data.msg,});
                }
              }

            }).catch(() => this.$set(this, 'loading', false));
          }
        })
      }
    },
  }
</script>

