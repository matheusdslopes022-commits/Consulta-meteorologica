const botao_buscar = document.getElementById("button");


botao_buscar.addEventListener("click", (evento) => {
    evento.preventDefault();
    const cidade = document.getElementById("cidade").value.trim();
    const resultado = document.getElementById("resultado");
    const clima = document.getElementById("clima");

    if (cidade === "") {
        alert("Campo vazio, Digite novamente");
        return
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

            //cria conforme a quantidade de cidades
            locais.forEach(function (local) {

                const item = document.createElement("div");
                item.classList.add("item-cidade");
                const partes = [local.name, local.admin2, local.admin1, local.country].filter(Boolean);
                item.textContent = `${partes.join(', ')} (lat: ${local.latitude}, lon: ${local.longitude})`;
                resultado.append(item);

                item.addEventListener("click", () => {
                    document.querySelectorAll(".item-cidade").forEach(function (cidade) {
                        cidade.classList.remove("selecionada");
                    });

                    item.classList.add("selecionada");
                    console.log("Cidade selecionada:", local);

                    const parametrosClima = new URLSearchParams({
                        latitude: local.latitude,
                        longitude: local.longitude,
                        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
                        timezone: "auto"
                    });

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
                            <h2>${local.name}</h2>
                            <p>Temperatura: ${atual.temperature_2m} °C</p>
                            <p>Sensação térmica: ${atual.apparent_temperature} °C</p>
                            <p>Umidade: ${atual.relative_humidity_2m}%</p>
                            <p>Vento: ${atual.wind_speed_10m} km/h</p>
                            <p>Código do clima: ${atual.weather_code}</p>`;

                            console.log("Dados do clima:", dados);
                        })
                        .catch(function (erro) {
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

})
