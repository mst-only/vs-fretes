// js/script.js - Solução Matriz Manual (100% Funcional sem API)

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


// 2. LISTA DE BAIRROS ATENDIDOS
// ATENÇÃO: Mantenha apenas os bairros que você cadastrar na matriz no passo 3.
const BAIRROS_DISPONIVEIS = [
    "Centro", "Pedregulho", "Vila Paraíba", "Vila Brasil", "CECAP", 
    "Jardim do Vale", "São Benedito", "Campo do Galvão", "Engenheiro Neiva"
    // Adicione o restante dos bairros aqui, um de cada vez.
]; 


// 3. MATRIZ MANUAL DE DISTÂNCIAS - VOCÊ PRECISA PREENCHER AQUI!
// Chave deve ser: "BAIRRO A|BAIRRO B" (em ordem alfabética, com os nomes EXATOS da lista acima)
// Valor deve ser: a distância rodoviária em KM (Ex: 2.5)
const DISTANCIAS_MANUAIS = {
    // EXEMPLOS PREENCHIDOS:
    "CECAP|Centro": 3.5,
    "Centro|Pedregulho": 2.5, 
    "São Benedito|Vila Brasil": 1.2,
    "CECAP|Vila Paraíba": 5.0,
    // Adicione todas as outras combinações (coleta-entrega) aqui.
};


// FUNÇÃO AUXILIAR: Encontra a distância na matriz
function obterDistanciaNaMatriz(origem, destino) {
    // Garante que a chave seja sempre a mesma, independente da ordem (A|B ou B|A)
    const bairrosOrdenados = [origem, destino].sort();
    const chave = `${bairrosOrdenados[0]}|${bairrosOrdenados[1]}`;
    
    // Retorna a distância ou -999 se não encontrar
    return DISTANCIAS_MANUAIS[chave] !== undefined ? DISTANCIAS_MANUAIS[chave] : -999;
}


// --- LÓGICA PRINCIPAL DE EXECUÇÃO ---

// Função que preenche o datalist
function preencherDatalist() {
    const datalist = document.getElementById('bairros-lista');
    if (datalist) {
        // Usa apenas os bairros que estão na lista
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
        resultadoDiv.innerHTML = `<p class="erro">Por favor, preencha ambos os campos de Coleta e Entrega.</p>`;
        return;
    }
    
    // A validação verifica se o bairro digitado está na lista BAIRROS_DISPONIVEIS
    if (!BAIRROS_DISPONIVEIS.includes(nomeColeta) || !BAIRROS_DISPONIVEIS.includes(nomeEntrega)) {
        resultadoDiv.innerHTML = `<p class="erro">Um ou ambos os bairros digitados não estão na lista de áreas atendidas.</p>`;
        return;
    }

    if (nomeColeta === nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">A coleta e a entrega não podem ser no mesmo local.</p>`;
        return;
    }

    // 1. OBTÉM A DISTÂNCIA DA MATRIZ INTERNA (SEM API)
    const distanciaKm = obterDistanciaNaMatriz(nomeColeta, nomeEntrega); 

    // Se a distância não for encontrada na matriz
    if (distanciaKm === -999) {
        resultadoDiv.innerHTML = `<p class="erro">A rota entre ${nomeColeta} e ${nomeEntrega} ainda não foi cadastrada na tabela de preços.</p>`;
        return;
    }
    
    // 2. APLICA A LÓGICA DE PREÇO FIXO
    const valorFrete = calcularPrecoFixo(distanciaKm);
    
    // 3. EXIBE O RESULTADO
    if (valorFrete === -1) {
        resultadoDiv.innerHTML = `
            <p>Distância Cadastrada: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
            <p class="erro">Esta rota está fora da tabela de fretes (limite: 10 KM).</p>
        `;
        return;
    }
    
    resultadoDiv.innerHTML = `
        <p>Distância Cadastrada: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
        <p class="sucesso">Valor do Frete (Fixo): <strong>R$ ${valorFrete.toFixed(2).replace('.', ',')}</strong></p>
    `;
}


// Evento que GARANTE que tudo funcionará após o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    preencherDatalist();

    const form = document.getElementById('frete-form');
    if (form) {
        form.addEventListener('submit', calcularFrete);
    }
});
