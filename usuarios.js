// =================================================================
// CONFIGURAÇÃO
// ATENÇÃO: Substitua pela URL base da sua API ORDS para a tabela USUARIOS
// =================================================================
const apiUrlUsuarios = 'https://SEU_DOMINIO.oraclecloud.com/ords/SEU_SCHEMA/usuarios/';


// =================================================================
// LOGIN DE USUÁRIO (index.html)
// =================================================================
async function fazerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
        alert('Por favor, preencha o email e a senha.');
        return;
    }

    // AVISO DE SEGURANÇA: Em um app real, nunca passe a senha na URL.
    // O ideal seria um endpoint /login que recebe um POST e retorna um token.
    // Esta é uma simplificação para fins de demonstração com ORDS AutoREST.
    const filter = `?q={"email":{"$eq":"${email}"},"senha":{"$eq":"${senha}"}}`;
    
    try {
        const response = await fetch(apiUrlUsuarios + filter);
        if (!response.ok) throw new Error('Falha na comunicação com o servidor.');

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            alert('Login bem-sucedido!');
            // Armazena informações do usuário para uso futuro na aplicação
            sessionStorage.setItem('usuarioLogado', JSON.stringify(data.items[0]));
            // Redireciona para a página principal do sistema (ex: doadores.html)
            window.location.href = 'doadores.html'; 
        } else {
            alert('Email ou senha inválidos.');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Ocorreu um erro ao tentar fazer login. Tente novamente.');
    }
}


// =================================================================
// CRIAR CONTA (criar_conta.html)
// =================================================================
async function criarConta(event) {
    event.preventDefault();

    const senha = document.getElementById('senha').value;
    const confSenha = document.getElementById('confirmar_senha').value;

    if (senha !== confSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    const dadosNovaConta = {
        nome_usuario: document.getElementById('nome_usuario').value,
        email: document.getElementById('email').value,
        senha: senha, // Lembre-se do risco de segurança de enviar senha em texto puro
        nome_completo: document.getElementById('nome_completo').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        tipo_sanguineo: document.getElementById('tipo_sanguineo').value
        // Adicione outros campos se necessário
    };

    try {
        const response = await fetch(apiUrlUsuarios, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosNovaConta)
        });

        if (response.status === 201) { // 201 Created
            alert('Conta criada com sucesso! Você será redirecionado para a página de login.');
            window.location.href = 'index.html';
        } else {
            const errorData = await response.json();
            // Tenta dar uma mensagem de erro mais clara
            if (errorData.cause.includes('USUARIOS_U_CPF')) {
                 alert('Erro: O CPF informado já está cadastrado.');
            } else if (errorData.cause.includes('USUARIOS_U_EMAIL')) {
                 alert('Erro: O Email informado já está cadastrado.');
            } else {
                 throw new Error(errorData.title || 'Erro desconhecido ao criar a conta.');
            }
        }
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        alert(`Não foi possível criar a conta: ${error.message}`);
    }
}


// =================================================================
// ALTERAR SENHA (esqueceu.html)
// =================================================================
async function alterarSenha(event) {
    event.preventDefault();

    const cpf = document.getElementById('cpf_recuperacao').value;
    const novaSenha = document.getElementById('nova_senha').value;
    const confNovaSenha = document.getElementById('confirmar_nova_senha').value;

    if (novaSenha !== confNovaSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    // 1. Encontrar o usuário pelo CPF
    const filter = `?q={"cpf":{"$eq":"${cpf}"}}`;
    try {
        const responseGet = await fetch(apiUrlUsuarios + filter);
        if (!responseGet.ok) throw new Error('Falha ao buscar usuário.');
        
        const data = await responseGet.json();
        if (!data.items || data.items.length === 0) {
            alert('Nenhum usuário encontrado com o CPF informado.');
            return;
        }

        const usuario = data.items[0];

        // 2. Atualizar a senha do usuário encontrado
        const dadosUpdate = {
            senha: novaSenha
        };

        const responsePut = await fetch(apiUrlUsuarios + usuario.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosUpdate)
        });

        if (responsePut.ok) {
            alert('Senha alterada com sucesso!');
            window.location.href = 'index.html';
        } else {
            const errorData = await responsePut.json();
            throw new Error(errorData.title || 'Não foi possível atualizar a senha.');
        }

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        alert(`Ocorreu um erro: ${error.message}`);
    }
}

// Adiciona os listeners aos formulários quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    if (formLogin) formLogin.addEventListener('submit', fazerLogin);
    
    const formCriarConta = document.getElementById('form-criar-conta');
    if (formCriarConta) formCriarConta.addEventListener('submit', criarConta);

    const formEsqueceu = document.getElementById('form-esqueceu');
    if (formEsqueceu) formEsqueceu.addEventListener('submit', alterarSenha);
});