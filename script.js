import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


/* =========================================================
   CONFIGURAÇÃO DO SUPABASE
   ========================================================= */

const supabaseUrl =
    "https://hehvfgiinpskmhivboju.supabase.co";

const supabaseKey =
    "sb_publishable_Fvrqesmaq-tUImz0J1s8bg_neJymJpH";

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);


/* =========================================================
   VARIÁVEIS
   ========================================================= */

let itens = [];
let itemSelecionado = null;


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

window.entrar = function () {
    window.location.href = "menu.html";
};

window.irPerdidos = function () {
    window.location.href = "perdidos.html";
};

window.irEncontrados = function () {
    window.location.href = "encontrados.html";
};

window.voltar = function () {
    window.location.href = "menu.html";
};

window.voltarInicio = function () {
    window.location.href = "index.html";
};


/* =========================================================
   MENSAGENS
   ========================================================= */

function mostrarMensagem(
    titulo,
    mensagem,
    tipo = "sucesso"
) {

    const container =
        document.getElementById("toastContainer");

    if (!container) {
        alert(`${titulo}\n\n${mensagem}`);
        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${tipo === "erro" ? "erro" : ""}`;

    toast.innerHTML = `
        <div>
            <strong>${titulo}</strong>
            <p>${mensagem}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(20px)";

        setTimeout(() => {
            toast.remove();
        }, 250);

    }, 3500);
}


/* =========================================================
   PREVIEW DA IMAGEM
   ========================================================= */

function configurarPreview() {

    const input =
        document.getElementById("imagem");

    const previewContainer =
        document.getElementById("previewContainer");

    const previewImagem =
        document.getElementById("previewImagem");

    if (
        !input ||
        !previewContainer ||
        !previewImagem
    ) {
        return;
    }

    input.addEventListener(
        "change",
        () => {

            const file =
                input.files[0];

            if (!file) {

                previewContainer
                    .classList
                    .remove("ativo");

                return;
            }

            if (!file.type.startsWith("image/")) {

                mostrarMensagem(
                    "Arquivo inválido",
                    "Selecione uma imagem.",
                    "erro"
                );

                input.value = "";

                previewContainer
                    .classList
                    .remove("ativo");

                return;
            }

            const url =
                URL.createObjectURL(file);

            previewImagem.src = url;

            previewContainer
                .classList
                .add("ativo");
        }
    );
}


/* =========================================================
   SALVAR OBJETO
   ========================================================= */

async function salvarObjeto(event) {

    event.preventDefault();

    const objeto =
        document.getElementById("objeto");

    const local =
        document.getElementById("local");

    const imagem =
        document.getElementById("imagem");

    const botao =
        document.getElementById("btnSalvar");


    if (
        !objeto ||
        !local ||
        !imagem
    ) {
        return;
    }


    const nomeObjeto =
        objeto.value.trim();

    const localEncontrado =
        local.value.trim();

    const imagemFile =
        imagem.files[0];


    /* VALIDAÇÃO */

    if (!nomeObjeto) {

        mostrarMensagem(
            "Campo obrigatório",
            "Informe o nome do objeto.",
            "erro"
        );

        objeto.focus();
        return;
    }


    if (!localEncontrado) {

        mostrarMensagem(
            "Campo obrigatório",
            "Informe onde o objeto foi encontrado.",
            "erro"
        );

        local.focus();
        return;
    }


    if (!imagemFile) {

        mostrarMensagem(
            "Foto obrigatória",
            "Adicione uma foto do objeto.",
            "erro"
        );

        return;
    }


    /* TAMANHO DA IMAGEM */

    const tamanhoMaximo =
        5 * 1024 * 1024;

    if (imagemFile.size > tamanhoMaximo) {

        mostrarMensagem(
            "Imagem muito grande",
            "Escolha uma imagem de até 5 MB.",
            "erro"
        );

        return;
    }


    /* LOADING */

    let textoOriginal = "";

    if (botao) {

        textoOriginal =
            botao.textContent;

        botao.disabled = true;
        botao.textContent =
            "Salvando...";
    }


    try {

        /* =================================================
           ENVIA A IMAGEM PARA O STORAGE
           ================================================= */

        const nomeArquivo =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}-${imagemFile.name}`;

        const caminhoArquivo =
            `objetos/${nomeArquivo}`;


        const {
            error: erroUpload
        } = await supabase.storage
            .from("imagens")
            .upload(
                caminhoArquivo,
                imagemFile,
                {
                    contentType: imagemFile.type,
                    upsert: false
                }
            );


        if (erroUpload) {
            throw erroUpload;
        }


        /* =================================================
           PEGA A URL PÚBLICA DA IMAGEM
           ================================================= */

        const {
            data: urlData
        } = supabase.storage
            .from("imagens")
            .getPublicUrl(caminhoArquivo);


        const imagemUrl =
            urlData.publicUrl;


        /* =================================================
           SALVA OS DADOS NA TABELA
           ================================================= */

        const {
            error
        } = await supabase
            .from("itens")
            .insert([
                {
                    objeto: nomeObjeto,
                    local: localEncontrado,
                    imagem: imagemUrl
                }
            ]);


        if (error) {
            throw error;
        }


        /* SUCESSO */

        mostrarMensagem(
            "Objeto cadastrado!",
            "O objeto foi registrado com sucesso."
        );


        const formulario =
            document.getElementById("formObjeto");

        if (formulario) {
            formulario.reset();
        }


        const preview =
            document.getElementById(
                "previewContainer"
            );

        if (preview) {

            preview
                .classList
                .remove("ativo");
        }


        setTimeout(() => {

            window.location.href =
                "perdidos.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Erro ao salvar objeto:",
            error
        );


        mostrarMensagem(
            "Não foi possível salvar",
            error.message ||
            "Ocorreu um erro ao cadastrar o objeto.",
            "erro"
        );


    } finally {

        if (botao) {

            botao.disabled = false;

            botao.textContent =
                textoOriginal;
        }
    }
}


/* =========================================================
   ESCAPAR TEXTO
   ========================================================= */

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto ?? "";

    return div.innerHTML;
}


/* =========================================================
   CARREGAR OBJETOS
   ========================================================= */

async function carregarItens() {

    const container =
        document.getElementById("lista");

    if (!container) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabase
            .from("itens")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        itens = data || [];

        renderizarItens(itens);


    } catch (error) {

        console.error(
            "Erro ao carregar objetos:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Não foi possível carregar
                </h3>

                <p>
                    ${escaparHTML(error.message)}
                </p>

                <br>

                <button id="btnTentarNovamente">
                    Tentar novamente
                </button>

            </div>
        `;


        const tentarNovamente =
            document.getElementById(
                "btnTentarNovamente"
            );

        if (tentarNovamente) {

            tentarNovamente.addEventListener(
                "click",
                carregarItens
            );
        }
    }
}


/* =========================================================
   RENDERIZAR OBJETOS
   ========================================================= */

function renderizarItens(lista) {

    const container =
        document.getElementById("lista");

    const resultadoInfo =
        document.getElementById(
            "resultadoInfo"
        );


    if (!container) {
        return;
    }


    /* RESULTADO */

    if (resultadoInfo) {

        if (lista.length === 0) {

            resultadoInfo.textContent =
                "Nenhum objeto encontrado.";

        } else if (lista.length === 1) {

            resultadoInfo.textContent =
                "1 objeto encontrado";

        } else {

            resultadoInfo.textContent =
                `${lista.length} objetos encontrados`;
        }
    }


    /* LISTA VAZIA */

    if (lista.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📦
                </div>

                <h3>
                    Nenhum objeto encontrado
                </h3>

                <p>
                    Ainda não há objetos cadastrados
                    ou sua pesquisa não encontrou resultados.
                </p>

            </div>
        `;

        return;
    }


    /* GRID */

    const grid =
        document.createElement("div");

    grid.className =
        "lista-itens";


    lista.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "item";


        const imagem =
            escaparHTML(
                item.imagem
            );

        const objeto =
            escaparHTML(
                item.objeto
            );

        const local =
            escaparHTML(
                item.local
            );


        card.innerHTML = `
            <img
                class="item-imagem"
                src="${imagem}"
                alt="Foto de ${objeto}"
                loading="lazy"
            >

            <div class="item-conteudo">

                <h3>
                    ${objeto}
                </h3>

                <div class="item-local">

                    <span>📍</span>

                    <span>
                        Encontrado em:
                        ${local}
                    </span>

                </div>

                <button
                    class="btn-item"
                >
                    Esse objeto é meu
                </button>

            </div>
        `;


        const botao =
            card.querySelector(
                ".btn-item"
            );


        if (botao) {

            botao.addEventListener(
                "click",
                () => abrirModal(item.id)
            );
        }


        grid.appendChild(card);
    });


    container.innerHTML = "";

    container.appendChild(grid);
}


/* =========================================================
   PESQUISA
   ========================================================= */

function configurarPesquisa() {

    const pesquisa =
        document.getElementById("pesquisa");


    if (!pesquisa) {
        return;
    }


    pesquisa.addEventListener(
        "input",
        () => {

            const termo =
                pesquisa.value
                    .trim()
                    .toLowerCase();


            if (!termo) {

                renderizarItens(itens);
                return;
            }


            const filtrados =
                itens.filter(item => {

                    const objeto =
                        String(
                            item.objeto || ""
                        ).toLowerCase();


                    const local =
                        String(
                            item.local || ""
                        ).toLowerCase();


                    return (
                        objeto.includes(termo) ||
                        local.includes(termo)
                    );
                });


            renderizarItens(
                filtrados
            );
        }
    );
}


/* =========================================================
   MODAL
   ========================================================= */

function abrirModal(id) {

    const item =
        itens.find(
            objeto => objeto.id === id
        );


    if (!item) {
        return;
    }


    itemSelecionado = id;


    const modal =
        document.getElementById(
            "modalConfirmacao"
        );


    if (modal) {

        modal
            .classList
            .add("ativo");
    }
}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

function fecharModal() {

    const modal =
        document.getElementById(
            "modalConfirmacao"
        );


    if (modal) {

        modal
            .classList
            .remove("ativo");
    }


    itemSelecionado = null;
}


window.fecharModal =
    fecharModal;


/* =========================================================
   CONFIRMAR RETIRADA
   ========================================================= */

async function confirmarRetirada() {

    if (!itemSelecionado) {
        return;
    }


    const botao =
        document.getElementById(
            "btnConfirmar"
        );


    if (botao) {

        botao.disabled = true;

        botao.textContent =
            "Processando...";
    }


    try {

        const {
            error
        } = await supabase
            .from("itens")
            .delete()
            .eq(
                "id",
                itemSelecionado
            );


        if (error) {
            throw error;
        }


        fecharModal();


        mostrarMensagem(
            "Objeto reservado!",
            "Procure a coordenação para finalizar a retirada."
        );


        await carregarItens();


    } catch (error) {

        console.error(
            "Erro ao retirar objeto:",
            error
        );


        mostrarMensagem(
            "Não foi possível concluir",
            error.message ||
            "Tente novamente.",
            "erro"
        );


    } finally {

        if (botao) {

            botao.disabled = false;

            botao.textContent =
                "Sim, é meu";
        }
    }
}


window.confirmarRetirada =
    confirmarRetirada;


/* =========================================================
   FECHAR MODAL CLICANDO FORA
   ========================================================= */

function configurarModal() {

    const modal =
        document.getElementById(
            "modalConfirmacao"
        );


    if (!modal) {
        return;
    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                fecharModal();
            }
        }
    );
}


/* =========================================================
   TECLA ESC
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            fecharModal();
        }
    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarPreview();

        configurarPesquisa();

        configurarModal();


        const formulario =
            document.getElementById(
                "formObjeto"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                salvarObjeto
            );
        }


        carregarItens();
    }
);


/* =========================================================
   DISPONIBILIZAR FUNÇÕES PARA O HTML
   ========================================================= */

window.carregarItens =
    carregarItens;