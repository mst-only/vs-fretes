
document.addEventListener('DOMContentLoaded', () => {

    const WHATSAPP_BASE_URL = 'https://api.whatsapp.com/send?phone=5512982735317&text=';
    
    // URL DA SUA FUNÇÃO BACKEND NA NETLIFY
    // Por padrão, usa o caminho local na Netlify
    let backendUrl = '/.netlify/functions/calcularFrete'; 

    // Tentativa de carregar a URL salva pelo ADM
    const storedUrl = localStorage.getItem('backendUrlVSFretes');
    if (storedUrl) {
        backendUrl = storedUrl;
    }

    const itemSelect = document.getElementById('item-select');
    const itemOutro = document.getElementById('item-outro');
    const labelOutro = document.getElementById('label-outro');

    itemSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Outro') {
            itemOutro.style.display = 'block';
            labelOutro.style.display = 'block';
            itemOutro.setAttribute('required', 'required');
        } else {
            itemOutro.style.display = 'none';
            labelOutro.style.display = 'none';
            itemOutro.removeAttribute('required');
        }
    });

    // Lógica de Chamada ao Backend (Serverless Function)
    document.getElementById('calcular-frete-btn').addEventListener('click', async () => {
        if (!validateForm()) {
            alert("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        const coletaBairro = document.getElementById('coleta-bairro').value.trim().toUpperCase();
        const entregaBairro = document.getElementById('entrega-bairro').value.trim().toUpperCase();
        
        const resultadoDiv = document.getElementById('resultado-calculo');
        document.getElementById('valor-calculado').textContent = 'Calculando...';
        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });

        try {
            // Chamada à função Serverless
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    origem: coletaBairro,
                    destino: entregaBairro,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso: Exibe os resultados do cálculo
                document.getElementById('distancia-calculada').textContent = `Distância Estimada: ${data.distancia.toFixed(1)} km`;
                document.getElementById('valor-calculado').textContent = `R$ ${data.valor.toFixed(2).replace('.', ',')}`;
            } else {
                // Erro do Backend
                document.getElementById('distancia-calculada').textContent = `Erro: ${data.message || 'Falha ao calcular.'}`;
                document.getElementById('valor-calculado').textContent = `R$ 0,00`;
                alert(`Erro no Cálculo: ${data.message || 'A função de cálculo pode não estar ativa ou o bairro não foi mapeado.'}`);
            }

        } catch (error) {
            console.error('Erro na requisição da API:', error);
            document.getElementById('distancia-calculada').textContent = 'Erro de Conexão';
            document.getElementById('valor-calculado').textContent = `R$ 0,00`;
            alert("Erro de conexão com o servidor de cálculo. Verifique a URL na página ADM.");
        }
    });


    // Lógica do Botão "Solicitar Frete" (WhatsApp)
    document.getElementById('solicitar-frete-btn').addEventListener('click', () => {
        
        const itemSelecionado = itemSelect.value === 'Outro' ? itemOutro.value : itemSelect.value;
        const nome = document.getElementById('nome-usuario').value.trim();
        const horario = document.getElementById('horario-frete').value;

        const coleta = {
            cep: document.getElementById('coleta-cep').value.trim(),
            end: document.getElementById('coleta-endereco').value.trim(),
            num: document.getElementById('coleta-numero').value.trim(),
            comp: document.getElementById('coleta-complemento').value.trim(),
            bairro: document.getElementById('coleta-bairro').value.trim(),
        };

        const entrega = {
            cep: document.getElementById('entrega-cep').value.trim(),
            end: document.getElementById('entrega-endereco').value.trim(),
            num: document.getElementById('entrega-numero').value.trim(),
            comp: document.getElementById('entrega-complemento').value.trim(),
            bairro: document.getElementById('entrega-bairro').value.trim(),
        };
        
        const valorFinal = document.getElementById('valor-calculado').textContent;
        const distanciaFinal = document.getElementById('distancia-calculada').textContent;


        let mensagem = `*SOLICITAÇÃO DE FRETE - VS FRETES* %0A%0A`;
        mensagem += `*1. SOLICITANTE:* ${nome} %0A`;
        mensagem += `*2. ITEM(NS):* ${itemSelecionado} %0A`;
        mensagem += `*3. HORÁRIO DESEJADO:* ${horario || 'Não especificado'} %0A%0A`;
        
        mensagem += `*4. ENDEREÇO DE COLETA (ORIGEM):*%0A`;
        mensagem += `- CEP: ${coleta.cep} %0A`;
        mensagem += `- Endereço: ${coleta.end}, N° ${coleta.num} %0A`;
        mensagem += `- Bairro: ${coleta.bairro} %0A`;
        if (coleta.comp) {
            mensagem += `- Complemento: ${coleta.comp} %0A%0A`;
        }

        mensagem += `*5. ENDEREÇO DE ENTREGA (DESTINO):*%0A`;
        mensagem += `- CEP: ${entrega.cep} %0A`;
        mensagem += `- Endereço: ${entrega.end}, N° ${entrega.num} %0A`;
        mensagem += `- Bairro: ${entrega.bairro} %0A`;
        if (entrega.comp) {
            mensagem += `- Complemento: ${entrega.comp} %0A%0A`;
        }

        mensagem += `*6. VALOR CALCULADO:* ${valorFinal} %0A`;
        mensagem += `*7. ESTIMATIVA:* ${distanciaFinal} %0A%0A`;
        mensagem += `Por favor, confirme a disponibilidade e o valor final.`;

        window.open(WHATSAPP_BASE_URL + mensagem, '_blank');
    });

    // Lógica do Botão "Nova Simulação"
    document.getElementById('novo-frete-btn').addEventListener('click', () => {
        document.getElementById('resultado-calculo').style.display = 'none';
        document.querySelectorAll('input, select').forEach(input => {
            if (input.type !== 'submit' && input.type !== 'button') {
                input.value = '';
            }
        });
        itemOutro.style.display = 'none';
        labelOutro.style.display = 'none';
        document.getElementById('nome-usuario').focus();
    });

    // Função de Validação
    function validateForm() {
        const requiredFields = document.querySelectorAll('[required]');
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.border = '2px solid red';
                isValid = false;
            } else {
                field.style.border = '1px solid var(--border-color)';
            }
        });
        return isValid;
    }
});
                          
