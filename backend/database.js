const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

let db = null;

async function getDB() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    initTables();
    seedData();
    saveDB();
  }

  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      cover_image TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_text TEXT,
      image_url TEXT,
      video_url TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (section_id) REFERENCES sections(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sub_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      image_url_2 TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (content_id) REFERENCES contents(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quiz_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      user_answer TEXT,
      is_correct INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS introduction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      video_url TEXT,
      image_url TEXT
    )
  `);
}

function seedData() {
  db.run(`INSERT INTO users (username, password, nickname, role) VALUES ('LH666', '123456', '学员', 'student')`);
  db.run(`INSERT INTO users (username, password, nickname, role) VALUES ('admin', 'admin123', '管理员', 'admin')`);

  db.run(`INSERT INTO introduction (title, content, video_url, image_url) VALUES (
    '柴油机润滑系统',
    '柴油机润滑系统主要由机油泵、机油滤清器、机油冷却器、油底壳及油路等组成，负责向曲轴、连杆、活塞、凸轮轴等运动部件输送润滑油。其核心作用是减摩降损、冷却散热、清洁杂质、密封间隙及防锈防腐。润滑系统是柴油机正常运行的重要保障，一旦润滑不良，将导致机件过热、加速磨损甚至烧瓦抱轴等严重故障。了解润滑系统的组成与工作原理，对于柴油机的维护保养和故障诊断具有重要意义。',
    '/materials/video/intro_video.mp4',
    '/materials/img/intro_main.jpg'
  )`);

  // ===== 五大板块 =====
  db.run(`INSERT INTO sections (title, subtitle, description, cover_image, sort_order) VALUES
    ('主要作用和润滑方式', '了解润滑系统的核心功能与工作方式', '深入学习柴油机润滑系统的五大主要作用和三种润滑方式，掌握润滑系统在柴油机运行中的关键角色。', '/materials/img/zuoyong_runhua_1.png', 1)`);
  db.run(`INSERT INTO sections (title, subtitle, description, cover_image, sort_order) VALUES
    ('结构组成', '润滑系统的核心部件', '学习润滑系统的各组成部分，包括储存、升压、滤清、安全限压、冷却和检查装置。', '/materials/img/jiegou_zong.jpg', 2)`);
  db.run(`INSERT INTO sections (title, subtitle, description, cover_image, sort_order) VALUES
    ('油路', '润滑油的循环路径', '了解润滑油在柴油机内部的流动路径，掌握油路的结构和工作原理。', '/materials/img/youlu_zhu.jpg', 3)`);
  db.run(`INSERT INTO sections (title, subtitle, description, cover_image, sort_order) VALUES
    ('润滑剂', '机油的分类与特性', '学习不同类型机油的分类、特点和应用场景，了解润滑剂的选用原则。', '/materials/img/intro_main.jpg', 4)`);
  db.run(`INSERT INTO sections (title, subtitle, description, cover_image, sort_order) VALUES
    ('常见故障和排除方法', '润滑系统故障诊断', '了解柴油机润滑系统常见故障的表现、原因和排除方法，提高故障诊断能力。', '/materials/img/intro_main.jpg', 5)`);

  // ===== 板块1：主要作用和润滑方式 =====
  // content_id = 1
  db.run(`INSERT INTO contents (section_id, title, content_type, content_text, image_url, sort_order) VALUES
    (1, '主要作用', 'concept', '柴油机润滑系统具有五大主要作用，是保障发动机正常运转的关键系统。', '', 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (1, '润滑作用', '利用油膜减少机件间的磨损。润滑油在运动部件之间形成一层油膜，将两个金属表面隔开，大大降低摩擦系数，减少磨损，延长零件使用寿命。', '/materials/img/zuoyong_runhua_1.png', '/materials/img/zuoyong_runhua_2.png', 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (1, '清洁作用', '带走金属屑、杂质，同时减少磨料磨损的发生。润滑油在循环过程中，能够冲洗零件表面的磨屑和杂质，保持摩擦面清洁。', '/materials/img/zuoyong_qingjie_1.jpg', '/materials/img/zuoyong_qingjie_2.jpg', 2)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (1, '冷却作用', '润滑油可以吸收热量。发动机工作时，摩擦产生大量热量，润滑油流经摩擦面时带走热量，起到冷却降温的作用，防止零件过热。', '/materials/img/zuoyong_lengque_1.jpg', '/materials/img/zuoyong_lengque_2.jpg', 3)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (1, '防锈作用', '表面形成保护膜，防止或减轻零件腐蚀锈蚀。润滑油覆盖在金属表面，隔绝空气和水分，有效防止氧化腐蚀。', '/materials/img/zuoyong_fangxiu_1.jpg', '/materials/img/zuoyong_fangxiu_2.jpg', 4)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (1, '密封作用', '利用油膜防止燃气的泄漏。在活塞与气缸壁之间，润滑油起到密封作用，防止高压燃气窜入曲轴箱，提高发动机效率。', '/materials/img/zuoyong_mifeng_1.jpg', '/materials/img/zuoyong_mifeng_2.jpg', 5)`);

  // content_id = 2
  db.run(`INSERT INTO contents (section_id, title, content_type, content_text, image_url, sort_order) VALUES
    (1, '润滑方式', 'concept', '柴油机润滑系统采用三种主要润滑方式，确保各部位都能得到充分润滑。', '', 2)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (2, '压力润滑', '利用机油泵使润滑油产生压力，强制送到各摩擦表面。这是最主要的润滑方式，适用于负荷较大的零件，如曲轴主轴承、连杆轴承、凸轮轴轴承等。机油泵将油底壳中的润滑油吸入并加压，通过油道强制输送到各润滑点。', '/materials/img/fangshi_yali.jpg', NULL, 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (2, '飞溅润滑', '利用运动零件激溅或喷溅起来的油滴、油雾润滑摩擦面。当曲轴连杆等零件高速运转时，会将油底壳中的机油溅起形成油雾，附着在气缸壁、活塞销、正时齿轮等部位表面，实现润滑。适用于负荷较轻的零件。', '/materials/img/fangshi_feijian.jpg', NULL, 2)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (2, '掺混润滑', '在汽油中掺入机油，雾化后润滑各零件摩擦表面。主要用于二冲程发动机，将机油按一定比例掺入燃油中，随燃油一起进入气缸，在燃烧过程中对气缸壁、活塞等部件进行润滑。', '/materials/img/fangshi_chanhun.jpg', NULL, 3)`);

  // ===== 板块2：结构组成 =====
  // content_id = 3
  db.run(`INSERT INTO contents (section_id, title, content_type, content_text, image_url, sort_order) VALUES
    (2, '润滑系统结构组成', 'structure', '柴油机润滑系统由多种装置组成，各装置协同工作，确保润滑油顺畅循环。点击下方各组成部件查看详细说明。', '/materials/img/jiegou_zong.jpg', 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '油底壳', '油底壳位于发动机下部，是储存润滑油的容器。它通常由薄钢板冲压而成，内部设有挡油板，防止机油在车辆行驶过程中剧烈晃动。油底壳底部设有放油螺塞，便于更换机油。其容量根据发动机排量而定，一般为4-8升。', '/materials/img/jiegou_youdi.jpg', NULL, 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '机油泵（齿轮式）', '齿轮式机油泵由主动齿轮和从动齿轮组成，结构简单、工作可靠。主动齿轮由发动机曲轴或凸轮轴驱动，带动从动齿轮旋转。齿轮旋转时，齿间的机油被带到出油口，产生压力将机油输送到各润滑部位。', '/materials/img/jiegou_beng_chilun_1.png', '/materials/img/jiegou_beng_chilun_2.png', 2)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '机油泵（转子式）', '转子式机油泵由内转子和外转子组成，体积小、流量大。内转子由发动机驱动，带动外转子旋转。转子间形成的密封腔容积变化产生吸油和排油作用，将机油加压输送。', '/materials/img/jiegou_beng_zhuanzi_1.png', '/materials/img/jiegou_beng_zhuanzi_2.png', 3)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '集滤器', '集滤器安装在机油泵进油口处，是粗滤装置，过滤较大的杂质颗粒，防止大颗粒杂质进入机油泵造成损坏。', '/materials/img/jiegou_lv_ji.png', NULL, 4)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '粗滤器', '粗滤器安装在机油泵出油口后方，采用全流式过滤，对全部机油进行初步过滤，去除较大的金属屑和杂质颗粒。', '/materials/img/jiegou_lv_cu.png', NULL, 5)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '细滤器', '细滤器采用分流式过滤，对部分机油进行精细过滤，去除更微小的杂质。通常与粗滤器配合使用，确保机油清洁度。', '/materials/img/jiegou_lv_xi.png', NULL, 6)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '限压阀', '限压阀安装在机油泵出口，当油压超过规定值时自动开启，使多余机油回流油底壳，防止油压过高损坏密封件和油管。', '/materials/img/jiegou_xianya.jpg', NULL, 7)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '旁通阀', '旁通阀安装在滤清器旁，当滤清器堵塞导致前后压差过大时自动开启，使机油不经过滤直接进入油道，保证供油不中断。', '/materials/img/jiegou_pangtong.jpg', NULL, 8)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '安全阀', '安全阀在系统出现异常高压时起保护作用，防止油压过高损坏润滑系统的管路和密封，是润滑系统的最后一道安全防线。', '/materials/img/jiegou_anquan.jpg', NULL, 9)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '机油散热器', '机油散热器用于冷却循环中的润滑油，防止油温过高导致油膜变薄、润滑性能下降。常见有风冷式和水冷式两种，风冷式利用行驶风冷却，水冷式利用冷却水对机油进行热交换。', '/materials/img/jiegou_sanre.png', NULL, 10)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (3, '油压表', '油压表显示润滑系统的工作压力，正常怠速时一般为0.05-0.2MPa，中高速时为0.2-0.5MPa。油温表显示机油温度，正常工作温度为70-90°C。油尺用于检查油底壳中机油量是否在规定范围内。', '/materials/img/jiegou_youya.jpg', NULL, 11)`);

  // ===== 板块3：油路 =====
  // content_id = 4
  db.run(`INSERT INTO contents (section_id, title, content_type, content_text, image_url, sort_order) VALUES
    (3, '油路结构与工作原理', 'concept', '润滑油路是连接各润滑部位的通道，确保润滑油能够到达每一个需要润滑的零件表面。', '', 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (4, '主油道', '主油道是润滑系统的"主动脉"，通常设置在气缸体的一侧，贯穿整个发动机。经机油泵加压后的润滑油首先进入主油道，再分配到各支路。主油道直径较大，保证充足的供油量。', '/materials/img/youlu_zhu.jpg', NULL, 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (4, '分油道', '从主油道分出若干支路，分别通向曲轴主轴承、凸轮轴轴承、摇臂轴等部位。每条分油道根据所供润滑部位的需求，设计不同的直径和长度。', '/materials/img/youlu_fen.jpg', NULL, 2)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (4, '油路循环流程', '油底壳→集滤器→机油泵→机油滤清器→主油道→分油道→各润滑部位→回流至油底壳。这是一个完整的循环过程，润滑油在不断循环中完成润滑、冷却、清洁等功能。', '/materials/img/youlu_xunhuan_1.jpg', '/materials/img/youlu_xunhuan_2.jpg', 3)`);

  // ===== 板块4：润滑剂（纯文字概念，无图片） =====
  // content_id = 5
  db.run(`INSERT INTO contents (section_id, title, content_type, content_text, image_url, sort_order) VALUES
    (4, '润滑剂分类与特性', 'text_only', '机油是柴油机润滑系统中最重要的工作介质，不同类型的发动机需要使用不同规格的机油。', '', 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (5, '机油分类', '机油按用途分为：汽油机油、柴油机油、摩托车油、船用发动机油、铁路机车油、航空发动机油。柴油机油是专为柴油发动机设计的润滑油，需要承受更高的温度和压力。按照API（美国石油学会）标准，柴油机油分为CA、CB、CC、CD、CE、CF等多个等级。', NULL, NULL, 1)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (5, '高温氧化稳定性', '优质机油在高温环境下不易被氧化变质，能够长期保持良好的润滑性能。柴油机工作温度较高，对机油的抗氧化性能要求更为严格。', NULL, NULL, 2)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (5, '溶解积碳能力', '机油具有清净分散性能，能够溶解和分散发动机运行中产生的积碳，防止积碳沉积在零件表面影响正常工作。', NULL, NULL, 3)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (5, '磨屑结聚与耐磨耐压', '机油能将磨损产生的金属微粒结聚并携带至滤清器过滤。同时在高压条件下仍能保持足够的油膜强度，保护零件不受损伤。', NULL, NULL, 4)`);
  db.run(`INSERT INTO sub_items (content_id, title, description, image_url, image_url_2, sort_order) VALUES
    (5, '油污结聚与耐腐蚀', '机油能够将油泥、漆膜等污染物结聚为较大颗粒，便于滤清器拦截。同时具备中和酸性物质的能力，防止零件被腐蚀。选择合适等级的机油并按时更换，是柴油机保养的关键。', NULL, NULL, 5)`);

  // ===== 板块5：常见故障和排除方法 =====
  // content_id = 6
  db.run(`INSERT INTO contents (section_id, title, content_type, content_text, image_url, sort_order) VALUES
    (5, '常见故障和排除方法', 'fault_table', '${JSON.stringify([
      { symptom: '机油压力过低', detail: '报警灯亮、油压偏低、有金属异响', causes: ['机油油量不足', '机油过稀或变质', '机油滤清器堵塞', '机油泵磨损损坏', '限压阀弹簧过软或卡滞', '轴瓦间隙过大', '油管或接头漏油'], solutions: ['补充机油至标准油位', '更换合格机油', '清洗或更换机油滤芯', '检修或更换机油泵', '清洗、调整或更换限压阀', '检修更换轴瓦，恢复间隙', '紧固接头，更换破损油管'] },
      { symptom: '机油压力过高', detail: '油压超标、油管/滤清器渗漏鼓包', causes: ['机油黏度过大', '限压阀卡死无法开启', '主油道局部堵塞'], solutions: ['更换合适黏度机油', '拆洗限压阀，保证运动灵活', '疏通主油道及分支油道'] },
      { symptom: '机油消耗过大', detail: '排气管冒蓝烟、机油明显减少', causes: ['活塞环磨损、对口、弹力不足', '气缸套磨损严重', '气门油封损坏', '增压器油封漏油', '发动机外部渗漏'], solutions: ['更换活塞环，正确装配', '镗缸或更换缸套', '更换气门油封', '检修涡轮增压器', '检查并修复外部渗漏点'] },
      { symptom: '机油变质乳化', detail: '机油发白起泡、有柴油味、油泥多', causes: ['气缸垫损坏，冷却水进入油道', '气缸套裂纹漏水', '喷油器雾化不良，柴油漏入油底壳', '长期低温短途运行'], solutions: ['更换气缸垫', '检修或更换气缸套', '检修或更换喷油器', '避免长时间怠速，定期更换机油'] },
      { symptom: '润滑系统异响', detail: '轴瓦沉重敲击声、机油泵异响', causes: ['机油压力不足，润滑不良', '轴瓦严重磨损', '机油泵齿轮磨损', '油道堵塞，局部缺油'], solutions: ['恢复正常机油压力', '更换磨损轴瓦', '检修或更换机油泵', '彻底清洗润滑系统油道'] },
      { symptom: '滤清器早期堵塞', detail: '旁通阀常开、机油清洁度差', causes: ['机油过脏', '发动机内部磨屑过多', '使用劣质滤芯'], solutions: ['清洗系统，更换新机油', '检修磨损部件', '更换合格正品机油滤芯'] }
    ])}', '', 1)`);

  // ===== 测试题 =====
  const quizzes = [
    { q: '柴油机润滑系统的核心作用不包括以下哪项？', a: '减摩降损', b: '冷却散热', c: '提供动力', d: '密封间隙', ans: 'C', exp: '润滑系统的核心作用包括减摩降损、冷却散热、清洁杂质、密封间隙及防锈防腐，不包括提供动力。' },
    { q: '机油泵属于润滑系统中的哪类装置？', a: '储存装置', b: '升压装置', c: '滤清装置', d: '冷却装置', ans: 'B', exp: '机油泵是润滑油升压装置，负责将油底壳中的机油吸入并加压输送到各润滑部位。' },
    { q: '以下哪种润滑方式是利用机油泵产生压力强制供油？', a: '飞溅润滑', b: '掺混润滑', c: '压力润滑', d: '自然润滑', ans: 'C', exp: '压力润滑是利用机油泵使润滑油产生压力，强制送到各摩擦表面的润滑方式。' },
    { q: '油底壳在润滑系统中的主要功能是什么？', a: '过滤机油', b: '储存润滑油', c: '冷却机油', d: '加压机油', ans: 'B', exp: '油底壳是润滑油储存装置，位于发动机下部，是储存润滑油的容器。' },
    { q: '当机油滤清器堵塞时，哪个部件会自动开启以保证供油？', a: '限压阀', b: '安全阀', c: '旁通阀', d: '单向阀', ans: 'C', exp: '旁通阀安装在滤清器旁，当滤清器堵塞时开启，使机油不经过滤直接进入油道，保证供油不中断。' },
    { q: '飞溅润滑适用于以下哪类零件？', a: '负荷较大的零件', b: '负荷较轻的零件', c: '所有零件', d: '静止零件', ans: 'B', exp: '飞溅润滑利用运动零件激溅的油滴、油雾润滑摩擦面，适用于负荷较轻的零件。' },
    { q: '正常工作状态下，机油温度应保持在什么范围？', a: '40-60°C', b: '70-90°C', c: '100-120°C', d: '120-150°C', ans: 'B', exp: '机油正常工作温度为70-90°C，过高或过低都会影响润滑效果。' },
    { q: '润滑油路的循环起点是？', a: '机油泵', b: '主油道', c: '油底壳', d: '机油滤清器', ans: 'C', exp: '润滑油路循环流程：油底壳→集滤器→机油泵→机油滤清器→主油道→分油道→各润滑部位→回流至油底壳。' },
    { q: '以下关于集滤器的描述正确的是？', a: '安装在机油泵出油口', b: '是精滤装置', c: '安装在机油泵进油口处', d: '过滤微小颗粒', ans: 'C', exp: '集滤器安装在机油泵进油口处，是粗滤装置，过滤较大的杂质颗粒。' },
    { q: '柴油机油按API标准分级，以下哪个不是柴油机油等级？', a: 'CD', b: 'CF', c: 'SN', d: 'CE', ans: 'C', exp: 'SN是汽油机油的等级标准。柴油机油等级以C开头（如CA、CB、CC、CD、CE、CF），汽油机油等级以S开头。' },
    { q: '润滑油的密封作用主要体现在哪个部位？', a: '曲轴与轴承之间', b: '活塞与气缸壁之间', c: '凸轮轴与轴承之间', d: '齿轮与齿轮之间', ans: 'B', exp: '在活塞与气缸壁之间，润滑油起到密封作用，防止高压燃气窜入曲轴箱。' },
    { q: '限压阀的作用是什么？', a: '防止油温过高', b: '过滤机油杂质', c: '防止油压过高', d: '检测机油量', ans: 'C', exp: '限压阀安装在机油泵出口，当油压超过规定值时自动开启，使多余机油回流，防止油压过高。' },
    { q: '掺混润滑主要用于哪种类型的发动机？', a: '四冲程柴油机', b: '二冲程发动机', c: '涡轮发动机', d: '蒸汽机', ans: 'B', exp: '掺混润滑主要用于二冲程发动机，将机油按一定比例掺入燃油中使用。' },
    { q: '检查油底壳机油量应在停机后多长时间进行？', a: '立即检查', b: '1分钟后', c: '5分钟后', d: '30分钟后', ans: 'C', exp: '应在停机5分钟后用油尺检查机油量，让机油充分回流至油底壳后再检查才准确。' },
    { q: '机油散热器有哪两种常见类型？', a: '电冷式和水冷式', b: '风冷式和水冷式', c: '油冷式和气冷式', d: '内循环式和外循环式', ans: 'B', exp: '机油散热器常见有风冷式和水冷式两种，风冷式利用行驶风冷却，水冷式利用冷却水进行热交换。' },
  ];
  quizzes.forEach((q, i) => {
    db.run(`INSERT INTO quizzes (question, option_a, option_b, option_c, option_d, correct_answer, explanation, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.q, q.a, q.b, q.c, q.d, q.ans, q.exp, i + 1]);
  });
}

module.exports = { getDB, saveDB };
