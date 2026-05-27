const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { getDB, saveDB } = require('./database');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const JWT_SECRET = 'diesel-lubrication-system-2026';

app.use(cors());
app.use(express.json());

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: 401, message: '未登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ code: 401, message: '登录已过期' });
  }
}

// 登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDB();
  const result = db.exec(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.json({ code: 400, message: '账号或密码错误' });
  }
  const row = result[0].values[0];
  const cols = result[0].columns;
  const user = {};
  cols.forEach((col, i) => { user[col] = row[i]; });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    code: 200,
    message: '登录成功',
    data: { token, user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role } }
  });
});

// 获取当前用户信息
app.get('/api/user/info', authMiddleware, async (req, res) => {
  const db = await getDB();
  const result = db.exec(`SELECT id, username, nickname, role FROM users WHERE id = ${req.user.id}`);
  if (result.length === 0) return res.json({ code: 404, message: '用户不存在' });
  const row = result[0].values[0];
  const cols = result[0].columns;
  const user = {};
  cols.forEach((col, i) => { user[col] = row[i]; });
  res.json({ code: 200, data: user });
});

// 获取基本介绍
app.get('/api/introduction', async (req, res) => {
  const db = await getDB();
  const result = db.exec('SELECT * FROM introduction LIMIT 1');
  if (result.length === 0) return res.json({ code: 200, data: null });
  const row = result[0].values[0];
  const cols = result[0].columns;
  const intro = {};
  cols.forEach((col, i) => { intro[col] = row[i]; });
  res.json({ code: 200, data: intro });
});

// 获取所有板块
app.get('/api/sections', async (req, res) => {
  const db = await getDB();
  const result = db.exec('SELECT * FROM sections ORDER BY sort_order');
  if (result.length === 0) return res.json({ code: 200, data: [] });
  const cols = result[0].columns;
  const sections = result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
  res.json({ code: 200, data: sections });
});

// 获取单个板块详情
app.get('/api/sections/:id', async (req, res) => {
  const db = await getDB();
  const sectionResult = db.exec(`SELECT * FROM sections WHERE id = ${req.params.id}`);
  if (sectionResult.length === 0) return res.json({ code: 404, message: '板块不存在' });

  const sCols = sectionResult[0].columns;
  const section = {};
  sCols.forEach((col, i) => { section[col] = sectionResult[0].values[0][i]; });

  const contentResult = db.exec(`SELECT * FROM contents WHERE section_id = ${req.params.id} ORDER BY sort_order`);
  const contents = [];
  if (contentResult.length > 0) {
    const cCols = contentResult[0].columns;
    for (const row of contentResult[0].values) {
      const content = {};
      cCols.forEach((col, i) => { content[col] = row[i]; });

      const subResult = db.exec(`SELECT * FROM sub_items WHERE content_id = ${content.id} ORDER BY sort_order`);
      content.sub_items = [];
      if (subResult.length > 0) {
        const subCols = subResult[0].columns;
        content.sub_items = subResult[0].values.map(subRow => {
          const sub = {};
          subCols.forEach((col, i) => { sub[col] = subRow[i]; });
          return sub;
        });
      }
      contents.push(content);
    }
  }
  section.contents = contents;
  res.json({ code: 200, data: section });
});

// 获取测试题列表
app.get('/api/quizzes', async (req, res) => {
  const db = await getDB();
  const result = db.exec('SELECT * FROM quizzes ORDER BY sort_order');
  if (result.length === 0) return res.json({ code: 200, data: [] });
  const cols = result[0].columns;
  const quizzes = result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
  res.json({ code: 200, data: quizzes });
});

// 提交答题记录
app.post('/api/quiz/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body;
  const db = await getDB();
  let correctCount = 0;
  const results = [];

  for (const answer of answers) {
    const quizResult = db.exec(`SELECT * FROM quizzes WHERE id = ${answer.quiz_id}`);
    if (quizResult.length === 0) continue;
    const cols = quizResult[0].columns;
    const quiz = {};
    cols.forEach((col, i) => { quiz[col] = quizResult[0].values[0][i]; });

    const isCorrect = answer.user_answer === quiz.correct_answer ? 1 : 0;
    if (isCorrect) correctCount++;

    db.run(`INSERT INTO quiz_records (user_id, quiz_id, user_answer, is_correct) VALUES (?, ?, ?, ?)`,
      [req.user.id, answer.quiz_id, answer.user_answer, isCorrect]);

    results.push({
      quiz_id: answer.quiz_id,
      user_answer: answer.user_answer,
      correct_answer: quiz.correct_answer,
      is_correct: !!isCorrect,
      explanation: quiz.explanation
    });
  }

  saveDB();
  res.json({
    code: 200,
    data: {
      total: answers.length,
      correct: correctCount,
      score: Math.round((correctCount / answers.length) * 100),
      results
    }
  });
});

// 获取答题历史
app.get('/api/quiz/history', authMiddleware, async (req, res) => {
  const db = await getDB();
  const result = db.exec(`
    SELECT qr.*, q.question, q.correct_answer, q.explanation
    FROM quiz_records qr
    JOIN quizzes q ON qr.quiz_id = q.id
    WHERE qr.user_id = ${req.user.id}
    ORDER BY qr.created_at DESC
  `);
  if (result.length === 0) return res.json({ code: 200, data: [] });
  const cols = result[0].columns;
  const records = result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
  res.json({ code: 200, data: records });
});

// 获取学习统计
app.get('/api/stats', authMiddleware, async (req, res) => {
  const db = await getDB();
  const totalQuizResult = db.exec('SELECT COUNT(*) as count FROM quizzes');
  const totalQuizzes = totalQuizResult[0].values[0][0];

  const answeredResult = db.exec(`SELECT COUNT(DISTINCT quiz_id) as count FROM quiz_records WHERE user_id = ${req.user.id}`);
  const answeredQuizzes = answeredResult[0].values[0][0];

  const correctResult = db.exec(`SELECT COUNT(*) as count FROM quiz_records WHERE user_id = ${req.user.id} AND is_correct = 1`);
  const correctCount = correctResult[0].values[0][0];

  const totalAnswered = db.exec(`SELECT COUNT(*) as count FROM quiz_records WHERE user_id = ${req.user.id}`);
  const totalAnsweredCount = totalAnswered[0].values[0][0];

  res.json({
    code: 200,
    data: {
      totalQuizzes,
      answeredQuizzes,
      correctRate: totalAnsweredCount > 0 ? Math.round((correctCount / totalAnsweredCount) * 100) : 0,
      totalSections: 5
    }
  });
});

// 记录学习行为（访问板块）
app.post('/api/learn/record', authMiddleware, async (req, res) => {
  const { section_id } = req.body;
  const db = await getDB();
  db.run(`CREATE TABLE IF NOT EXISTS learn_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`INSERT INTO learn_records (user_id, section_id) VALUES (?, ?)`, [req.user.id, section_id]);
  saveDB();
  res.json({ code: 200, message: '记录成功' });
});

// 获取学习进度（每个板块的访问次数）
app.get('/api/learn/progress', authMiddleware, async (req, res) => {
  const db = await getDB();
  db.run(`CREATE TABLE IF NOT EXISTS learn_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  const result = db.exec(`
    SELECT s.id, s.title, COALESCE(lr.visit_count, 0) as visit_count
    FROM sections s
    LEFT JOIN (
      SELECT section_id, COUNT(*) as visit_count FROM learn_records WHERE user_id = ${req.user.id} GROUP BY section_id
    ) lr ON s.id = lr.section_id
    ORDER BY s.sort_order
  `);
  if (result.length === 0) return res.json({ code: 200, data: [] });
  const cols = result[0].columns;
  const data = result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
  res.json({ code: 200, data });
});

// 增强统计：包含每题正确率数据用于图表
app.get('/api/stats/detail', authMiddleware, async (req, res) => {
  const db = await getDB();
  const totalQuizzes = db.exec('SELECT COUNT(*) FROM quizzes')[0].values[0][0];
  const totalRecords = db.exec(`SELECT COUNT(*) FROM quiz_records WHERE user_id = ${req.user.id}`)[0].values[0][0];
  const correctRecords = db.exec(`SELECT COUNT(*) FROM quiz_records WHERE user_id = ${req.user.id} AND is_correct = 1`)[0].values[0][0];
  const wrongRecords = totalRecords - correctRecords;
  const answeredQuizzes = db.exec(`SELECT COUNT(DISTINCT quiz_id) FROM quiz_records WHERE user_id = ${req.user.id}`)[0].values[0][0];

  db.run(`CREATE TABLE IF NOT EXISTS learn_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, section_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  const learnResult = db.exec(`SELECT COALESCE(COUNT(DISTINCT section_id),0) FROM learn_records WHERE user_id = ${req.user.id}`);
  const learnedSections = learnResult[0].values[0][0];

  const perQuiz = db.exec(`
    SELECT q.id, q.question,
      COALESCE(SUM(CASE WHEN qr.is_correct=1 THEN 1 ELSE 0 END),0) as correct_count,
      COALESCE(COUNT(qr.id),0) as total_count
    FROM quizzes q
    LEFT JOIN quiz_records qr ON q.id = qr.quiz_id AND qr.user_id = ${req.user.id}
    GROUP BY q.id ORDER BY q.sort_order
  `);
  let quizStats = [];
  if (perQuiz.length > 0) {
    const cols = perQuiz[0].columns;
    quizStats = perQuiz[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  res.json({
    code: 200,
    data: {
      totalQuizzes, totalRecords, correctRecords, wrongRecords,
      answeredQuizzes, learnedSections, totalSections: 5,
      correctRate: totalRecords > 0 ? Math.round((correctRecords / totalRecords) * 100) : 0,
      quizStats
    }
  });
});

const distPath = process.env.FRONTEND_DIST_PATH || path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`柴油机润滑系统教学辅助系统已启动: http://localhost:${PORT}`);
});
