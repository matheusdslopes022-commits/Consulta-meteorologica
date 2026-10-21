const botao_buscar = document.getElementById("button");


botao_buscar.addEventListener("click", (evento) => {
    evento.preventDefault();
    const cidade = document.getElementById("cidade").value.trim();
    const resultado = document.getElementById("resultado");
    const clima = document.getElementById("clima");
    document.querySelector(".resultado").style.display = "none";
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
                    document.querySelector(".clima").style.display = "block";
                    document.querySelectorAll(".item-cidade").forEach(function (cidade) {
                        cidade.classList.remove("selecionada");
                    });

                    item.classList.add("selecionada");
                    console.log("Cidade selecionada:", local);
                    

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
