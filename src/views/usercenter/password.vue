<template lang="pug">
  Form(ref="stepTwo", :model="formItem", :rules="stepTwoValidate")
    FormItem(:label="$lang('旧密码')" prop="oldPassword")
      Input(@on-enter="submit" v-model="formItem.oldPassword", type="password" :placeholder="$lang('旧密码')")
    FormItem(:label="$lang('新密码')" prop="newPassword")
      Input(@on-enter="submit" v-model="formItem.newPassword", type="password" :placeholder="$lang('新密码')")
    FormItem(:label="$lang('确认密码')" prop="confirmedPassword")
      Input(@on-enter="submit" v-model="formItem.confirmedPassword", type="password" :placeholder="$lang('确认密码')")
    FormItem
      Button(type="primary" @click="submit" long :loading="loading") {{$lang('确定')}}
</template>
<script>
import md5 from "md5";
export default {
  data() {
    return {
      loading: false,
      formItem: {
        oldPassword: "",
        newPassword: "",
        confirmedPassword: ""
      },
      stepTwoValidate: {
        oldPassword: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("旧密码"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        newPassword: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("登录密码"));
              } else if (
                value.length < 8 ||
                value.length > 20 ||
                !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)
              ) {
                callback(new Error("密码8-20位字符，必须包含大小写字母和数字"));
              } else {
                if (this.formItem.confirmedPassword !== "") {
                  this.$refs.stepTwo.validateField("confirmedPassword");
                }
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        confirmedPassword: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("确认密码"));
              } else if (value != this.formItem.newPassword) {
                callback(new Error("两次密码输入不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      }
    };
  },

  methods: {
    submit() {
      this.$refs["stepTwo"].validate(valid => {
        if (valid) {
          this.loading = true;
          this.$axios
            .post("/api/v1/user/change_password", {
              oldPassword: md5(this.formItem.oldPassword),
              newPassword: md5(this.formItem.newPassword)
            })
            .then(result => {
              this.loading = false;
              if (result.code === 0) {
                if (result.data.success) {
                  this.$Message.success(this.$lang("成功"));
                  location.reload();
                } else {
                  this.$Message.error(result.msg);
                }
              }
            });
        }
      });
    }
  }
};
</script>