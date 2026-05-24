<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="logo-box">
        <h2>灵析智能学伴 </h2>
        <p>多智能体驱动的个性化学习平台</p>
      </div>

      <div class="mode-toggle">
        <span :class="{ active: isLoginMode }" @click="switchMode(true)">账号登录</span>
        <span :class="{ active: !isLoginMode }" @click="switchMode(false)">新用户注册</span>
      </div>

      <el-form 
        v-if="isLoginMode"
        ref="loginFormRef"
        :model="loginForm" 
        :rules="loginRules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账号 (管理台输入 admin)" size="large" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password />
        </el-form-item>
        <el-button type="primary" class="action-btn" size="large" :loading="loading" @click="handleLogin">
          立即登录
        </el-button>
      </el-form>

      <el-form 
        v-else
        ref="registerFormRef"
        :model="registerForm" 
        :rules="registerRules"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="请设置登录账号" size="large" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请设置密码 (不少于6位)" size="large" show-password />
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input v-model="registerForm.rePassword" type="password" placeholder="请再次输入密码" size="large" show-password />
        </el-form-item>
        <el-button type="success" class="action-btn" size="large" :loading="loading" @click="handleRegister">
          提交注册
        </el-button>
      </el-form>
      
      <div class="tips" v-if="isLoginMode">
        <p> 测试快捷通道：</p>
        <p>输入 <strong>admin</strong> / 123456 进入超级管理员</p>
        <p>输入 <strong>student</strong> / 123456 进入普通学生端</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginAPI, registerAPI } from '@/api/user.js'
import { useUserStore } from '@/stores/user' //  引入 Pinia Store
const userStore = useUserStore() //  实例化 Store

const router = useRouter()
const loading = ref(false)
const isLoginMode = ref(true) //  控制是登录还是注册

// 表单 DOM 引用
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 数据绑定
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '', rePassword: '' })

//  自定义校验：二次密码必须一致
const validateRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致，请检查！'))
  } else {
    callback()
  }
}

// 校验规则
const loginRules = {
  username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}

const registerRules = {
  username: [
    { required: true, message: '账号不能为空', trigger: 'blur' },
    { min: 2, message: '账号长度至少为2位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  rePassword: [
    { required: true, validator: validateRePassword, trigger: 'blur' }
  ]
}

// 切换模式
const switchMode = (mode) => {
  isLoginMode.value = mode
  // 切换时清空表单报错痕迹
  if (loginFormRef.value) loginFormRef.value.resetFields()
  if (registerFormRef.value) registerFormRef.value.resetFields()
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const res = await loginAPI(loginForm.value)
      
      // 必须是 200 才能放行进系统
      if (res && res.code === 200) {
        const userData = {
        ...res.data,
        token: res.token
      }
        userStore.login(userData)
      
        ElMessage.success(`欢迎进入多智能体学习中枢，${userData.username}！`)
        router.push(userData.role === 'admin' ? '/admin/dashboard' : '/') 
      }
    } catch (error) {
      console.error('登录流程中断:', error)
    } finally {
      loading.value = false
    }
  })
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      
      // 真实呼叫后端注册接口
      await registerAPI({
        username: registerForm.value.username,
        password: registerForm.value.password
      })
      
      ElMessage.success(' 注册成功！已自动为您切换到登录界面')
      loginForm.value.username = registerForm.value.username
      isLoginMode.value = true 
    } catch (error) {
      console.error('注册失败', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.login-card { width: 400px; border-radius: 12px; padding: 20px 30px; }
.logo-box { text-align: center; margin-bottom: 24px; }
.logo-box h2 { margin: 0 0 6px 0; color: #333; }
.logo-box p { margin: 0; color: #8c8c8c; font-size: 13px; }

/* 切换 Tab 的精美设计 */
.mode-toggle {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}
.mode-toggle span {
  font-size: 15px;
  color: #666;
  cursor: pointer;
  font-weight: 500;
  padding: 0 10px;
  position: relative;
  transition: color 0.2s;
}
.mode-toggle span.active {
  color: #1890ff;
  font-weight: bold;
}
/* 底部蓝色高亮小横条 */
.mode-toggle span.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1890ff;
}

.action-btn { width: 100%; border-radius: 8px; font-weight: bold; margin-top: 10px; }
.tips { margin-top: 24px; background: #f6ffed; border: 1px solid #b7eb8f; padding: 12px; border-radius: 8px; font-size: 13px; color: #52c41a; line-height: 1.5; }
.tips p { margin: 4px 0; }
</style>
