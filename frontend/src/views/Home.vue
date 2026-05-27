<template>
  <div class="home-page">
    <nav class="top-nav">
      <div class="nav-inner">
        <div class="nav-brand">
          <div class="nav-logo"><svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#2d6a4f" stroke-width="2"/><path d="M11 20c0-4 2.5-8 5-8s5 4 5 8" stroke="#2d6a4f" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="21" r="2" fill="#2d6a4f"/></svg></div>
          <span>柴油机润滑系统教学辅助系统</span>
        </div>
        <div class="nav-user">
          <span class="user-name">{{ user?.nickname || '学员' }}</span>
          <button class="logout-btn" @click="logout">退出登录</button>
        </div>
      </div>
    </nav>
    <div class="home-hero">
      <img src="/materials/img/intro_main.jpg" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>柴油机润滑系统</h1>
        <p>教学辅助系统 - 结构展示 / 操作演示 / 知识测试</p>
        <div class="hero-stats" v-if="detail">
          <div class="stat-item"><span class="stat-num">{{ detail.totalSections }}</span><span class="stat-label">学习板块</span></div>
          <div class="stat-item"><span class="stat-num">{{ detail.totalQuizzes }}</span><span class="stat-label">测试题目</span></div>
          <div class="stat-item"><span class="stat-num">{{ detail.correctRate }}%</span><span class="stat-label">正确率</span></div>
          <div class="stat-item"><span class="stat-num">{{ detail.learnedSections }}/{{ detail.totalSections }}</span><span class="stat-label">已学板块</span></div>
        </div>
      </div>
    </div>
    <div class="home-content">
      <div class="charts-row" v-if="detail">
        <div class="chart-card">
          <h3>答题正确率</h3>
          <div class="ring-chart">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e8ece9" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" :stroke="detail.correctRate>=60?'#2d6a4f':'#e53e3e'" stroke-width="10" stroke-linecap="round"
                :stroke-dasharray="(detail.correctRate/100*314)+' 314'" stroke-dashoffset="0" transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1s"/>
            </svg>
            <div class="ring-center">
              <span class="ring-num">{{ detail.correctRate }}</span>
              <span class="ring-unit">%</span>
            </div>
          </div>
          <div class="ring-legend">
            <span><i style="background:#2d6a4f"></i>正确 {{ detail.correctRecords }} 题</span>
            <span><i style="background:#e53e3e"></i>错误 {{ detail.wrongRecords }} 题</span>
          </div>
        </div>
        <div class="chart-card">
          <h3>学习进度</h3>
          <div class="progress-list">
            <div class="progress-item" v-for="s in learnProgress" :key="s.id">
              <div class="prog-label">{{ s.title }}</div>
              <div class="prog-bar-wrap">
                <div class="prog-bar" :style="{ width: Math.min(s.visit_count * 20, 100) + '%' }"></div>
              </div>
              <span class="prog-count">{{ s.visit_count }}次</span>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <h3>答题完成度</h3>
          <div class="completion-chart">
            <div class="comp-row">
              <span class="comp-label">已答题目</span>
              <div class="comp-bar-wrap"><div class="comp-bar" :style="{ width: (detail.answeredQuizzes/detail.totalQuizzes*100)+'%' }"></div></div>
              <span class="comp-val">{{ detail.answeredQuizzes }}/{{ detail.totalQuizzes }}</span>
            </div>
            <div class="comp-row">
              <span class="comp-label">已学板块</span>
              <div class="comp-bar-wrap"><div class="comp-bar bar2" :style="{ width: (detail.learnedSections/detail.totalSections*100)+'%' }"></div></div>
              <span class="comp-val">{{ detail.learnedSections }}/{{ detail.totalSections }}</span>
            </div>
            <div class="comp-row">
              <span class="comp-label">总答题数</span>
              <div class="comp-bar-wrap"><div class="comp-bar bar3" :style="{ width: Math.min(detail.totalRecords/30*100,100)+'%' }"></div></div>
              <span class="comp-val">{{ detail.totalRecords }}次</span>
            </div>
          </div>
        </div>
      </div>
      <div class="menu-grid">
        <div class="menu-card" @click="$router.push('/intro')">
          <div class="card-img"><img src="/materials/img/intro_main.jpg" /></div>
          <div class="card-body"><h3>基本介绍</h3><p>了解柴油机润滑系统的基本概念和核心作用</p></div>
        </div>
        <div class="menu-card" @click="$router.push('/catalog')">
          <div class="card-img"><img src="/materials/img/jiegou_zong.jpg" /></div>
          <div class="card-body"><h3>学习目录</h3><p>五大板块系统学习润滑系统知识</p></div>
        </div>
        <div class="menu-card" @click="$router.push('/quiz')">
          <div class="card-img"><img src="/materials/img/zuoyong_runhua_2.png" /></div>
          <div class="card-body"><h3>知识测试</h3><p>在线测试检验学习成果</p></div>
        </div>
      </div>
    </div>
    <footer class="home-footer"><p>柴油机润滑系统教学辅助系统</p></footer>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api'
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const detail = ref(null)
const learnProgress = ref([])
onMounted(async () => {
  try {
    const [r1, r2] = await Promise.all([api.get('/stats/detail'), api.get('/learn/progress')])
    if (r1.code === 200) detail.value = r1.data
    if (r2.code === 200) learnProgress.value = r2.data
  } catch {}
})
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login') }
</script>
<style scoped>
.home-page { min-height: 100vh; background: var(--bg-main); }
.top-nav { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
.nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.nav-brand { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: var(--primary); }
.nav-logo { width: 32px; height: 32px; }
.nav-logo svg { width: 100%; height: 100%; }
.nav-user { display: flex; align-items: center; gap: 16px; }
.user-name { font-size: 14px; color: var(--text-secondary); }
.logout-btn { padding: 6px 16px; font-size: 13px; color: var(--text-muted); background: var(--bg-main); border-radius: 6px; transition: all 0.2s; }
.logout-btn:hover { color: #e53e3e; background: #fff5f5; }
.home-hero { position: relative; height: 300px; overflow: hidden; }
.hero-bg { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(27,67,50,0.85), rgba(45,106,79,0.65)); }
.hero-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
.hero-content h1 { font-size: 34px; font-weight: 700; letter-spacing: 4px; margin-bottom: 8px; }
.hero-content p { font-size: 15px; opacity: 0.85; letter-spacing: 2px; margin-bottom: 28px; }
.hero-stats { display: flex; gap: 40px; }
.stat-item { text-align: center; }
.stat-num { display: block; font-size: 26px; font-weight: 700; }
.stat-label { font-size: 12px; opacity: 0.75; margin-top: 2px; }
.home-content { max-width: 1200px; margin: -30px auto 0; padding: 0 32px; position: relative; z-index: 10; }
.charts-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px; }
.chart-card { background: #fff; border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }
.chart-card h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
.ring-chart { position: relative; width: 120px; height: 120px; margin: 0 auto; }
.ring-chart svg { width: 100%; height: 100%; }
.ring-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }
.ring-num { font-size: 28px; font-weight: 700; color: var(--text-primary); }
.ring-unit { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
.ring-legend { display: flex; justify-content: center; gap: 20px; margin-top: 12px; font-size: 12px; color: var(--text-secondary); }
.ring-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.progress-list { display: flex; flex-direction: column; gap: 14px; }
.progress-item { display: flex; align-items: center; gap: 10px; }
.prog-label { font-size: 13px; color: var(--text-secondary); width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
.prog-bar-wrap { flex: 1; height: 8px; background: #f0f4f1; border-radius: 4px; overflow: hidden; }
.prog-bar { height: 100%; background: linear-gradient(90deg, #2d6a4f, #52b788); border-radius: 4px; transition: width 0.8s; min-width: 2px; }
.prog-count { font-size: 12px; color: var(--text-muted); width: 36px; text-align: right; flex-shrink: 0; }
.completion-chart { display: flex; flex-direction: column; gap: 18px; padding-top: 4px; }
.comp-row { display: flex; align-items: center; gap: 10px; }
.comp-label { font-size: 13px; color: var(--text-secondary); width: 70px; flex-shrink: 0; }
.comp-bar-wrap { flex: 1; height: 10px; background: #f0f4f1; border-radius: 5px; overflow: hidden; }
.comp-bar { height: 100%; background: var(--primary); border-radius: 5px; transition: width 0.8s; }
.comp-bar.bar2 { background: var(--primary-lighter); }
.comp-bar.bar3 { background: var(--accent); }
.comp-val { font-size: 12px; color: var(--text-muted); width: 50px; text-align: right; flex-shrink: 0; }
.menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.menu-card { background: #fff; border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-md); }
.menu-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }
.card-img { height: 180px; overflow: hidden; }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.menu-card:hover .card-img img { transform: scale(1.05); }
.card-body { padding: 20px 24px; }
.card-body h3 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.card-body p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
.home-footer { text-align: center; padding: 40px; margin-top: 40px; color: var(--text-muted); font-size: 13px; }
</style>
