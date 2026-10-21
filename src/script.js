const botao_buscar = document.getElementById("button");

function descricaoClima(codigo) {
    const mapa = {
        0: "Céu limpo",
        1: "Predominantemente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Neblina",
        48: "Neblina com geada",
        51: "Garoa leve",
        53: "Garoa moderada",
        55: "Garoa intensa",
        61: "Chuva leve",
        63: "Chuva moderada",
        65: "Chuva forte",
        71: "Neve leve",
        73: "Neve moderada",
        75: "Neve forte",
        80: "Pancadas de chuva leves",
        81: "Pancadas de chuva moderadas",
        82: "Pancadas de chuva violentas",
        95: "Tempestade",
        96: "Tempestade com granizo leve",
        99: "Tempestade com granizo forte"
    };
    return mapa[codigo] || "Condição desconhecida";
}


botao_buscar.addEventListener("click", (evento) => {
    evento.preventDefault();
    const cidade = document.getElementById("cidade").value.trim();
    const resultado = document.getElementById("resultado");
    const clima = document.getElementById("clima");
    const mensagem = document.getElementById("mensagem");
    document.querySelector(".resultado").style.display = "none";
    clima.style.display = "none"; 

    if (cidade === "") {
        alert("Campo vazio, Digite novamente");
        return;
    }

    botao_buscar.disabled = true;

    const parametros = new URLSearchParams({
        name: cidade,
        count: 10,
        language: 'pt',
        format: 'json'
    });

    fetch(`https://geocoding-api.open-meteo.com/v1/search?${parametros}`)
        .then(function (resposta) {
            // O fetch não rejeita erros HTTP automaticamente
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }
            return resposta.json();
        })
        .then(function (dados) {
            // Sem ocorrências, a API omite "results"; usamos lista vazia
            const locais = dados.results || [];
            console.log(dados);
            resultado.innerHTML = "";

            mensagem.textContent = locais.length === 0
                ? 'Nenhuma localidade encontrada.'
                : `${locais.length} Localidades encontradas.`;

            if (locais.length === 0) {
                return;
            }

            document.querySelector(".resultado").style.display = "block";

            // cria conforme a quantidade de cidades
            locais.forEach(function (local) {

                const item = document.createElement("div");
                item.classList.add("item-cidade");
                const partes = [local.name, local.admin2, local.admin1, local.country].filter(Boolean);
                item.textContent = `${partes.join(', ')} (lat: ${local.latitude}, lon: ${local.longitude})`;
                resultado.append(item);

                item.addEventListener("click", () => {
                    document.querySelector(".clima").style.display = "block";
                    document.querySelectorAll(".item-cidade").forEach(function (outroItem) { 
                        outroItem.classList.remove("selecionada");
                    });

                    item.classList.add("selecionada");
                    console.log("Cidade selecionada:", local);

                    const parametrosClima = new URLSearchParams({
                        latitude: local.latitude,
                        longitude: local.longitude,
                        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
                        timezone: "auto"
                    });

                    clima.style.display = "none";
                    clima.textContent = "Carregando clima...";

                    fetch(`https://api.open-meteo.com/v1/forecast?${parametrosClima}`)
                        .then(function (resposta) {
                            if (!resposta.ok) {
                                throw new Error(`Erro HTTP: ${resposta.status}`);
                            }

                            return resposta.json();
                        })
                        .then(function (dados) {
                            const atual = dados.current;

                            clima.innerHTML = `
                                <div class="geral">
                                    <div class="icon">*</div>

                                    <div class="clima-principal">
                                        <div class="icone-clima">☀</div>

                                        <div class="informacoes">
                                            <p>${local.name}, ${local.country}</p>
                                            <h1>${Math.round(atual.temperature_2m)}°C</h1>
                                            <p>${descricaoClima(atual.weather_code)}</p>
                                        </div>
                                    </div>

                                    <div class="detalhes-clima">
                                        <div class="detalhe">
                                            <p>SENSAÇÃO</p>
                                            <h2>${Math.round(atual.apparent_temperature)}°C</h2>
                                        </div>

                                        <div class="detalhe">
                                            <p>UMIDADE</p>
                                            <h2>${atual.relative_humidity_2m}%</h2>
                                        </div>

                                        <div class="detalhe">
                                            <p>VENTO</p>
                                            <h2>${Math.round(atual.wind_speed_10m)} km/h</h2>
                                        </div>
                                    </div>

                                    <button id="favoritos" class="botao-favoritos">
                                        ☆ Adicionar aos favoritos
                                    </button>
                                </div>
                            `;
                            clima.style.display = "grid";

                            console.log("Dados do clima:", dados);
                        })
                        .catch(function (erro) {
                            clima.style.display = "block";
                            clima.textContent = "Não foi possível carregar o clima.";
                            console.error(erro);
                        });

                });
            });
        })
        .catch(function (erro) {
            mensagem.textContent = 'Não foi possível buscar os dados.';
            console.error(erro);
        })
        // Executa sempre, com sucesso ou erro: reabilita o botão
        .finally(function () {
            botao_buscar.disabled = false;
        });

});