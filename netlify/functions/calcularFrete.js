// ... (Código anterior)

// --- CÁLCULO DE DISTÂNCIA ---
// ... (Código anterior)
let distanciaKM = 0;
let rotaEncontrada = distancias.find(d => 
    (d.rota === chaveRota) || (d.rota === chaveRotaInversa)
);

if (rotaEncontrada) {
    // CONVERSÃO CRÍTICA AQUI: O valor de 'km' que vem como texto é convertido para número.
    distanciaKM = parseFloat(rotaEncontrada.km); 
} else {
    // ... (Código anterior)


// --- CÁLCULO DA TARIFA ---
// ... (Código anterior)
// Garante que a tabela está ordenada por max_km (convertendo para número para ordenação)
tabelaTarifas.sort((a, b) => parseFloat(a.max_km) - parseFloat(b.max_km)); 

for (const faixa of tabelaTarifas) {
    // CONVERSÃO CRÍTICA AQUI: O valor de 'max_km' e 'valor_rs' são convertidos para número.
    const maxKm = parseFloat(faixa.max_km);
    const valorRs = parseFloat(faixa.valor_rs);

    if (distanciaKM <= maxKm) {
        valorFrete = valorRs;
        break;
    }
}

// Se a distância for maior que a última faixa, usa o valor da última
if (valorFrete === 0 && tabelaTarifas.length > 0) {
    // CONVERSÃO CRÍTICA AQUI
    valorFrete = parseFloat(tabelaTarifas[tabelaTarifas.length - 1].valor_rs);
}

// ... (Código final)
