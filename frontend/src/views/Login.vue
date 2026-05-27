<template>
  <div class="login-page">
    <div class="login-bg">
      <img src="/materials/img/runhua_2.png" alt="" class="bg-img" />
      <div class="bg-overlay"></div>
    </div>
    <div class="login-container">
      <div class="login-left">
        <div class="brand-info">
          <div class="brand-icon">
            <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#fff" stroke-width="2"/><path d="M16 28c0-6 4-12 8-12s8 6 8 12" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="30" r="3" fill="#fff"/><path d="M12 20h24M12 24h24" stroke="#fff" stroke-width="1" opacity="0.4"/></svg>
          </div>
          <h1>柴油机润滑系统</h1>
          <p class="brand-subtitle">教学辅助系统</p>
          <div class="brand-desc">
            <div class="desc-item"><span class="dot"></span>结构展示与操作演示</div>
            <div class="desc-item"><span class="dot"></span>交互式自主学习</div>
            <div class="desc-item"><span class="dot"></span>在线知识测试</div>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-wrap">
          <h2>欢迎登录</h2>
          <p class="form-tip">请输入您的账号和密码开始学习</p>
          <div class="form-group">
            <label>账号</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none"><path d="M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3 17.5c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <input v-model="form.username" type="text" placeholder="请输入账号" @keyup.enter="handleLogin" />
            </div>
          </div>
          <div class="form-group">
            <label>密码</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="13" r="1.5" fill="currentColor"/></svg>
              <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
            </div>
          </div>
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          <button class="login-btn" :class="{ loading }" @click="handleLogin" :disabled="loading">
            <span v-if="!loading">登 录</span>
            <span v-else>登录中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api'

const router = useRouter()
const form = ref({ username: '', password: '' })
const errorMsg = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入账号和密码'
    return
  }
  loading.value = true
  try {
    const res = await api.post('/login', form.value)
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/home')
    } else {
      errorMsg.value = res.message || '登录失败'
    }
  } catch (e) {
    errorMsg.value = '网络错误，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.login-bg { position: fixed; inset: 0; z-index: 0; }
.bg-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }
.bg-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(45,106,79,0.5) 0%, rgba(26,26,46,0.6) 100%); }
.login-container {
  position: relative; z-index: 1;
  display: flex; width: 900px; min-height: 520px;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border-radius: var(--radius-xl); overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.login-left {
  flex: 1; background: linear-gradient(160deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%);
  display: flex; align-items: center; justify-content: center; padding: 48px;
}
.brand-info { color: #fff; text-align: center; }
.brand-icon { width: 64px; height: 64px; margin: 0 auto 20px; }
.brand-icon svg { width: 100%; height: 100%; }
.brand-info h1 { font-size: 26px; font-weight: 700; letter-spacing: 2px; margin-bottom: 4px; }
.brand-subtitle { font-size: 15px; opacity: 0.8; margin-bottom: 36px; letter-spacing: 4px; }
.brand-desc { text-align: left; }
.desc-item { display: flex; align-items: center; gap: 10px; font-size: 14px; opacity: 0.85; margin-bottom: 12px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #52b788; flex-shrink: 0; }
.login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px; }
.login-form-wrap { width: 100%; max-width: 320px; }
.login-form-wrap h2 { font-size: 24px; color: var(--text-primary); margin-bottom: 6px; font-weight: 600; }
.form-tip { font-size: 13px; color: var(--text-muted); margin-bottom: 32px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500; }
.input-wrap {
  display: flex; align-items: center; gap: 10px;
  background: #f7faf8; border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 0 14px; transition: all 0.2s;
}
.input-wrap:focus-within { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }
.input-icon { width: 18px; height: 18px; color: var(--text-muted); flex-shrink: 0; }
.input-wrap input { flex: 1; border: none; background: none; padding: 12px 0; font-size: 14px; color: var(--text-primary); }
.input-wrap input::placeholder { color: var(--text-muted); }
.error-msg { font-size: 13px; color: #e53e3e; margin-bottom: 16px; padding: 8px 12px; background: #fff5f5; border-radius: var(--radius-sm); }
.login-btn {
  width: 100%; padding: 13px; font-size: 15px; font-weight: 600;
  color: #fff; background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
  border-radius: var(--radius-sm); margin-top: 8px;
  transition: all 0.25s; letter-spacing: 4px;
}
.login-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,106,79,0.3); }
.login-btn:active { transform: translateY(0); }
.login-btn.loading { opacity: 0.7; pointer-events: none; }
</style>
