// js/script.js - Rota Simplificada para Teste Final (SEM API)

// 1. REGRA DE PRECIFICAÇÃO FIXA POR FAIXA DE KM
function calcularPrecoFixo(distanciaKm) {
    if (distanciaKm <= 1.5) {
        return 150.00;
    } else if (distanciaKm <= 5.0) {
        return 250.00;
    } else if (distanciaKm <= 7.0) {
        return 400.00;
    } else if (distanciaKm <= 10.0) {
        return 600.00;
    } else {
        return -1; // Fora do limite
    }
}


// 2. LISTA DE BAIRROS ATENDIDOS (APENAS DOIS)
const BAIRROS_DISPONIVEIS = [
    "Centro", 
    "Pedregulho"
]; 


// 3. MATRIZ MANUAL DE DISTÂNCIAS (APENAS UMA ROTA)
const DISTANCIAS_MANUAIS = {
    // Rota solicitada: 2.5 KM
    "Centro|Pedregulho": 2.5
};


// FUNÇÃO AUXILIAR: Encontra a distância na matriz
function obterDistanciaNaMatriz(origem, destino) {
    // Garante que a chave seja "Centro|Pedregulho" ou "Pedregulho|Centro"
    const bairrosOrdenados = [origem, destino].sort();
    const chave = `${bairrosOrdenados[0]}|${bairrosOrdenados[1]}`;
    
    // Retorna 2.5 ou -999 (erro)
    return DISTANCIAS_MANUAIS[chave] !== undefined ? DISTANCIAS_MANUAIS[chave] : -999;
}


// --- LÓGICA PRINCIPAL DE EXECUÇÃO ---

// Função que preenche o datalist
function preencherDatalist() {
    const datalist = document.getElementById('bairros-lista');
    if (datalist) {
        BAIRROS_DISPONIVEIS.sort().forEach(bairro => { 
            const option = document.createElement('option');
            option.value = bairro; 
            datalist.appendChild(option);
        });
    }
}


// Função que calcula e exibe o frete
async function calcularFrete(event) {
    event.preventDefault(); 
    
    const nomeColeta = document.getElementById('bairro-coleta-input').value.trim();
    const nomeEntrega = document.getElementById('bairro-entrega-input').value.trim();

    const resultadoDiv = document.getElementById('resultado-frete');

    if (!nomeColeta || !nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">Por favor, preencha ambos os campos.</p>`;
        return;
    }
    
    if (nomeColeta === nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">A coleta e a entrega não podem ser no mesmo local.</p>`;
        return;
    }
    
    // Apenas Centro e Pedregulho devem funcionar
    if (!BAIRROS_DISPONIVEIS.includes(nomeColeta) || !BAIRROS_DISPONIVEIS.includes(nomeEntrega)) {
         resultadoDiv.innerHTML = `<p class="erro">Apenas a rota Centro-Pedregulho está cadastrada para teste. Verifique a digitação.</p>`;
        return;
    }


    // OBTÉM A DISTÂNCIA DA MATRIZ INTERNA
    const distanciaKm = obterDistanciaNaMatriz(nomeColeta, nomeEntrega); 

    // Se o código chegou até aqui, a distância é 2.5 KM.
    if (distanciaKm === -999) {
        resultadoDiv.innerHTML = `<p class="erro">Rota interna não encontrada. Erro de código.</p>`;
        return;
    }
    
    const valorFrete = calcularPrecoFixo(distanciaKm);
    
    // EXIBE O RESULTADO FINAL
    resultadoDiv.innerHTML = `
        <p>Distância Cadastrada: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
        <p class="sucesso">Valor do Frete (Fixo): <strong>R$ ${valorFrete.toFixed(2).replace('.', ',')}</strong></p>
    `;
}


// Conexão do Formulário com o JavaScript
document.addEventListener('DOMContentLoaded', () => {
    preencherDatalist();

    const form = document.getElementById('frete-form');
    if (form) {
        form.addEventListener('submit', calcularFrete);
        // Log para confirmar que a conexão ocorreu
        console.log("Script carregado e listener anexado."); 
    } else {
        console.error("ERRO GRAVE: O formulário com ID 'frete-form' não foi encontrado.");
    }
});
