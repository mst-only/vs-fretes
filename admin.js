document.addEventListener('DOMContentLoaded', () => {
    
    let ADMIN_PASSWORD = 'vsadmin'; 
    
    const loginArea = document.getElementById('login-area');
    const adminContent = document.getElementById('admin-content');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Carregar a senha e URL salvas no navegador
    const storedPassword = localStorage.getItem('adminPasswordVSFretes');
    if (storedPassword) {
        ADMIN_PASSWORD = storedPassword;
    }
    const storedUrl = localStorage.getItem('backendUrlVSFretes');
    if (storedUrl) {
        document.getElementById('api-url-input').value = storedUrl;
    }
    

    // 1. LÓGICA DE LOGIN
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = document.getElementById('admin-password').value;

        if (enteredPassword === ADMIN_PASSWORD) {
            loginArea.style.display = 'none';
            adminContent.style.display = 'block';
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    });

    // 2. ATUALIZAÇÃO DE SENHA
    document.getElementById('update-password-btn').addEventListener('click', () => {
        const newPass = document.getElementById('new-admin-password').value;
        const confirmPass = document.getElementById('confirm-admin-password').value;

        if (newPass.length < 5 || newPass !== confirmPass) {
             alert('Erro: Senhas não coincidem ou são muito curtas.');
             return;
        }
        ADMIN_PASSWORD = newPass;
        localStorage.setItem('adminPasswordVSFretes', newPass); 
        alert('Senha do Administrador atualizada com sucesso!');
        document.getElementById('new-admin-password').value = '';
        document.getElementById('confirm-admin-password').value = '';
    });

    // 3. ATUALIZAÇÃO DA URL DA API
    document.getElementById('save-url-btn').addEventListener('click', () => {
        const newUrl = document.getElementById('api-url-input').value.trim();
        if (newUrl.length > 5) {
            localStorage.setItem('backendUrlVSFretes', newUrl); 
            alert('URL do Backend (Netlify Function) salva com sucesso! O site agora usará esta URL para calcular.');
        } else {
            alert('Erro: A URL parece inválida.');
        }
    });
});
