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
// Preencha esta lista com todos os bairros que você atende.
const BAIRROS_DISPONIVEIS = [
    // Bairros para Teste
    "Centro", 
    "Pedregulho", 
    "Vila Paraíba", 
    "Vila Brasil", 
    "CECAP", 
    "Jardim do Vale", 
    "São Benedito", 
    "Campo do Galvão", 
    "Engenheiro Neiva"
    // Adicione o restante dos bairros aqui, garantindo que o nome seja EXATO.
]; 


// 3. MATRIZ MANUAL DE DISTÂNCIAS - VOCÊ PRECISA PREENCHER AQUI!
// Chave: "BAIRRO A|BAIRRO B" (em ordem alfabética para busca fácil)
// Valor: Distância rodoviária em KM.
const DISTANCIAS_MANUAIS = {
    // EXEMPLOS PREENCHIDOS:
    "CECAP|Centro": 3.5,
    "Centro|Pedregulho": 2.5, 
    "São Benedito|Vila Brasil": 1.2,
    "CECAP|Vila Paraíba": 5.0,
    // ADICIONE TODAS AS SUAS COMBINAÇÕES AQUI:
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
    
    if (!BAIRROS_DISPONIVEIS.includes(nomeColeta) || !BAIRROS_DISPONIVEIS.includes(nomeEntrega)) {
        resultadoDiv.innerHTML = `<p class="erro">Um ou ambos os bairros digitados não estão na lista de áreas atendidas.</p>`;
        return;
    }

    if (nomeColeta === nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">A coleta e a entrega não podem ser no mesmo local.</p>`;
        return;
    }

    // OBTÉM A DISTÂNCIA DA MATRIZ INTERNA
    const distanciaKm = obterDistanciaNaMatriz(nomeColeta, nomeEntrega); 

    // TRATAMENTO DE ERRO: Rota não cadastrada (você precisa cadastrar no DISTANCIAS_MANUAIS)
    if (distanciaKm === -999) {
        resultadoDiv.innerHTML = `<p class="erro">O cálculo falhou. A rota entre <strong>${nomeColeta}</strong> e <strong>${nomeEntrega}</strong> ainda não foi cadastrada na tabela de preços.</p>`;
        return;
    }
    
    const valorFrete = calcularPrecoFixo(distanciaKm);
    
    // TRATAMENTO DE ERRO: Fora do limite de 10km
    if (valorFrete === -1) {
        resultadoDiv.innerHTML = `
            <p>Distância Cadastrada: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
            <p class="erro">Esta rota está fora da tabela de fretes (limite: 10 KM).</p>
            `;
        return;
    }
    
    // EXIBE O RESULTADO FINAL
    resultadoDiv.innerHTML = `
        <p>Distância Cadastrada: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
        <p class="sucesso">Valor do Frete (Fixo): <strong>R$ ${valorFrete.toFixed(2).replace('.', ',')}</strong></p>
    `;
}


// Evento que garante que o código é executado SOMENTE após o HTML estar pronto
document.addEventListener('DOMContentLoaded', () => {
    preencherDatalist();

    const form = document.getElementById('frete-form');
    if (form) {
        // CONEXÃO CRÍTICA: Liga o evento 'submit' à função 'calcularFrete'
        form.addEventListener('submit', calcularFrete);
    } else {
        console.error("ERRO DE CONEXÃO: Elemento com ID 'frete-form' não foi encontrado. O botão não funcionará.");
    }
});
