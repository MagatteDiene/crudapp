// ===== CONFIGURATION =====
// L'API est accessible via le front controller : index.php?action=api
const API_URL = 'index.php?action=api';

// ===== DOM ELEMENTS =====
const form = document.getElementById('user-form');
const formTitle = document.getElementById('form-title');
const userIdInput = document.getElementById('user-id');
const nomInput = document.getElementById('nom');
const prenomInput = document.getElementById('prenom');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const passwordHint = document.getElementById('password-hint');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const usersTbody = document.getElementById('users-tbody');
const userCount = document.getElementById('user-count');
const emptyState = document.getElementById('empty-state');
const tableWrapper = document.querySelector('.table-wrapper');

// ===== STATE =====
let isEditing = false;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    form.addEventListener('submit', handleSubmit);
});

// ===== FETCH (LISTER) =====
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.success) {
            renderUsers(result.data);
        } else {
            showToast(result.error || 'Erreur lors du chargement.', 'error');
        }
    } catch (error) {
        showToast('Impossible de contacter le serveur.', 'error');
    }
}

// ===== RENDER TABLE =====
function renderUsers(users) {
    usersTbody.innerHTML = '';
    userCount.textContent = users.length;

    if (users.length === 0) {
        tableWrapper.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    tableWrapper.classList.remove('hidden');
    emptyState.classList.add('hidden');

    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        tr.style.animationDelay = `${index * 0.05}s`;

        const dateFormatted = user.created_at
            ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : '—';

        tr.innerHTML = `
            <td><strong>#${user.id}</strong></td>
            <td>${escapeHtml(user.nom)}</td>
            <td>${escapeHtml(user.prenom)}</td>
            <td><code>${escapeHtml(user.login)}</code></td>
            <td>${dateFormatted}</td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn btn-edit" title="Modifier" onclick="editUser(${user.id}, '${escapeAttr(user.nom)}', '${escapeAttr(user.prenom)}', '${escapeAttr(user.login)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="action-btn btn-delete" title="Supprimer" onclick="deleteUser(${user.id}, '${escapeAttr(user.nom)} ${escapeAttr(user.prenom)}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
            </td>
        `;
        usersTbody.appendChild(tr);
    });
}

// ===== HANDLE SUBMIT (CREATE / UPDATE) =====
async function handleSubmit(e) {
    e.preventDefault();

    const nom = nomInput.value.trim();
    const prenom = prenomInput.value.trim();
    const login = loginInput.value.trim();
    const password = passwordInput.value;

    if (!nom || !prenom || !login) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error');
        return;
    }

    if (!isEditing && !password) {
        showToast('Le mot de passe est obligatoire.', 'error');
        return;
    }

    const data = { nom, prenom, login };
    if (password) data.password = password;

    try {
        let response;

        if (isEditing) {
            data.id = parseInt(userIdInput.value);
            response = await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            data.password = password;
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            resetForm();
            fetchUsers();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Erreur réseau. Veuillez réessayer.', 'error');
    }
}

// ===== EDIT USER =====
function editUser(id, nom, prenom, login) {
    isEditing = true;
    userIdInput.value = id;
    nomInput.value = nom;
    prenomInput.value = prenom;
    loginInput.value = login;
    passwordInput.value = '';
    passwordInput.removeAttribute('required');
    passwordHint.classList.remove('hidden');

    formTitle.innerHTML = '<span class="form-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span> Modifier l\'utilisateur #' + id;
    btnSubmit.innerHTML = '<span class="btn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></span> Mettre à jour';
    btnCancel.classList.remove('hidden');

    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    nomInput.focus();
}

// ===== DELETE USER =====
let pendingDeleteId = null;

function deleteUser(id, fullName) {
    pendingDeleteId = id;
    document.getElementById('confirm-message').textContent =
        `Êtes-vous sûr de vouloir supprimer l'utilisateur "${fullName}" ?`;
    document.getElementById('confirm-modal').classList.remove('hidden');
    document.getElementById('confirm-ok').onclick = confirmDelete;
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    pendingDeleteId = null;
}

async function confirmDelete() {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;
    closeConfirmModal();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, _method: 'DELETE' })
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            fetchUsers();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Erreur réseau. Veuillez réessayer.', 'error');
    }
}

// ===== CANCEL EDIT =====
function cancelEdit() {
    resetForm();
}

// ===== RESET FORM =====
function resetForm() {
    isEditing = false;
    form.reset();
    userIdInput.value = '';
    passwordInput.setAttribute('required', 'required');
    passwordHint.classList.add('hidden');
    formTitle.innerHTML = '<span class="form-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></span> Inscrire un utilisateur';
    btnSubmit.innerHTML = '<span class="btn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></span> Enregistrer';
    btnCancel.classList.add('hidden');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    toast.className = `toast ${type}`;
    toastIcon.innerHTML = type === 'success'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    toastMessage.textContent = message;

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// ===== SECURITY HELPERS =====
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
