// js/script.js - Lógica Principal e Integração com APIs Abertas (SEM CHAVE)

// 1. CONFIGURAÇÃO DE PREÇOS
const TARIFA_BASE = 5.00; // Seu custo fixo por entrega (em Reais)
const CUSTO_POR_KM = 2.00; // Seu custo por KM rodado (em Reais)

// 2. LISTA COMPLETA DE BAIRROS (125 Itens)
const BAIRROS_DISPONIVEIS = [
    "Alto das Almas", "Área Rural de Guaratinguetá", "Aroeira", "Beira Rio II", "Belveder Clube dos 500", 
    "Bom Jardim I", "Bom Jardim II", "Bom Jardim III", "Bosque dos Ipês", "Campinho", 
    "Campo do Galvão", "CECAP", "Centro", "Chácara Selles", "Chácaras Piagui", 
    "Chácaras Santa Edwirges", "Chácaras Santa Maria I", "Chácaras Vitória", "Cohab Bandeirante", "Condomínio Residencial Hípica", 
    "Condomínio Residencial Prefeito Gilberto Filippo", "Condomínio Residencial Santa Mônica", "Conjunto Habitacional Vista das Paineiras", "Cooperi", "Engenheiro Neiva", 
    "Escola Especialista da Aeronáutica", "Figueira", "Granja Patury", "Internacional Park", "Jardim Aeroporto", 
    "Jardim Alvorada", "Jardim Bela Vista", "Jardim Bela Vista II", "Jardim Coelho Neto", "Jardim David Fernandes Coelho", 
    "Jardim do Vale", "Jardim do Vale I", "Jardim do Vale II", "Jardim Esperança", "Jardim Esplanada", 
    "Jardim França I", "Jardim França II", "Jardim Ícaro", "Jardim Indepedência", "Jardim Modelo", 
    "Jardim Padroeira", "Jardim Panorama", "Jardim Panorama II", "Jardim Pérola", "Jardim Primavera", 
    "Jardim Rony", "Jardim Santa Luzia", "Jardim São Manoel", "Jardim Tamandaré", "Jardim Vista Alegre", 
    "Loteamento Chácaras Patury", "Loteamento Chácaras Santana", "Loteamento Doutor Walter Arantes", "Loteamento São Pedro", "Nova Guará", 
    "Núcleo Residencial Adhemar de Barros", "Núcleo Residencial Costa e Silva", "Olaria José Benedito", "Parque das Alamedas", "Parque das Árvores", 
    "Parque das Garças", "Parque do Sol", "Parque Industrial II", "Parque Residencial André Broca Filho", "Parque Residencial Anna Guilhermina Rois Alves", 
    "Parque Residencial Beira Rio", "Parque Residencial Mirante do Vale", "Parque Santa Clara", "Parque São Francisco", "Parque São Francisco III", 
    "Pedregulho", "Pedreira", "Pedrinha", "Pingo de Ouro", "Pólo Industrial José Pires de Castro", 
    "Portal das Colinas", "Recreio Pedrinhas", "Residencial Alberto Byington", "Residencial Arduíno Verreschi", "Residencial Augusto Filippo", 
    "Residencial Bosque das Quaresmeiras", "Residencial Colinas dos Resedás", "Residencial COOPEMI I", "Residencial Esplanada", "Residencial Nino", 
    "Residencial Santa Bárbara", "Residencial Shangri-La", "Residencial Village Santana", "Rocinha", "Santa Rita", 
    "São Benedito", "São Dimas", "São Gonçalo", "Vale das Serras Residencia", "Vila Alves", 
    "Vila Angelina", "Vila Antunes", "Vila Bela", "Vila Brasil", "Vila Comendador Rodrigues Alves", 
    "Vila dos Comerciários I", "Vila dos Comerciários II", "Vila Eliana Maria", "Vila Frei Galvão", "Vila Galvão", 
    "Vila Guará", "Vila Indiana", "Vila Jacobelli", "Vila Municipal I", "Vila Ofélia", 
    "Vila Paraíba", "Vila Regina", "Vila Rosa", "Vila Santa Maria", "Vila Santa Rita", 
    "Vila São Bento", "Vila São José", "Village Mantiqueira", "Ilha dos Ingas", "Loteamento São Manoel"
]; 


// API 1: Nominatim (Geocoding - Conversão de Endereço para Coordenadas)
// Não requer chave de API.
async function getCoordinates(bairro) {
    // Adiciona "Guaratinguetá, SP, Brasil" para garantir a precisão
    const query = `${bairro}, Guaratinguetá, SP, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.length > 0) {
        // Retorna as coordenadas [latitude, longitude]
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    throw new Error(`[ERRO Localização] Não foi possível localizar o ponto central de: ${bairro}.`); 
}

// API 2: OSRM (Routing - Cálculo de Rota Rodoviária)
// Não requer chave de API.
async function obterDistanciaReal(origemBairro, destinoBairro) {
    const coordOrigem = await getCoordinates(origemBairro);
    const coordDestino = await getCoordinates(destinoBairro);
    
    // O OSRM usa o formato: lon,lat;lon,lat
    const url = `https://router.project-osrm.org/route/v1/driving/${coordOrigem.lon},${coordOrigem.lat};${coordDestino.lon},${coordDestino.lat}?overview=false`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
        // O OSRM devolve a distância em metros
        const distanciaMetros = data.routes[0].summary.total_distance; 
        return distanciaMetros / 1000; // Converte para KM
    }
    
    throw new Error(`[ERRO Rota] Não foi possível calcular a rota rodoviária.`);
}


// FUNÇÕES DE SUPORTE
document.addEventListener('DOMContentLoaded', () => {
    // Preenche os dropdowns com a lista completa de bairros
    const preencherDropdown = (id) => {
        const select = document.getElementById(id);
        BAIRROS_DISPONIVEIS.sort().forEach(bairro => { // Organiza a lista em ordem alfabética
            const option = document.createElement('option');
            option.value = bairro; 
            option.textContent = bairro; 
            select.appendChild(option);
        });
    };

    preencherDropdown('bairro-coleta');
    preencherDropdown('bairro-entrega');
});


// FUNÇÃO PRINCIPAL QUE CALCULA O FRETE
async function calcularFrete() {
    const selectColeta = document.getElementById('bairro-coleta');
    const selectEntrega = document.getElementById('bairro-entrega');
    const nomeColeta = selectColeta.value;
    const nomeEntrega = selectEntrega.value;

    const resultadoDiv = document.getElementById('resultado-frete');

    if (!nomeColeta || !nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">Por favor, selecione os bairros de Coleta e Entrega.</p>`;
        return;
    }

    if (nomeColeta === nomeEntrega) {
        resultadoDiv.innerHTML = `<p class="erro">A coleta e a entrega não podem ser no mesmo local.</p>`;
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
