// js/script.js - Versão Final com APIs Abertas (SEM CHAVE)

const TARIFA_BASE = 5.00; // Seu custo fixo por entrega (em Reais)
const CUSTO_POR_KM = 2.00; // Seu custo por KM rodado (em Reais)

// API 1: Nominatim (Geocoding - Conversão de Endereço para Coordenadas)
async function getCoordinates(bairro) {
    const query = `${bairro}, Guaratinguetá, SP, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.length > 0) {
        // O Nominatim retorna [latitude, longitude]
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    // Lança um erro se o bairro não for encontrado
    throw new Error(`[ERRO API] Não foi possível localizar as coordenadas do bairro: ${bairro}.`); 
}

// API 2: OSRM (Routing - Cálculo de Rota Rodoviária)
async function obterDistanciaReal(origemBairro, destinoBairro) {
    const coordOrigem = await getCoordinates(origemBairro);
    const coordDestino = await getCoordinates(destinoBairro);
    
    // O OSRM usa o formato: lon,lat;lon,lat
    const url = `https://router.project-osrm.org/route/v1/driving/
        ${coordOrigem.lon},${coordOrigem.lat};
        ${coordDestino.lon},${coordDestino.lat}?overview=false`;
    
    // ATENÇÃO: Removemos quebras de linha e espaços extras
    const cleanedUrl = url.replace(/\s/g, ''); 

    const response = await fetch(cleanedUrl);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
        // O OSRM devolve a distância em metros
        const distanciaMetros = data.routes[0].summary.total_distance; 
        return distanciaMetros / 1000; // Converte para KM
    }
    
    throw new Error(`[ERRO API] Rota rodoviária não encontrada entre ${origemBairro} e ${destinoBairro}.`);
}


// A FUNÇÃO PRINCIPAL DE CÁLCULO
async function calcularFrete() {
    const selectColeta = document.getElementById('bairro-coleta');
    const selectEntrega = document.getElementById('bairro-entrega');
    const nomeColeta = selectColeta.value;
    const nomeEntrega = selectEntrega.value;

    const resultadoDiv = document.getElementById('resultado-frete');

    if (nomeColeta === nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">A coleta e a entrega não podem ser no mesmo bairro.</p>`;
        return;
    }

    // Exibe mensagem de carregamento enquanto a API trabalha
    resultadoDiv.innerHTML = `<p class="carregando">Calculando a rota em tempo real...</p>`;

    try {
        // 1. OBTÉM A DISTÂNCIA REAL POR API
        const distanciaKm = await obterDistanciaReal(nomeColeta, nomeEntrega); 

        // 2. APLICA A FÓRMULA DE PREÇO
        const valorFrete = TARIFA_BASE + (distanciaKm * CUSTO_POR_KM);
        
        // 3. EXIBE O RESULTADO
        resultadoDiv.innerHTML = `
            <p>Distância Rodoviária: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
            <p class="sucesso">Valor do Frete: <strong>R$ ${valorFrete.toFixed(2).replace('.', ',')}</strong></p>
        `;
    
    } catch (error) {
        // Exibe o erro da API ou de localização
        resultadoDiv.innerHTML = `<p class="erro">Erro no cálculo: ${error.message}</p>`;
    }
}
