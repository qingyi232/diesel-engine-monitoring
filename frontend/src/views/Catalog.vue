<template>
  <div class="catalog-page">
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="back-btn" @click="$router.push('/home')"><svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 返回首页</button>
        <span class="nav-title">学习目录</span>
        <div style="width:100px"></div>
      </div>
    </nav>
    <div class="catalog-header">
      <h1>学习目录</h1>
      <p>选择您想要学习的内容板块，深入了解柴油机润滑系统</p>
    </div>
    <div class="catalog-grid">
      <div class="section-card" v-for="(s, i) in sections" :key="s.id" @click="$router.push('/section/' + s.id)">
        <div class="card-num">{{ String(i + 1).padStart(2, '0') }}</div>
        <div class="card-cover"><img :src="sectionImages[i]" :alt="s.title" /></div>
        <div class="card-info">
          <h3>{{ s.title }}</h3>
          <p>{{ s.description }}</p>
          <span class="card-link">开始学习 →</span>
        </div>
      </div>
    </div>
    <div v-if="!sections.length" class="loading-state">加载中...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
const sections = ref([])
const sectionImages = [
  '/materials/img/zuoyong_runhua_1.png',
  '/materials/img/jiegou_zong.jpg',
  '/materials/img/youlu_zhu.jpg',
  '/materials/img/intro_main.jpg',
  '/materials/img/intro_main.jpg'
]
onMounted(async () => {
  try { const res = await api.get('/sections'); if (res.code === 200) sections.value = res.data } catch {}
})
</script>
<style scoped>
.catalog-page { min-height: 100vh; background: var(--bg-main); }
.top-nav { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
.nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 14px; color: var(--text-secondary); background: none; transition: color 0.2s; }
.back-btn:hover { color: var(--primary); }
.nav-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.catalog-header { text-align: center; padding: 48px 24px 36px; }
.catalog-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.catalog-header p { font-size: 14px; color: var(--text-muted); }
.catalog-grid { max-width: 1100px; margin: 0 auto; padding: 0 32px 60px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.catalog-grid .section-card:nth-child(4), .catalog-grid .section-card:nth-child(5) { grid-column: span 1; }
.section-card { background: #fff; border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; position: relative; }
.section-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.card-num { position: absolute; top: 16px; left: 16px; z-index: 2; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); color: var(--primary); font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.card-cover { height: 200px; overflow: hidden; }
.card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.section-card:hover .card-cover img { transform: scale(1.05); }
.card-info { padding: 24px; flex: 1; display: flex; flex-direction: column; }
.card-info h3 { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.card-info p { font-size: 13px; color: var(--text-muted); line-height: 1.7; flex: 1; }
.card-link { display: inline-block; margin-top: 16px; font-size: 13px; color: var(--primary); font-weight: 600; }
.loading-state { text-align: center; padding: 120px; color: var(--text-muted); }
</style>
