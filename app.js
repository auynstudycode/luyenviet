// ============================================================
//  LuyenViet — app.js
//  Toàn bộ data + logic + AI feedback (Anthropic API)
// ============================================================

// ── STATE ────────────────────────────────────────────────────
const state = {
  level: null,       // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  mode: null,        // 'topic' | 'free'
  topic: null,       // { name, emoji, prompts, vocab, grammar }
  promptIdx: 0,
  freeTopic: '',
};

// ── DATA ─────────────────────────────────────────────────────
const LEVELS = [
  { id: 'N5', jp: 'N五', name: 'N5', sub: 'Sơ cấp', color: '#10B981' },
  { id: 'N4', jp: 'N四', name: 'N4', sub: 'Tiền trung cấp', color: '#3B82F6' },
  { id: 'N3', jp: 'N三', name: 'N3', sub: 'Trung cấp', color: '#F59E0B' },
  { id: 'N2', jp: 'N二', name: 'N2', sub: 'Tiền cao cấp', color: '#EF4444' },
  { id: 'N1', jp: 'N一', name: 'N1', sub: 'Cao cấp', color: '#8B5CF6' },
];

const TOPICS = {
  N5: [
    {
      name: 'Gia đình', emoji: '👨‍👩‍👧',
      prompts: [
        { jp: '家族について紹介してください。', vn: 'Hãy giới thiệu về gia đình bạn.' },
        { jp: 'お父さん・お母さんはどんな人ですか？', vn: 'Bố mẹ bạn là người như thế nào?' },
        { jp: '家族と何をしますか？', vn: 'Bạn thường làm gì cùng gia đình?' },
      ],
      vocab: [
        { jp: '家族', r: 'かぞく', vn: 'gia đình' },
        { jp: 'お父さん', r: 'おとうさん', vn: 'bố' },
        { jp: 'お母さん', r: 'おかあさん', vn: 'mẹ' },
        { jp: '兄', r: 'あに', vn: 'anh trai' },
        { jp: '姉', r: 'あね', vn: 'chị gái' },
        { jp: '弟', r: 'おとうと', vn: 'em trai' },
        { jp: '妹', r: 'いもうと', vn: 'em gái' },
        { jp: '一緒に', r: 'いっしょに', vn: 'cùng nhau' },
        { jp: '優しい', r: 'やさしい', vn: 'tốt bụng' },
        { jp: '好き', r: 'すき', vn: 'thích' },
      ],
      grammar: [
        { pattern: '〜は〜です', meaning: 'A là B — câu khẳng định cơ bản' },
        { pattern: '〜と〜', meaning: 'Và ~ (liệt kê)' },
        { pattern: '〜が好きです', meaning: 'Thích ~' },
        { pattern: '〜がいます', meaning: 'Có ~ (người/động vật)' },
      ],
    },
    {
      name: 'Thức ăn', emoji: '🍱',
      prompts: [
        { jp: '好きな食べ物は何ですか？', vn: 'Món ăn yêu thích của bạn là gì?' },
        { jp: '毎日何を食べますか？', vn: 'Hằng ngày bạn ăn gì?' },
        { jp: '日本の食べ物を食べたことがありますか？', vn: 'Bạn đã ăn thức ăn Nhật chưa?' },
      ],
      vocab: [
        { jp: '食べ物', r: 'たべもの', vn: 'đồ ăn' },
        { jp: '飲み物', r: 'のみもの', vn: 'đồ uống' },
        { jp: 'ご飯', r: 'ごはん', vn: 'cơm' },
        { jp: 'おいしい', r: 'おいしい', vn: 'ngon' },
        { jp: '甘い', r: 'あまい', vn: 'ngọt' },
        { jp: '辛い', r: 'からい', vn: 'cay' },
        { jp: '毎日', r: 'まいにち', vn: 'mỗi ngày' },
        { jp: '朝ごはん', r: 'あさごはん', vn: 'bữa sáng' },
        { jp: '昼ごはん', r: 'ひるごはん', vn: 'bữa trưa' },
        { jp: '晩ごはん', r: 'ばんごはん', vn: 'bữa tối' },
      ],
      grammar: [
        { pattern: '〜を食べます', meaning: 'Ăn ~' },
        { pattern: '〜が一番好きです', meaning: 'Thích ~ nhất' },
        { pattern: '〜たことがあります', meaning: 'Đã từng ~ (kinh nghiệm)' },
        { pattern: '〜も〜も', meaning: 'Cả ~ lẫn ~' },
      ],
    },
    {
      name: 'Trường học', emoji: '🏫',
      prompts: [
        { jp: '学校はどうですか？', vn: 'Trường học của bạn như thế nào?' },
        { jp: '好きな科目は何ですか？', vn: 'Môn học yêu thích của bạn là gì?' },
        { jp: '学校で何をしますか？', vn: 'Bạn làm gì ở trường?' },
      ],
      vocab: [
        { jp: '学校', r: 'がっこう', vn: 'trường học' },
        { jp: '先生', r: 'せんせい', vn: 'giáo viên' },
        { jp: '友達', r: 'ともだち', vn: 'bạn bè' },
        { jp: '勉強する', r: 'べんきょうする', vn: 'học' },
        { jp: '科目', r: 'かもく', vn: 'môn học' },
        { jp: '数学', r: 'すうがく', vn: 'toán học' },
        { jp: '英語', r: 'えいご', vn: 'tiếng Anh' },
        { jp: '楽しい', r: 'たのしい', vn: 'vui' },
        { jp: '難しい', r: 'むずかしい', vn: 'khó' },
        { jp: '毎日', r: 'まいにち', vn: 'mỗi ngày' },
      ],
      grammar: [
        { pattern: '〜に行きます', meaning: 'Đi đến ~' },
        { pattern: '〜で〜をします', meaning: 'Làm ~ ở ~' },
        { pattern: '〜は〜より〜です', meaning: 'A ~ hơn B' },
        { pattern: 'どんな〜ですか', meaning: 'Là loại ~ gì?' },
      ],
    },
    {
      name: 'Sở thích', emoji: '🎮',
      prompts: [
        { jp: '趣味は何ですか？', vn: 'Sở thích của bạn là gì?' },
        { jp: '週末に何をしますか？', vn: 'Cuối tuần bạn làm gì?' },
        { jp: 'どんな音楽が好きですか？', vn: 'Bạn thích nhạc gì?' },
      ],
      vocab: [
        { jp: '趣味', r: 'しゅみ', vn: 'sở thích' },
        { jp: '音楽', r: 'おんがく', vn: 'âm nhạc' },
        { jp: '映画', r: 'えいが', vn: 'phim' },
        { jp: 'ゲーム', r: 'ゲーム', vn: 'trò chơi điện tử' },
        { jp: '読む', r: 'よむ', vn: 'đọc' },
        { jp: '聴く', r: 'きく', vn: 'nghe' },
        { jp: '週末', r: 'しゅうまつ', vn: 'cuối tuần' },
        { jp: 'よく', r: 'よく', vn: 'thường xuyên' },
        { jp: '時々', r: 'ときどき', vn: 'thỉnh thoảng' },
        { jp: '楽しむ', r: 'たのしむ', vn: 'tận hưởng' },
      ],
      grammar: [
        { pattern: '〜のが好きです', meaning: 'Thích làm ~' },
        { pattern: 'よく〜ます', meaning: 'Thường xuyên ~' },
        { pattern: '〜たり〜たりします', meaning: 'Làm các thứ như ~ và ~' },
        { pattern: '〜ことがあります', meaning: 'Thỉnh thoảng có ~' },
      ],
    },
    {
      name: 'Thời tiết', emoji: '⛅',
      prompts: [
        { jp: '今日の天気はどうですか？', vn: 'Thời tiết hôm nay như thế nào?' },
        { jp: '好きな季節はいつですか？', vn: 'Bạn thích mùa nào nhất?' },
        { jp: '今、外は寒いですか？', vn: 'Bây giờ bên ngoài có lạnh không?' },
      ],
      vocab: [
        { jp: '天気', r: 'てんき', vn: 'thời tiết' },
        { jp: '晴れ', r: 'はれ', vn: 'nắng' },
        { jp: '雨', r: 'あめ', vn: 'mưa' },
        { jp: '雪', r: 'ゆき', vn: 'tuyết' },
        { jp: '暑い', r: 'あつい', vn: 'nóng' },
        { jp: '寒い', r: 'さむい', vn: 'lạnh' },
        { jp: '春', r: 'はる', vn: 'mùa xuân' },
        { jp: '夏', r: 'なつ', vn: 'mùa hè' },
        { jp: '秋', r: 'あき', vn: 'mùa thu' },
        { jp: '冬', r: 'ふゆ', vn: 'mùa đông' },
      ],
      grammar: [
        { pattern: '〜です / ではありません', meaning: 'Là ~ / Không phải ~' },
        { pattern: '〜ですね', meaning: '~ nhỉ (xác nhận, đồng tình)' },
        { pattern: '〜が一番〜です', meaning: '~ là ~ nhất' },
        { pattern: 'どんな〜ですか', meaning: 'Như thế nào?' },
      ],
    },
    {
      name: 'Tự giới thiệu', emoji: '👋',
      prompts: [
        { jp: '自己紹介をしてください。', vn: 'Hãy tự giới thiệu bản thân.' },
        { jp: 'お名前は何ですか？どこから来ましたか？', vn: 'Tên bạn là gì? Bạn đến từ đâu?' },
        { jp: 'これからよろしくお願いします、と言ってください。', vn: 'Hãy nói lời chào hỏi khi gặp lần đầu.' },
      ],
      vocab: [
        { jp: '名前', r: 'なまえ', vn: 'tên' },
        { jp: '〜歳', r: '〜さい', vn: '~ tuổi' },
        { jp: '国', r: 'くに', vn: 'đất nước' },
        { jp: '学生', r: 'がくせい', vn: 'sinh viên' },
        { jp: '会社員', r: 'かいしゃいん', vn: 'nhân viên công ty' },
        { jp: 'はじめまして', r: 'はじめまして', vn: 'Rất vui được gặp bạn' },
        { jp: 'よろしく', r: 'よろしく', vn: 'mong nhận được sự giúp đỡ' },
        { jp: '住む', r: 'すむ', vn: 'sinh sống' },
      ],
      grammar: [
        { pattern: '私は〜です', meaning: 'Tôi là ~' },
        { pattern: '〜から来ました', meaning: 'Đến từ ~' },
        { pattern: '〜に住んでいます', meaning: 'Đang sống ở ~' },
        { pattern: 'どうぞよろしくお願いします', meaning: 'Mong nhận được sự giúp đỡ (trang trọng)' },
      ],
    },
  ],

  N4: [
    {
      name: 'Du lịch', emoji: '✈️',
      prompts: [
        { jp: '旅行した経験を教えてください。', vn: 'Hãy kể về chuyến du lịch của bạn.' },
        { jp: '行きたい国はどこですか？理由も教えてください。', vn: 'Bạn muốn đến nước nào? Hãy nói lý do.' },
        { jp: '旅行の準備として何をしますか？', vn: 'Bạn chuẩn bị gì trước khi đi du lịch?' },
      ],
      vocab: [
        { jp: '旅行', r: 'りょこう', vn: 'du lịch' },
        { jp: '予約する', r: 'よやくする', vn: 'đặt trước' },
        { jp: '観光地', r: 'かんこうち', vn: 'điểm du lịch' },
        { jp: 'お土産', r: 'おみやげ', vn: 'quà lưu niệm' },
        { jp: '宿泊する', r: 'しゅくはくする', vn: 'lưu trú' },
        { jp: '景色', r: 'けしき', vn: 'phong cảnh' },
        { jp: '経験', r: 'けいけん', vn: 'kinh nghiệm' },
        { jp: '思い出', r: 'おもいで', vn: 'kỷ niệm' },
        { jp: '楽しみにする', r: 'たのしみにする', vn: 'mong chờ' },
        { jp: '感動する', r: 'かんどうする', vn: 'xúc động' },
      ],
      grammar: [
        { pattern: '〜てみる', meaning: 'Thử làm ~ (lần đầu)' },
        { pattern: '〜たいと思っています', meaning: 'Đang nghĩ muốn ~' },
        { pattern: '〜ために', meaning: 'Để ~ (mục đích)' },
        { pattern: '〜たことがある', meaning: 'Đã từng ~ (kinh nghiệm)' },
        { pattern: '〜ながら', meaning: 'Vừa ~ vừa ~' },
      ],
    },
    {
      name: 'Công việc', emoji: '💼',
      prompts: [
        { jp: 'あなたの仕事や勉強について教えてください。', vn: 'Hãy kể về công việc / việc học của bạn.' },
        { jp: '将来どんな仕事をしたいですか？', vn: 'Tương lai bạn muốn làm công việc gì?' },
        { jp: '仕事の中で何が一番大変ですか？', vn: 'Điều gì khó nhất trong công việc của bạn?' },
      ],
      vocab: [
        { jp: '仕事', r: 'しごと', vn: 'công việc' },
        { jp: '会社', r: 'かいしゃ', vn: 'công ty' },
        { jp: '上司', r: 'じょうし', vn: 'sếp' },
        { jp: '同僚', r: 'どうりょう', vn: 'đồng nghiệp' },
        { jp: '給料', r: 'きゅうりょう', vn: 'lương' },
        { jp: '残業する', r: 'ざんぎょうする', vn: 'làm thêm giờ' },
        { jp: '将来', r: 'しょうらい', vn: 'tương lai' },
        { jp: '夢', r: 'ゆめ', vn: 'ước mơ' },
        { jp: '大変', r: 'たいへん', vn: 'vất vả, khó khăn' },
        { jp: '頑張る', r: 'がんばる', vn: 'cố gắng' },
      ],
      grammar: [
        { pattern: '〜ようになる', meaning: 'Trở nên có thể ~ / bắt đầu ~' },
        { pattern: '〜てしまう', meaning: 'Lỡ ~ / đã xong (nuối tiếc/hoàn thành)' },
        { pattern: '〜ばよかった', meaning: 'Giá mà đã ~ (hối tiếc)' },
        { pattern: '〜はずだ', meaning: 'Đáng lẽ phải ~ / chắc là ~' },
        { pattern: '〜なければならない', meaning: 'Phải ~ (bắt buộc)' },
      ],
    },
    {
      name: 'Sức khỏe', emoji: '🏃',
      prompts: [
        { jp: '健康のために何をしていますか？', vn: 'Bạn làm gì để giữ sức khỏe?' },
        { jp: '運動する習慣がありますか？', vn: 'Bạn có thói quen tập thể dục không?' },
        { jp: '病気になったとき、どうしますか？', vn: 'Khi bị bệnh bạn làm gì?' },
      ],
      vocab: [
        { jp: '健康', r: 'けんこう', vn: 'sức khỏe' },
        { jp: '運動する', r: 'うんどうする', vn: 'tập thể dục' },
        { jp: '病院', r: 'びょういん', vn: 'bệnh viện' },
        { jp: '薬', r: 'くすり', vn: 'thuốc' },
        { jp: '習慣', r: 'しゅうかん', vn: 'thói quen' },
        { jp: '体重', r: 'たいじゅう', vn: 'cân nặng' },
        { jp: '疲れる', r: 'つかれる', vn: 'mệt mỏi' },
        { jp: '休む', r: 'やすむ', vn: 'nghỉ ngơi' },
        { jp: '食生活', r: 'しょくせいかつ', vn: 'chế độ ăn uống' },
        { jp: '睡眠', r: 'すいみん', vn: 'giấc ngủ' },
      ],
      grammar: [
        { pattern: '〜ようにしている', meaning: 'Đang cố gắng để ~' },
        { pattern: '〜たほうがいい', meaning: 'Nên ~ (lời khuyên)' },
        { pattern: '〜すぎる', meaning: 'Quá ~ (mức độ)' },
        { pattern: '〜と、〜', meaning: 'Nếu ~ thì ~ (điều kiện tự nhiên)' },
        { pattern: '〜てから', meaning: 'Sau khi ~ thì ~' },
      ],
    },
    {
      name: 'Phim & Âm nhạc', emoji: '🎬',
      prompts: [
        { jp: '好きな映画や音楽を教えてください。', vn: 'Hãy nói về phim hoặc âm nhạc bạn thích.' },
        { jp: '最近見た映画はどんな映画でしたか？', vn: 'Bộ phim gần đây bạn xem là phim gì?' },
        { jp: 'おすすめの曲やアーティストは？', vn: 'Bài hát / nghệ sĩ bạn muốn giới thiệu là gì?' },
      ],
      vocab: [
        { jp: '映画', r: 'えいが', vn: 'phim' },
        { jp: '音楽', r: 'おんがく', vn: 'âm nhạc' },
        { jp: '歌手', r: 'かしゅ', vn: 'ca sĩ' },
        { jp: '感動的', r: 'かんどうてき', vn: 'cảm động' },
        { jp: '笑う', r: 'わらう', vn: 'cười' },
        { jp: '泣く', r: 'なく', vn: 'khóc' },
        { jp: 'ストーリー', r: 'ストーリー', vn: 'cốt truyện' },
        { jp: 'おすすめ', r: 'おすすめ', vn: 'gợi ý, giới thiệu' },
        { jp: '印象に残る', r: 'いんしょうにのこる', vn: 'đọng lại ấn tượng' },
        { jp: 'ジャンル', r: 'ジャンル', vn: 'thể loại' },
      ],
      grammar: [
        { pattern: '〜と思います', meaning: 'Tôi nghĩ rằng ~' },
        { pattern: '〜という〜', meaning: '~ tên là ~' },
        { pattern: '〜てよかった', meaning: 'May mà đã ~ / Vui vì đã ~' },
        { pattern: '〜ので', meaning: 'Vì ~ nên ~ (lý do)' },
        { pattern: '〜し、〜し', meaning: 'Vừa ~ vừa ~ (liệt kê lý do)' },
      ],
    },
    {
      name: 'Mua sắm', emoji: '🛍️',
      prompts: [
        { jp: '最近何かを買いましたか？', vn: 'Gần đây bạn có mua gì không?' },
        { jp: 'どこで買い物をすることが多いですか？', vn: 'Bạn thường mua sắm ở đâu?' },
        { jp: '欲しいものは何ですか？なぜですか？', vn: 'Bạn muốn mua gì? Tại sao?' },
      ],
      vocab: [
        { jp: '買い物', r: 'かいもの', vn: 'mua sắm' },
        { jp: '値段', r: 'ねだん', vn: 'giá cả' },
        { jp: '高い', r: 'たかい', vn: 'đắt' },
        { jp: '安い', r: 'やすい', vn: 'rẻ' },
        { jp: 'セール', r: 'セール', vn: 'giảm giá' },
        { jp: '試着する', r: 'しちゃくする', vn: 'thử đồ' },
        { jp: '財布', r: 'さいふ', vn: 'ví' },
        { jp: 'ブランド', r: 'ブランド', vn: 'thương hiệu' },
        { jp: 'クレジットカード', r: 'クレジットカード', vn: 'thẻ tín dụng' },
        { jp: '返品する', r: 'へんぴんする', vn: 'trả hàng' },
      ],
      grammar: [
        { pattern: '〜てみる', meaning: 'Thử ~ xem sao' },
        { pattern: '〜にする', meaning: 'Quyết định chọn ~' },
        { pattern: '〜かどうか', meaning: 'Có ~ hay không' },
        { pattern: '〜より〜のほうが', meaning: 'So với ~ thì ~ hơn' },
        { pattern: '〜くれる / もらう', meaning: 'Cho ~ / Nhận được ~' },
      ],
    },
    {
      name: 'Thói quen hằng ngày', emoji: '🌅',
      prompts: [
        { jp: '毎朝何時に起きますか？朝の習慣を教えてください。', vn: 'Buổi sáng bạn thức dậy lúc mấy giờ? Thói quen buổi sáng của bạn?' },
        { jp: '一日のスケジュールを説明してください。', vn: 'Hãy mô tả lịch trình một ngày của bạn.' },
        { jp: '夜、寝る前に何をしますか？', vn: 'Buổi tối trước khi ngủ bạn làm gì?' },
      ],
      vocab: [
        { jp: '起きる', r: 'おきる', vn: 'thức dậy' },
        { jp: '寝る', r: 'ねる', vn: 'đi ngủ' },
        { jp: '朝ごはん', r: 'あさごはん', vn: 'bữa sáng' },
        { jp: 'シャワーを浴びる', r: 'シャワーをあびる', vn: 'tắm' },
        { jp: '歯を磨く', r: 'はをみがく', vn: 'đánh răng' },
        { jp: '通勤する', r: 'つうきんする', vn: 'đi làm' },
        { jp: '〜時ごろ', r: '〜じごろ', vn: 'khoảng ~ giờ' },
        { jp: 'いつも', r: 'いつも', vn: 'luôn luôn' },
        { jp: 'たいてい', r: 'たいてい', vn: 'thường thường' },
        { jp: '準備する', r: 'じゅんびする', vn: 'chuẩn bị' },
      ],
      grammar: [
        { pattern: '〜てから〜', meaning: 'Sau khi ~ rồi ~' },
        { pattern: '〜ている', meaning: 'Đang ~ / Thói quen ~' },
        { pattern: '〜前に', meaning: 'Trước khi ~' },
        { pattern: '〜後で', meaning: 'Sau khi ~' },
        { pattern: 'まず〜、次に〜', meaning: 'Đầu tiên ~, tiếp theo ~' },
      ],
    },
  ],

  N3: [
    {
      name: 'Môi trường', emoji: '🌍',
      prompts: [
        { jp: '環境問題についてどう思いますか？', vn: 'Bạn nghĩ gì về vấn đề môi trường?' },
        { jp: '地球温暖化の原因と解決策について書いてください。', vn: 'Viết về nguyên nhân và giải pháp của biến đổi khí hậu.' },
        { jp: '日常生活でできる環境保護の取り組みを紹介してください。', vn: 'Giới thiệu những việc bảo vệ môi trường bạn có thể làm trong cuộc sống hằng ngày.' },
      ],
      vocab: [
        { jp: '環境', r: 'かんきょう', vn: 'môi trường' },
        { jp: '地球温暖化', r: 'ちきゅうおんだんか', vn: 'biến đổi khí hậu' },
        { jp: 'リサイクル', r: 'リサイクル', vn: 'tái chế' },
        { jp: '排気ガス', r: 'はいきガス', vn: 'khí thải' },
        { jp: '再生可能エネルギー', r: 'さいせいかのうエネルギー', vn: 'năng lượng tái tạo' },
        { jp: '自然破壊', r: 'しぜんはかい', vn: 'phá hoại thiên nhiên' },
        { jp: '取り組む', r: 'とりくむ', vn: 'nỗ lực giải quyết' },
        { jp: '削減する', r: 'さくげんする', vn: 'cắt giảm' },
        { jp: '影響', r: 'えいきょう', vn: 'ảnh hưởng' },
        { jp: '将来の世代', r: 'しょうらいのせだい', vn: 'thế hệ tương lai' },
      ],
      grammar: [
        { pattern: '〜によって', meaning: 'Tùy theo ~ / Do ~ gây ra' },
        { pattern: '〜だけでなく〜も', meaning: 'Không chỉ ~ mà còn ~' },
        { pattern: '〜ために', meaning: 'Để ~ (mục đích rõ ràng)' },
        { pattern: '〜に対して', meaning: 'Đối với ~ / Về ~' },
        { pattern: '〜べきだ', meaning: 'Nên ~ (trách nhiệm, đúng đắn)' },
      ],
    },
    {
      name: 'Giáo dục', emoji: '📚',
      prompts: [
        { jp: '日本の教育制度について知っていることを書いてください。', vn: 'Viết những gì bạn biết về hệ thống giáo dục Nhật Bản.' },
        { jp: '勉強する動機について説明してください。', vn: 'Hãy nói về động lực học tập của bạn.' },
        { jp: '良い先生の条件は何だと思いますか？', vn: 'Bạn nghĩ điều kiện để trở thành giáo viên tốt là gì?' },
      ],
      vocab: [
        { jp: '教育', r: 'きょういく', vn: 'giáo dục' },
        { jp: '受験', r: 'じゅけん', vn: 'thi cử' },
        { jp: '奨学金', r: 'しょうがくきん', vn: 'học bổng' },
        { jp: '意欲', r: 'いよく', vn: 'ý chí, động lực' },
        { jp: '自主学習', r: 'じしゅがくしゅう', vn: 'tự học' },
        { jp: '目標', r: 'もくひょう', vn: 'mục tiêu' },
        { jp: '能力', r: 'のうりょく', vn: 'năng lực' },
        { jp: '知識', r: 'ちしき', vn: 'kiến thức' },
        { jp: '成績', r: 'せいせき', vn: 'kết quả học tập' },
        { jp: '大学院', r: 'だいがくいん', vn: 'sau đại học' },
      ],
      grammar: [
        { pattern: '〜にとって', meaning: 'Đối với ~ (quan điểm cá nhân)' },
        { pattern: '〜ことによって', meaning: 'Bằng cách ~' },
        { pattern: '〜ようになる', meaning: 'Dần dần trở nên ~ / có thể ~' },
        { pattern: '〜かどうか', meaning: 'Có ~ hay không' },
        { pattern: '〜という点で', meaning: 'Về mặt ~' },
      ],
    },
    {
      name: 'Văn hóa Nhật', emoji: '⛩️',
      prompts: [
        { jp: '日本の文化で興味があるものを紹介してください。', vn: 'Giới thiệu điều gì đó về văn hóa Nhật khiến bạn thấy thú vị.' },
        { jp: '日本のマナーや習慣で、驚いたことはありますか？', vn: 'Bạn có ngạc nhiên về phong tục hay phép lịch sự nào của Nhật không?' },
        { jp: '伝統文化と現代文化の違いについて考えてみてください。', vn: 'Hãy suy nghĩ về sự khác biệt giữa văn hóa truyền thống và hiện đại.' },
      ],
      vocab: [
        { jp: '文化', r: 'ぶんか', vn: 'văn hóa' },
        { jp: '伝統', r: 'でんとう', vn: 'truyền thống' },
        { jp: 'マナー', r: 'マナー', vn: 'phép lịch sự' },
        { jp: '習慣', r: 'しゅうかん', vn: 'phong tục, thói quen' },
        { jp: '礼儀', r: 'れいぎ', vn: 'lễ nghĩa' },
        { jp: '着物', r: 'きもの', vn: 'kimono' },
        { jp: '祭り', r: 'まつり', vn: 'lễ hội' },
        { jp: '独特', r: 'どくとく', vn: 'độc đáo' },
        { jp: '尊重する', r: 'そんちょうする', vn: 'tôn trọng' },
        { jp: '影響を受ける', r: 'えいきょうをうける', vn: 'bị ảnh hưởng' },
      ],
      grammar: [
        { pattern: '〜として', meaning: 'Với tư cách là ~ / Được coi là ~' },
        { pattern: '〜に関して', meaning: 'Liên quan đến ~' },
        { pattern: '〜ながらも', meaning: 'Tuy ~ nhưng vẫn ~' },
        { pattern: '〜わけではない', meaning: 'Không có nghĩa là ~' },
        { pattern: '〜一方で', meaning: 'Trong khi đó ~ / Mặt khác ~' },
      ],
    },
    {
      name: 'Công nghệ & MXH', emoji: '📱',
      prompts: [
        { jp: 'SNSのメリットとデメリットについて書いてください。', vn: 'Viết về ưu và nhược điểm của mạng xã hội.' },
        { jp: '技術の進歩は生活をどう変えましたか？', vn: 'Sự tiến bộ công nghệ đã thay đổi cuộc sống như thế nào?' },
        { jp: 'スマートフォンなしで生活できますか？理由も教えてください。', vn: 'Bạn có thể sống mà không có smartphone không? Hãy nêu lý do.' },
      ],
      vocab: [
        { jp: '技術', r: 'ぎじゅつ', vn: 'công nghệ' },
        { jp: 'SNS', r: 'エスエヌエス', vn: 'mạng xã hội' },
        { jp: '情報', r: 'じょうほう', vn: 'thông tin' },
        { jp: 'コミュニケーション', r: 'コミュニケーション', vn: 'giao tiếp' },
        { jp: '便利', r: 'べんり', vn: 'tiện lợi' },
        { jp: '依存する', r: 'いぞんする', vn: 'phụ thuộc' },
        { jp: 'プライバシー', r: 'プライバシー', vn: 'quyền riêng tư' },
        { jp: '発展する', r: 'はってんする', vn: 'phát triển' },
        { jp: 'デジタル化', r: 'デジタルか', vn: 'số hóa' },
        { jp: '普及する', r: 'ふきゅうする', vn: 'phổ biến' },
      ],
      grammar: [
        { pattern: '〜に伴い', meaning: 'Cùng với ~ / Kéo theo ~' },
        { pattern: '〜反面', meaning: 'Trong khi ~ / Nhưng mặt khác ~' },
        { pattern: '〜ことで', meaning: 'Bằng việc ~ / Nhờ ~' },
        { pattern: '〜かねない', meaning: 'Có thể dẫn đến ~ (tiêu cực)' },
        { pattern: '〜だろうか', meaning: 'Liệu ~ có không? (nghi vấn)' },
      ],
    },
    {
      name: 'Cuộc sống đô thị', emoji: '🏙️',
      prompts: [
        { jp: '都市生活と田舎生活のどちらが好きですか？', vn: 'Bạn thích cuộc sống đô thị hay nông thôn?' },
        { jp: 'あなたの街のいいところと悪いところを書いてください。', vn: 'Viết về điểm tốt và điểm chưa tốt của thành phố bạn đang ở.' },
        { jp: '住みやすい街の条件は何ですか？', vn: 'Điều kiện để một thành phố đáng sống là gì?' },
      ],
      vocab: [
        { jp: '都市', r: 'とし', vn: 'đô thị' },
        { jp: '田舎', r: 'いなか', vn: 'nông thôn' },
        { jp: '交通', r: 'こうつう', vn: 'giao thông' },
        { jp: '渋滞', r: 'じゅうたい', vn: 'kẹt xe' },
        { jp: '治安', r: 'ちあん', vn: 'an ninh' },
        { jp: '騒音', r: 'そうおん', vn: 'tiếng ồn' },
        { jp: '利便性', r: 'りべんせい', vn: 'sự tiện lợi' },
        { jp: '自然', r: 'しぜん', vn: 'thiên nhiên' },
        { jp: '人口', r: 'じんこう', vn: 'dân số' },
        { jp: '格差', r: 'かくさ', vn: 'khoảng cách, bất bình đẳng' },
      ],
      grammar: [
        { pattern: '〜に比べて', meaning: 'So với ~' },
        { pattern: '〜とすれば', meaning: 'Nếu giả sử ~ thì' },
        { pattern: '〜ほど〜ない', meaning: 'Không ~ bằng ~' },
        { pattern: '〜点では', meaning: 'Về mặt ~ / Ở điểm ~' },
        { pattern: '〜からこそ', meaning: 'Chính vì ~ mà ~' },
      ],
    },
  ],

  N2: [
    {
      name: 'Kinh tế xã hội', emoji: '📊',
      prompts: [
        { jp: '少子高齢化問題と社会への影響について論じてください。', vn: 'Thảo luận về vấn đề già hóa dân số và tác động đến xã hội.' },
        { jp: '経済格差はなぜ生まれるのか、あなたの考えを述べてください。', vn: 'Hãy trình bày ý kiến về nguyên nhân của bất bình đẳng kinh tế.' },
        { jp: 'グローバル化のメリットとデメリットを分析してください。', vn: 'Phân tích ưu và nhược điểm của toàn cầu hóa.' },
      ],
      vocab: [
        { jp: '少子高齢化', r: 'しょうしこうれいか', vn: 'già hóa dân số' },
        { jp: '格差', r: 'かくさ', vn: 'bất bình đẳng' },
        { jp: 'グローバル化', r: 'グローバルか', vn: 'toàn cầu hóa' },
        { jp: '財政', r: 'ざいせい', vn: 'tài chính công' },
        { jp: '貧困', r: 'ひんこん', vn: 'nghèo đói' },
        { jp: '福祉', r: 'ふくし', vn: 'phúc lợi xã hội' },
        { jp: '構造的', r: 'こうぞうてき', vn: 'mang tính cấu trúc' },
        { jp: '是正する', r: 'ぜせいする', vn: 'khắc phục, chỉnh sửa' },
        { jp: '持続可能', r: 'じぞくかのう', vn: 'bền vững' },
        { jp: '政策', r: 'せいさく', vn: 'chính sách' },
      ],
      grammar: [
        { pattern: '〜にもかかわらず', meaning: 'Mặc dù ~ nhưng vẫn' },
        { pattern: '〜に伴って', meaning: 'Cùng với ~ / Do ~' },
        { pattern: '〜をめぐって', meaning: 'Xoay quanh vấn đề ~' },
        { pattern: '〜とともに', meaning: 'Cùng với ~ (đồng thời)' },
        { pattern: '〜を踏まえて', meaning: 'Dựa trên / Căn cứ vào ~' },
      ],
    },
    {
      name: 'Khoa học & Tương lai', emoji: '🔬',
      prompts: [
        { jp: 'AIの発展が社会に与える影響について考えてください。', vn: 'Hãy suy nghĩ về tác động của sự phát triển AI đến xã hội.' },
        { jp: '宇宙開発の意義と課題について述べてください。', vn: 'Trình bày ý nghĩa và thách thức của việc khám phá vũ trụ.' },
        { jp: '医療技術の進歩は倫理問題をどのように生むか論じてください。', vn: 'Thảo luận về cách tiến bộ y tế tạo ra các vấn đề đạo đức.' },
      ],
      vocab: [
        { jp: '人工知能', r: 'じんこうちのう', vn: 'trí tuệ nhân tạo' },
        { jp: '倫理', r: 'りんり', vn: 'đạo đức' },
        { jp: '革新', r: 'かくしん', vn: 'cách tân, đổi mới' },
        { jp: 'リスク', r: 'リスク', vn: 'rủi ro' },
        { jp: '自動化', r: 'じどうか', vn: 'tự động hóa' },
        { jp: '予測する', r: 'よそくする', vn: 'dự đoán' },
        { jp: '克服する', r: 'こくふくする', vn: 'khắc phục' },
        { jp: '普及率', r: 'ふきゅうりつ', vn: 'tỷ lệ phổ biến' },
        { jp: '規制', r: 'きせい', vn: 'quy định, kiểm soát' },
        { jp: '共存する', r: 'きょうぞんする', vn: 'cùng tồn tại' },
      ],
      grammar: [
        { pattern: '〜に際して', meaning: 'Khi ~ / Nhân dịp ~' },
        { pattern: '〜に基づいて', meaning: 'Dựa trên ~' },
        { pattern: '〜とは言えない', meaning: 'Không thể nói rằng ~' },
        { pattern: '〜ざるを得ない', meaning: 'Không thể không ~ / Buộc phải ~' },
        { pattern: '〜にすぎない', meaning: 'Chỉ là ~ mà thôi' },
      ],
    },
    {
      name: 'Quan hệ con người', emoji: '🤝',
      prompts: [
        { jp: '現代社会における人間関係の変化について論じてください。', vn: 'Thảo luận về sự thay đổi trong mối quan hệ con người ở xã hội hiện đại.' },
        { jp: '世代間の価値観の違いはなぜ生まれるのか述べてください。', vn: 'Hãy nói về lý do có sự khác biệt về giá trị giữa các thế hệ.' },
        { jp: 'コミュニケーション能力を高めるにはどうすればよいか。', vn: 'Làm thế nào để nâng cao kỹ năng giao tiếp?' },
      ],
      vocab: [
        { jp: '価値観', r: 'かちかん', vn: 'hệ giá trị' },
        { jp: '世代', r: 'せだい', vn: 'thế hệ' },
        { jp: '摩擦', r: 'まさつ', vn: 'xung đột, bất hòa' },
        { jp: '共感', r: 'きょうかん', vn: 'đồng cảm' },
        { jp: '対立', r: 'たいりつ', vn: 'đối lập, mâu thuẫn' },
        { jp: '相互理解', r: 'そうごりかい', vn: 'hiểu biết lẫn nhau' },
        { jp: '孤立', r: 'こりつ', vn: 'cô lập' },
        { jp: '信頼', r: 'しんらい', vn: 'niềm tin' },
        { jp: '多様性', r: 'たようせい', vn: 'sự đa dạng' },
        { jp: '協調性', r: 'きょうちょうせい', vn: 'tinh thần hợp tác' },
      ],
      grammar: [
        { pattern: '〜であるがゆえに', meaning: 'Chính vì là ~ mà' },
        { pattern: '〜に関わらず', meaning: 'Bất kể ~ / Không phân biệt ~' },
        { pattern: '〜においては', meaning: 'Trong bối cảnh ~ / Về ~' },
        { pattern: '〜とは限らない', meaning: 'Không nhất thiết là ~' },
        { pattern: '〜をよそに', meaning: 'Bất chấp ~ / Không đếm xỉa đến ~' },
      ],
    },
  ],

  N1: [
    {
      name: 'Triết học & Tư duy', emoji: '🧠',
      prompts: [
        { jp: '「幸福とは何か」について、哲学的視点から論じてください。', vn: 'Hãy thảo luận về "hạnh phúc là gì" từ góc độ triết học.' },
        { jp: '道徳と法律の相違点と関係性を分析してください。', vn: 'Phân tích điểm khác biệt và mối quan hệ giữa đạo đức và pháp luật.' },
        { jp: '「自由」と「責任」はどのような関係にあるか論じてください。', vn: 'Thảo luận về mối quan hệ giữa "tự do" và "trách nhiệm".' },
      ],
      vocab: [
        { jp: '概念', r: 'がいねん', vn: 'khái niệm' },
        { jp: '本質', r: 'ほんしつ', vn: 'bản chất' },
        { jp: '矛盾', r: 'むじゅん', vn: 'mâu thuẫn' },
        { jp: '見解', r: 'けんかい', vn: 'quan điểm' },
        { jp: '普遍性', r: 'ふへんせい', vn: 'tính phổ quát' },
        { jp: '相対的', r: 'そうたいてき', vn: 'tương đối' },
        { jp: '批判的', r: 'ひはんてき', vn: 'phê phán' },
        { jp: '論証', r: 'ろんしょう', vn: 'luận chứng' },
        { jp: '前提', r: 'ぜんてい', vn: 'tiền đề' },
        { jp: '帰結する', r: 'きけつする', vn: 'dẫn đến kết luận' },
      ],
      grammar: [
        { pattern: '〜ならではの', meaning: 'Chỉ ~ mới có / Đặc trưng của ~' },
        { pattern: '〜に至っては', meaning: 'Thậm chí đến mức ~ (cực đoan)' },
        { pattern: '〜ずにはおかない', meaning: 'Nhất định sẽ ~ / không thể không ~' },
        { pattern: '〜とも〜とも言えない', meaning: 'Không thể nói là ~ cũng chẳng phải ~' },
        { pattern: '〜がゆえに', meaning: 'Vì là ~ / Do ~' },
      ],
    },
    {
      name: 'Chính trị & Xã hội', emoji: '🏛️',
      prompts: [
        { jp: '民主主義の課題と可能性について論じてください。', vn: 'Thảo luận về thách thức và tiềm năng của nền dân chủ.' },
        { jp: '国際社会における日本の役割について考えてください。', vn: 'Suy nghĩ về vai trò của Nhật Bản trong cộng đồng quốc tế.' },
        { jp: '言論の自由と規制のバランスについてあなたの考えを述べてください。', vn: 'Trình bày ý kiến về sự cân bằng giữa tự do ngôn luận và kiểm duyệt.' },
      ],
      vocab: [
        { jp: '民主主義', r: 'みんしゅしゅぎ', vn: 'dân chủ' },
        { jp: '主権', r: 'しゅけん', vn: 'chủ quyền' },
        { jp: '言論の自由', r: 'げんろんのじゆう', vn: 'tự do ngôn luận' },
        { jp: '権利', r: 'けんり', vn: 'quyền lợi' },
        { jp: '義務', r: 'ぎむ', vn: 'nghĩa vụ' },
        { jp: '国際秩序', r: 'こくさいちつじょ', vn: 'trật tự quốc tế' },
        { jp: '透明性', r: 'とうめいせい', vn: 'tính minh bạch' },
        { jp: '批准する', r: 'ひじゅんする', vn: 'phê chuẩn' },
        { jp: '覇権', r: 'はけん', vn: 'bá quyền' },
        { jp: '合意形成', r: 'ごういけいせい', vn: 'hình thành đồng thuận' },
      ],
      grammar: [
        { pattern: '〜に照らして', meaning: 'Căn cứ vào ~ / Soi chiếu với ~' },
        { pattern: '〜を契機として', meaning: 'Lấy ~ làm cơ hội / Bắt đầu từ ~' },
        { pattern: '〜いかんによらず', meaning: 'Bất kể ~ như thế nào' },
        { pattern: '〜のもとで', meaning: 'Dưới ~ / Trong điều kiện ~' },
        { pattern: '〜にほかならない', meaning: 'Chính là ~ / Không gì khác là ~' },
      ],
    },
    {
      name: 'Văn học & Nghệ thuật', emoji: '🎨',
      prompts: [
        { jp: '芸術は社会にどのような役割を果たすか論じてください。', vn: 'Thảo luận về vai trò của nghệ thuật trong xã hội.' },
        { jp: '日本文学の特徴と世界文学への影響を述べてください。', vn: 'Trình bày đặc điểm của văn học Nhật và ảnh hưởng đến văn học thế giới.' },
        { jp: '現代アートの意義について批判的に考察してください。', vn: 'Suy ngẫm phê phán về ý nghĩa của nghệ thuật đương đại.' },
      ],
      vocab: [
        { jp: '芸術', r: 'げいじゅつ', vn: 'nghệ thuật' },
        { jp: '表現', r: 'ひょうげん', vn: 'biểu đạt, biểu hiện' },
        { jp: '審美眼', r: 'しんびがん', vn: 'thẩm mỹ' },
        { jp: '象徴', r: 'しょうちょう', vn: 'biểu tượng' },
        { jp: '解釈', r: 'かいしゃく', vn: 'diễn giải' },
        { jp: '普遍的', r: 'ふへんてき', vn: 'mang tính phổ quát' },
        { jp: '独創性', r: 'どくそうせい', vn: 'sự sáng tạo, độc đáo' },
        { jp: '批評', r: 'ひひょう', vn: 'phê bình' },
        { jp: '前衛的', r: 'ぜんえいてき', vn: 'tiền phong' },
        { jp: '文脈', r: 'ぶんみゃく', vn: 'ngữ cảnh, bối cảnh' },
      ],
      grammar: [
        { pattern: '〜すら〜ない', meaning: 'Thậm chí ~ cũng không' },
        { pattern: '〜というものだ', meaning: 'Đó chính là ~, bản chất của ~' },
        { pattern: '〜とあれば', meaning: 'Nếu là (trong trường hợp đặc biệt) ~' },
        { pattern: '〜んがために', meaning: 'Để đạt được ~ / Vì muốn ~' },
        { pattern: '〜に相違ない', meaning: 'Chắc chắn là ~ / Không nghi ngờ gì' },
      ],
    },
  ],
};

// ── PROMPTS GỢI Ý CHO VIẾT TỰ DO (AI sẽ generate thêm) ──────
const FREE_PROMPT_TEMPLATE = (topic, level) => `Bạn là giáo viên tiếng Nhật JLPT ${level}.

Người học muốn luyện viết về chủ đề: "${topic}"
Cấp độ: ${level}

Hãy tạo gợi ý theo format JSON sau (chỉ JSON, không giải thích thêm):
{
  "prompt_jp": "Câu đề bài bằng tiếng Nhật",
  "prompt_vn": "Câu đề bài bằng tiếng Việt",
  "vocab": [
    {"jp": "từ tiếng Nhật", "r": "furigana", "vn": "nghĩa tiếng Việt"},
    ... (8-10 từ phù hợp cấp độ)
  ],
  "grammar": [
    {"pattern": "〜パターン", "meaning": "ý nghĩa tiếng Việt"},
    ... (4-5 mẫu ngữ pháp phù hợp cấp độ)
  ]
}`;

const FEEDBACK_PROMPT = (level, prompt, answer) => `Bạn là giáo viên tiếng Nhật chấm bài JLPT ${level}.

Đề bài: ${prompt}
Bài viết của học sinh: 「${answer}」

Chấm điểm và cho feedback theo format JSON sau (chỉ JSON):
{
  "score": 85,
  "corrected": "câu đã sửa hoặc câu mẫu",
  "good_points": "điểm tốt trong bài (bằng tiếng Việt)",
  "issues": "lỗi cần sửa, nếu không có để trống (bằng tiếng Việt)",
  "explanation": "giải thích chi tiết ngắn gọn bằng tiếng Việt",
  "natural": "cách diễn đạt tự nhiên hơn nếu cần, bằng tiếng Nhật"
}`;

// ── API CALL ─────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content.map(i => i.text || '').join('');
}

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

// ── RENDER HELPERS ────────────────────────────────────────────
function renderLevels() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = LEVELS.map(l => `
    <div class="level-card" id="lv-${l.id}" onclick="selectLevel('${l.id}')">
      <div class="level-jp" style="color:${l.color}">${l.jp}</div>
      <div class="level-name">${l.name}</div>
      <div class="level-sub">${l.sub}</div>
    </div>
  `).join('');
}

function renderTopics() {
  const topics = TOPICS[state.level] || [];
  document.getElementById('topic-level-badge').textContent = state.level;
  const grid = document.getElementById('topic-grid');
  grid.innerHTML = topics.map((t, i) => `
    <div class="topic-card" onclick="selectTopic(${i})">
      <div class="topic-emoji">${t.emoji}</div>
      <div class="topic-name">${t.name}</div>
      <div class="topic-count">${t.prompts.length} câu hỏi</div>
    </div>
  `).join('');
}

function renderSidebar() {
  const t = state.topic;
  document.getElementById('sidebar-topic').textContent = `${t.emoji} ${t.name}`;
  document.getElementById('sidebar-level').textContent = state.level;

  const vocabList = document.getElementById('vocab-list');
  vocabList.innerHTML = t.vocab.map(v => `
    <div class="vocab-item" title="Click để copy" onclick="copyText('${v.jp}')">
      <div>
        <div class="vocab-jp">${v.jp}</div>
        <div class="vocab-reading">${v.r}</div>
      </div>
      <div class="vocab-vn">${v.vn}</div>
    </div>
  `).join('');
  document.getElementById('vocab-count').textContent = t.vocab.length;

  const grammarList = document.getElementById('grammar-list');
  grammarList.innerHTML = t.grammar.map(g => `
    <div class="grammar-item" onclick="copyText('${g.pattern}')">
      <div class="grammar-pattern">${g.pattern}</div>
      <div class="grammar-meaning">${g.meaning}</div>
    </div>
  `).join('');
  document.getElementById('grammar-count').textContent = t.grammar.length;
}

function renderPrompt() {
  const p = state.topic.prompts[state.promptIdx % state.topic.prompts.length];
  document.getElementById('writing-prompt').innerHTML = `
    <div class="prompt-label">✏ Đề bài ${state.promptIdx + 1}</div>
    <div class="prompt-text">${p.jp}</div>
    <div class="prompt-vn">${p.vn}</div>
  `;
}

// ── ACTIONS ───────────────────────────────────────────────────
function selectLevel(id) {
  state.level = id;
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
  document.getElementById('lv-' + id).classList.add('active');
  showStep('step-mode');
  scrollToStep('step-mode');
}

function selectMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');

  if (mode === 'topic') {
    renderTopics();
    showStep('step-topics');
    scrollToStep('step-topics');
  } else {
    showStep('step-free-input');
    scrollToStep('step-free-input');
  }
}

function selectTopic(idx) {
  const topics = TOPICS[state.level];
  state.topic = topics[idx];
  state.promptIdx = 0;
  renderSidebar();
  renderPrompt();
  showStep('step-writing');
  scrollToStep('step-writing');
  clearFeedback();
}

function setFreeTopic(val) {
  document.getElementById('free-topic-input').value = val;
}

async function getSuggestions() {
  const input = document.getElementById('free-topic-input').value.trim();
  if (!input) {
    document.getElementById('free-topic-input').focus();
    return;
  }
  state.freeTopic = input;

  document.getElementById('free-loading').style.display = 'flex';

  try {
    const raw = await callClaude(FREE_PROMPT_TEMPLATE(input, state.level));
    const data = parseJSON(raw);

    if (!data) throw new Error('Parse failed');

    state.topic = {
      name: input,
      emoji: '✏️',
      prompts: [{ jp: data.prompt_jp, vn: data.prompt_vn }],
      vocab: data.vocab || [],
      grammar: data.grammar || [],
    };
    state.promptIdx = 0;

    renderSidebar();
    renderPrompt();
    showStep('step-writing');
    scrollToStep('step-writing');
    clearFeedback();
  } catch (e) {
    alert('Có lỗi kết nối. Vui lòng thử lại!');
  } finally {
    document.getElementById('free-loading').style.display = 'none';
  }
}

async function submitWriting() {
  const answer = document.getElementById('user-writing').value.trim();
  if (!answer) {
    document.getElementById('user-writing').focus();
    return;
  }

  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Đang chấm bài...';
  btn.disabled = true;

  const p = state.topic.prompts[state.promptIdx % state.topic.prompts.length];
  const fbArea = document.getElementById('feedback-area');
  fbArea.innerHTML = `
    <div class="feedback-box" style="padding:1.5rem;">
      <div class="loading-bar" style="padding:0;">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <span>AI đang phân tích bài viết của bạn...</span>
      </div>
    </div>`;

  try {
    const raw = await callClaude(FEEDBACK_PROMPT(state.level, p.jp, answer));
    const fb = parseJSON(raw);
    if (!fb) throw new Error();

    const scoreClass =
      fb.score >= 85 ? 'score-great' :
      fb.score >= 70 ? 'score-good' :
      fb.score >= 50 ? 'score-ok' : 'score-low';

    const scoreLabel =
      fb.score >= 85 ? 'Xuất sắc!' :
      fb.score >= 70 ? 'Tốt lắm!' :
      fb.score >= 50 ? 'Cần cải thiện' : 'Hãy cố gắng thêm!';

    fbArea.innerHTML = `
      <div class="feedback-box">
        <div class="feedback-top">
          <div class="score-circle ${scoreClass}">${fb.score ?? '✓'}</div>
          <div>
            <div class="score-label">${scoreLabel}</div>
            <div class="score-sublabel">Phân tích chi tiết bên dưới</div>
          </div>
        </div>
        <div class="feedback-body">
          ${fb.good_points ? `
            <div class="fb-section">
              <div class="fb-section-title">✅ Điểm tốt</div>
              <div class="fb-good">${fb.good_points}</div>
            </div>` : ''}
          ${fb.issues ? `
            <div class="fb-section">
              <div class="fb-section-title">⚠ Cần chú ý</div>
              <div class="fb-issue">${fb.issues}</div>
            </div>` : ''}
          ${fb.corrected ? `
            <div class="fb-section">
              <div class="fb-section-title">📝 Câu sửa / câu mẫu</div>
              <div class="fb-corrected">${fb.corrected}</div>
            </div>` : ''}
          ${fb.natural ? `
            <div class="fb-section">
              <div class="fb-section-title">💬 Diễn đạt tự nhiên hơn</div>
              <div class="fb-corrected">${fb.natural}</div>
            </div>` : ''}
          ${fb.explanation ? `
            <div class="fb-section">
              <div class="fb-section-title">📖 Giải thích</div>
              <div class="fb-section-body">${fb.explanation}</div>
            </div>` : ''}
        </div>
      </div>`;

    document.getElementById('next-actions').style.display = 'flex';
    fbArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch {
    fbArea.innerHTML = `<div class="feedback-box" style="padding:1.25rem; color:#DC2626;">Không thể kết nối. Vui lòng thử lại.</div>`;
  } finally {
    btn.textContent = 'Nộp bài & nhận feedback ↗';
    btn.disabled = false;
  }
}

function nextPrompt() {
  state.promptIdx++;
  renderPrompt();
  clearFeedback();
  document.getElementById('writing-prompt').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function tryAgain() {
  document.getElementById('user-writing').value = '';
  clearFeedback();
  document.getElementById('user-writing').focus();
}

function clearFeedback() {
  document.getElementById('feedback-area').innerHTML = '';
  document.getElementById('next-actions').style.display = 'none';
}

function clearWriting() {
  document.getElementById('user-writing').value = '';
  document.getElementById('char-count').textContent = '0 ký tự';
}

function backToTopics() {
  if (state.mode === 'free') {
    showStep('step-free-input');
    scrollToStep('step-free-input');
  } else {
    showStep('step-topics');
    scrollToStep('step-topics');
  }
  document.getElementById('step-writing').classList.add('step-hidden');
  document.getElementById('next-actions').style.display = 'none';
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

// ── STEP DISPLAY ─────────────────────────────────────────────
function showStep(id) {
  const steps = ['step-mode','step-topics','step-free-input','step-writing'];
  steps.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('step-hidden');
  });
  const target = document.getElementById(id);
  if (target) target.classList.remove('step-hidden');
}

function scrollToStep(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ── CHAR COUNTER ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('user-writing');
  const cc = document.getElementById('char-count');
  if (ta) {
    ta.addEventListener('input', () => {
      cc.textContent = ta.value.length + ' ký tự';
    });
  }

  // Enter key for free input
  const fi = document.getElementById('free-topic-input');
  if (fi) {
    fi.addEventListener('keydown', e => {
      if (e.key === 'Enter') getSuggestions();
    });
  }

  renderLevels();
});
