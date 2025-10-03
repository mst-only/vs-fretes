// js/script.js - Lógica Final com Conexão Reforçada

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
        return -1; 
    }
}


// 2. LISTA COMPLETA DE BAIRROS (125 Itens)
const BAIRROS_DISPONIVEIS = [
    // MANTENHA ESTA LISTA IGUAL À SUA VERSÃO MAIS RECENTE
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


// API 1: Nominatim (Geocoding) - Converte Nome em Coordenadas
async function getCoordinates(bairro) {
    const query = `${bairro}, Guaratinguetá, SP, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    
    // Configura um Controller para tempo limite (TIMEOUT)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'CalculadoraFreteGuaratingueta-V1' },
            signal: controller.signal // Aplica o timeout
        });
        
        clearTimeout(timeoutId); // Cancela o timeout se a resposta for rápida
        
        if (!response.ok) {
            throw new Error(`Servidor de localização (Nominatim) não respondeu. Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
        throw new Error(`[ERRO Localização] Não foi possível localizar o ponto central de: ${bairro}.`); 
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`[ERRO Localização] A API de localização demorou demais para responder (Timeout).`);
        }
        throw new Error(`[ERRO Localização] Falha na comunicação com o servidor. Tente novamente.`);
    }
}

// API 2: OSRM (Routing) - Calcula a Rota Rodoviária
async function obterDistanciaReal(origemBairro, destinoBairro) {
    const coordOrigem = await getCoordinates(origemBairro);
    const coordDestino = await getCoordinates(destinoBairro);
    
    const url = `https://router.project-osrm.org/route/v1/driving/${coordOrigem.lon},${coordOrigem.lat};${coordDestino.lon},${coordDestino.lat}?overview=false`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`[ERRO API] Servidor de Rota (OSRM) não respondeu. Status: ${response.status}`);
        }

        const data = await response.json();
        
        // VERIFICAÇÃO ROBUSTA
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0 || !data.routes[0].summary || !data.routes[0].summary.total_distance) {
            throw new Error(`O cálculo falhou. Não foi possível traçar uma rota válida entre ${origemBairro} e ${destinoBairro}.`);
        }

        const distanciaMetros = data.routes[0].summary.total_distance; 
        return distanciaMetros / 1000; // Converte para KM
        
    } catch (error) {
        // Trata erros de rede mais genéricos
        if (error.message.includes('O cálculo falhou')) {
             throw error; // Lança o erro específico da API
        }
        throw new Error(`[ERRO Rota] Falha de comunicação de rede. Verifique sua conexão ou tente novamente.`);
    }
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

    resultadoDiv.innerHTML = `<p class="carregando">Calculando a rota em tempo real...</p>`;

    try {
        const distanciaKm = await obterDistanciaReal(nomeColeta, nomeEntrega); 
        const valorFrete = calcularPrecoFixo(distanciaKm);
        
        if (valorFrete === -1) {
            resultadoDiv.innerHTML = `
                <p>Distância Rodoviária: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
                <p class="erro">Esta rota de <strong>${distanciaKm.toFixed(2)} KM</strong> está fora da tabela de fretes (limite: 10 KM).</p>
            `;
            return;
        }

        resultadoDiv.innerHTML = `
            <p>Distância Rodoviária: <strong>${distanciaKm.toFixed(2)} KM</strong></p>
            <p class="sucesso">Valor do Frete (Fixo): <strong>R$ ${valorFrete.toFixed(2).replace('.', ',')}</strong></p>
        `;
    
    } catch (error) {
        resultadoDiv.innerHTML = `<p class="erro">Erro no cálculo: ${error.message}</p>`;
    }
}


// Evento que GARANTE que tudo funcionará após o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    preencherDatalist();

    const form = document.getElementById('frete-form');
    if (form) {
        form.addEventListener('submit', calcularFrete);
    }
});
