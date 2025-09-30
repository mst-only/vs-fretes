// O código Serverless Function (Node.js)
const axios = require('axios');

// VARIÁVEIS DE AMBIENTE: Netlify irá substituir estes valores pelos links do seu Sheety.
// Eles devem ser configurados no painel da Netlify.
const TARIFAS_API_URL = process.env.TARIFAS_API_URL; 
const DISTANCIAS_API_URL = process.env.DISTANCIAS_API_URL; 


// Função principal que a Netlify executa
exports.handler = async (event) => {
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Método não permitido" }) };
    }
    
    const { origem, destino } = JSON.parse(event.body);

    if (!origem || !destino) {
        return { statusCode: 400, body: JSON.stringify({ message: "Faltam os bairros de origem ou destino." }) };
    }

    // Verifica se as variáveis de ambiente foram carregadas
    if (!TARIFAS_API_URL || !DISTANCIAS_API_URL) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
                message: "As URLs de API (do Google Sheets) não foram configuradas no painel da Netlify." 
            }) 
        };
    }

    try {
        // --- BUSCA DE DADOS ---
        
        // Busca a tabela de tarifas
        const [tarifasResponse, distanciasResponse] = await Promise.all([
            axios.get(TARIFAS_API_URL),
            axios.get(DISTANCIAS_API_URL)
        ]);

        // A estrutura de dados depende do Sheety. Usamos 'data' como um palpite comum.
        const tabelaTarifas = tarifasResponse.data.data || tarifasResponse.data; 
        const distancias = distanciasResponse.data.data || distanciasResponse.data; 

        // --- CÁLCULO DE DISTÂNCIA ---
        const chaveRota = `${origem}-${destino}`;
        const chaveRotaInversa = `${destino}-${origem}`;
        
        let distanciaKM = 0;
        let rotaEncontrada = distancias.find(d => 
            (d.rota === chaveRota) || (d.rota === chaveRotaInversa)
        );

        if (rotaEncontrada) {
            distanciaKM = rotaEncontrada.km; // Assume que o campo é 'km' conforme o Sheety
        } else {
            // Se a rota não foi mapeada no Google Sheets, usa um valor padrão alto.
            distanciaKM = 15.0; 
            console.log(`Rota ${chaveRota} não mapeada. Usando estimativa de ${distanciaKM}km.`);
        }


        // --- CÁLCULO DA TARIFA ---
        let valorFrete = 0;
        
        // Garante que a tabela está ordenada por max_km
        tabelaTarifas.sort((a, b) => parseFloat(a.max_km) - parseFloat(b.max_km)); 

        for (const faixa of tabelaTarifas) {
            const maxKm = parseFloat(faixa.max_km);
            const valorRs = parseFloat(faixa.valor_rs);

            if (distanciaKM <= maxKm) {
                valorFrete = valorRs;
                break;
            }
        }
        
        // Se a distância for maior que a última faixa, usa o valor da última
        if (valorFrete === 0 && tabelaTarifas.length > 0) {
            valorFrete = parseFloat(tabelaTarifas[tabelaTarifas.length - 1].valor_rs);
        }


        // Retorna o resultado para o Frontend
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                valor: valorFrete,
                distancia: distanciaKM,
                message: "Cálculo realizado com sucesso!"
            }),
        };

    } catch (error) {
        console.error('Erro no processamento da função ou ao acessar APIs:', error.message);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "Erro interno no servidor de cálculo. Verifique os links das APIs no Sheety/Netlify.",
                errorDetail: error.message 
            }),
        };
    }
};

