
// --- Helper Functions ---

function getUsers() {
  return JSON.parse(localStorage.getItem('pvpUsers')) || [];
}

function saveUsers(users) {
  localStorage.setItem('pvpUsers', JSON.stringify(users));
}

function getFolders() {
  return JSON.parse(localStorage.getItem('pvpFolders')) || [{name: "Uncategorized", color: "#cccccc"}];
}

function saveFolders(folders) {
  localStorage.setItem('pvpFolders', JSON.stringify(folders));
}

function getEntries() {
  return JSON.parse(localStorage.getItem('pvpVaultEntries')) || [];
}

function saveEntries(entries) {
  localStorage.setItem('pvpVaultEntries', JSON.stringify(entries));
}

function randomPastelColor() {
  const pastelColors = ["#aec6cf", "#cbaacb", "#b5ead7", "#ffdac1", "#ffb7b2", "#f7cac9", "#e0bbE4", "#c7ceea"];
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

// --- Login / Register ---
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      alert("User not found. Please register first.");
      return;
    }

    if (user.password !== password) {
      alert("Incorrect password. Please try again.");
      return;
    }

    localStorage.setItem('pvpUser', username);
    localStorage.setItem('pvpPro', localStorage.getItem('pvpPro') || 'false');
    window.location.href = "vault.html";
  } else {
    alert("Please enter username and password.");
  }
}

function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && password) {
    let users = getUsers();
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
      alert("Username already exists. Please choose another one.");
      return;
    }

    users.push({ username: username, password: password });
    saveUsers(users);

    alert("Account created successfully! Please login.");
    window.location.href = "login.html";
  } else {
    alert("Please enter a username and password to register.");
  }
}

// --- Vault Logic ---
function logout() {
  localStorage.removeItem('pvpUser');
  localStorage.removeItem('pvpPro');
  window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('vault.html')) {
    const user = localStorage.getItem('pvpUser');
    const pro = localStorage.getItem('pvpPro') === 'true';

    if (!user) {
      window.location.href = "login.html";
    }

    initFolders();
    document.getElementById('vaultContent').classList.remove('hidden');
    loadVaultEntries();

    if (pro) {
      const proFeatures = document.getElementById('proFeatures');
      if (proFeatures) proFeatures.style.display = 'none';
      document.getElementById('proButtons').style.display = 'flex';
    } else {
      const upgradeBtn = document.getElementById('upgradeNavBtn');
      if (upgradeBtn) upgradeBtn.style.display = 'inline-block';
    }
  }
});

function initFolders() {
  const folderSelect = document.getElementById('folderSelect');
  const folderView = document.getElementById('folderView');
  folderSelect.innerHTML = "";
  folderView.innerHTML = "";

  const folders = getFolders();

  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.name;
    option.innerHTML = `<span style="color:${folder.color}">⬤</span> ${folder.name}`;
    folderSelect.appendChild(option);

    const viewOption = document.createElement('option');
    viewOption.value = folder.name;
    viewOption.innerHTML = folder.name;
    folderView.appendChild(viewOption);
  });
}

function createFolder() {
  const folderName = prompt("Enter new folder name:").trim();
  if (!folderName) return;

  let folders = getFolders();
  if (folders.find(f => f.name === folderName)) {
    alert("Folder already exists.");
    return;
  }

  folders.push({ name: folderName, color: randomPastelColor() });
  saveFolders(folders);
  initFolders();
  alert("Folder created successfully!");
}

function addVaultEntry() {
  const pro = localStorage.getItem('pvpPro') === 'true';
  const entries = getEntries();

  if (!pro && entries.length >= 20) {
    alert("Free account limit reached (20 entries). Upgrade to Pro for unlimited vault entries!");
    return;
  }

  const entry = prompt("Enter your new Vault Entry:");
  if (entry) {
    const selectedFolder = document.getElementById('folderSelect').value || "Uncategorized";
    entries.push({ text: entry, imported: false, folder: selectedFolder });
    saveEntries(entries);
    loadVaultEntries();
  }
}

function loadVaultEntries() {
  const entriesContainer = document.getElementById('entries');
  if (!entriesContainer) return;

  entriesContainer.innerHTML = '';

  const selectedFolder = document.getElementById('folderView').value || "Uncategorized";
  const entries = getEntries().filter(e => e.folder === selectedFolder);

  entries.forEach((entry, index) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'vault-entry';
    entryDiv.innerHTML = `
      <p>${entry.text} ${entry.imported ? '<span class="tag-imported">(Imported)</span>' : ''}</p>
      <button onclick="deleteVaultEntry(${index})" class="btn-delete">Delete</button>
    `;
    entriesContainer.appendChild(entryDiv);
  });

  const progressBar = document.getElementById('completion');
  if (progressBar) {
    progressBar.value = Math.min(entries.length * 5, 100);
  }
}

function deleteVaultEntry(index) {
  const selectedFolder = document.getElementById('folderView').value || "Uncategorized";
  let entries = getEntries();
  const filteredEntries = entries.filter(e => e.folder === selectedFolder);
  const trueIndex = entries.indexOf(filteredEntries[index]);
  entries.splice(trueIndex, 1);
  saveEntries(entries);
  loadVaultEntries();
}

function importGptPrompts() {
  const gptPrompts = [
    "Write a professional thank-you email.",
    "Generate 5 blog topics for AI startups.",
    "Create a social media calendar for healthcare business.",
    "Draft a cold outreach message for new clients.",
    "Suggest 10 unique GPT app ideas."
  ];

  let entries = getEntries();
  const pro = localStorage.getItem('pvpPro') === 'true';
  if (!pro && (entries.length + gptPrompts.length) > 20) {
    alert("Importing would exceed your free account limit. Upgrade to Pro!");
    return;
  }

  const selectedFolder = document.getElementById('folderSelect').value || "Uncategorized";
  gptPrompts.forEach(prompt => {
    entries.push({ text: prompt, imported: true, folder: selectedFolder });
  });

  saveEntries(entries);
  loadVaultEntries();
}

function clearVault() {
  if (confirm("Are you sure you want to clear all vault entries? This cannot be undone.")) {
    localStorage.removeItem('pvpVaultEntries');
    loadVaultEntries();
  }
}

function exportVault() {
  const entries = getEntries();
  if (entries.length === 0) {
    alert("No entries to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Entry,Imported,Folder\n";
  entries.forEach(e => {
    csvContent += `"${e.text.replace(/"/g, '""')}",${e.imported},"${e.folder}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "promptvault_entries.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function shareVault() {
  const entries = getEntries();
  if (entries.length === 0) {
    alert("No entries to share!");
    return;
  }
  const shareWindow = window.open();
  shareWindow.document.write("<h1>Shared Vault Entries</h1>");
  entries.forEach(e => {
    shareWindow.document.write(`<p>[${e.folder}] ${e.text}</p>`);
  });
}


async function browseTemplates() {
  const res = await fetch('templates.json');
  const templates = await res.json();

  let selection = "Select a Template:\n";
  templates.forEach((t, index) => {
    selection += `${index+1}. [${t.category}] ${t.name}\n`;
  });
  selection += "\nEnter template number to insert:";

  const choice = prompt(selection);
  const choiceIndex = parseInt(choice) - 1;
  if (!isNaN(choiceIndex) && templates[choiceIndex]) {
    const selectedFolder = document.getElementById('folderSelect').value || "Uncategorized";
    let entries = JSON.parse(localStorage.getItem('pvpVaultEntries')) || [];
    entries.push({ text: templates[choiceIndex].prompt, imported: true, folder: selectedFolder });
    localStorage.setItem('pvpVaultEntries', JSON.stringify(entries));
    loadVaultEntries();
    alert("Template added to your Vault!");
  } else {
    alert("Invalid choice or cancelled.");
  }
}


async function browseTemplates() {
  const res = await fetch('templates.json');
  const templates = await res.json();

  const templateList = document.getElementById('templateList');
  templateList.innerHTML = "";

  templates.forEach((t, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.display = 'block';
    btn.style.margin = '10px auto';
    btn.textContent = `[${t.category}] ${t.name}`;
    btn.onclick = () => selectTemplate(t.prompt);
    templateList.appendChild(btn);
  });

  document.getElementById('templateModal').classList.remove('hidden');
}

function selectTemplate(promptText) {
  const selectedFolder = document.getElementById('folderSelect').value || "Uncategorized";
  let entries = JSON.parse(localStorage.getItem('pvpVaultEntries')) || [];
  entries.push({ text: promptText, imported: true, folder: selectedFolder });
  localStorage.setItem('pvpVaultEntries', JSON.stringify(entries));
  loadVaultEntries();
  closeTemplateModal();
  alert("Template added to your Vault!");
}

function closeTemplateModal() {
  document.getElementById('templateModal').classList.add('hidden');
}


async function browseTemplates() {
  const templateModal = document.getElementById('templateModal');
  const templateList = document.getElementById('templateList');

  if (!templateModal || !templateList) {
    console.error("Template modal elements missing!");
    return;
  }

  try {
    const res = await fetch('templates.json');
    const templates = await res.json();

    templateList.innerHTML = "";

    templates.forEach((t, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.style.display = 'block';
      btn.style.margin = '10px auto';
      btn.textContent = `[${t.category}] ${t.name}`;
      btn.onclick = () => selectTemplate(t.prompt);
      templateList.appendChild(btn);
    });

    templateModal.classList.remove('hidden');
  } catch (err) {
    console.error("Error loading templates:", err);
    alert("Failed to load templates.");
  }
}

function selectTemplate(promptText) {
  const selectedFolder = document.getElementById('folderSelect').value || "Uncategorized";
  let entries = JSON.parse(localStorage.getItem('pvpVaultEntries')) || [];
  entries.push({ text: promptText, imported: true, folder: selectedFolder });
  localStorage.setItem('pvpVaultEntries', JSON.stringify(entries));
  loadVaultEntries();
  closeTemplateModal();
  alert("Template added to your Vault!");
}

function closeTemplateModal() {
  const templateModal = document.getElementById('templateModal');
  if (templateModal) {
    templateModal.classList.add('hidden');
  }
}

// Defensive: Hide modal immediately on page load
document.addEventListener('DOMContentLoaded', function() {
  const templateModal = document.getElementById('templateModal');
  if (templateModal) {
    templateModal.classList.add('hidden');
  }
});
