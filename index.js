/**
 * Custom Model Strings
 * Adds a free-text "custom model" field under every API model selector in
 * SillyTavern, so you can use any model ID even if it isn't in the dropdown.
 */

const MODULE_NAME = 'custom_model_strings';
const CUSTOM_FLAG = 'data-cms-custom';

const CC = 'chat';
const TC = 'text';

/**
 * Model selector id -> [settings group, settings key].
 * Chat completion settings live in oai_settings, text completion in textgen_settings.
 */
const TARGETS = {
    // Chat Completion
    'model_openai_select': [CC, 'openai_model'],
    'model_claude_select': [CC, 'claude_model'],
    'model_openrouter_select': [CC, 'openrouter_model'],
    'model_ai21_select': [CC, 'ai21_model'],
    'model_google_select': [CC, 'google_model'],
    'model_vertexai_select': [CC, 'vertexai_model'],
    'model_mistralai_select': [CC, 'mistralai_model'],
    'model_cohere_select': [CC, 'cohere_model'],
    'model_perplexity_select': [CC, 'perplexity_model'],
    'model_groq_select': [CC, 'groq_model'],
    'model_chutes_select': [CC, 'chutes_model'],
    'model_electronhub_select': [CC, 'electronhub_model'],
    'model_nanogpt_select': [CC, 'nanogpt_model'],
    'model_deepseek_select': [CC, 'deepseek_model'],
    'model_aimlapi_select': [CC, 'aimlapi_model'],
    'model_xai_select': [CC, 'xai_model'],
    'model_pollinations_select': [CC, 'pollinations_model'],
    'model_moonshot_select': [CC, 'moonshot_model'],
    'model_fireworks_select': [CC, 'fireworks_model'],
    'model_cometapi_select': [CC, 'cometapi_model'],
    'model_siliconflow_select': [CC, 'siliconflow_model'],
    'model_minimax_select': [CC, 'minimax_model'],
    'model_workers_ai_select': [CC, 'workers_ai_model'],
    'model_zai_select': [CC, 'zai_model'],
    'azure_openai_model': [CC, 'azure_openai_model'],
    // Text Completion
    'model_togetherai_select': [TC, 'togetherai_model'],
    'model_infermaticai_select': [TC, 'infermaticai_model'],
    'model_dreamgen_select': [TC, 'dreamgen_model'],
    'mancer_model': [TC, 'mancer_model'],
    'openrouter_model': [TC, 'openrouter_model'],
    'featherless_model': [TC, 'featherless_model'],
    'ollama_model': [TC, 'ollama_model'],
    'vllm_model': [TC, 'vllm_model'],
    'aphrodite_model': [TC, 'aphrodite_model'],
    'tabby_model': [TC, 'tabby_model'],
    'llamacpp_model': [TC, 'llamacpp_model'],
    'generic_model_select': [TC, 'generic_model'],
};

function ctx() {
    return SillyTavern.getContext();
}

/** @returns {{ active: Record<string, string> }} */
function getSettings() {
    const all = ctx().extensionSettings;
    if (!all[MODULE_NAME] || typeof all[MODULE_NAME] !== 'object') {
        all[MODULE_NAME] = {};
    }
    if (!all[MODULE_NAME].active || typeof all[MODULE_NAME].active !== 'object') {
        all[MODULE_NAME].active = {};
    }
    return all[MODULE_NAME];
}

function save() {
    ctx().saveSettingsDebounced();
}

function getSettingsObject(group) {
    const c = ctx();
    return group === CC ? c.chatCompletionSettings : c.textCompletionSettings;
}

function readModelSetting(id) {
    const [group, key] = TARGETS[id];
    return getSettingsObject(group)?.[key];
}

function writeModelSetting(id, value) {
    const [group, key] = TARGETS[id];
    const obj = getSettingsObject(group);
    if (!obj) return;
    obj[key] = value;
    if (id === 'generic_model_select') {
        $('#generic_model_textgenerationwebui').val(value);
    }
}

/** Find an <option> by exact value (no selector escaping needed). */
function findOption(select, value) {
    return Array.from(select.options).find(o => o.value === value) || null;
}

function ensureOption(select, value) {
    if (findOption(select, value)) return;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = `${value} (custom)`;
    option.setAttribute(CUSTOM_FLAG, '1');
    select.insertBefore(option, select.firstChild);
}

function removeStaleCustomOptions(select, keepValue) {
    for (const option of Array.from(select.querySelectorAll(`option[${CUSTOM_FLAG}]`))) {
        if (option.value !== keepValue) option.remove();
    }
}

/** Refresh select2's displayed value without firing SillyTavern's change handlers. */
function refreshSelect2(select) {
    if ($(select).data('select2')) {
        $(select).trigger('change.select2');
    }
}

/**
 * Make sure the active custom model (if any) is present and selected,
 * and that the saved setting matches. Never fires ST's change handlers,
 * so it can't cause reconnect loops.
 */
function restore(id) {
    const select = document.getElementById(id);
    const value = getSettings().active[id];
    if (!select || !value) return;

    ensureOption(select, value);

    if (select.value !== value) {
        select.value = value;
        refreshSelect2(select);
    }

    if (readModelSetting(id) !== value) {
        writeModelSetting(id, value);
        save();
    }

    const input = document.querySelector(`.cms-row[data-cms-for="${id}"] .cms-input`);
    if (input && !input.value) input.value = value;
}

function restoreAll() {
    for (const id of Object.keys(TARGETS)) restore(id);
}

/** User applied a custom model string. */
function applyCustom(id, rawValue) {
    const select = document.getElementById(id);
    const value = String(rawValue ?? '').trim();
    if (!select || !value) return;

    const settings = getSettings();
    settings.active[id] = value;

    removeStaleCustomOptions(select, value);
    ensureOption(select, value);

    // Go through SillyTavern's normal handler first (context size, reconnects, etc.)
    $(select).val(value).trigger('change');

    // Some handlers ignore values that aren't in their model list, so set it directly too.
    writeModelSetting(id, value);
    if (select.value !== value) {
        select.value = value;
        refreshSelect2(select);
    }
    save();

    toastr.success(`Using custom model: ${value}`, 'Custom Model Strings', { timeOut: 2000 });
}

/** User cleared the custom model string. */
function clearCustom(id) {
    const select = document.getElementById(id);
    const settings = getSettings();
    delete settings.active[id];
    if (select) removeStaleCustomOptions(select, null);
    const input = document.querySelector(`.cms-row[data-cms-for="${id}"] .cms-input`);
    if (input) input.value = '';
    save();
}

/**
 * Watch for the user (or a profile / slash command) picking a regular model,
 * so we stop forcing the custom one.
 */
function onSelectChange(id, event) {
    const select = document.getElementById(id);
    const active = getSettings().active[id];
    if (!select || !active) return;

    const value = String($(select).val() ?? '');
    if (!value || value === active) return;

    // If our custom option is missing, the list is being rebuilt by ST
    // (it will be restored shortly) — not a deliberate switch.
    const isUserEvent = Boolean(event?.originalEvent) || event?.type === 'select2:select';
    if (!isUserEvent && !findOption(select, active)) return;

    delete getSettings().active[id];
    removeStaleCustomOptions(select, null);
    const input = document.querySelector(`.cms-row[data-cms-for="${id}"] .cms-input`);
    if (input) input.value = '';
    save();
}

function buildRow(id) {
    const row = document.createElement('div');
    row.className = 'cms-row';
    row.dataset.cmsFor = id;
    row.innerHTML = `
        <input type="text" class="text_pole cms-input" placeholder="Custom model string…" autocomplete="off" spellcheck="false">
        <div class="menu_button menu_button_icon cms-apply" title="Use this model ID">
            <i class="fa-solid fa-check"></i>
        </div>
        <div class="menu_button menu_button_icon cms-clear" title="Stop using the custom model ID">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;

    const input = row.querySelector('.cms-input');
    row.querySelector('.cms-apply').addEventListener('click', () => applyCustom(id, input.value));
    row.querySelector('.cms-clear').addEventListener('click', () => clearCustom(id));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyCustom(id, input.value);
        }
    });

    return row;
}

function attach(id) {
    const select = document.getElementById(id);
    if (!select || select.dataset.cmsAttached) return;
    select.dataset.cmsAttached = '1';

    // Place the row after select2's container if it's already initialized.
    let anchor = select;
    const next = select.nextElementSibling;
    if (next && next.classList.contains('select2-container')) anchor = next;
    anchor.insertAdjacentElement('afterend', buildRow(id));

    // Re-add the custom option whenever ST rebuilds the model list.
    const observer = new MutationObserver(() => restore(id));
    observer.observe(select, { childList: true, subtree: true });

    $(select).on('change', (e) => onSelectChange(id, e));
    $(select).on('select2:select', (e) => onSelectChange(id, e));
}

function init() {
    getSettings();
    for (const id of Object.keys(TARGETS)) attach(id);

    const { eventSource, eventTypes } = ctx();
    const events = [
        eventTypes.APP_READY,
        eventTypes.SETTINGS_LOADED,
        eventTypes.SETTINGS_LOADED_AFTER,
        eventTypes.CHATCOMPLETION_SOURCE_CHANGED,
        eventTypes.ONLINE_STATUS_CHANGED,
    ].filter(Boolean);
    for (const evt of events) {
        eventSource.on(evt, () => setTimeout(restoreAll, 0));
    }
}

jQuery(() => {
    try {
        init();
    } catch (err) {
        console.error('[Custom Model Strings] Failed to initialize', err);
    }
});
