// =================================================================
// CONFIGURAÇÃO
// ATENÇÃO: Substitua pela URL base da sua API ORDS
// =================================================================
const apiUrl = 'https://SEU_DOMINIO.oraclecloud.com/ords/SEU_SCHEMA/doadores/';


// =================================================================
// READ (Ler/Listar Doadores)
// Lógica que estaria na view "listar_doadores" em views.py
// =================================================================
async function listarDoadores() {
    const tabelaCorpo = document.querySelector("#doadores-tabela tbody");
    if (!tabelaCorpo) return; // Só executa se estiver na página de listagem
    
    tabelaCorpo.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Falha na rede');
        const data = await response.json();
        
        tabelaCorpo.innerHTML = ""; // Limpa a tabela

        if (!data.items || data.items.length === 0) {
            tabelaCorpo.innerHTML = '<tr><td colspan="5">Nenhum doador cadastrado.</td></tr>';
            return;
        }

        data.items.forEach(doador => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doador.id}</td>
                <td>${doador.nome_completo || ''}</td>
                <td>${doador.email || ''}</td>
                <td>${doador.tipo_sanguineo || ''}</td>
                <td class="button-group">
                    <button class="button" onclick="editarDoador(${doador.id})">Editar</button>
                    <button class="button-danger" onclick="deletarDoador(${doador.id})">Excluir</button>
                </td>
            `;
            tabelaCorpo.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao listar doadores:", error);
        tabelaCorpo.innerHTML = `<tr><td colspan="5">Não foi possível carregar os doadores.</td></tr>`;
    }
}

// =================================================================
// CREATE & UPDATE (Criar e Atualizar Doador)
// Lógica que estaria na view "criar_ou_atualizar_doador" em views.py
// =================================================================
async function salvarDoador(event) {
    event.preventDefault();

    const doadorId = new URLSearchParams(window.location.search).get('id');
    const isEditMode = Boolean(doadorId);

    const dadosDoador = {
        nome_completo: document.getElementById('nome_completo').value,
        email: document.getElementById('email').value,
        cpf: document.getElementById('cpf').value,
        tipo_sanguineo: document.getElementById('tipo_sanguineo').value
    };

    const method = isEditMode ? 'PUT' : 'POST';
    const finalUrl = isEditMode ? `${apiUrl}${doadorId}` : apiUrl;

    try {
        const response = await fetch(finalUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosDoador)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.title || 'Erro ao salvar os dados.');
        }

        alert('Doador salvo com sucesso!');
        window.location.href = 'doadores.html'; // Redireciona para a lista
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert(`Falha ao salvar: ${error.message}`);
    }
}

// =================================================================
// DELETE (Apagar Doador)
// Lógica que estaria na view "deletar_doador" em views.py
// =================================================================
async function deletarDoador(id) {
    if (!confirm('Tem certeza que deseja excluir este doador? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`${apiUrl}${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao excluir o doador.');
        
        alert('Doador excluído com sucesso!');
        listarDoadores(); // Recarrega a lista de doadores
    } catch (error) {
        console.error("Erro ao deletar:", error);
        alert(error.message);
    }
}

// =================================================================
// FUNÇÕES AUXILIARES
// =================================================================

// Redireciona para o formulário de edição
function editarDoador(id) {
    window.location.href = `criar_doador.html?id=${id}`;
}

// Preenche o formulário se estivermos em modo de edição
async function preencherFormularioParaEdicao() {
    const doadorId = new URLSearchParams(window.location.search).get('id');
    if (!doadorId) return; // Não está em modo de edição

    document.getElementById('form-titulo').innerText = 'Editar Doador';

    try {
        const response = await fetch(`${apiUrl}${doadorId}`);
        if (!response.ok) throw new Error('Doador não encontrado.');
        
        const doador = await response.json();
        
        document.getElementById('nome_completo').value = doador.nome_completo;
        document.getElementById('email').value = doador.email;
        document.getElementById('cpf').value = doador.cpf;
        document.getElementById('tipo_sanguineo').value = doador.tipo_sanguineo;

    } catch(error) {
        alert('Não foi possível carregar os dados para edição.');
        window.location.href = 'doadores.html';
    }
}