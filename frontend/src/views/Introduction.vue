<template>
  <div class="intro-page">
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="back-btn" @click="$router.push('/home')"><svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M13 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 返回首页</button>
        <span class="nav-title">基本介绍</span>
        <div style="width:100px"></div>
      </div>
    </nav>
    <div class="intro-hero">
      <img src="/materials/img/intro_main.jpg" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-text">
        <h1>{{ intro?.title || '柴油机润滑系统' }}</h1>
        <p>基本介绍</p>
      </div>
    </div>
    <div class="intro-content" v-if="intro">
      <div class="content-card">
        <div class="section-badge">概述</div>
        <h2>系统简介</h2>
        <p class="intro-text">{{ intro.content }}</p>
        <div class="intro-diagram">
          <img src="/materials/img/intro_main.jpg" alt="机润滑系统示意图" />
          <span class="img-caption">机润滑系统示意图</span>
        </div>
      </div>
      <div class="content-card video-card">
        <div class="section-badge">视频</div>
        <h2>视频讲解</h2>
        <div class="video-wrap">
          <video controls>
            <source src="/materials/video/intro_video.mp4" type="video/mp4">
          </video>
        </div>
      </div>
      <div class="content-card">
        <div class="section-badge">要点</div>
        <h2>核心要点</h2>
        <div class="key-points">
          <div class="point-item" v-for="(item, i) in keyPoints" :key="i">
            <div class="point-num">{{ i + 1 }}</div>
            <div><h4>{{ item.title }}</h4><p>{{ item.desc }}</p></div>
          </div>
        </div>
      </div>
      <div class="action-bar">
        <button class="btn-primary" @click="$router.push('/catalog')">开始学习 →</button>
      </div>
    </div>
    <div v-else class="loading-state">加载中...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
const intro = ref(null)
const keyPoints = [
  { title: '机油泵', desc: '润滑系统的动力源，负责加压输送润滑油' },
  { title: '机油滤清器', desc: '过滤机油中的杂质，保持润滑油清洁' },
  { title: '机油冷却器', desc: '冷却循环中的润滑油，防止油温过高' },
  { title: '油底壳', desc: '储存润滑油的容器，位于发动机下部' },
  { title: '油路系统', desc: '连接各润滑部位的通道，确保供油畅通' },
]
onMounted(async () => {
  try { const res = await api.get('/introduction'); if (res.code === 200) intro.value = res.data } catch {}
})
</script>
<style scoped>
.intro-page { min-height: 100vh; background: var(--bg-main); }
.top-nav { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
.nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 14px; color: var(--text-secondary); background: none; transition: color 0.2s; }
.back-btn:hover { color: var(--primary); }
.nav-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.intro-hero { position: relative; height: 260px; overflow: hidden; }
.hero-bg { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(27,67,50,0.8), rgba(45,106,79,0.6)); }
.hero-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
.hero-text h1 { font-size: 32px; font-weight: 700; letter-spacing: 3px; }
.hero-text p { font-size: 15px; opacity: 0.8; margin-top: 8px; letter-spacing: 2px; }
.intro-content { max-width: 900px; margin: -30px auto 0; padding: 0 24px 60px; position: relative; z-index: 10; }
.content-card { background: #fff; border-radius: var(--radius-lg); padding: 32px 36px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
.section-badge { display: inline-block; padding: 3px 12px; background: var(--primary-bg); color: var(--primary); font-size: 12px; font-weight: 600; border-radius: 20px; margin-bottom: 12px; }
.content-card h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
.intro-text { font-size: 15px; line-height: 2; color: var(--text-secondary); text-indent: 2em; }
.intro-diagram { margin-top: 24px; text-align: center; }
.intro-diagram img { max-width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.img-caption { display: block; font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.video-wrap { border-radius: var(--radius-md); overflow: hidden; background: #000; }
.video-wrap video { width: 100%; display: block; }
.key-points { display: flex; flex-direction: column; gap: 16px; }
.point-item { display: flex; gap: 16px; align-items: flex-start; padding: 16px; background: var(--primary-bg-light); border-radius: var(--radius-sm); }
.point-num { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.point-item h4 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.point-item p { font-size: 13px; color: var(--text-secondary); }
.action-bar { text-align: center; margin-top: 16px; }
.btn-primary { padding: 12px 40px; font-size: 15px; font-weight: 600; color: #fff; background: var(--primary); border-radius: var(--radius-sm); transition: all 0.2s; letter-spacing: 2px; }
.btn-primary:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(45,106,79,0.25); }
.loading-state { text-align: center; padding: 120px; color: var(--text-muted); font-size: 15px; }
</style>
