(() => {
  "use strict";

  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const CACHE_DB_NAME = "adv-standing-picture-movie-tool";
  const CACHE_STORE_NAME = "projects";
  const CACHE_KEY = "autosave";

  const POSITION_PRESETS = {
    left: { x: 470, y: 1040, scale: 1 },
    leftCenter: { x: 720, y: 1040, scale: 1 },
    center: { x: 960, y: 1040, scale: 1 },
    rightCenter: { x: 1200, y: 1040, scale: 1 },
    right: { x: 1450, y: 1040, scale: 1 },
    custom: null
  };

  const $ = (selector) => document.querySelector(selector);


  const LANGUAGE_STORAGE_KEY = "adv-standing-picture-movie-tool-language";
  const SUPPORTED_LANGUAGES = ["ja", "en", "ko"];
  let currentLanguage = SUPPORTED_LANGUAGES.includes(localStorage.getItem(LANGUAGE_STORAGE_KEY))
    ? localStorage.getItem(LANGUAGE_STORAGE_KEY)
    : "ja";

  const I18N_TEXT = {
    "音声に合わせてキャラクター立ち絵・口パク・まばたきを切り替える透過PNG連番生成ツール": {
      en: "A transparent PNG sequence tool for switching character sprites, mouth flaps, and blinks to match audio.",
      ko: "오디오에 맞춰 캐릭터 스탠딩 이미지, 입 모양, 눈 깜빡임을 전환하는 투명 PNG 연번 생성 도구"
    },
    "日本語": { en: "Japanese", ko: "일본어" },
    "取扱説明書": { en: "Manual", ko: "사용 설명서" },
    "JSON保存": { en: "Save JSON", ko: "JSON 저장" },
    "JSON読込": { en: "Load JSON", ko: "JSON 불러오기" },
    "キャッシュ保存": { en: "Save Cache", ko: "캐시 저장" },
    "キャッシュ復元": { en: "Restore Cache", ko: "캐시 복원" },
    "シーン管理": { en: "Scene Management", ko: "장면 관리" },
    "シーン選択": { en: "Scene", ko: "장면 선택" },
    "追加": { en: "Add", ko: "추가" },
    "名前変更": { en: "Rename", ko: "이름 변경" },
    "複製": { en: "Duplicate", ko: "복제" },
    "削除": { en: "Delete", ko: "삭제" },
    "シーンごとに音声・立ち絵キューを保存します。キャラクター素材はプロジェクト共通です。": {
      en: "Audio and sprite cues are saved per scene. Character assets are shared across the project.",
      ko: "오디오와 스탠딩 이미지 큐는 장면별로 저장됩니다. 캐릭터 소재는 프로젝트 공통입니다."
    },
    "音声ファイル登録": { en: "Audio File", ko: "오디오 파일 등록" },
    "音声ファイル": { en: "Audio file", ko: "오디오 파일" },
    "音声未読込：音声を読み込むとJSON保存・キャッシュ保存にも含まれます。": {
      en: "No audio loaded: loaded audio is included in JSON and cache saves.",
      ko: "오디오 미불러옴: 오디오를 불러오면 JSON 저장 및 캐시 저장에 포함됩니다."
    },
    "キャラクター登録": { en: "Character Registration", ko: "캐릭터 등록" },
    "画像素材登録": { en: "Image Asset Registration", ko: "이미지 소재 등록" },
    "画像素材を追加するキャラクター": { en: "Character to add image assets to", ko: "이미지 소재를 추가할 캐릭터" },
    "画像素材名": { en: "Image asset name", ko: "이미지 소재 이름" },
    "画像素材": { en: "Image asset", ko: "이미지 소재" },
    "画像素材名は「通常」「笑顔」「目閉じ」など、用途がわかりやすい名前にすることを推奨します。": {
      en: "Use easy-to-understand names such as Normal, Smile, or Eyes Closed.",
      ko: "기본, 웃는 얼굴, 눈 감음처럼 용도를 알기 쉬운 이름을 권장합니다."
    },
    "画像素材を追加": { en: "Add Image Asset", ko: "이미지 소재 추가" },
    "連番素材登録": { en: "Sequence Asset Registration", ko: "연번 소재 등록" },
    "連番素材を追加するキャラクター": { en: "Character to add sequence assets to", ko: "연번 소재를 추가할 캐릭터" },
    "連番素材名": { en: "Sequence asset name", ko: "연번 소재 이름" },
    "用途": { en: "Use", ko: "용도" },
    "口パク": { en: "Mouth", ko: "입 모양" },
    "まばたき": { en: "Blink", ko: "눈 깜빡임" },
    "汎用": { en: "Generic", ko: "범용" },
    "連番FPS": { en: "Sequence FPS", ko: "연번 FPS" },
    "連番画像ファイル": { en: "Sequence image files", ko: "연번 이미지 파일" },
    "ベース素材・口パク素材・まばたき素材は、同じキャンバスサイズで書き出してください。サイズが一致していれば位置調整なしで重ねて再生できます。ファイル名順に並べて読み込みます。": {
      en: "Export base, mouth, and blink assets at the same canvas size. If sizes match, they can be layered without position adjustment. Files are loaded in filename order.",
      ko: "베이스 소재, 입 모양 소재, 눈 깜빡임 소재는 같은 캔버스 크기로 내보내 주세요. 크기가 같으면 위치 조정 없이 겹쳐 재생할 수 있습니다. 파일명 순서대로 불러옵니다."
    },
    "連番素材を追加": { en: "Add Sequence Asset", ko: "연번 소재 추가" },
    "立ち絵キュー一覧": { en: "Sprite Cue List", ko: "스탠딩 이미지 큐 목록" },
    "プレビュー": { en: "Preview", ko: "미리보기" },
    "プレビュー秒": { en: "Preview Time", ko: "미리보기 시간" },
    "プレビュー更新": { en: "Update Preview", ko: "미리보기 갱신" },
    "表示補助": { en: "View Guides", ko: "표시 보조" },
    "位置調整用グリッドを表示": { en: "Show position grid", ko: "위치 조정용 그리드 표시" },
    "中央・安全範囲ガイドを表示": { en: "Show center / safe-area guides", ko: "중앙・안전 영역 가이드 표시" },
    "グリッドやガイドはプレビュー用です。書き出しPNGには含めません。": {
      en: "Grid and guides are preview-only and are not included in exported PNGs.",
      ko: "그리드와 가이드는 미리보기용이며 내보낸 PNG에는 포함되지 않습니다."
    },
    "書き出し": { en: "Export", ko: "내보내기" },
    "ファイル名接頭辞": { en: "Filename prefix", ko: "파일명 접두사" },
    "書き出し開始秒": { en: "Export start time", ko: "내보내기 시작 시간" },
    "書き出し終了秒": { en: "Export end time", ko: "내보내기 종료 시간" },
    "透過PNG連番ZIPを書き出し": { en: "Export Transparent PNG Sequence ZIP", ko: "투명 PNG 연번 ZIP 내보내기" },
    "1920 × 1080 / 透過PNG / 背景はプレビュー用": {
      en: "1920 × 1080 / Transparent PNG / Background is preview-only",
      ko: "1920 × 1080 / 투명 PNG / 배경은 미리보기용"
    },
    "表示倍率": { en: "Zoom", ko: "표시 배율" },
    "背景": { en: "Background", ko: "배경" },
    "ミント": { en: "Mint", ko: "민트" },
    "白": { en: "White", ko: "흰색" },
    "薄い水色": { en: "Light Blue", ko: "연한 하늘색" },
    "クリーム": { en: "Cream", ko: "크림" },
    "市松": { en: "Checker", ko: "체커" },
    "表示中の立ち絵なし": { en: "No sprite currently visible", ko: "표시 중인 스탠딩 이미지 없음" },
    "キャラ選択": { en: "Character", ko: "캐릭터 선택" },
    "表示画像素材": { en: "Display Image Asset", ko: "표시 이미지 소재" },
    "喋り終わり後の画像素材": { en: "Image After Speech", ko: "대사 종료 후 이미지 소재" },
    "立ち絵の位置": { en: "Sprite Position", ko: "스탠딩 이미지 위치" },
    "左": { en: "Left", ko: "왼쪽" },
    "左寄り": { en: "Left Center", ko: "왼쪽 중간" },
    "中央": { en: "Center", ko: "중앙" },
    "右寄り": { en: "Right Center", ko: "오른쪽 중간" },
    "右": { en: "Right", ko: "오른쪽" },
    "自由指定": { en: "Custom", ko: "자유 지정" },
    "口パク・まばたきは「画像素材」と「連番素材」の両方に対応しています。連番素材は表示中にループ再生され、台詞終了後は自動停止します。": {
      en: "Mouth and blink overlays support both image assets and sequence assets. Sequence assets loop while visible and stop automatically after the speech ends.",
      ko: "입 모양・눈 깜빡임은 이미지 소재와 연번 소재를 모두 지원합니다. 연번 소재는 표시 중 반복 재생되며 대사가 끝나면 자동 정지합니다."
    },
    "なし": { en: "None", ko: "없음" },
    "連番素材": { en: "Sequence Asset", ko: "연번 소재" },
    "口パク画像素材": { en: "Mouth Image Asset", ko: "입 모양 이미지 소재" },
    "口パク連番素材": { en: "Mouth Sequence Asset", ko: "입 모양 연번 소재" },
    "まばたき画像素材": { en: "Blink Image Asset", ko: "눈 깜빡임 이미지 소재" },
    "まばたき連番素材": { en: "Blink Sequence Asset", ko: "눈 깜빡임 연번 소재" },
    "位置・サイズ調整": { en: "Position / Size", ko: "위치・크기 조정" },
    "大きめスライダーで細かく調整できます": { en: "Use the larger sliders for fine adjustment.", ko: "큰 슬라이더로 세밀하게 조정할 수 있습니다." },
    "X位置": { en: "X Position", ko: "X 위치" },
    "下端Y位置": { en: "Bottom Y Position", ko: "하단 Y 위치" },
    "サイズ / 拡大率": { en: "Size / Scale", ko: "크기 / 확대율" },
    "設定項目": { en: "Settings", ko: "설정 항목" },
    "開始秒": { en: "Start Time", ko: "시작 시간" },
    "台詞終了秒": { en: "Speech End Time", ko: "대사 종료 시간" },
    "重なり順": { en: "Layer Order", ko: "겹침 순서" },
    "アニメーション": { en: "Animation", ko: "애니메이션" },
    "未設定": { en: "None", ko: "미설정" },
    "一度だけ小さくジャンプする": { en: "Small one-time jump", ko: "한 번 작게 점프" },
    "プルプル震える": { en: "Tremble", ko: "부르르 떨림" },
    "フェードイン秒": { en: "Fade-in seconds", ko: "페이드 인 시간" },
    "フェードアウト秒": { en: "Fade-out seconds", ko: "페이드 아웃 시간" },
    "ジャンプの大きさ": { en: "Jump Amount", ko: "점프 크기" },
    "ジャンプの速さ": { en: "Jump Speed", ko: "점프 속도" },
    "震えの大きさ": { en: "Shake Amount", ko: "떨림 크기" },
    "震えの速さ": { en: "Shake Speed", ko: "떨림 속도" },
    "入場：開始時にフェードイン": { en: "Entrance: fade in at start", ko: "등장: 시작 시 페이드 인" },
    "退場：台詞終了時にフェードアウト": { en: "Exit: fade out at speech end", ko: "퇴장: 대사 종료 시 페이드 아웃" },
    "退場を入れない場合、台詞終了秒以降は「喋り終わり後の画像素材」に自動で切り替わります。": {
      en: "If Exit is off, the character stays visible after the speech end time and switches to the Image After Speech asset.",
      ko: "퇴장을 넣지 않으면 대사 종료 시간 이후에도 캐릭터가 표시되며 ‘대사 종료 후 이미지 소재’로 자동 전환됩니다."
    },
    "現在時刻を開始へ": { en: "Set Current Time as Start", ko: "현재 시간을 시작으로" },
    "現在時刻を終了へ": { en: "Set Current Time as End", ko: "현재 시간을 종료로" },
    "位置プリセットを反映": { en: "Apply Position Preset", ko: "위치 프리셋 반영" },
    "キュー追加": { en: "Add Cue", ko: "큐 추가" },
    "キュー更新": { en: "Update Cue", ko: "큐 갱신" },
    "編集解除": { en: "Cancel Edit", ko: "편집 해제" },
    "音声に合わせて立ち絵・口パク・まばたき・アニメーションを切り替えるための基本手順です。": {
      en: "Basic steps for switching sprites, mouth flaps, blinks, and animation to match audio.",
      ko: "오디오에 맞춰 스탠딩 이미지, 입 모양, 눈 깜빡임, 애니메이션을 전환하기 위한 기본 절차입니다."
    },
    "閉じる": { en: "Close", ko: "닫기" },
    "1. 基本の流れ": { en: "1. Basic Workflow", ko: "1. 기본 흐름" },
    "「シーン管理」で作業するシーンを作成または選択します。": { en: "Create or select a scene in Scene Management.", ko: "장면 관리에서 작업할 장면을 만들거나 선택합니다." },
    "「音声ファイル登録」で、そのシーンに使う音声を読み込みます。": { en: "Load the audio for that scene in Audio File.", ko: "오디오 파일 등록에서 해당 장면에 사용할 오디오를 불러옵니다." },
    "「キャラクター登録」でキャラクターを追加します。": { en: "Add characters in Character Registration.", ko: "캐릭터 등록에서 캐릭터를 추가합니다." },
    "画像素材・連番素材を登録します。": { en: "Register image assets and sequence assets.", ko: "이미지 소재와 연번 소재를 등록합니다." },
    "右側のキュー入力で、表示画像素材・口パク・まばたき・開始秒・終了秒などを設定します。": { en: "In the cue input panel on the right, set the display image, mouth, blink, start time, end time, and other options.", ko: "오른쪽 큐 입력에서 표시 이미지, 입 모양, 눈 깜빡임, 시작 시간, 종료 시간 등을 설정합니다." },
    "「キュー追加」を押すと、現在のシーンに立ち絵キューが追加されます。": { en: "Press Add Cue to add a sprite cue to the current scene.", ko: "큐 추가를 누르면 현재 장면에 스탠딩 이미지 큐가 추가됩니다." },
    "必要に応じて透過PNG連番ZIPを書き出します。": { en: "Export a transparent PNG sequence ZIP as needed.", ko: "필요에 따라 투명 PNG 연번 ZIP을 내보냅니다." },
    "2. シーン管理": { en: "2. Scene Management", ko: "2. 장면 관리" },
    "1つのプロジェクト内に複数シーンを保存できます。キャラクター素材・画像素材・連番素材はプロジェクト共通、音声ファイルと立ち絵キューはシーンごとに保存されます。": {
      en: "You can save multiple scenes in one project. Character, image, and sequence assets are shared across the project; audio files and sprite cues are saved per scene.",
      ko: "하나의 프로젝트 안에 여러 장면을 저장할 수 있습니다. 캐릭터 소재, 이미지 소재, 연번 소재는 프로젝트 공통이며 오디오 파일과 스탠딩 이미지 큐는 장면별로 저장됩니다."
    },
    "：新しい空シーンを作成します。": { en: ": Creates a new empty scene.", ko: ": 새 빈 장면을 만듭니다." },
    "：選択中のシーン名を変更します。": { en: ": Renames the selected scene.", ko: ": 선택 중인 장면 이름을 변경합니다." },
    "：選択中のシーンの音声・キューをコピーして新しいシーンを作ります。": { en: ": Copies the selected scene's audio and cues into a new scene.", ko: ": 선택 중인 장면의 오디오와 큐를 복사해 새 장면을 만듭니다." },
    "：選択中のシーンを削除します。シーンは最低1つ必要です。": { en: ": Deletes the selected scene. At least one scene is required.", ko: ": 선택 중인 장면을 삭제합니다. 장면은 최소 1개가 필요합니다." },
    "3. 音声ファイル": { en: "3. Audio File", ko: "3. 오디오 파일" },
    "音声はシーンごとに登録されます。JSON保存・キャッシュ保存には読み込んだ音声も含まれるため、次回読み込み直す必要はありません。": {
      en: "Audio is registered per scene. Loaded audio is included in JSON and cache saves, so you do not need to load it again next time.",
      ko: "오디오는 장면별로 등록됩니다. JSON 저장과 캐시 저장에는 불러온 오디오도 포함되므로 다음에 다시 불러올 필요가 없습니다."
    },
    "4. 画像素材と連番素材": { en: "4. Image Assets and Sequence Assets", ko: "4. 이미지 소재와 연번 소재" },
    "は通常立ち絵や喋り終わり後に表示する静止画です。": { en: " are still images used for normal sprites or the image shown after speech.", ko: "는 기본 스탠딩 이미지나 대사 종료 후 표시할 정지 이미지입니다." },
    "は口パクやまばたきのループ再生に使います。": { en: " are used for looping mouth flaps and blinks.", ko: "는 입 모양이나 눈 깜빡임의 반복 재생에 사용합니다." },
    "重要：ベース素材・口パク素材・まばたき素材は、同じキャンバスサイズで書き出してください。サイズが一致していれば、位置調整なしで重ねて再生できます。": {
      en: "Important: Export base, mouth, and blink assets at the same canvas size. If sizes match, they can be layered without position adjustment.",
      ko: "중요: 베이스 소재, 입 모양 소재, 눈 깜빡임 소재는 같은 캔버스 크기로 내보내 주세요. 크기가 같으면 위치 조정 없이 겹쳐 재생할 수 있습니다."
    },
    "連番素材は複数PNGをまとめて選択します。": { en: "Select multiple PNGs together for sequence assets.", ko: "연번 소재는 여러 PNG를 함께 선택합니다." },
    "ファイル名順に読み込まれます。例：mouth_001.png、mouth_002.png、mouth_003.png": { en: "Files are loaded in filename order, e.g. mouth_001.png, mouth_002.png, mouth_003.png.", ko: "파일명 순서대로 불러옵니다. 예: mouth_001.png, mouth_002.png, mouth_003.png" },
    "透過PNG推奨です。": { en: "Transparent PNG is recommended.", ko: "투명 PNG를 권장합니다." },
    "5. キュー設定": { en: "5. Cue Settings", ko: "5. 큐 설정" },
    "：開始秒から表示するベース画像です。": { en: ": The base image shown from the start time.", ko: ": 시작 시간부터 표시할 베이스 이미지입니다." },
    "：台詞終了秒以降に自動で切り替える静止画です。": { en: ": The still image automatically shown after the speech end time.", ko: ": 대사 종료 시간 이후 자동으로 전환할 정지 이미지입니다." },
    "：プリセットまたはスライダーで調整します。": { en: ": Adjust with presets or sliders.", ko: ": 프리셋 또는 슬라이더로 조정합니다." },
    "入場": { en: "Entrance", ko: "등장" },
    "：開始時にフェードインします。": { en: ": Fades in at the start.", ko: ": 시작 시 페이드 인합니다." },
    "退場": { en: "Exit", ko: "퇴장" },
    "：台詞終了時にフェードアウトし、その後は非表示になります。": { en: ": Fades out at the speech end time and then becomes hidden.", ko: ": 대사 종료 시 페이드 아웃하고 이후 비표시됩니다." },
    "退場なし": { en: "No Exit", ko: "퇴장 없음" },
    "：台詞終了後もキャラは表示され続け、喋り終わり後の画像素材に切り替わります。": { en: ": The character remains visible after speech and switches to the Image After Speech asset.", ko: ": 대사 종료 후에도 캐릭터가 표시되며 대사 종료 후 이미지 소재로 전환됩니다." },
    "6. 口パク・まばたき": { en: "6. Mouth / Blink", ko: "6. 입 모양・눈 깜빡임" },
    "口パク・まばたきは、それぞれ「なし」「画像素材」「連番素材」から選べます。": { en: "Mouth and blink can each be set to None, Image Asset, or Sequence Asset.", ko: "입 모양과 눈 깜빡임은 각각 없음, 이미지 소재, 연번 소재 중에서 선택할 수 있습니다." },
    "：セリフ中のみ表示・ループします。台詞終了後は止まります。": { en: ": Displays and loops only during speech, then stops after speech ends.", ko: ": 대사 중에만 표시・반복되며 대사 종료 후 멈춥니다." },
    "：キャラが表示されている間ずっとループします。退場後は止まります。": { en: ": Loops while the character is visible and stops after exit.", ko: ": 캐릭터가 표시되는 동안 계속 반복되며 퇴장 후 멈춥니다." },
    "画像素材を選ぶと、セリフ中または表示中に指定画像を重ねます。": { en: "When Image Asset is selected, the specified image is overlaid during speech or while visible.", ko: "이미지 소재를 선택하면 대사 중 또는 표시 중에 지정 이미지를 겹칩니다." },
    "連番素材を選ぶと、登録したFPSでループ再生します。": { en: "When Sequence Asset is selected, it loops at the registered FPS.", ko: "연번 소재를 선택하면 등록한 FPS로 반복 재생합니다." },
    "7. アニメーション調整": { en: "7. Animation Adjustment", ko: "7. 애니메이션 조정" },
    "キューごとに「一度だけ小さくジャンプする」「プルプル震える」を設定できます。ジャンプ・震えは、それぞれ大きさと速さをスライダーで調整できます。": {
      en: "Each cue can use Small one-time jump or Tremble. Jump and shake amount/speed can be adjusted with sliders.",
      ko: "큐마다 ‘한 번 작게 점프’ 또는 ‘부르르 떨림’을 설정할 수 있습니다. 점프와 떨림은 각각 크기와 속도를 슬라이더로 조정할 수 있습니다."
    },
    "8. プレビューと書き出し": { en: "8. Preview and Export", ko: "8. 미리보기와 내보내기" },
    "プレビュー背景は確認用です。書き出しPNGには入りません。": { en: "The preview background is for checking only and is not included in exported PNGs.", ko: "미리보기 배경은 확인용이며 내보낸 PNG에는 포함되지 않습니다." },
    "表示倍率は作業画面上の見た目だけに影響します。": { en: "Zoom only affects the working preview display.", ko: "표시 배율은 작업 화면의 보기 크기에만 영향을 줍니다." },
    "書き出しPNGは1920×1080の透過PNGです。": { en: "Exported PNGs are 1920×1080 transparent PNGs.", ko: "내보낸 PNG는 1920×1080 투명 PNG입니다." },
    "ZIP書き出しにはJSZipを使用しているため、CDN読み込みが必要です。": { en: "ZIP export uses JSZip, so CDN loading is required.", ko: "ZIP 내보내기는 JSZip을 사용하므로 CDN 로딩이 필요합니다." },
    "9. 保存": { en: "9. Save", ko: "9. 저장" },
    "：プロジェクトをファイルとして保存します。": { en: ": Saves the project as a file.", ko: ": 프로젝트를 파일로 저장합니다." },
    "：保存済みプロジェクトを読み込みます。": { en: ": Loads a saved project.", ko: ": 저장된 프로젝트를 불러옵니다." },
    "：ブラウザ内に一時保存します。": { en: ": Temporarily saves in the browser.", ko: ": 브라우저 안에 임시 저장합니다." },
    "：ブラウザ内の保存データを復元します。": { en: ": Restores saved browser data.", ko: ": 브라우저 안의 저장 데이터를 복원합니다." },
    "シーン名": { en: "Scene name", ko: "장면 이름" },
    "キャラクター名": { en: "Character name", ko: "캐릭터 이름" },
    "通常 / 笑顔 / 目閉じ など": { en: "Normal / Smile / Eyes Closed, etc.", ko: "기본 / 웃는 얼굴 / 눈 감음 등" },
    "通常口パク / 通常まばたき など": { en: "Normal mouth / Normal blink, etc.", ko: "기본 입 모양 / 기본 눈 깜빡임 등" },
    "プレビュー表示設定": { en: "Preview display settings", ko: "미리보기 표시 설정" },
    "音声再生": { en: "Audio playback", ko: "오디오 재생" },
    "立ち絵キュー入力": { en: "Sprite cue input", ko: "스탠딩 이미지 큐 입력" },
    "立ち絵位置・サイズ調整": { en: "Sprite position / size adjustment", ko: "스탠딩 이미지 위치・크기 조정" },
    "アニメーション調整": { en: "Animation adjustment", ko: "애니메이션 조정" },
    "シーン1": { en: "Scene 1", ko: "장면 1" },
    "シーン": { en: "Scene", ko: "장면" },
    "シーン{number}": { en: "Scene {number}", ko: "장면 {number}" },
    "コピー": { en: "Copy", ko: "복사" },
    "現在のシーン": { en: "current scene", ko: "현재 장면" },
    "差分": { en: "variant", ko: "차분" },
    "音声ファイル": { en: "Audio file", ko: "오디오 파일" },
    "音声なし": { en: "No audio", ko: "오디오 없음" },
    "音声あり：{name}": { en: "Audio loaded: {name}", ko: "오디오 있음: {name}" },
    "現在：{name} / キュー{count}件 / {audioText}": { en: "Current: {name} / {count} cues / {audioText}", ko: "현재: {name} / 큐 {count}개 / {audioText}" },
    "保存対象：{name}{size}": { en: "Saved with project: {name}{size}", ko: "저장 대상: {name}{size}" },
    "シーン名を入力してください。": { en: "Please enter a scene name.", ko: "장면 이름을 입력해 주세요." },
    "シーンは最低1つ必要です。": { en: "At least one scene is required.", ko: "장면은 최소 1개가 필요합니다." },
    "{name}を削除しますか？": { en: "Delete {name}?", ko: "{name}을(를) 삭제할까요?" },
    "{name}を削除しますか？関連するキューも削除されます。": { en: "Delete {name}? Related cues will also be deleted.", ko: "{name}을(를) 삭제할까요? 관련 큐도 삭제됩니다." },
    "{name}を削除しますか？関連するキュー設定も解除されます。": { en: "Delete {name}? Related cue settings will be cleared.", ko: "{name}을(를) 삭제할까요? 관련 큐 설정도 해제됩니다." },
    "画像の読み込みに失敗しました": { en: "Failed to load the image.", ko: "이미지를 불러오지 못했습니다." },
    "画像の読み込みに失敗しました。": { en: "Failed to load the image.", ko: "이미지를 불러오지 못했습니다." },
    "キャラクター未登録": { en: "No characters registered", ko: "등록된 캐릭터 없음" },
    "画像素材未登録": { en: "No image assets registered", ko: "등록된 이미지 소재 없음" },
    "同じ画像素材を維持": { en: "Keep same image asset", ko: "같은 이미지 소재 유지" },
    "選択してください": { en: "Select", ko: "선택해 주세요" },
    "連番素材未登録": { en: "No sequence assets registered", ko: "등록된 연번 소재 없음" },
    "キャラクターを登録してください。": { en: "Please register a character.", ko: "캐릭터를 등록해 주세요." },
    "画像素材なし": { en: "No image assets", ko: "이미지 소재 없음" },
    "連番素材なし": { en: "No sequence assets", ko: "연번 소재 없음" },
    "まだ立ち絵キューがありません。": { en: "No sprite cues yet.", ko: "아직 스탠딩 이미지 큐가 없습니다." },
    "未選択": { en: "Not selected", ko: "미선택" },
    "入場": { en: "Entrance", ko: "등장" },
    "終了後：{name}": { en: "After end: {name}", ko: "종료 후: {name}" },
    "同じ画像素材": { en: "same image asset", ko: "같은 이미지 소재" },
    "小ジャンプ": { en: "Small jump", ko: "작은 점프" },
    "震え": { en: "Shake", ko: "떨림" },
    "不明なキャラ": { en: "Unknown character", ko: "알 수 없는 캐릭터" },
    "差分なし": { en: "No variant", ko: "차분 없음" },
    "位置 {x}, {y}": { en: "Position {x}, {y}", ko: "위치 {x}, {y}" },
    "拡大 {scale}": { en: "Scale {scale}", ko: "확대 {scale}" },
    "重なり {layer}": { en: "Layer {layer}", ko: "겹침 {layer}" },
    "{time}で退場": { en: "Exit at {time}", ko: "{time}에 퇴장" },
    "{time}以降は終了後の画像素材": { en: "After {time}: image after speech", ko: "{time} 이후 대사 종료 후 이미지 소재" },
    "時刻へ": { en: "Go to Time", ko: "시간으로" },
    "編集": { en: "Edit", ko: "편집" },
    "キャラクター名を入力してください。": { en: "Please enter a character name.", ko: "캐릭터 이름을 입력해 주세요." },
    "差分を追加するキャラクターを選択してください。": { en: "Please select the character to add a variant to.", ko: "차분을 추가할 캐릭터를 선택해 주세요." },
    "差分名を入力してください。例：笑顔 / 困り顔 / 照れ": { en: "Please enter a variant name, e.g. Smile / Worried / Blush.", ko: "차분 이름을 입력해 주세요. 예: 웃는 얼굴 / 난처한 얼굴 / 부끄러움" },
    "立ち絵画像を選択してください。": { en: "Please select a sprite image.", ko: "스탠딩 이미지 파일을 선택해 주세요." },
    "読み込み中...": { en: "Loading...", ko: "불러오는 중..." },
    "差分を追加": { en: "Add Variant", ko: "차분 추가" },
    "連番素材を追加するキャラクターを選択してください。": { en: "Please select the character to add a sequence asset to.", ko: "연번 소재를 추가할 캐릭터를 선택해 주세요." },
    "連番素材名を入力してください。例：通常口パク / 通常まばたき": { en: "Please enter a sequence asset name, e.g. Normal mouth / Normal blink.", ko: "연번 소재 이름을 입력해 주세요. 예: 기본 입 모양 / 기본 눈 깜빡임" },
    "連番画像ファイルを複数選択してください。": { en: "Please select multiple sequence image files.", ko: "연번 이미지 파일을 여러 개 선택해 주세요." },
    "連番素材の読み込みに失敗しました。": { en: "Failed to load the sequence asset.", ko: "연번 소재를 불러오지 못했습니다." },
    "キャラクターを選択してください。": { en: "Please select a character.", ko: "캐릭터를 선택해 주세요." },
    "表示画像素材を選択してください。": { en: "Please select a display image asset.", ko: "표시 이미지 소재를 선택해 주세요." },
    "喋り終わり後の画像素材を選択し直してください。": { en: "Please reselect the image asset after speech.", ko: "대사 종료 후 이미지 소재를 다시 선택해 주세요." },
    "口パク用の画像素材を選択してください。": { en: "Please select a mouth image asset.", ko: "입 모양용 이미지 소재를 선택해 주세요." },
    "口パク用の連番素材を選択してください。": { en: "Please select a mouth sequence asset.", ko: "입 모양용 연번 소재를 선택해 주세요." },
    "まばたき用の画像素材を選択してください。": { en: "Please select a blink image asset.", ko: "눈 깜빡임용 이미지 소재를 선택해 주세요." },
    "まばたき用の連番素材を選択してください。": { en: "Please select a blink sequence asset.", ko: "눈 깜빡임용 연번 소재를 선택해 주세요." },
    "PNG生成に失敗しました": { en: "Failed to generate PNG.", ko: "PNG 생성에 실패했습니다." },
    "JSZipを読み込めませんでした。ネット接続またはCDN読み込みを確認してください。": { en: "Could not load JSZip. Check your internet connection or CDN loading.", ko: "JSZip을 불러올 수 없습니다. 인터넷 연결 또는 CDN 로딩을 확인해 주세요." },
    "{count}枚のPNGを書き出します。時間がかかる可能性がありますが実行しますか？": { en: "Export {count} PNGs. This may take some time. Continue?", ko: "PNG {count}장을 내보냅니다. 시간이 걸릴 수 있습니다. 실행할까요?" },
    "書き出し準備中...": { en: "Preparing export...", ko: "내보내기 준비 중..." },
    "PNG生成中... {current} / {total}": { en: "Generating PNGs... {current} / {total}", ko: "PNG 생성 중... {current} / {total}" },
    "ZIP生成中...": { en: "Generating ZIP...", ko: "ZIP 생성 중..." },
    "ZIP生成中... {percent}%": { en: "Generating ZIP... {percent}%", ko: "ZIP 생성 중... {percent}%" },
    "完了：{count}枚を書き出しました。": { en: "Done: exported {count} images.", ko: "완료: {count}장을 내보냈습니다." },
    "書き出しに失敗しました。": { en: "Export failed.", ko: "내보내기에 실패했습니다." },
    "取扱説明書はこのブラウザではポップアップ表示に対応していません。README.txtをご確認ください。": { en: "This browser does not support the manual popup. Please check README.txt.", ko: "이 브라우저는 사용 설명서 팝업 표시를 지원하지 않습니다. README.txt를 확인해 주세요." },
    "音声を読み込み中...": { en: "Loading audio...", ko: "오디오 불러오는 중..." },
    "音声ファイルの読み込みに失敗しました。": { en: "Failed to load the audio file.", ko: "오디오 파일을 불러오지 못했습니다." },
    "JSONの読み込みに失敗しました。": { en: "Failed to load JSON.", ko: "JSON을 불러오지 못했습니다." },
    "キャッシュに保存しました。": { en: "Saved to cache.", ko: "캐시에 저장했습니다." },
    "キャッシュ保存に失敗しました。": { en: "Failed to save cache.", ko: "캐시 저장에 실패했습니다." },
    "保存済みキャッシュがありません。": { en: "No saved cache found.", ko: "저장된 캐시가 없습니다." },
    "キャッシュ復元に失敗しました。": { en: "Failed to restore cache.", ko: "캐시 복원에 실패했습니다." },
    "表示中：{names}": { en: "Visible: {names}", ko: "표시 중: {names}" },
    "口:{mode}": { en: "Mouth: {mode}", ko: "입: {mode}" },
    "目:{mode}": { en: "Blink: {mode}", ko: "눈: {mode}" },
    "画像": { en: "Image", ko: "이미지" },
    "連番": { en: "Sequence", ko: "연번" }
  };

  const textNodeOriginals = new WeakMap();

  function translateTemplate(template, params = {}) {
    const translated = currentLanguage === "ja" ? template : (I18N_TEXT[template]?.[currentLanguage] ?? template);
    return translated.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
  }

  function t(text, params = {}) {
    return translateTemplate(text, params);
  }

  function languageLabel(value) {
    if (value === "mouth") return t("口パク");
    if (value === "blink") return t("まばたき");
    if (value === "generic") return t("汎用");
    if (value === "image") return t("画像");
    if (value === "sequence") return t("連番");
    return value;
  }

  function getTranslatedText(originalText) {
    return currentLanguage === "ja" ? originalText : (I18N_TEXT[originalText]?.[currentLanguage] ?? originalText);
  }

  function translateTextNode(node) {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (!textNodeOriginals.has(node)) textNodeOriginals.set(node, trimmed);
    const original = textNodeOriginals.get(node);
    const translated = getTranslatedText(original);
    const leading = raw.match(/^\s*/)?.[0] ?? "";
    const trailing = raw.match(/\s*$/)?.[0] ?? "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function translateAttribute(element, attributeName) {
    if (!element.hasAttribute(attributeName)) return;
    const originalAttribute = `data-i18n-original-${attributeName}`;
    if (!element.hasAttribute(originalAttribute)) {
      element.setAttribute(originalAttribute, element.getAttribute(attributeName));
    }
    const original = element.getAttribute(originalAttribute) ?? "";
    element.setAttribute(attributeName, getTranslatedText(original));
  }

  function applyI18n(root = document.body) {
    document.documentElement.lang = currentLanguage;
    if (languageSelect && languageSelect.value !== currentLanguage) languageSelect.value = currentLanguage;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);

    root.querySelectorAll?.("input[placeholder], textarea[placeholder], [aria-label], [title]").forEach((element) => {
      translateAttribute(element, "placeholder");
      translateAttribute(element, "aria-label");
      translateAttribute(element, "title");
    });
  }


  const languageSelect = $("#languageSelect");
  const openManualBtn = $("#openManualBtn");
  const manualDialog = $("#manualDialog");
  const closeManualBtn = $("#closeManualBtn");

  const canvas = $("#previewCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const canvasWrap = $("#canvasWrap");
  const previewZoomInput = $("#previewZoomInput");
  const previewZoomOutput = $("#previewZoomOutput");
  const previewBgSelect = $("#previewBgSelect");

  const audioInput = $("#audioInput");
  const audioPlayer = $("#audioPlayer");
  const audioStatus = $("#audioStatus");

  const saveJsonBtn = $("#saveJsonBtn");
  const loadJsonInput = $("#loadJsonInput");
  const saveCacheBtn = $("#saveCacheBtn");
  const loadCacheBtn = $("#loadCacheBtn");

  const sceneSelect = $("#sceneSelect");
  const sceneNameInput = $("#sceneNameInput");
  const addSceneBtn = $("#addSceneBtn");
  const renameSceneBtn = $("#renameSceneBtn");
  const duplicateSceneBtn = $("#duplicateSceneBtn");
  const deleteSceneBtn = $("#deleteSceneBtn");
  const sceneStatus = $("#sceneStatus");

  const characterNameInput = $("#characterNameInput");
  const addCharacterBtn = $("#addCharacterBtn");
  const variantCharacterSelect = $("#variantCharacterSelect");
  const variantNameInput = $("#variantNameInput");
  const variantImageInput = $("#variantImageInput");
  const addVariantBtn = $("#addVariantBtn");
  const sequenceCharacterSelect = $("#sequenceCharacterSelect");
  const sequenceNameInput = $("#sequenceNameInput");
  const sequenceTypeSelect = $("#sequenceTypeSelect");
  const sequenceFpsInput = $("#sequenceFpsInput");
  const sequenceImageInput = $("#sequenceImageInput");
  const addSequenceBtn = $("#addSequenceBtn");
  const characterList = $("#characterList");

  const cueList = $("#cueList");
  const cueCharacterSelect = $("#cueCharacterSelect");
  const cueVariantSelect = $("#cueVariantSelect");
  const cueAfterVariantSelect = $("#cueAfterVariantSelect");
  const cueMouthModeSelect = $("#cueMouthModeSelect");
  const cueMouthVariantSelect = $("#cueMouthVariantSelect");
  const cueMouthSequenceSelect = $("#cueMouthSequenceSelect");
  const cueBlinkModeSelect = $("#cueBlinkModeSelect");
  const cueBlinkVariantSelect = $("#cueBlinkVariantSelect");
  const cueBlinkSequenceSelect = $("#cueBlinkSequenceSelect");
  const cuePositionPresetSelect = $("#cuePositionPresetSelect");
  const cueStartInput = $("#cueStartInput");
  const cueEndInput = $("#cueEndInput");
  const cueLayerInput = $("#cueLayerInput");
  const cueXInput = $("#cueXInput");
  const cueYInput = $("#cueYInput");
  const cueScaleInput = $("#cueScaleInput");
  const cueXOutput = $("#cueXOutput");
  const cueYOutput = $("#cueYOutput");
  const cueScaleOutput = $("#cueScaleOutput");
  const cueXNumberInput = $("#cueXNumberInput");
  const cueYNumberInput = $("#cueYNumberInput");
  const cueScaleNumberInput = $("#cueScaleNumberInput");
  const cueAnimationSelect = $("#cueAnimationSelect");
  const cueJumpPowerInput = $("#cueJumpPowerInput");
  const cueJumpSpeedInput = $("#cueJumpSpeedInput");
  const cueShakePowerInput = $("#cueShakePowerInput");
  const cueShakeSpeedInput = $("#cueShakeSpeedInput");
  const cueJumpPowerOutput = $("#cueJumpPowerOutput");
  const cueJumpSpeedOutput = $("#cueJumpSpeedOutput");
  const cueShakePowerOutput = $("#cueShakePowerOutput");
  const cueShakeSpeedOutput = $("#cueShakeSpeedOutput");
  const cueFadeInInput = $("#cueFadeInInput");
  const cueFadeOutInput = $("#cueFadeOutInput");
  const cueEntranceInput = $("#cueEntranceInput");
  const cueExitInput = $("#cueExitInput");
  const setStartFromAudioBtn = $("#setStartFromAudioBtn");
  const setEndFromAudioBtn = $("#setEndFromAudioBtn");
  const applyPositionPresetBtn = $("#applyPositionPresetBtn");
  const addOrUpdateCueBtn = $("#addOrUpdateCueBtn");
  const cancelEditCueBtn = $("#cancelEditCueBtn");

  const previewTimeInput = $("#previewTimeInput");
  const previewTimeRange = $("#previewTimeRange");
  const renderPreviewBtn = $("#renderPreviewBtn");
  const activeCueInfo = $("#activeCueInfo");
  const showGridInput = $("#showGridInput");
  const showSafeAreaInput = $("#showSafeAreaInput");

  const exportFpsInput = $("#exportFpsInput");
  const exportPrefixInput = $("#exportPrefixInput");
  const exportStartInput = $("#exportStartInput");
  const exportEndInput = $("#exportEndInput");
  const exportZipBtn = $("#exportZipBtn");
  const exportProgress = $("#exportProgress");

  const state = {
    characters: [],
    scenes: [],
    currentSceneId: "",
    cues: [],
    editingCueId: null,
    audioObjectUrl: null,
    audioDataUrl: "",
    audioFileName: "",
    audioMimeType: "",
    audioSize: 0,
    lastVariantCharacterId: null,
    lastSequenceCharacterId: null,
    formPreviewEnabled: false,
    settings: {
      showGrid: false,
      showSafeArea: false,
      previewZoom: 40,
      previewBg: "mint"
    }
  };

  let rafId = null;

  function uid(prefix = "id") {
    if (window.crypto && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function trim(value) {
    return String(value ?? "").trim();
  }

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatTime(seconds) {
    const value = Math.max(0, toNumber(seconds, 0));
    return `${value.toFixed(2)}s`;
  }

  function formatBytes(bytes) {
    const size = Math.max(0, toNumber(bytes, 0));
    if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)}MB`;
    if (size >= 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${Math.round(size)}B`;
  }

  function createScene(name = t("シーン1"), source = {}) {
    return {
      id: source.id || uid("scene"),
      name: trim(source.name) || name,
      cues: Array.isArray(source.cues) ? source.cues.map((cue) => ({ ...cue })) : [],
      audioDataUrl: String(source.audioDataUrl ?? source.audio?.dataUrl ?? ""),
      audioFileName: String(source.audioFileName ?? source.audio?.fileName ?? ""),
      audioMimeType: String(source.audioMimeType ?? source.audio?.mimeType ?? ""),
      audioSize: toNumber(source.audioSize ?? source.audio?.size, 0)
    };
  }

  function ensureScenes() {
    if (!Array.isArray(state.scenes) || state.scenes.length === 0) {
      state.scenes = [
        createScene(t("シーン1"), {
          cues: state.cues,
          audioDataUrl: state.audioDataUrl,
          audioFileName: state.audioFileName,
          audioMimeType: state.audioMimeType,
          audioSize: state.audioSize
        })
      ];
    }
    if (!state.currentSceneId || !state.scenes.some((scene) => scene.id === state.currentSceneId)) {
      state.currentSceneId = state.scenes[0].id;
    }
  }

  function getCurrentScene() {
    ensureScenes();
    return state.scenes.find((scene) => scene.id === state.currentSceneId) ?? state.scenes[0];
  }

  function captureCurrentScene() {
    const scene = getCurrentScene();
    if (!scene) return;
    scene.cues = state.cues.map((cue) => ({ ...cue }));
    scene.audioDataUrl = state.audioDataUrl;
    scene.audioFileName = state.audioFileName;
    scene.audioMimeType = state.audioMimeType;
    scene.audioSize = state.audioSize;
  }

  function applySceneToState(scene) {
    state.currentSceneId = scene.id;
    state.cues = (scene.cues ?? []).map((cue) => ({ ...cue }));
    state.audioDataUrl = scene.audioDataUrl || "";
    state.audioFileName = scene.audioFileName || "";
    state.audioMimeType = scene.audioMimeType || "";
    state.audioSize = toNumber(scene.audioSize, 0);
    state.editingCueId = null;
    state.formPreviewEnabled = false;
    if (audioInput) audioInput.value = "";
    setAudioSourceFromState();
    syncPreviewTime(0);
  }

  function populateSceneSelect() {
    ensureScenes();
    if (!sceneSelect) return;
    sceneSelect.innerHTML = state.scenes
      .map((scene, index) => `<option value="${escapeHtml(scene.id)}">${escapeHtml(scene.name || t("シーン{number}", { number: index + 1 }))}</option>`)
      .join("");
    sceneSelect.value = state.currentSceneId;
    const scene = getCurrentScene();
    if (sceneNameInput && document.activeElement !== sceneNameInput) sceneNameInput.value = scene?.name ?? "";
    if (sceneStatus) {
      const cueCount = state.cues.length;
      const audioText = state.audioDataUrl ? t("音声あり：{name}", { name: state.audioFileName || t("音声ファイル") }) : t("音声なし");
      sceneStatus.textContent = t("現在：{name} / キュー{count}件 / {audioText}", { name: scene?.name ?? t("シーン"), count: cueCount, audioText });
    }
  }

  function addScene() {
    captureCurrentScene();
    const currentName = getCurrentScene()?.name ?? "";
    const typedName = trim(sceneNameInput.value);
    const name = typedName && typedName !== currentName ? typedName : t("シーン{number}", { number: state.scenes.length + 1 });
    const scene = createScene(name);
    state.scenes.push(scene);
    applySceneToState(scene);
    renderAll();
  }

  function renameScene() {
    const scene = getCurrentScene();
    const name = trim(sceneNameInput.value);
    if (!name) {
      alert(t("シーン名を入力してください。"));
      return;
    }
    scene.name = name;
    populateSceneSelect();
  }

  function duplicateScene() {
    captureCurrentScene();
    const source = getCurrentScene();
    const copy = createScene(`${source.name || t("シーン")} ${t("コピー")}`, {
      cues: source.cues,
      audioDataUrl: source.audioDataUrl,
      audioFileName: source.audioFileName,
      audioMimeType: source.audioMimeType,
      audioSize: source.audioSize
    });
    state.scenes.push(copy);
    applySceneToState(copy);
    renderAll();
  }

  function deleteScene() {
    ensureScenes();
    if (state.scenes.length <= 1) {
      alert(t("シーンは最低1つ必要です。"));
      return;
    }
    const scene = getCurrentScene();
    const ok = confirm(t("{name}を削除しますか？", { name: scene.name || t("現在のシーン") }));
    if (!ok) return;
    const index = state.scenes.findIndex((item) => item.id === scene.id);
    state.scenes = state.scenes.filter((item) => item.id !== scene.id);
    const nextScene = state.scenes[Math.max(0, Math.min(index, state.scenes.length - 1))];
    applySceneToState(nextScene);
    renderAll();
  }

  function updateSliderOutputs() {
    const xValue = Math.round(toNumber(cueXInput.value, 960));
    const yValue = Math.round(toNumber(cueYInput.value, 1040));
    const scaleValue = Math.max(0.05, toNumber(cueScaleInput.value, 1));

    if (cueXOutput) cueXOutput.value = String(xValue);
    if (cueYOutput) cueYOutput.value = String(yValue);
    if (cueScaleOutput) cueScaleOutput.value = `${Math.round(scaleValue * 100)}%`;

    if (cueXNumberInput && document.activeElement !== cueXNumberInput) cueXNumberInput.value = String(xValue);
    if (cueYNumberInput && document.activeElement !== cueYNumberInput) cueYNumberInput.value = String(yValue);
    if (cueScaleNumberInput && document.activeElement !== cueScaleNumberInput) cueScaleNumberInput.value = scaleValue.toFixed(2);
  }

  function syncSliderFromNumberInput(numberInput, rangeInput, fallback = 0) {
    if (!numberInput || !rangeInput) return;
    const min = Number(rangeInput.min);
    const max = Number(rangeInput.max);
    let value = toNumber(numberInput.value, fallback);
    if (Number.isFinite(min)) value = Math.max(min, value);
    if (Number.isFinite(max)) value = Math.min(max, value);
    rangeInput.value = String(value);
    numberInput.value = rangeInput.step && String(rangeInput.step).includes('.')
      ? Number(value).toFixed(String(rangeInput.step).split('.')[1].length)
      : String(Math.round(value));
  }

  function updateAnimationTuneOutputs() {
    const jumpPower = Math.round(toNumber(cueJumpPowerInput?.value, 42));
    const jumpSpeed = toNumber(cueJumpSpeedInput?.value, 1);
    const shakePower = Math.round(toNumber(cueShakePowerInput?.value, 8));
    const shakeSpeed = toNumber(cueShakeSpeedInput?.value, 1);

    if (cueJumpPowerOutput) cueJumpPowerOutput.value = `${jumpPower}px`;
    if (cueJumpSpeedOutput) cueJumpSpeedOutput.value = `${jumpSpeed.toFixed(1)}x`;
    if (cueShakePowerOutput) cueShakePowerOutput.value = `${shakePower}px`;
    if (cueShakeSpeedOutput) cueShakeSpeedOutput.value = `${shakeSpeed.toFixed(1)}x`;
  }

  function applyPreviewDisplaySettings() {
    const zoom = clamp(Math.round(toNumber(state.settings.previewZoom, 32)), 20, 70);
    const bg = ["mint", "white", "blue", "cream", "checker"].includes(state.settings.previewBg) ? state.settings.previewBg : "mint";

    state.settings.previewZoom = zoom;
    state.settings.previewBg = bg;

    if (previewZoomInput) previewZoomInput.value = String(zoom);
    if (previewZoomOutput) previewZoomOutput.value = `${zoom}%`;
    if (previewBgSelect) previewBgSelect.value = bg;

    canvas.style.width = `${Math.round(CANVAS_WIDTH * zoom / 100)}px`;
    canvas.style.height = "auto";

    if (canvasWrap) {
      canvasWrap.classList.remove(
        "preview-bg-mint",
        "preview-bg-white",
        "preview-bg-blue",
        "preview-bg-cream",
        "preview-bg-checker"
      );
      canvasWrap.classList.add(`preview-bg-${bg}`);
    }
  }

  function findCharacter(characterId) {
    return state.characters.find((character) => character.id === characterId) ?? null;
  }

  function findVariant(characterId, variantId) {
    const character = findCharacter(characterId);
    if (!character) return null;
    return (character.variants ?? []).find((variant) => variant.id === variantId) ?? null;
  }

  function findSequence(characterId, sequenceId) {
    const character = findCharacter(characterId);
    if (!character) return null;
    return (character.sequenceVariants ?? []).find((sequence) => sequence.id === sequenceId) ?? null;
  }

  function compareFileNames(a, b) {
    return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result)));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(file);
    });
  }

  function updateAudioStatus() {
    if (!audioStatus) return;
    if (state.audioDataUrl) {
      const name = state.audioFileName || t("音声ファイル");
      const size = state.audioSize ? ` / ${formatBytes(state.audioSize)}` : "";
      audioStatus.textContent = t("保存対象：{name}{size}", { name, size });
      return;
    }
    audioStatus.textContent = t("音声未読込：音声を読み込むとJSON保存・キャッシュ保存にも含まれます。");
  }

  function setAudioSourceFromState() {
    if (state.audioObjectUrl) {
      URL.revokeObjectURL(state.audioObjectUrl);
      state.audioObjectUrl = null;
    }

    if (state.audioDataUrl) {
      audioPlayer.src = state.audioDataUrl;
      audioPlayer.load();
    } else {
      audioPlayer.removeAttribute("src");
      audioPlayer.load();
    }

    updateAudioStatus();
    setRangeMaxFromDuration();
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", () => reject(new Error(t("画像の読み込みに失敗しました"))));
      img.src = dataUrl;
    });
  }

  async function hydrateImages() {
    const tasks = [];
    for (const character of state.characters) {
      character.variants ??= [];
      character.sequenceVariants ??= [];
      for (const variant of character.variants) {
        if (variant.dataUrl && !variant._img) {
          tasks.push(
            loadImage(variant.dataUrl).then((img) => {
              variant._img = img;
              variant.width = img.naturalWidth;
              variant.height = img.naturalHeight;
            })
          );
        }
      }
      for (const sequence of character.sequenceVariants) {
        sequence.frames ??= [];
        for (const frame of sequence.frames) {
          if (frame.dataUrl && !frame._img) {
            tasks.push(
              loadImage(frame.dataUrl).then((img) => {
                frame._img = img;
                frame.width = img.naturalWidth;
                frame.height = img.naturalHeight;
              })
            );
          }
        }
      }
    }
    await Promise.all(tasks);
  }

  function cleanProject() {
    captureCurrentScene();
    const scenes = state.scenes.map((scene) => ({
      id: scene.id,
      name: scene.name,
      cues: (scene.cues ?? []).map((cue) => ({ ...cue })),
      audio: scene.audioDataUrl
        ? {
            fileName: scene.audioFileName,
            mimeType: scene.audioMimeType,
            size: scene.audioSize,
            dataUrl: scene.audioDataUrl
          }
        : null
    }));

    return {
      version: 2,
      characters: state.characters.map((character) => ({
        id: character.id,
        name: character.name,
        variants: (character.variants ?? []).map((variant) => ({
          id: variant.id,
          name: variant.name,
          fileName: variant.fileName ?? "",
          dataUrl: variant.dataUrl,
          width: variant.width ?? null,
          height: variant.height ?? null
        })),
        sequenceVariants: (character.sequenceVariants ?? []).map((sequence) => ({
          id: sequence.id,
          name: sequence.name,
          type: sequence.type ?? "generic",
          fps: Math.max(1, toNumber(sequence.fps, 8)),
          frames: (sequence.frames ?? []).map((frame) => ({
            fileName: frame.fileName ?? "",
            dataUrl: frame.dataUrl,
            width: frame.width ?? null,
            height: frame.height ?? null
          }))
        }))
      })),
      scenes,
      currentSceneId: state.currentSceneId,
      // 旧形式との互換用：現在のシーンもトップレベルに残します。
      cues: state.cues.map((cue) => ({ ...cue })),
      settings: { ...state.settings },
      audio: state.audioDataUrl
        ? {
            fileName: state.audioFileName,
            mimeType: state.audioMimeType,
            size: state.audioSize,
            dataUrl: state.audioDataUrl
          }
        : null
    };
  }

  async function setProject(project) {
    state.characters = Array.isArray(project.characters) ? project.characters : [];
    state.settings = {
      showGrid: Boolean(project.settings?.showGrid),
      showSafeArea: Boolean(project.settings?.showSafeArea),
      previewZoom: clamp(toNumber(project.settings?.previewZoom, 40), 20, 70),
      previewBg: ["mint", "white", "blue", "cream", "checker"].includes(project.settings?.previewBg) ? project.settings.previewBg : "mint"
    };
    for (const character of state.characters) {
      character.variants ??= [];
      character.sequenceVariants ??= [];
    }

    if (Array.isArray(project.scenes) && project.scenes.length > 0) {
      state.scenes = project.scenes.map((scene, index) => createScene(scene.name || t("シーン{number}", { number: index + 1 }), {
        id: scene.id,
        name: scene.name,
        cues: scene.cues,
        audio: scene.audio
      }));
      state.currentSceneId = project.currentSceneId && state.scenes.some((scene) => scene.id === project.currentSceneId)
        ? project.currentSceneId
        : state.scenes[0].id;
    } else {
      state.scenes = [
        createScene(t("シーン1"), {
          cues: Array.isArray(project.cues) ? project.cues : [],
          audio: project.audio
        })
      ];
      state.currentSceneId = state.scenes[0].id;
    }

    state.editingCueId = null;
    state.formPreviewEnabled = false;
    state.lastVariantCharacterId = state.characters[0]?.id ?? null;
    state.lastSequenceCharacterId = state.characters[0]?.id ?? null;

    const currentScene = getCurrentScene();
    state.cues = (currentScene.cues ?? []).map((cue) => ({ ...cue }));
    state.audioDataUrl = currentScene.audioDataUrl || "";
    state.audioFileName = currentScene.audioFileName || "";
    state.audioMimeType = currentScene.audioMimeType || "";
    state.audioSize = toNumber(currentScene.audioSize, 0);
    if (audioInput) audioInput.value = "";
    setAudioSourceFromState();

    showGridInput.checked = state.settings.showGrid;
    showSafeAreaInput.checked = state.settings.showSafeArea;
    previewZoomInput.value = String(state.settings.previewZoom);
    previewBgSelect.value = state.settings.previewBg;
    applyPreviewDisplaySettings();

    await hydrateImages();
    renderAll();
    syncPreviewTime(0);
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadText(text, fileName, type = "application/json") {
    const blob = new Blob([text], { type });
    downloadBlob(blob, fileName);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB_NAME, 1);
      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME);
        }
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function putCache(value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, "readwrite");
      tx.objectStore(CACHE_STORE_NAME).put(value, CACHE_KEY);
      tx.addEventListener("complete", () => resolve());
      tx.addEventListener("error", () => reject(tx.error));
    });
  }

  async function getCache() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, "readonly");
      const request = tx.objectStore(CACHE_STORE_NAME).get(CACHE_KEY);
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  function populateCharacterSelects() {
    const previousVariantCharacterId = state.lastVariantCharacterId || variantCharacterSelect.value;
    const previousSequenceCharacterId = state.lastSequenceCharacterId || sequenceCharacterSelect.value;
    const previousCueCharacterId = cueCharacterSelect.value;
    const options = state.characters
      .map((character) => `<option value="${escapeHtml(character.id)}">${escapeHtml(character.name)}</option>`)
      .join("");

    variantCharacterSelect.innerHTML = options || `<option value="">${escapeHtml(t("キャラクター未登録"))}</option>`;
    sequenceCharacterSelect.innerHTML = options || `<option value="">${escapeHtml(t("キャラクター未登録"))}</option>`;
    cueCharacterSelect.innerHTML = options || `<option value="">${escapeHtml(t("キャラクター未登録"))}</option>`;

    if (state.characters.length > 0) {
      const variantTarget = findCharacter(previousVariantCharacterId) ? previousVariantCharacterId : state.characters[0].id;
      const sequenceTarget = findCharacter(previousSequenceCharacterId) ? previousSequenceCharacterId : variantTarget;
      const cueTarget = findCharacter(previousCueCharacterId) ? previousCueCharacterId : variantTarget;
      variantCharacterSelect.value = variantTarget;
      sequenceCharacterSelect.value = sequenceTarget;
      cueCharacterSelect.value = cueTarget;
      state.lastVariantCharacterId = variantTarget;
      state.lastSequenceCharacterId = sequenceTarget;
    }

    populateVariantSelect();
    populateSequenceSelects();
    updateOverlayModeVisibility();
  }

  function populateVariantSelect() {
    const previousVariantId = cueVariantSelect.value;
    const previousAfterVariantId = cueAfterVariantSelect.value;
    const previousMouthVariantId = cueMouthVariantSelect.value;
    const previousBlinkVariantId = cueBlinkVariantSelect.value;
    const character = findCharacter(cueCharacterSelect.value);
    const variants = character?.variants ?? [];
    const variantOptions = variants.length
      ? variants.map((variant) => `<option value="${escapeHtml(variant.id)}">${escapeHtml(variant.name)}</option>`).join("")
      : `<option value="">${escapeHtml(t("画像素材未登録"))}</option>`;

    cueVariantSelect.innerHTML = variantOptions;
    cueAfterVariantSelect.innerHTML = variants.length
      ? `<option value="">${escapeHtml(t("同じ画像素材を維持"))}</option>${variantOptions}`
      : `<option value="">${escapeHtml(t("画像素材未登録"))}</option>`;
    cueMouthVariantSelect.innerHTML = variants.length
      ? `<option value="">${escapeHtml(t("選択してください"))}</option>${variantOptions}`
      : `<option value="">${escapeHtml(t("画像素材未登録"))}</option>`;
    cueBlinkVariantSelect.innerHTML = variants.length
      ? `<option value="">${escapeHtml(t("選択してください"))}</option>${variantOptions}`
      : `<option value="">${escapeHtml(t("画像素材未登録"))}</option>`;

    if (variants.length > 0) {
      cueVariantSelect.value = findVariant(character.id, previousVariantId) ? previousVariantId : variants[0].id;
      cueAfterVariantSelect.value = previousAfterVariantId && findVariant(character.id, previousAfterVariantId) ? previousAfterVariantId : "";
      cueMouthVariantSelect.value = previousMouthVariantId && findVariant(character.id, previousMouthVariantId) ? previousMouthVariantId : "";
      cueBlinkVariantSelect.value = previousBlinkVariantId && findVariant(character.id, previousBlinkVariantId) ? previousBlinkVariantId : "";
    }
  }

  function populateSequenceSelects() {
    const previousMouthSequenceId = cueMouthSequenceSelect.value;
    const previousBlinkSequenceId = cueBlinkSequenceSelect.value;
    const character = findCharacter(cueCharacterSelect.value);
    const sequences = character?.sequenceVariants ?? [];

    const toOptions = (type) => {
      const items = sequences.filter((sequence) => sequence.type === type || sequence.type === "generic");
      return items.length
        ? `<option value="">選択してください</option>${items.map((sequence) => `<option value="${escapeHtml(sequence.id)}">${escapeHtml(sequence.name)} / ${escapeHtml(languageLabel(sequence.type ?? "generic"))} / ${Math.max(1, toNumber(sequence.fps, 8))}fps</option>`).join("")}`
        : `<option value="">${escapeHtml(t("連番素材未登録"))}</option>`;
    };

    cueMouthSequenceSelect.innerHTML = toOptions("mouth");
    cueBlinkSequenceSelect.innerHTML = toOptions("blink");

    cueMouthSequenceSelect.value = previousMouthSequenceId && findSequence(cueCharacterSelect.value, previousMouthSequenceId) ? previousMouthSequenceId : "";
    cueBlinkSequenceSelect.value = previousBlinkSequenceId && findSequence(cueCharacterSelect.value, previousBlinkSequenceId) ? previousBlinkSequenceId : "";
  }

  function updateOverlayModeVisibility() {
    document.querySelector('.overlay-mouth-image-field')?.classList.toggle('hidden', cueMouthModeSelect.value !== 'image');
    document.querySelector('.overlay-mouth-sequence-field')?.classList.toggle('hidden', cueMouthModeSelect.value !== 'sequence');
    document.querySelector('.overlay-blink-image-field')?.classList.toggle('hidden', cueBlinkModeSelect.value !== 'image');
    document.querySelector('.overlay-blink-sequence-field')?.classList.toggle('hidden', cueBlinkModeSelect.value !== 'sequence');
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderCharacterList() {
    if (state.characters.length === 0) {
      characterList.innerHTML = `<p class="empty-text">${escapeHtml(t("キャラクターを登録してください。"))}</p>`;
      return;
    }

    characterList.innerHTML = state.characters
      .map((character) => {
        const variants = character.variants ?? [];
        const sequences = character.sequenceVariants ?? [];
        const variantHtml = variants.length
          ? variants.map((variant) => `
                  <div class="variant-chip">
                    <span>${escapeHtml(t("画像"))}：${escapeHtml(variant.name)}</span>
                    <button type="button" class="mini danger" data-action="deleteVariant" data-character-id="${escapeHtml(character.id)}" data-variant-id="${escapeHtml(variant.id)}">×</button>
                  </div>
                `).join("")
          : `<span class="muted-small">${escapeHtml(t("画像素材なし"))}</span>`;
        const sequenceHtml = sequences.length
          ? sequences.map((sequence) => `
                  <div class="variant-chip sequence-chip">
                    <span>${escapeHtml(t("連番"))}：${escapeHtml(sequence.name)} / ${escapeHtml(languageLabel(sequence.type ?? "generic"))} / ${Math.max(1, toNumber(sequence.fps, 8))}fps / ${sequence.frames?.length ?? 0}</span>
                    <button type="button" class="mini danger" data-action="deleteSequence" data-character-id="${escapeHtml(character.id)}" data-sequence-id="${escapeHtml(sequence.id)}">×</button>
                  </div>
                `).join("")
          : `<span class="muted-small">${escapeHtml(t("連番素材なし"))}</span>`;

        return `
          <div class="character-card">
            <div class="character-card-head">
              <strong>${escapeHtml(character.name)}</strong>
              <button type="button" class="mini danger" data-action="deleteCharacter" data-character-id="${escapeHtml(character.id)}">${escapeHtml(t("削除"))}</button>
            </div>
            <div class="variant-chip-list">${variantHtml}</div>
            <div class="variant-chip-list">${sequenceHtml}</div>
          </div>
        `;
      })
      .join("");
  }

  function cueSort(a, b) {
    return a.start - b.start || a.layer - b.layer || a.id.localeCompare(b.id);
  }

  function renderCueList() {
    const cues = [...state.cues].sort(cueSort);
    if (cues.length === 0) {
      cueList.innerHTML = `<p class="empty-text">${escapeHtml(t("まだ立ち絵キューがありません。"))}</p>`;
      return;
    }

    const describeOverlay = (cue, kind) => {
      const mode = cue[`${kind}Mode`] ?? "none";
      if (mode === "image") {
        const variant = findVariant(cue.characterId, cue[`${kind}VariantId`]);
        return `${kind === 'mouth' ? t("口パク") : t("まばたき")}：${t("画像")} / ${variant?.name ?? t("未選択")}`;
      }
      if (mode === "sequence") {
        const sequence = findSequence(cue.characterId, cue[`${kind}SequenceId`]);
        return `${kind === 'mouth' ? t("口パク") : t("まばたき")}：${t("連番")} / ${sequence?.name ?? t("未選択")}`;
      }
      return `${kind === 'mouth' ? t("口パク") : t("まばたき")}：${t("なし")}`;
    };

    cueList.innerHTML = cues
      .map((cue) => {
        const character = findCharacter(cue.characterId);
        const variant = findVariant(cue.characterId, cue.variantId);
        const afterVariant = cue.afterVariantId ? findVariant(cue.characterId, cue.afterVariantId) : null;
        const isEditing = state.editingCueId === cue.id;
        const flags = [
          cue.entrance ? t("入場") : null,
          cue.exit ? t("退場") : t("終了後：{name}", { name: afterVariant?.name ?? variant?.name ?? t("同じ画像素材") }),
          describeOverlay(cue, 'mouth'),
          describeOverlay(cue, 'blink'),
          cue.animation === "jump" ? t("小ジャンプ") : null,
          cue.animation === "shake" ? t("震え") : null
        ].filter(Boolean);

        return `
          <div class="cue-card ${isEditing ? "editing" : ""}">
            <div class="cue-main">
              <strong>${escapeHtml(character?.name ?? t("不明なキャラ"))}</strong>
              <span>${escapeHtml(variant?.name ?? t("画像素材なし"))}</span>
              <small>${formatTime(cue.start)} / ${cue.exit ? `${t("{time}で退場", { time: formatTime(cue.end) })}` : `${t("{time}以降は終了後の画像素材", { time: formatTime(cue.end) })}`}</small>
            </div>
            <div class="cue-meta">
              <span>${escapeHtml(t("位置 {x}, {y}", { x: Math.round(cue.x), y: Math.round(cue.y) }))}</span>
              <span>${escapeHtml(t("拡大 {scale}", { scale: toNumber(cue.scale, 1).toFixed(2) }))}</span>
              <span>${escapeHtml(t("重なり {layer}", { layer: cue.layer }))}</span>
            </div>
            <div class="cue-flags">${flags.map((flag) => `<span>${escapeHtml(flag)}</span>`).join("")}</div>
            <div class="cue-actions">
              <button type="button" class="mini" data-action="previewCue" data-cue-id="${escapeHtml(cue.id)}">${escapeHtml(t("時刻へ"))}</button>
              <button type="button" class="mini" data-action="editCue" data-cue-id="${escapeHtml(cue.id)}">${escapeHtml(t("編集"))}</button>
              <button type="button" class="mini" data-action="duplicateCue" data-cue-id="${escapeHtml(cue.id)}">${escapeHtml(t("複製"))}</button>
              <button type="button" class="mini danger" data-action="deleteCue" data-cue-id="${escapeHtml(cue.id)}">${escapeHtml(t("削除"))}</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function syncFormButtonState() {
    addOrUpdateCueBtn.textContent = state.editingCueId ? t("キュー更新") : t("キュー追加");
    cancelEditCueBtn.disabled = !state.editingCueId;
  }

  function renderAll() {
    populateSceneSelect();
    populateCharacterSelects();
    renderCharacterList();
    renderCueList();
    syncFormButtonState();
    applyPreviewDisplaySettings();
    renderPreview();
    applyI18n();
  }

  function addCharacter() {
    const name = trim(characterNameInput.value);
    if (!name) {
      alert(t("キャラクター名を入力してください。"));
      return;
    }

    const character = {
      id: uid("character"),
      name,
      variants: [],
      sequenceVariants: []
    };
    state.characters.push(character);
    characterNameInput.value = "";
    variantCharacterSelect.value = character.id;
    cueCharacterSelect.value = character.id;
    renderAll();
  }

  async function addVariant() {
    const character = findCharacter(variantCharacterSelect.value);
    if (!character) {
      alert(t("差分を追加するキャラクターを選択してください。"));
      return;
    }

    const name = trim(variantNameInput.value);
    if (!name) {
      alert(t("差分名を入力してください。例：笑顔 / 困り顔 / 照れ"));
      return;
    }

    const file = variantImageInput.files?.[0];
    if (!file) {
      alert(t("立ち絵画像を選択してください。"));
      return;
    }

    try {
      addVariantBtn.disabled = true;
      addVariantBtn.textContent = t("読み込み中...");
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);
      const variant = {
        id: uid("variant"),
        name,
        fileName: file.name,
        dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        _img: img
      };
      character.variants.push(variant);
      variantNameInput.value = "";
      variantImageInput.value = "";
      state.lastVariantCharacterId = character.id;
      state.formPreviewEnabled = true;
      variantCharacterSelect.value = character.id;
      cueCharacterSelect.value = character.id;
      renderAll();
      cueVariantSelect.value = variant.id;
      renderPreview();
    } catch (error) {
      console.error(error);
      alert(t("画像の読み込みに失敗しました。"));
    } finally {
      addVariantBtn.disabled = false;
      addVariantBtn.textContent = t("差分を追加");
    }
  }

  async function addSequence() {
    const character = findCharacter(sequenceCharacterSelect.value);
    if (!character) {
      alert(t("連番素材を追加するキャラクターを選択してください。"));
      return;
    }

    const name = trim(sequenceNameInput.value);
    if (!name) {
      alert(t("連番素材名を入力してください。例：通常口パク / 通常まばたき"));
      return;
    }

    const files = [...(sequenceImageInput.files ?? [])].sort((a, b) => compareFileNames(a.name, b.name));
    if (!files.length) {
      alert(t("連番画像ファイルを複数選択してください。"));
      return;
    }

    try {
      addSequenceBtn.disabled = true;
      addSequenceBtn.textContent = t("読み込み中...");
      const frames = [];
      for (const file of files) {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);
        frames.push({
          fileName: file.name,
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          _img: img
        });
      }
      const sequence = {
        id: uid("sequence"),
        name,
        type: sequenceTypeSelect.value || "generic",
        fps: Math.max(1, Math.round(toNumber(sequenceFpsInput.value, 8))),
        frames
      };
      character.sequenceVariants ??= [];
      character.sequenceVariants.push(sequence);
      sequenceNameInput.value = "";
      sequenceImageInput.value = "";
      sequenceTypeSelect.value = "mouth";
      sequenceFpsInput.value = "8";
      state.lastSequenceCharacterId = character.id;
      state.formPreviewEnabled = true;
      sequenceCharacterSelect.value = character.id;
      cueCharacterSelect.value = character.id;
      renderAll();
      if (sequence.type === 'mouth' || sequence.type === 'generic') cueMouthSequenceSelect.value = sequence.id;
      if (sequence.type === 'blink' || sequence.type === 'generic') cueBlinkSequenceSelect.value = sequence.id;
      renderPreview();
    } catch (error) {
      console.error(error);
      alert(t("連番素材の読み込みに失敗しました。"));
    } finally {
      addSequenceBtn.disabled = false;
      addSequenceBtn.textContent = t("連番素材を追加");
    }
  }

  function deleteSequence(characterId, sequenceId) {
    const character = findCharacter(characterId);
    if (!character) return;
    const sequence = findSequence(characterId, sequenceId);
    const ok = confirm(t("{name}を削除しますか？関連するキュー設定も解除されます。", { name: sequence?.name ?? t("連番素材") }));
    if (!ok) return;

    character.sequenceVariants = (character.sequenceVariants ?? []).filter((item) => item.id !== sequenceId);
    state.cues = state.cues.map((cue) => {
      const next = { ...cue };
      if (next.mouthSequenceId === sequenceId) {
        next.mouthSequenceId = "";
        if (next.mouthMode === "sequence") next.mouthMode = "none";
      }
      if (next.blinkSequenceId === sequenceId) {
        next.blinkSequenceId = "";
        if (next.blinkMode === "sequence") next.blinkMode = "none";
      }
      return next;
    });
    renderAll();
  }

  function deleteCharacter(characterId) {
    const character = findCharacter(characterId);
    if (!character) return;
    const ok = confirm(t("{name}を削除しますか？関連するキューも削除されます。", { name: character.name }));
    if (!ok) return;

    state.characters = state.characters.filter((item) => item.id !== characterId);
    state.cues = state.cues.filter((cue) => cue.characterId !== characterId);
    if (state.editingCueId && !state.cues.some((cue) => cue.id === state.editingCueId)) {
      clearCueForm(false);
    }
    renderAll();
  }

  function deleteVariant(characterId, variantId) {
    const character = findCharacter(characterId);
    if (!character) return;
    const variant = findVariant(characterId, variantId);
    const ok = confirm(t("{name}を削除しますか？関連するキューも削除されます。", { name: variant?.name ?? t("差分") }));
    if (!ok) return;

    character.variants = character.variants.filter((item) => item.id !== variantId);
    state.cues = state.cues
      .filter((cue) => cue.variantId !== variantId)
      .map((cue) => {
        const next = { ...cue };
        if (next.afterVariantId === variantId) next.afterVariantId = "";
        if (next.mouthVariantId === variantId) {
          next.mouthVariantId = "";
          if (next.mouthMode === "image") next.mouthMode = "none";
        }
        if (next.blinkVariantId === variantId) {
          next.blinkVariantId = "";
          if (next.blinkMode === "image") next.blinkMode = "none";
        }
        return next;
      });
    if (state.editingCueId && !state.cues.some((cue) => cue.id === state.editingCueId)) {
      clearCueForm(false);
    }
    renderAll();
  }

  function getCueFromForm({ silent = false, draft = false } = {}) {
    const character = findCharacter(cueCharacterSelect.value);
    if (!character) {
      if (!silent) alert(t("キャラクターを選択してください。"));
      return null;
    }

    const variant = findVariant(character.id, cueVariantSelect.value);
    if (!variant) {
      if (!silent) alert(t("表示画像素材を選択してください。"));
      return null;
    }

    const afterVariantId = cueAfterVariantSelect.value || "";
    if (afterVariantId && !findVariant(character.id, afterVariantId)) {
      if (!silent) alert(t("喋り終わり後の画像素材を選択し直してください。"));
      return null;
    }

    const mouthMode = cueMouthModeSelect.value || 'none';
    const mouthVariantId = cueMouthVariantSelect.value || '';
    const mouthSequenceId = cueMouthSequenceSelect.value || '';
    const blinkMode = cueBlinkModeSelect.value || 'none';
    const blinkVariantId = cueBlinkVariantSelect.value || '';
    const blinkSequenceId = cueBlinkSequenceSelect.value || '';

    if (mouthMode === 'image' && !findVariant(character.id, mouthVariantId)) {
      if (!silent) alert(t("口パク用の画像素材を選択してください。"));
      return null;
    }
    if (mouthMode === 'sequence' && !findSequence(character.id, mouthSequenceId)) {
      if (!silent) alert(t("口パク用の連番素材を選択してください。"));
      return null;
    }
    if (blinkMode === 'image' && !findVariant(character.id, blinkVariantId)) {
      if (!silent) alert(t("まばたき用の画像素材を選択してください。"));
      return null;
    }
    if (blinkMode === 'sequence' && !findSequence(character.id, blinkSequenceId)) {
      if (!silent) alert(t("まばたき用の連番素材を選択してください。"));
      return null;
    }

    const start = Math.max(0, toNumber(cueStartInput.value, 0));
    let end = Math.max(0, toNumber(cueEndInput.value, start + 1));
    if (end < start) end = start;

    return {
      id: state.editingCueId ?? (draft ? "__form-preview-cue__" : uid("cue")),
      characterId: character.id,
      variantId: variant.id,
      afterVariantId,
      mouthMode,
      mouthVariantId,
      mouthSequenceId,
      blinkMode,
      blinkVariantId,
      blinkSequenceId,
      positionPreset: cuePositionPresetSelect.value,
      start,
      end,
      layer: Math.round(toNumber(cueLayerInput.value, 0)),
      x: toNumber(cueXInput.value, 960),
      y: toNumber(cueYInput.value, 1040),
      scale: Math.max(0.05, toNumber(cueScaleInput.value, 1)),
      animation: cueAnimationSelect.value,
      jumpPower: Math.max(0, toNumber(cueJumpPowerInput.value, 42)),
      jumpSpeed: clamp(toNumber(cueJumpSpeedInput.value, 1), 0.2, 3),
      shakePower: Math.max(0, toNumber(cueShakePowerInput.value, 8)),
      shakeSpeed: clamp(toNumber(cueShakeSpeedInput.value, 1), 0.2, 3),
      entrance: cueEntranceInput.checked,
      exit: cueExitInput.checked,
      fadeIn: Math.max(0, toNumber(cueFadeInInput.value, 0.25)),
      fadeOut: Math.max(0, toNumber(cueFadeOutInput.value, 0.25))
    };
  }

  function getPreviewDraftCue() {
    if (!state.editingCueId && !state.formPreviewEnabled) return null;
    return getCueFromForm({ silent: true, draft: true });
  }

  function markFormPreview({ syncToStart = false } = {}) {
    state.formPreviewEnabled = true;
    if (syncToStart && audioPlayer.paused) {
      const start = Math.max(0, toNumber(cueStartInput.value, 0));
      const current = toNumber(previewTimeInput.value, 0);
      const end = Math.max(start, toNumber(cueEndInput.value, start));
      if (current < start || (cueExitInput.checked && current >= end)) {
        syncPreviewTime(start);
        return;
      }
    }
    renderPreview();
  }

  function addOrUpdateCue() {
    const cue = getCueFromForm();
    if (!cue) return;

    const index = state.cues.findIndex((item) => item.id === cue.id);
    if (index >= 0) {
      state.cues.splice(index, 1, cue);
    } else {
      state.cues.push(cue);
    }

    state.editingCueId = null;
    state.formPreviewEnabled = false;
    captureCurrentScene();
    syncPreviewTime(cue.start);
    renderAll();
  }

  function fillCueForm(cue) {
    cueCharacterSelect.value = cue.characterId;
    populateVariantSelect();
    cueVariantSelect.value = cue.variantId;
    cueAfterVariantSelect.value = cue.afterVariantId ?? "";
    cueMouthModeSelect.value = cue.mouthMode ?? "none";
    cueBlinkModeSelect.value = cue.blinkMode ?? "none";
    populateSequenceSelects();
    cueMouthVariantSelect.value = cue.mouthVariantId ?? "";
    cueMouthSequenceSelect.value = cue.mouthSequenceId ?? "";
    cueBlinkVariantSelect.value = cue.blinkVariantId ?? "";
    cueBlinkSequenceSelect.value = cue.blinkSequenceId ?? "";
    updateOverlayModeVisibility();
    cuePositionPresetSelect.value = cue.positionPreset ?? "custom";
    cueStartInput.value = cue.start;
    cueEndInput.value = cue.end;
    cueLayerInput.value = cue.layer;
    cueXInput.value = cue.x;
    cueYInput.value = cue.y;
    cueScaleInput.value = cue.scale;
    updateSliderOutputs();
    cueAnimationSelect.value = cue.animation ?? "none";
    cueJumpPowerInput.value = cue.jumpPower ?? 42;
    cueJumpSpeedInput.value = cue.jumpSpeed ?? 1;
    cueShakePowerInput.value = cue.shakePower ?? 8;
    cueShakeSpeedInput.value = cue.shakeSpeed ?? 1;
    updateAnimationTuneOutputs();
    cueFadeInInput.value = cue.fadeIn ?? 0.25;
    cueFadeOutInput.value = cue.fadeOut ?? 0.25;
    cueEntranceInput.checked = Boolean(cue.entrance);
    cueExitInput.checked = Boolean(cue.exit);
  }

  function editCue(cueId) {
    const cue = state.cues.find((item) => item.id === cueId);
    if (!cue) return;
    state.editingCueId = cue.id;
    fillCueForm(cue);
    syncPreviewTime(cue.start);
    renderAll();
  }

  function duplicateCue(cueId) {
    const cue = state.cues.find((item) => item.id === cueId);
    if (!cue) return;
    const copy = {
      ...cue,
      id: uid("cue"),
      start: Number((cue.start + 0.1).toFixed(2)),
      end: Number((cue.end + 0.1).toFixed(2))
    };
    state.cues.push(copy);
    state.editingCueId = copy.id;
    fillCueForm(copy);
    syncPreviewTime(copy.start);
    renderAll();
  }

  function deleteCue(cueId) {
    state.cues = state.cues.filter((cue) => cue.id !== cueId);
    if (state.editingCueId === cueId) {
      clearCueForm(false);
    }
    captureCurrentScene();
    renderAll();
  }

  function clearCueForm(resetTime = true) {
    state.editingCueId = null;
    state.formPreviewEnabled = false;
    if (state.characters.length > 0) {
      const currentCharacterId = findCharacter(cueCharacterSelect.value) ? cueCharacterSelect.value : state.characters[0].id;
      cueCharacterSelect.value = currentCharacterId;
      populateVariantSelect();
    }
    cuePositionPresetSelect.value = "center";
    cueLayerInput.value = "0";
    cueXInput.value = "960";
    cueYInput.value = "1040";
    cueScaleInput.value = "1";
    updateSliderOutputs();
    cueAnimationSelect.value = "none";
    cueAfterVariantSelect.value = "";
    cueMouthModeSelect.value = "none";
    cueBlinkModeSelect.value = "none";
    cueMouthVariantSelect.value = "";
    cueMouthSequenceSelect.value = "";
    cueBlinkVariantSelect.value = "";
    cueBlinkSequenceSelect.value = "";
    updateOverlayModeVisibility();
    cueJumpPowerInput.value = "42";
    cueJumpSpeedInput.value = "1";
    cueShakePowerInput.value = "8";
    cueShakeSpeedInput.value = "1";
    updateAnimationTuneOutputs();
    cueFadeInInput.value = "0.25";
    cueFadeOutInput.value = "0.25";
    cueEntranceInput.checked = false;
    cueExitInput.checked = false;
    if (resetTime) {
      cueStartInput.value = "0";
      cueEndInput.value = "3";
    }
    renderAll();
  }

  function applyPositionPreset() {
    const preset = POSITION_PRESETS[cuePositionPresetSelect.value];
    if (!preset) return;
    cueXInput.value = preset.x;
    cueYInput.value = preset.y;
    cueScaleInput.value = preset.scale;
    updateSliderOutputs();
    renderPreview();
  }

  function syncPreviewTime(time) {
    const value = Math.max(0, toNumber(time, 0));
    previewTimeInput.value = value.toFixed(2);
    previewTimeRange.value = String(value);
    renderPreview();
  }

  function setRangeMaxFromDuration() {
    const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 30;
    const maxCueEnd = state.cues.reduce((max, cue) => Math.max(max, cue.end, cue.start), 0);
    const max = Math.max(30, duration, maxCueEnd + 1);
    previewTimeRange.max = String(max);
    exportEndInput.value = String(Number.isFinite(audioPlayer.duration) ? audioPlayer.duration.toFixed(2) : exportEndInput.value);
  }

  function getVisibleStates(time, { draftCue = null } = {}) {
    let cues = state.cues;
    if (draftCue) {
      const hasMatchingCue = state.cues.some((cue) => cue.id === draftCue.id);
      cues = hasMatchingCue
        ? state.cues.map((cue) => (cue.id === draftCue.id ? draftCue : cue))
        : [...state.cues, draftCue];
    }

    const visible = new Map();
    const sorted = [...cues].sort(cueSort);

    for (const cue of sorted) {
      if (cue.start > time) continue;

      if (cue.exit && time >= cue.end) {
        // 退場キューは「このキュー自身だけを消す」のではなく、
        // その時点で同じキャラに残っている立ち絵状態を明示的に消す。
        // これをしないと、過去の非退場キューが残り続けて、
        // 退場フェード後に古い立ち絵が復活してしまう。
        visible.delete(cue.characterId);
        continue;
      }

      visible.set(cue.characterId, cue);
    }

    return [...visible.values()].sort((a, b) => a.layer - b.layer || a.x - b.x || a.start - b.start);
  }

  function getDisplayVariantId(cue, time) {
    if (!cue.exit && time >= cue.end && cue.afterVariantId) {
      return cue.afterVariantId;
    }
    return cue.variantId;
  }

  function getCueOpacity(cue, time) {
    let opacity = 1;
    if (cue.entrance && cue.fadeIn > 0 && time < cue.start + cue.fadeIn) {
      opacity = Math.min(opacity, clamp((time - cue.start) / cue.fadeIn, 0, 1));
    }
    if (cue.exit && cue.fadeOut > 0 && time > cue.end - cue.fadeOut) {
      opacity = Math.min(opacity, clamp((cue.end - time) / cue.fadeOut, 0, 1));
    }
    return opacity;
  }

  function getCueOffset(cue, time) {
    const elapsed = Math.max(0, time - cue.start);
    if (cue.animation === "jump") {
      const power = Math.max(0, toNumber(cue.jumpPower, 42));
      const speed = clamp(toNumber(cue.jumpSpeed, 1), 0.2, 3);
      const duration = 0.46 / speed;
      if (elapsed <= duration) {
        const progress = elapsed / duration;
        return { x: 0, y: -power * Math.sin(Math.PI * progress) };
      }
    }

    if (cue.animation === "shake" && time >= cue.start && time <= cue.end) {
      const power = Math.max(0, toNumber(cue.shakePower, 8));
      const speed = clamp(toNumber(cue.shakeSpeed, 1), 0.2, 3);
      return {
        x: Math.sin(elapsed * 62 * speed) * power + Math.sin(elapsed * 37 * speed) * power * 0.38,
        y: Math.sin(elapsed * 83 * speed) * power * 0.5
      };
    }

    return { x: 0, y: 0 };
  }

  function drawGrid() {
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.strokeStyle = "#6fa9cf";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSafeArea() {
    ctx.save();
    ctx.strokeStyle = "#4d9fd8";
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 12]);
    ctx.globalAlpha = 0.58;
    ctx.strokeRect(96, 54, CANVAS_WIDTH - 192, CANVAS_HEIGHT - 108);

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.restore();
  }

  function getSequenceFrame(sequence, time, cueStart) {
    const frames = sequence?.frames ?? [];
    if (!frames.length) return null;
    const fps = Math.max(1, toNumber(sequence?.fps, 8));
    const elapsed = Math.max(0, time - cueStart);
    const index = Math.floor(elapsed * fps) % frames.length;
    return frames[index]?._img ?? null;
  }

  function getOverlayImage(cue, time, kind) {
    if (time < cue.start) return null;

    // 口パクは「セリフ中だけ」再生。
    // まばたきは「キャラが表示されている間」ずっとループ。
    // 退場後は getVisibleStates 側で表示対象から外れるため、ここでは end で止めない。
    if (kind === 'mouth' && time >= cue.end) return null;

    const mode = cue[`${kind}Mode`] ?? 'none';
    if (mode === 'image') {
      return findVariant(cue.characterId, cue[`${kind}VariantId`])?._img ?? null;
    }
    if (mode === 'sequence') {
      const sequence = findSequence(cue.characterId, cue[`${kind}SequenceId`]);
      return getSequenceFrame(sequence, time, cue.start);
    }
    return null;
  }

  function renderAt(time, { includeGuides = true, draftCue = null } = {}) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (includeGuides && state.settings.showGrid) drawGrid();
    if (includeGuides && state.settings.showSafeArea) drawSafeArea();

    const visible = getVisibleStates(time, { draftCue });
    const visibleNames = [];

    for (const cue of visible) {
      const character = findCharacter(cue.characterId);
      const variant = findVariant(cue.characterId, getDisplayVariantId(cue, time));
      const img = variant?._img;
      if (!img) continue;

      const opacity = getCueOpacity(cue, time);
      if (opacity <= 0) continue;

      const offset = getCueOffset(cue, time);
      const scale = Math.max(0.05, toNumber(cue.scale, 1));
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      const x = toNumber(cue.x, 960) - width / 2 + offset.x;
      const y = toNumber(cue.y, 1040) - height + offset.y;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, x, y, width, height);

      const mouthOverlay = getOverlayImage(cue, time, 'mouth');
      if (mouthOverlay) ctx.drawImage(mouthOverlay, x, y, width, height);
      const blinkOverlay = getOverlayImage(cue, time, 'blink');
      if (blinkOverlay) ctx.drawImage(blinkOverlay, x, y, width, height);
      ctx.restore();

      const activeOverlays = [];
      if (cue.mouthMode && cue.mouthMode !== 'none' && time >= cue.start && time < cue.end) activeOverlays.push(t("口:{mode}", { mode: cue.mouthMode === 'image' ? t("画像") : t("連番") }));
      if (cue.blinkMode && cue.blinkMode !== 'none' && time >= cue.start) activeOverlays.push(t("目:{mode}", { mode: cue.blinkMode === 'image' ? t("画像") : t("連番") }));
      visibleNames.push(`${character?.name ?? t("不明なキャラ")}：${variant?.name ?? t("差分なし")}${activeOverlays.length ? ` (${activeOverlays.join(' / ')})` : ''}`);
    }

    if (includeGuides) {
      activeCueInfo.textContent = visibleNames.length ? t("表示中：{names}", { names: visibleNames.join(" / ") }) : t("表示中の立ち絵なし");
    }
  }

  function renderPreview() {
    const time = toNumber(previewTimeInput.value, 0);
    const draftCue = getPreviewDraftCue();
    renderAt(time, { includeGuides: true, draftCue });
  }

  function startAudioLoop() {
    stopAudioLoop();
    const tick = () => {
      if (!audioPlayer.paused && !audioPlayer.ended) {
        syncPreviewTime(audioPlayer.currentTime);
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopAudioLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function canvasToBlob() {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error(t("PNG生成に失敗しました")));
      }, "image/png");
    });
  }

  async function exportZip() {
    if (!window.JSZip) {
      alert(t("JSZipを読み込めませんでした。ネット接続またはCDN読み込みを確認してください。"));
      return;
    }

    const fps = clamp(Math.round(toNumber(exportFpsInput.value, 30)), 1, 60);
    const start = Math.max(0, toNumber(exportStartInput.value, 0));
    const end = Math.max(start, toNumber(exportEndInput.value, start + 1));
    const prefix = trim(exportPrefixInput.value) || "standing";
    const frameCount = Math.max(1, Math.floor((end - start) * fps) + 1);

    if (frameCount > 1800) {
      const ok = confirm(t("{count}枚のPNGを書き出します。時間がかかる可能性がありますが実行しますか？", { count: frameCount }));
      if (!ok) return;
    }

    exportZipBtn.disabled = true;
    exportProgress.textContent = t("書き出し準備中...");

    try {
      const zip = new JSZip();
      for (let i = 0; i < frameCount; i += 1) {
        const time = start + i / fps;
        renderAt(time, { includeGuides: false });
        const blob = await canvasToBlob();
        const number = String(i + 1).padStart(6, "0");
        zip.file(`${prefix}_${number}.png`, blob);

        if (i % 5 === 0 || i === frameCount - 1) {
          exportProgress.textContent = t("PNG生成中... {current} / {total}", { current: i + 1, total: frameCount });
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      exportProgress.textContent = t("ZIP生成中...");
      const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
        exportProgress.textContent = t("ZIP生成中... {percent}%", { percent: metadata.percent.toFixed(0) });
      });
      downloadBlob(zipBlob, `${prefix}_png_sequence.zip`);
      exportProgress.textContent = t("完了：{count}枚を書き出しました。", { count: frameCount });
    } catch (error) {
      console.error(error);
      alert(t("書き出しに失敗しました。"));
      exportProgress.textContent = t("書き出しに失敗しました。");
    } finally {
      exportZipBtn.disabled = false;
      renderPreview();
    }
  }

  function updateCuePositionByCanvasClick(event) {
    if (!state.editingCueId && !findCharacter(cueCharacterSelect.value)) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    cueXInput.value = Math.round((event.clientX - rect.left) * scaleX);
    cueYInput.value = Math.round((event.clientY - rect.top) * scaleY);
    updateSliderOutputs();
    cuePositionPresetSelect.value = "custom";
    markFormPreview({ syncToStart: true });
  }

  function bindEvents() {
    languageSelect?.addEventListener("change", () => {
      const nextLanguage = SUPPORTED_LANGUAGES.includes(languageSelect.value) ? languageSelect.value : "ja";
      currentLanguage = nextLanguage;
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
      renderAll();
      applyI18n();
    });

    openManualBtn?.addEventListener("click", () => {
      if (manualDialog?.showModal) {
        manualDialog.showModal();
      } else {
        alert(t("取扱説明書はこのブラウザではポップアップ表示に対応していません。README.txtをご確認ください。"));
      }
    });
    closeManualBtn?.addEventListener("click", () => manualDialog?.close());
    manualDialog?.addEventListener("click", (event) => {
      if (event.target === manualDialog) manualDialog.close();
    });

    sceneSelect.addEventListener("change", () => {
      captureCurrentScene();
      const scene = state.scenes.find((item) => item.id === sceneSelect.value);
      if (!scene) return;
      applySceneToState(scene);
      renderAll();
    });
    addSceneBtn.addEventListener("click", addScene);
    renameSceneBtn.addEventListener("click", renameScene);
    duplicateSceneBtn.addEventListener("click", duplicateScene);
    deleteSceneBtn.addEventListener("click", deleteScene);
    sceneNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") renameScene();
    });

    audioInput.addEventListener("change", async () => {
      const file = audioInput.files?.[0];
      if (!file) return;

      try {
        audioInput.disabled = true;
        if (audioStatus) audioStatus.textContent = t("音声を読み込み中...");
        const dataUrl = await readFileAsDataURL(file);
        state.audioDataUrl = dataUrl;
        state.audioFileName = file.name;
        state.audioMimeType = file.type || "audio/*";
        state.audioSize = file.size;
        setAudioSourceFromState();
        captureCurrentScene();
        populateSceneSelect();
      } catch (error) {
        console.error(error);
        alert(t("音声ファイルの読み込みに失敗しました。"));
        updateAudioStatus();
      } finally {
        audioInput.disabled = false;
      }
    });

    audioPlayer.addEventListener("loadedmetadata", setRangeMaxFromDuration);
    audioPlayer.addEventListener("play", startAudioLoop);
    audioPlayer.addEventListener("pause", stopAudioLoop);
    audioPlayer.addEventListener("ended", stopAudioLoop);
    audioPlayer.addEventListener("seeked", () => syncPreviewTime(audioPlayer.currentTime));
    audioPlayer.addEventListener("timeupdate", () => {
      if (audioPlayer.paused) syncPreviewTime(audioPlayer.currentTime);
    });

    saveJsonBtn.addEventListener("click", () => {
      const json = JSON.stringify(cleanProject(), null, 2);
      downloadText(json, "standing-picture-project.json");
    });

    loadJsonInput.addEventListener("change", async () => {
      const file = loadJsonInput.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const project = JSON.parse(text);
        await setProject(project);
        loadJsonInput.value = "";
      } catch (error) {
        console.error(error);
        alert(t("JSONの読み込みに失敗しました。"));
      }
    });

    saveCacheBtn.addEventListener("click", async () => {
      try {
        await putCache(cleanProject());
        alert(t("キャッシュに保存しました。"));
      } catch (error) {
        console.error(error);
        alert(t("キャッシュ保存に失敗しました。"));
      }
    });

    loadCacheBtn.addEventListener("click", async () => {
      try {
        const project = await getCache();
        if (!project) {
          alert(t("保存済みキャッシュがありません。"));
          return;
        }
        await setProject(project);
      } catch (error) {
        console.error(error);
        alert(t("キャッシュ復元に失敗しました。"));
      }
    });

    addCharacterBtn.addEventListener("click", addCharacter);
    characterNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addCharacter();
    });
    addVariantBtn.addEventListener("click", addVariant);
    addSequenceBtn.addEventListener("click", addSequence);

    characterList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action === "deleteCharacter") deleteCharacter(button.dataset.characterId);
      if (action === "deleteVariant") deleteVariant(button.dataset.characterId, button.dataset.variantId);
      if (action === "deleteSequence") deleteSequence(button.dataset.characterId, button.dataset.sequenceId);
    });

    variantCharacterSelect.addEventListener("change", () => {
      state.lastVariantCharacterId = variantCharacterSelect.value;
    });
    sequenceCharacterSelect.addEventListener("change", () => {
      state.lastSequenceCharacterId = sequenceCharacterSelect.value;
    });

    cueCharacterSelect.addEventListener("change", () => {
      populateVariantSelect();
      populateSequenceSelects();
      updateOverlayModeVisibility();
      markFormPreview({ syncToStart: true });
    });

    cuePositionPresetSelect.addEventListener("change", () => {
      applyPositionPreset();
      markFormPreview({ syncToStart: true });
    });
    applyPositionPresetBtn.addEventListener("click", () => {
      applyPositionPreset();
      markFormPreview({ syncToStart: true });
    });

    setStartFromAudioBtn.addEventListener("click", () => {
      cueStartInput.value = audioPlayer.currentTime.toFixed(2);
      markFormPreview({ syncToStart: true });
      syncPreviewTime(audioPlayer.currentTime);
    });

    setEndFromAudioBtn.addEventListener("click", () => {
      cueEndInput.value = audioPlayer.currentTime.toFixed(2);
      markFormPreview({ syncToStart: false });
      syncPreviewTime(audioPlayer.currentTime);
    });

    addOrUpdateCueBtn.addEventListener("click", addOrUpdateCue);
    cancelEditCueBtn.addEventListener("click", () => clearCueForm(false));

    cueList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      const cueId = button.dataset.cueId;
      if (action === "previewCue") {
        const cue = state.cues.find((item) => item.id === cueId);
        if (cue) syncPreviewTime(cue.start);
      }
      if (action === "editCue") editCue(cueId);
      if (action === "duplicateCue") duplicateCue(cueId);
      if (action === "deleteCue") deleteCue(cueId);
    });

    previewTimeInput.addEventListener("input", () => {
      previewTimeRange.value = previewTimeInput.value;
      renderPreview();
    });
    previewTimeRange.addEventListener("input", () => {
      previewTimeInput.value = Number(previewTimeRange.value).toFixed(2);
      renderPreview();
    });
    renderPreviewBtn.addEventListener("click", renderPreview);

    showGridInput.addEventListener("change", () => {
      state.settings.showGrid = showGridInput.checked;
      renderPreview();
    });
    showSafeAreaInput.addEventListener("change", () => {
      state.settings.showSafeArea = showSafeAreaInput.checked;
      renderPreview();
    });

    previewZoomInput.addEventListener("input", () => {
      state.settings.previewZoom = toNumber(previewZoomInput.value, 40);
      applyPreviewDisplaySettings();
    });

    previewBgSelect.addEventListener("change", () => {
      state.settings.previewBg = previewBgSelect.value;
      applyPreviewDisplaySettings();
    });

    [cueMouthModeSelect, cueBlinkModeSelect].forEach((select) => {
      select.addEventListener("change", () => {
        updateOverlayModeVisibility();
        markFormPreview({ syncToStart: true });
      });
    });

    [
      [cueXNumberInput, cueXInput, 960],
      [cueYNumberInput, cueYInput, 1040],
      [cueScaleNumberInput, cueScaleInput, 1]
    ].forEach(([numberInput, rangeInput, fallback]) => {
      if (!numberInput || !rangeInput) return;

      numberInput.addEventListener("input", () => {
        syncSliderFromNumberInput(numberInput, rangeInput, fallback);
        updateSliderOutputs();
        cuePositionPresetSelect.value = "custom";
        markFormPreview({ syncToStart: true });
      });

      numberInput.addEventListener("change", () => {
        syncSliderFromNumberInput(numberInput, rangeInput, fallback);
        updateSliderOutputs();
        cuePositionPresetSelect.value = "custom";
        markFormPreview({ syncToStart: true });
      });
    });

    [
      cueStartInput,
      cueEndInput,
      cueLayerInput,
      cueXInput,
      cueYInput,
      cueScaleInput,
      cueFadeInInput,
      cueFadeOutInput,
      cueAnimationSelect,
      cueJumpPowerInput,
      cueJumpSpeedInput,
      cueShakePowerInput,
      cueShakeSpeedInput,
      cueEntranceInput,
      cueExitInput,
      cueVariantSelect,
      cueAfterVariantSelect,
      cueMouthVariantSelect,
      cueMouthSequenceSelect,
      cueBlinkVariantSelect,
      cueBlinkSequenceSelect
    ].forEach((element) => {
      const eventName = element.tagName === "SELECT" || element.type === "checkbox" ? "change" : "input";
      element.addEventListener(eventName, () => {
        if (element === cueXInput || element === cueYInput || element === cueScaleInput) {
          updateSliderOutputs();
          cuePositionPresetSelect.value = "custom";
        }
        if (
          element === cueJumpPowerInput ||
          element === cueJumpSpeedInput ||
          element === cueShakePowerInput ||
          element === cueShakeSpeedInput
        ) {
          updateAnimationTuneOutputs();
        }
        markFormPreview({ syncToStart: true });
      });
    });

    exportZipBtn.addEventListener("click", exportZip);
    canvas.addEventListener("click", updateCuePositionByCanvasClick);
  }

  async function init() {
    if (languageSelect) languageSelect.value = currentLanguage;
    ensureScenes();
    applySceneToState(getCurrentScene());
    bindEvents();
    clearCueForm(false);
    updateAudioStatus();
    renderAll();
  }

  init();
})();
