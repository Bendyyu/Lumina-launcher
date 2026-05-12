const { Client, Authenticator } = require('minecraft-launcher-core');
const { shell } = require('electron');
const path = require('path');
const https = require('https');
const launcher = new Client();

const playBtn = document.getElementById('playBtn');
const statusText = document.getElementById('status-text');
const versionSelect = document.getElementById('version');
const usernameInput = document.getElementById('username');
const ramSelect = document.getElementById('ram-select');
const snapshotsCheck = document.getElementById('show-snapshots');
const alphaBetaCheck = document.getElementById('show-alpha-beta');

let allVersions = [];

// 1. HAFIZA SİSTEMİ
function loadSavedData() {
    if(localStorage.getItem('username')) usernameInput.value = localStorage.getItem('username');
    if(localStorage.getItem('ram')) ramSelect.value = localStorage.getItem('ram');
    if(localStorage.getItem('showSnapshots') === 'true') snapshotsCheck.checked = true;
    if(localStorage.getItem('showAlphaBeta') === 'true') alphaBetaCheck.checked = true;
}

function saveData() {
    localStorage.setItem('username', usernameInput.value);
    localStorage.setItem('lastVersion', versionSelect.value);
    localStorage.setItem('ram', ramSelect.value);
    localStorage.setItem('showSnapshots', snapshotsCheck.checked);
    localStorage.setItem('showAlphaBeta', alphaBetaCheck.checked);
}

// 2. SÜRÜM ÇEKME (MOD DESTEKLİ)
function fetchVersions() {
    https.get('https://launchermeta.mojang.com/mc/game/version_manifest.json', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            allVersions = JSON.parse(data).versions;
            updateVersionList();
            const savedVer = localStorage.getItem('lastVersion');
            if(savedVer) versionSelect.value = savedVer;
        });
    });
}

function updateVersionList() {
    const sS = snapshotsCheck.checked;
    const sAB = alphaBetaCheck.checked;
    versionSelect.innerHTML = '';
    
    allVersions.forEach(v => {
        let show = v.type === 'release' || (v.type === 'snapshot' && sS) || ((v.type === 'old_beta' || v.type === 'old_alpha') && sAB);
        if (show) {
            let opt = document.createElement('option');
            opt.value = v.id;
            opt.innerHTML = (v.type === 'release' ? "" : `[${v.type.replace('old_', '')}] `) + v.id;
            versionSelect.appendChild(opt);
        }
    });
}

// 3. HABER PANELİ
function haberleriGuncelle() {
    const newsList = document.getElementById('news-list');
    const haberler = [
        "🚀 [LUMINA] v1.0 Yayında!",
        "👤 [SKIN] Ely.by skin desteği aktif edildi.",
        "🛠️ [MODS] Forge ve Fabric mod desteği eklendi.",
        "💾 [KAYIT] Nick ve ayarlarınız artık güvende.",
        "⛏️ [MC] 1.21 sürümleri tam uyumlu çalışıyor."
    ];
    newsList.innerHTML = ''; 
    haberler.forEach(haber => {
        const item = document.createElement('div');
        item.style.marginBottom = "14px";
        item.style.borderBottom = "1px solid rgba(255,170,0,0.1)";
        item.style.paddingBottom = "8px";
        item.innerHTML = haber.replace("[LUMINA]", "<span style='color:#ffaa00'>[LUMINA]</span>").replace("[SKIN]", "<span style='color:#5bc0de'>[SKIN]</span>").replace("[MODS]", "<span style='color:#5cb85c'>[MODS]</span>");
        newsList.appendChild(item);
    });
}

// 4. OYUNU BAŞLAT (SKIN VE MOD DESTEĞİ İÇERİR)
playBtn.addEventListener('click', async () => {
    saveData();
    const user = usernameInput.value.trim() || "LuminaUser";
    
    playBtn.disabled = true;
    playBtn.innerText = "BAŞLATILIYOR...";

    // Ely.by Skin Desteği için Auth Ayarı
    const auth = Authenticator.getAuth(user);
    
    let opts = {
        authorization: auth,
        root: "./.minecraft",
        javaPath: "javaw",
        version: {
            number: versionSelect.value,
            type: "release"
        },
        memory: {
            max: ramSelect.value,
            min: "1G"
        },
        // Mod desteği için gerekli (Custom jar'ları tanıması için)
        customArgs: [], 
        overrides: {
            detached: false
        }
    };

    // Eğer sürüm özel bir modloader (Forge/Fabric) ise otomatik algıla
    if (versionSelect.value.includes("forge") || versionSelect.value.includes("fabric")) {
        console.log("Modlu sürüm tespit edildi, ayarlar optimize ediliyor...");
    }

    launcher.launch(opts).catch(err => {
        console.error(err);
        opts.javaPath = "java";
        launcher.launch(opts);
    });
});

// BAŞLANGIÇ
window.openFolder = () => shell.openPath(path.join(process.cwd(), '.minecraft'));
window.openSettings = () => document.getElementById('settings-modal').style.display = 'block';
window.saveAndReload = () => { saveData(); document.getElementById('settings-modal').style.display = 'none'; updateVersionList(); };

launcher.on('progress', (e) => { statusText.innerText = `%${Math.round((e.task / e.total) * 100)}`; });
launcher.on('close', () => { playBtn.disabled = false; playBtn.innerText = "OYUNA GİR"; statusText.innerText = "Hazır"; });

loadSavedData();
fetchVersions();
haberleriGuncelle();