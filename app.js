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

  function createScene(name = "シーン1", source = {}) {
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
        createScene("シーン1", {
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
      .map((scene, index) => `<option value="${escapeHtml(scene.id)}">${escapeHtml(scene.name || `シーン${index + 1}`)}</option>`)
      .join("");
    sceneSelect.value = state.currentSceneId;
    const scene = getCurrentScene();
    if (sceneNameInput && document.activeElement !== sceneNameInput) sceneNameInput.value = scene?.name ?? "";
    if (sceneStatus) {
      const cueCount = state.cues.length;
      const audioText = state.audioDataUrl ? `音声あり：${state.audioFileName || "音声ファイル"}` : "音声なし";
      sceneStatus.textContent = `現在：${scene?.name ?? "シーン"} / キュー${cueCount}件 / ${audioText}`;
    }
  }

  function addScene() {
    captureCurrentScene();
    const currentName = getCurrentScene()?.name ?? "";
    const typedName = trim(sceneNameInput.value);
    const name = typedName && typedName !== currentName ? typedName : `シーン${state.scenes.length + 1}`;
    const scene = createScene(name);
    state.scenes.push(scene);
    applySceneToState(scene);
    renderAll();
  }

  function renameScene() {
    const scene = getCurrentScene();
    const name = trim(sceneNameInput.value);
    if (!name) {
      alert("シーン名を入力してください。");
      return;
    }
    scene.name = name;
    populateSceneSelect();
  }

  function duplicateScene() {
    captureCurrentScene();
    const source = getCurrentScene();
    const copy = createScene(`${source.name || "シーン"} コピー`, {
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
      alert("シーンは最低1つ必要です。");
      return;
    }
    const scene = getCurrentScene();
    const ok = confirm(`${scene.name || "現在のシーン"}を削除しますか？`);
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
      const name = state.audioFileName || "音声ファイル";
      const size = state.audioSize ? ` / ${formatBytes(state.audioSize)}` : "";
      audioStatus.textContent = `保存対象：${name}${size}`;
      return;
    }
    audioStatus.textContent = "音声未読込：音声を読み込むとJSON保存・キャッシュ保存にも含まれます。";
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
      img.addEventListener("error", () => reject(new Error("画像の読み込みに失敗しました")));
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
      state.scenes = project.scenes.map((scene, index) => createScene(scene.name || `シーン${index + 1}`, {
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
        createScene("シーン1", {
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

    variantCharacterSelect.innerHTML = options || `<option value="">キャラクター未登録</option>`;
    sequenceCharacterSelect.innerHTML = options || `<option value="">キャラクター未登録</option>`;
    cueCharacterSelect.innerHTML = options || `<option value="">キャラクター未登録</option>`;

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
      : `<option value="">画像素材未登録</option>`;

    cueVariantSelect.innerHTML = variantOptions;
    cueAfterVariantSelect.innerHTML = variants.length
      ? `<option value="">同じ画像素材を維持</option>${variantOptions}`
      : `<option value="">画像素材未登録</option>`;
    cueMouthVariantSelect.innerHTML = variants.length
      ? `<option value="">選択してください</option>${variantOptions}`
      : `<option value="">画像素材未登録</option>`;
    cueBlinkVariantSelect.innerHTML = variants.length
      ? `<option value="">選択してください</option>${variantOptions}`
      : `<option value="">画像素材未登録</option>`;

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
        ? `<option value="">選択してください</option>${items.map((sequence) => `<option value="${escapeHtml(sequence.id)}">${escapeHtml(sequence.name)} / ${escapeHtml(sequence.type ?? "generic")} / ${Math.max(1, toNumber(sequence.fps, 8))}fps</option>`).join("")}`
        : `<option value="">連番素材未登録</option>`;
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
      characterList.innerHTML = `<p class="empty-text">キャラクターを登録してください。</p>`;
      return;
    }

    characterList.innerHTML = state.characters
      .map((character) => {
        const variants = character.variants ?? [];
        const sequences = character.sequenceVariants ?? [];
        const variantHtml = variants.length
          ? variants.map((variant) => `
                  <div class="variant-chip">
                    <span>画像：${escapeHtml(variant.name)}</span>
                    <button type="button" class="mini danger" data-action="deleteVariant" data-character-id="${escapeHtml(character.id)}" data-variant-id="${escapeHtml(variant.id)}">×</button>
                  </div>
                `).join("")
          : `<span class="muted-small">画像素材なし</span>`;
        const sequenceHtml = sequences.length
          ? sequences.map((sequence) => `
                  <div class="variant-chip sequence-chip">
                    <span>連番：${escapeHtml(sequence.name)} / ${escapeHtml(sequence.type ?? "generic")} / ${Math.max(1, toNumber(sequence.fps, 8))}fps / ${sequence.frames?.length ?? 0}枚</span>
                    <button type="button" class="mini danger" data-action="deleteSequence" data-character-id="${escapeHtml(character.id)}" data-sequence-id="${escapeHtml(sequence.id)}">×</button>
                  </div>
                `).join("")
          : `<span class="muted-small">連番素材なし</span>`;

        return `
          <div class="character-card">
            <div class="character-card-head">
              <strong>${escapeHtml(character.name)}</strong>
              <button type="button" class="mini danger" data-action="deleteCharacter" data-character-id="${escapeHtml(character.id)}">削除</button>
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
      cueList.innerHTML = `<p class="empty-text">まだ立ち絵キューがありません。</p>`;
      return;
    }

    const describeOverlay = (cue, kind) => {
      const mode = cue[`${kind}Mode`] ?? "none";
      if (mode === "image") {
        const variant = findVariant(cue.characterId, cue[`${kind}VariantId`]);
        return `${kind === 'mouth' ? '口パク' : 'まばたき'}：画像 / ${variant?.name ?? '未選択'}`;
      }
      if (mode === "sequence") {
        const sequence = findSequence(cue.characterId, cue[`${kind}SequenceId`]);
        return `${kind === 'mouth' ? '口パク' : 'まばたき'}：連番 / ${sequence?.name ?? '未選択'}`;
      }
      return `${kind === 'mouth' ? '口パク' : 'まばたき'}：なし`;
    };

    cueList.innerHTML = cues
      .map((cue) => {
        const character = findCharacter(cue.characterId);
        const variant = findVariant(cue.characterId, cue.variantId);
        const afterVariant = cue.afterVariantId ? findVariant(cue.characterId, cue.afterVariantId) : null;
        const isEditing = state.editingCueId === cue.id;
        const flags = [
          cue.entrance ? "入場" : null,
          cue.exit ? "退場" : `終了後：${afterVariant?.name ?? variant?.name ?? "同じ画像素材"}`,
          describeOverlay(cue, 'mouth'),
          describeOverlay(cue, 'blink'),
          cue.animation === "jump" ? "小ジャンプ" : null,
          cue.animation === "shake" ? "震え" : null
        ].filter(Boolean);

        return `
          <div class="cue-card ${isEditing ? "editing" : ""}">
            <div class="cue-main">
              <strong>${escapeHtml(character?.name ?? "不明なキャラ")}</strong>
              <span>${escapeHtml(variant?.name ?? "画像素材なし")}</span>
              <small>${formatTime(cue.start)} / ${cue.exit ? `${formatTime(cue.end)}で退場` : `${formatTime(cue.end)}以降は終了後の画像素材`}</small>
            </div>
            <div class="cue-meta">
              <span>位置 ${Math.round(cue.x)}, ${Math.round(cue.y)}</span>
              <span>拡大 ${toNumber(cue.scale, 1).toFixed(2)}</span>
              <span>重なり ${cue.layer}</span>
            </div>
            <div class="cue-flags">${flags.map((flag) => `<span>${escapeHtml(flag)}</span>`).join("")}</div>
            <div class="cue-actions">
              <button type="button" class="mini" data-action="previewCue" data-cue-id="${escapeHtml(cue.id)}">時刻へ</button>
              <button type="button" class="mini" data-action="editCue" data-cue-id="${escapeHtml(cue.id)}">編集</button>
              <button type="button" class="mini" data-action="duplicateCue" data-cue-id="${escapeHtml(cue.id)}">複製</button>
              <button type="button" class="mini danger" data-action="deleteCue" data-cue-id="${escapeHtml(cue.id)}">削除</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function syncFormButtonState() {
    addOrUpdateCueBtn.textContent = state.editingCueId ? "キュー更新" : "キュー追加";
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
  }

  function addCharacter() {
    const name = trim(characterNameInput.value);
    if (!name) {
      alert("キャラクター名を入力してください。");
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
      alert("差分を追加するキャラクターを選択してください。");
      return;
    }

    const name = trim(variantNameInput.value);
    if (!name) {
      alert("差分名を入力してください。例：笑顔 / 困り顔 / 照れ");
      return;
    }

    const file = variantImageInput.files?.[0];
    if (!file) {
      alert("立ち絵画像を選択してください。");
      return;
    }

    try {
      addVariantBtn.disabled = true;
      addVariantBtn.textContent = "読み込み中...";
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
      alert("画像の読み込みに失敗しました。");
    } finally {
      addVariantBtn.disabled = false;
      addVariantBtn.textContent = "差分を追加";
    }
  }

  async function addSequence() {
    const character = findCharacter(sequenceCharacterSelect.value);
    if (!character) {
      alert("連番素材を追加するキャラクターを選択してください。");
      return;
    }

    const name = trim(sequenceNameInput.value);
    if (!name) {
      alert("連番素材名を入力してください。例：通常口パク / 通常まばたき");
      return;
    }

    const files = [...(sequenceImageInput.files ?? [])].sort((a, b) => compareFileNames(a.name, b.name));
    if (!files.length) {
      alert("連番画像ファイルを複数選択してください。");
      return;
    }

    try {
      addSequenceBtn.disabled = true;
      addSequenceBtn.textContent = "読み込み中...";
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
      alert("連番素材の読み込みに失敗しました。");
    } finally {
      addSequenceBtn.disabled = false;
      addSequenceBtn.textContent = "連番素材を追加";
    }
  }

  function deleteSequence(characterId, sequenceId) {
    const character = findCharacter(characterId);
    if (!character) return;
    const sequence = findSequence(characterId, sequenceId);
    const ok = confirm(`${sequence?.name ?? "連番素材"}を削除しますか？関連するキュー設定も解除されます。`);
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
    const ok = confirm(`${character.name}を削除しますか？関連するキューも削除されます。`);
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
    const ok = confirm(`${variant?.name ?? "差分"}を削除しますか？関連するキューも削除されます。`);
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
      if (!silent) alert("キャラクターを選択してください。");
      return null;
    }

    const variant = findVariant(character.id, cueVariantSelect.value);
    if (!variant) {
      if (!silent) alert("表示画像素材を選択してください。");
      return null;
    }

    const afterVariantId = cueAfterVariantSelect.value || "";
    if (afterVariantId && !findVariant(character.id, afterVariantId)) {
      if (!silent) alert("喋り終わり後の画像素材を選択し直してください。");
      return null;
    }

    const mouthMode = cueMouthModeSelect.value || 'none';
    const mouthVariantId = cueMouthVariantSelect.value || '';
    const mouthSequenceId = cueMouthSequenceSelect.value || '';
    const blinkMode = cueBlinkModeSelect.value || 'none';
    const blinkVariantId = cueBlinkVariantSelect.value || '';
    const blinkSequenceId = cueBlinkSequenceSelect.value || '';

    if (mouthMode === 'image' && !findVariant(character.id, mouthVariantId)) {
      if (!silent) alert("口パク用の画像素材を選択してください。");
      return null;
    }
    if (mouthMode === 'sequence' && !findSequence(character.id, mouthSequenceId)) {
      if (!silent) alert("口パク用の連番素材を選択してください。");
      return null;
    }
    if (blinkMode === 'image' && !findVariant(character.id, blinkVariantId)) {
      if (!silent) alert("まばたき用の画像素材を選択してください。");
      return null;
    }
    if (blinkMode === 'sequence' && !findSequence(character.id, blinkSequenceId)) {
      if (!silent) alert("まばたき用の連番素材を選択してください。");
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
      if (cue.mouthMode && cue.mouthMode !== 'none' && time >= cue.start && time < cue.end) activeOverlays.push(`口:${cue.mouthMode === 'image' ? '画像' : '連番'}`);
      if (cue.blinkMode && cue.blinkMode !== 'none' && time >= cue.start) activeOverlays.push(`目:${cue.blinkMode === 'image' ? '画像' : '連番'}`);
      visibleNames.push(`${character?.name ?? "不明"}：${variant?.name ?? "差分なし"}${activeOverlays.length ? ` (${activeOverlays.join(' / ')})` : ''}`);
    }

    if (includeGuides) {
      activeCueInfo.textContent = visibleNames.length ? `表示中：${visibleNames.join(" / ")}` : "表示中の立ち絵なし";
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
        else reject(new Error("PNG生成に失敗しました"));
      }, "image/png");
    });
  }

  async function exportZip() {
    if (!window.JSZip) {
      alert("JSZipを読み込めませんでした。ネット接続またはCDN読み込みを確認してください。");
      return;
    }

    const fps = clamp(Math.round(toNumber(exportFpsInput.value, 30)), 1, 60);
    const start = Math.max(0, toNumber(exportStartInput.value, 0));
    const end = Math.max(start, toNumber(exportEndInput.value, start + 1));
    const prefix = trim(exportPrefixInput.value) || "standing";
    const frameCount = Math.max(1, Math.floor((end - start) * fps) + 1);

    if (frameCount > 1800) {
      const ok = confirm(`${frameCount}枚のPNGを書き出します。時間がかかる可能性がありますが実行しますか？`);
      if (!ok) return;
    }

    exportZipBtn.disabled = true;
    exportProgress.textContent = "書き出し準備中...";

    try {
      const zip = new JSZip();
      for (let i = 0; i < frameCount; i += 1) {
        const time = start + i / fps;
        renderAt(time, { includeGuides: false });
        const blob = await canvasToBlob();
        const number = String(i + 1).padStart(6, "0");
        zip.file(`${prefix}_${number}.png`, blob);

        if (i % 5 === 0 || i === frameCount - 1) {
          exportProgress.textContent = `PNG生成中... ${i + 1} / ${frameCount}`;
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      exportProgress.textContent = "ZIP生成中...";
      const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
        exportProgress.textContent = `ZIP生成中... ${metadata.percent.toFixed(0)}%`;
      });
      downloadBlob(zipBlob, `${prefix}_png_sequence.zip`);
      exportProgress.textContent = `完了：${frameCount}枚を書き出しました。`;
    } catch (error) {
      console.error(error);
      alert("書き出しに失敗しました。");
      exportProgress.textContent = "書き出しに失敗しました。";
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
    openManualBtn?.addEventListener("click", () => {
      if (manualDialog?.showModal) {
        manualDialog.showModal();
      } else {
        alert("取扱説明書はこのブラウザではポップアップ表示に対応していません。README.txtをご確認ください。");
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
        if (audioStatus) audioStatus.textContent = "音声を読み込み中...";
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
        alert("音声ファイルの読み込みに失敗しました。");
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
        alert("JSONの読み込みに失敗しました。");
      }
    });

    saveCacheBtn.addEventListener("click", async () => {
      try {
        await putCache(cleanProject());
        alert("キャッシュに保存しました。");
      } catch (error) {
        console.error(error);
        alert("キャッシュ保存に失敗しました。");
      }
    });

    loadCacheBtn.addEventListener("click", async () => {
      try {
        const project = await getCache();
        if (!project) {
          alert("保存済みキャッシュがありません。");
          return;
        }
        await setProject(project);
      } catch (error) {
        console.error(error);
        alert("キャッシュ復元に失敗しました。");
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
    ensureScenes();
    applySceneToState(getCurrentScene());
    bindEvents();
    clearCueForm(false);
    updateAudioStatus();
    renderAll();
  }

  init();
})();
