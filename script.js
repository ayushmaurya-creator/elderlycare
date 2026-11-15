const defaultMeds = [
    { id: 1, name: "Telmisartan 40mg (BP)", dosage: "1 Tablet after Breakfast", time: "09:00", taken: true },
    { id: 2, name: "Metformin 500mg (Sugar)", dosage: "1 Tablet before Lunch", time: "13:30", taken: false },
    { id: 3, name: "Atorvastatin 10mg", dosage: "1 Tablet at Night", time: "21:00", taken: false }
];

const defaultAppts = [
    { id: 1, doc: "Dr. R. Sharma (Cardiologist)", date: "2026-11-18", time: "11:00" }
];

let meds = JSON.parse(localStorage.getItem('caresync_meds')) || defaultMeds;
let appts = JSON.parse(localStorage.getItem('caresync_appts')) || defaultAppts;
let latestWellness = localStorage.getItem('caresync_wellness') || "😊 Normal";
const SECRET_PIN = "1234";

function saveData() {
    localStorage.setItem('caresync_meds', JSON.stringify(meds));
    localStorage.setItem('caresync_appts', JSON.stringify(appts));
    localStorage.setItem('caresync_wellness', latestWellness);
    renderAll();
}

function switchView(role) {
    document.getElementById('elderlyView').classList.toggle('hidden', role !== 'elderly');
    document.getElementById('caretakerView').classList.toggle('hidden', role !== 'caretaker');
    document.getElementById('elderlyTabBtn').classList.toggle('active', role === 'elderly');
    document.getElementById('caretakerTabBtn').classList.toggle('active', role === 'caretaker');
}

function verifyPasscode() {
    const input = document.getElementById('pinInput').value;
    const errorEl = document.getElementById('pinError');
    if (input === SECRET_PIN) {
        document.getElementById('passcodeScreen').classList.add('hidden');
        document.getElementById('caretakerDashboard').classList.remove('hidden');
        errorEl.textContent = "";
    } else {
        errorEl.textContent = "❌ Galat Passcode! Demo ke liye 1234 dalein.";
    }
}

function renderAll() {
    const elderlyList = document.getElementById('elderlyMedList');
    const caretakerList = document.getElementById('caretakerMedList');
    const apptList = document.getElementById('elderlyApptList');
    const statusBanner = document.getElementById('elderlyStatusBanner');

    if (statusBanner) {
        statusBanner.textContent = `📢 Latest Elderly Status: ${latestWellness}`;
    }

    elderlyList.innerHTML = "";
    caretakerList.innerHTML = "";
    apptList.innerHTML = "";

    meds.forEach(med => {
     
        const eDiv = document.createElement('div');
        eDiv.className = `med-item ${med.taken ? 'taken' : ''}`;
        eDiv.innerHTML = `
            <div class="med-info">
                <h4>${med.name}</h4>
                <p>🕒 ${med.time} | ${med.dosage}</p>
            </div>
            ${med.taken 
                ? `<span style="color:#16a34a; font-weight:bold;">✅ Kha Li</span>` 
                : `<button class="take-btn" onclick="markTaken(${med.id})">👍 Kha Li</button>`}
        `;
        elderlyList.appendChild(eDiv);

        const cDiv = document.createElement('div');
        cDiv.className = `med-item ${med.taken ? 'taken' : ''}`;
        cDiv.innerHTML = `
            <div class="med-info">
                <h4>${med.name} (${med.time})</h4>
                <p>${med.dosage} — Status: <strong>${med.taken ? 'Taken ✅' : 'Pending ⏳'}</strong></p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="edit-btn" onclick="editMed(${med.id})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteMed(${med.id})">Delete</button>
            </div>
        `;
        caretakerList.appendChild(cDiv);
    });

    appts.forEach(a => {
        const aDiv = document.createElement('div');
        aDiv.className = "med-item";
        aDiv.innerHTML = `
            <div class="med-info">
                <h4>👨‍⚕️ ${a.doc}</h4>
                <p>📅 Date: ${a.date} | 🕒 Time: ${a.time}</p>
            </div>
        `;
        apptList.appendChild(aDiv);
    });

    const takenCount = meds.filter(m => m.taken).length;
    const percent = meds.length ? Math.round((takenCount / meds.length) * 100) : 0;
    const bar = document.getElementById('adherenceBar');
    if (bar) {
        bar.style.width = percent + "%";
        bar.textContent = `${percent}% Adherence (${takenCount}/${meds.length} Taken)`;
    }
}

function markTaken(id) {
    meds = meds.map(m => m.id === id ? { ...m, taken: true } : m);
    saveData();
    showToast("✅ Great! Family dashboard update ho gaya hai.");
    speakText("Dawa mark ho gayi hai.");
}

function editMed(id) {
    const med = meds.find(m => m.id === id);
    if (!med) return;
    const newTime = prompt(`"${med.name}" ka naya time dalein (HH:MM):`, med.time);
    const newDosage = prompt(`"${med.name}" ki nayi instruction dalein:`, med.dosage);
    if (newTime && newTime.trim() !== "") med.time = newTime.trim();
    if (newDosage && newDosage.trim() !== "") med.dosage = newDosage.trim();
    saveData();
    showToast(`✏️ "${med.name}" update ho gaya!`);
}

function deleteMed(id) {
    meds = meds.filter(m => m.id !== id);
    saveData();
}

document.getElementById('medForm').addEventListener('submit', function(e) {
    e.preventDefault();
    meds.push({
        id: Date.now(),
        name: document.getElementById('medName').value,
        dosage: document.getElementById('medDosage').value,
        time: document.getElementById('medTime').value,
        taken: false
    });
    saveData();
    this.reset();
    showToast("💊 Nayi dawa add ho gayi!");
});

document.getElementById('apptForm').addEventListener('submit', function(e) {
    e.preventDefault();
    appts.push({
        id: Date.now(),
        doc: document.getElementById('docName').value,
        date: document.getElementById('apptDate').value,
        time: document.getElementById('apptTime').value
    });
    saveData();
    this.reset();
    showToast("📅 Appointment add ho gayi!");
});

function logWellness(msg) {
    latestWellness = `${msg} (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
    saveData();
    showToast("📢 Family ko alert gaya: " + msg);
    speakText("Aapka message family ko bhej diya gaya hai");
}

function checkMissedMeds() {
    const email = document.getElementById('caretakerEmail')?.value || "family@gmail.com";
    const pending = meds.filter(m => !m.taken);

    if (pending.length === 0) {
        showToast("✅ Saari dawaiyan time par li ja chuki hain!");
        return;
    }

    const medNames = pending.map(m => `• ${m.name} (${m.time}) - ${m.dosage}`).join('\n');
    const nextAppt = appts.length ? `\nUpcoming Appointment: ${appts[0].doc} on ${appts[0].date} at ${appts[0].time}` : "";
    const subject = `⚠️ CareSync Alert: ${pending.length} Pending Medication(s)`;
    const body = `Hello Caretaker,\n\nProactive reminder from CareSync:\n\nPending Medications:\n${medNames}\n\nLatest Elderly Status: ${latestWellness}${nextAppt}\n\nPlease check on them.`;

    showToast(`📧 Opening Email Alert for ${email}...`);
    setTimeout(() => {
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 900);
}

function resetDemoData() {
    localStorage.removeItem('caresync_meds');
    localStorage.removeItem('caresync_appts');
    localStorage.removeItem('caresync_wellness');
    meds = JSON.parse(JSON.stringify(defaultMeds));
    appts = JSON.parse(JSON.stringify(defaultAppts));
    latestWellness = "😊 Normal";
    saveData();
    showToast("🔄 Demo data reset ho gaya!");
}

const voiceBtn = document.getElementById('voiceBtn');
if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            markNextPendingMed();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';
        voiceBtn.textContent = "🎙️ Sun raha hu... Boliye 'Maine dawa kha li'";
        voiceBtn.style.background = "#dc2626";
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            if (transcript.includes("kha") || transcript.includes("खा") || transcript.includes("le li") || transcript.includes("dawa") || transcript.includes("taken")) {
                markNextPendingMed();
            } else {
                showToast(`🤔 Aapne bola: "${transcript}". Phir se boliye "Maine dawa kha li"`);
            }
        };
        recognition.onerror = () => markNextPendingMed();
        recognition.onend = () => {
            voiceBtn.textContent = '🎤 Bol kar Mark karein ("Maine dawa kha li")';
            voiceBtn.style.background = "#0284c7";
        };
    });
}

function markNextPendingMed() {
    const nextMed = meds.find(m => !m.taken);
    if (nextMed) {
        nextMed.taken = true;
        saveData();
        showToast(`✅ Voice Command: "${nextMed.name}" Kha Li mark ho gayi!`);
        speakText(`Bahut badhiya! ${nextMed.name} mark ho gayi hai.`);
    } else {
        showToast("🎉 Aaj ki saari dawaiyan pehle hi li ja chuki hain!");
        speakText("Saari dawaiyan pehle hi li ja chuki hain.");
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        window.speechSynthesis.speak(utterance);
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4500);
}

renderAll();