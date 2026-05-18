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

  const characterNameInput = $("#characterNameInput");
  const addCharacterBtn = $("#addCharacterBtn");
  const variantCharacterSelect = $("#variantCharacterSelect");
  const variantNameInput = $("#variantNameInput");
  const variantImageInput = $("#variantImageInput");
  const addVariantBtn = $("#addVariantBtn");
  const characterList = $("#characterList");

  const cueList = $("#cueList");
  const cueCharacterSelect = $("#cueCharacterSelect");
  const cueVariantSelect = $("#cueVariantSelect");
  const cueAfterVariantSelect = $("#cueAfterVariantSelect");
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
    cues: [],
    editingCueId: null,
    audioObjectUrl: null,
    audioDataUrl: "",
    audioFileName: "",
    audioMimeType: "",
    audioSize: 0,
    lastVariantCharacterId: null,
    formPreviewEnabled: false,
    settings: {
      showGrid: false,
      showSafeArea: false,
      previewZoom: 32,
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
    return character.variants.find((variant) => variant.id === variantId) ?? null;
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
    }
    await Promise.all(tasks);
  }

  function cleanProject() {
    return {
      version: 1,
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
        }))
      })),
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
    state.cues = Array.isArray(project.cues) ? project.cues : [];
    state.settings = {
      showGrid: Boolean(project.settings?.showGrid),
      showSafeArea: Boolean(project.settings?.showSafeArea),
      previewZoom: clamp(toNumber(project.settings?.previewZoom, 32), 20, 70),
      previewBg: ["mint", "white", "blue", "cream", "checker"].includes(project.settings?.previewBg) ? project.settings.previewBg : "mint"
    };
    state.editingCueId = null;
    state.formPreviewEnabled = false;
    state.lastVariantCharacterId = state.characters[0]?.id ?? null;

    if (project.audio?.dataUrl) {
      state.audioDataUrl = String(project.audio.dataUrl);
      state.audioFileName = String(project.audio.fileName ?? "");
      state.audioMimeType = String(project.audio.mimeType ?? "");
      state.audioSize = toNumber(project.audio.size, 0);
    } else {
      state.audioDataUrl = "";
      state.audioFileName = "";
      state.audioMimeType = "";
      state.audioSize = 0;
    }
    audioInput.value = "";
    setAudioSourceFromState();

    showGridInput.checked = state.settings.showGrid;
    showSafeAreaInput.checked = state.settings.showSafeArea;
    previewZoomInput.value = String(state.settings.previewZoom);
    previewBgSelect.value = state.settings.previewBg;
    applyPreviewDisplaySettings();

    await hydrateImages();
    renderAll();
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
    const previousCueCharacterId = cueCharacterSelect.value;
    const options = state.characters
      .map((character) => `<option value="${escapeHtml(character.id)}">${escapeHtml(character.name)}</option>`)
      .join("");

    variantCharacterSelect.innerHTML = options || `<option value="">キャラクター未登録</option>`;
    cueCharacterSelect.innerHTML = options || `<option value="">キャラクター未登録</option>`;

    if (state.characters.length > 0) {
      const variantTarget = findCharacter(previousVariantCharacterId) ? previousVariantCharacterId : state.characters[0].id;
      const cueTarget = findCharacter(previousCueCharacterId) ? previousCueCharacterId : variantTarget;
      variantCharacterSelect.value = variantTarget;
      cueCharacterSelect.value = cueTarget;
      state.lastVariantCharacterId = variantTarget;
    }

    populateVariantSelect();
  }

  function populateVariantSelect() {
    const previousVariantId = cueVariantSelect.value;
    const previousAfterVariantId = cueAfterVariantSelect.value;
    const character = findCharacter(cueCharacterSelect.value);
    const variants = character?.variants ?? [];
    const variantOptions = variants.length
      ? variants
          .map((variant) => `<option value="${escapeHtml(variant.id)}">${escapeHtml(variant.name)}</option>`)
          .join("")
      : `<option value="">差分未登録</option>`;

    cueVariantSelect.innerHTML = variantOptions;
    cueAfterVariantSelect.innerHTML = variants.length
      ? `<option value="">同じ差分を維持</option>${variantOptions}`
      : `<option value="">差分未登録</option>`;

    if (variants.length > 0) {
      if (findVariant(character.id, previousVariantId)) {
        cueVariantSelect.value = previousVariantId;
      } else {
        cueVariantSelect.value = variants[0].id;
      }

      if (previousAfterVariantId && findVariant(character.id, previousAfterVariantId)) {
        cueAfterVariantSelect.value = previousAfterVariantId;
      } else {
        cueAfterVariantSelect.value = "";
      }
    }
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
        const variantHtml = variants.length
          ? variants
              .map(
                (variant) => `
                  <div class="variant-chip">
                    <span>${escapeHtml(variant.name)}</span>
                    <button type="button" class="mini danger" data-action="deleteVariant" data-character-id="${escapeHtml(character.id)}" data-variant-id="${escapeHtml(variant.id)}">×</button>
                  </div>
                `
              )
              .join("")
          : `<span class="muted-small">差分なし</span>`;

        return `
          <div class="character-card">
            <div class="character-card-head">
              <strong>${escapeHtml(character.name)}</strong>
              <button type="button" class="mini danger" data-action="deleteCharacter" data-character-id="${escapeHtml(character.id)}">削除</button>
            </div>
            <div class="variant-chip-list">${variantHtml}</div>
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

    cueList.innerHTML = cues
      .map((cue) => {
        const character = findCharacter(cue.characterId);
        const variant = findVariant(cue.characterId, cue.variantId);
        const afterVariant = cue.afterVariantId ? findVariant(cue.characterId, cue.afterVariantId) : null;
        const isEditing = state.editingCueId === cue.id;
        const flags = [
          cue.entrance ? "入場" : null,
          cue.exit ? "退場" : `終了後：${afterVariant?.name ?? variant?.name ?? "同じ差分"}`,
          cue.animation === "jump" ? "小ジャンプ" : null,
          cue.animation === "shake" ? "震え" : null
        ].filter(Boolean);

        return `
          <div class="cue-card ${isEditing ? "editing" : ""}">
            <div class="cue-main">
              <strong>${escapeHtml(character?.name ?? "不明なキャラ")}</strong>
              <span>${escapeHtml(variant?.name ?? "差分なし")}</span>
              <small>${formatTime(cue.start)} / ${cue.exit ? `${formatTime(cue.end)}で退場` : `${formatTime(cue.end)}以降は終了後の立ち絵`}</small>
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
      variants: []
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
      .map((cue) => (cue.afterVariantId === variantId ? { ...cue, afterVariantId: "" } : cue));
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
      if (!silent) alert("差分を選択してください。差分名は『笑顔』『照れ』『不安』など、表情がわかりやすい名前にすることを推奨します。");
      return null;
    }

    const afterVariantId = cueAfterVariantSelect.value || "";
    if (afterVariantId && !findVariant(character.id, afterVariantId)) {
      if (!silent) alert("終了後の立ち絵を選択し直してください。");
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
      positionPreset: cuePositionPresetSelect.value,
      start,
      end,
      layer: Math.round(toNumber(cueLayerInput.value, 0)),
      x: toNumber(cueXInput.value, 960),
      y: toNumber(cueYInput.value, 1040),
      scale: Math.max(0.05, toNumber(cueScaleInput.value, 1)),
      animation: cueAnimationSelect.value,
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
    syncPreviewTime(cue.start);
    renderAll();
  }

  function fillCueForm(cue) {
    cueCharacterSelect.value = cue.characterId;
    populateVariantSelect();
    cueVariantSelect.value = cue.variantId;
    cueAfterVariantSelect.value = cue.afterVariantId ?? "";
    cuePositionPresetSelect.value = cue.positionPreset ?? "custom";
    cueStartInput.value = cue.start;
    cueEndInput.value = cue.end;
    cueLayerInput.value = cue.layer;
    cueXInput.value = cue.x;
    cueYInput.value = cue.y;
    cueScaleInput.value = cue.scale;
    updateSliderOutputs();
    cueAnimationSelect.value = cue.animation ?? "none";
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
      const duration = 0.46;
      if (elapsed <= duration) {
        const progress = elapsed / duration;
        return { x: 0, y: -42 * Math.sin(Math.PI * progress) };
      }
    }

    if (cue.animation === "shake" && time >= cue.start && time <= cue.end) {
      return {
        x: Math.sin(elapsed * 62) * 8 + Math.sin(elapsed * 37) * 3,
        y: Math.sin(elapsed * 83) * 4
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
      ctx.restore();

      visibleNames.push(`${character?.name ?? "不明"}：${variant?.name ?? "差分なし"}`);
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

    characterList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action === "deleteCharacter") deleteCharacter(button.dataset.characterId);
      if (action === "deleteVariant") deleteVariant(button.dataset.characterId, button.dataset.variantId);
    });

    variantCharacterSelect.addEventListener("change", () => {
      state.lastVariantCharacterId = variantCharacterSelect.value;
    });

    cueCharacterSelect.addEventListener("change", () => {
      populateVariantSelect();
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
      state.settings.previewZoom = toNumber(previewZoomInput.value, 32);
      applyPreviewDisplaySettings();
    });

    previewBgSelect.addEventListener("change", () => {
      state.settings.previewBg = previewBgSelect.value;
      applyPreviewDisplaySettings();
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
      cueEntranceInput,
      cueExitInput,
      cueVariantSelect,
      cueAfterVariantSelect
    ].forEach((element) => {
      const eventName = element.tagName === "SELECT" || element.type === "checkbox" ? "change" : "input";
      element.addEventListener(eventName, () => {
        if (element === cueXInput || element === cueYInput || element === cueScaleInput) {
          updateSliderOutputs();
          cuePositionPresetSelect.value = "custom";
        }
        markFormPreview({ syncToStart: true });
      });
    });

    exportZipBtn.addEventListener("click", exportZip);
    canvas.addEventListener("click", updateCuePositionByCanvasClick);
  }

  async function init() {
    bindEvents();
    clearCueForm(false);
    updateAudioStatus();
    renderAll();
  }

  init();
})();
