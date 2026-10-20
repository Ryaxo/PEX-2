/* ==========================================================
   TOPPOINT
   Sistema de Registro de Ponto
   Versão 2.1
========================================================== */

const App = {

    funcionarios: [],

    registros: [],

    tipoSelecionado: null,

    funcionarioEditando: null,

    temaEscuro: false,

    iniciar(){

        this.carregar();

        this.configurarEventos();

        this.atualizarDataHora();

        this.renderizarFuncionarios();

        this.renderizarHistorico();

        this.preencherSelect();

        this.atualizarDashboard();

        setInterval(()=>{

            this.atualizarDataHora();

        },1000);

    },

    carregar(){

        this.funcionarios =
            JSON.parse(
                localStorage.getItem("funcionarios")
            ) || [];

        this.registros =
            JSON.parse(
                localStorage.getItem("registros")
            ) || [];

        this.temaEscuro =
            JSON.parse(
                localStorage.getItem("temaEscuro")
            ) || false;

        if(this.temaEscuro){

            document.body.classList.add("dark");

        }

    },

    salvar(){

        localStorage.setItem(

            "funcionarios",

            JSON.stringify(this.funcionarios)

        );

        localStorage.setItem(

            "registros",

            JSON.stringify(this.registros)

        );

        localStorage.setItem(

            "temaEscuro",

            JSON.stringify(this.temaEscuro)

        );

    },

    configurarEventos(){

        document
            .getElementById("abrirModal")
            .addEventListener("click",()=>{

                this.abrirModal();

            });

        document
            .getElementById("fecharModal")
            .addEventListener("click",()=>{

                this.fecharModal();

            });

        document
            .getElementById("cancelarModal")
            .addEventListener("click",()=>{

                this.fecharModal();

            });

        document
            .getElementById("salvarFuncionario")
            .addEventListener("click",()=>{

                this.salvarFuncionario();

            });

        document
            .getElementById("btnRegistrar")
            .addEventListener("click",()=>{

                this.registrarPonto();

            });

        document
            .querySelectorAll(".tipo")
            .forEach(botao=>{

                botao.addEventListener("click",()=>{

                    document
                        .querySelectorAll(".tipo")
                        .forEach(b=>{

                            b.classList.remove("ativo");

                        });

                    botao.classList.add("ativo");

                    this.tipoSelecionado =
                        botao.dataset.tipo;

                });

            });

        const pesquisa =
            document.getElementById("pesquisaFuncionario");

        if(pesquisa){

            pesquisa.addEventListener("input",(e)=>{

                this.renderizarFuncionarios(

                    e.target.value

                );

            });

        }

    },
    /* ======================================================
       MODAL
    ====================================================== */

    abrirModal(limpar = true){

        document
            .getElementById("modalFuncionario")
            .classList
            .add("ativo");

        document
            .getElementById("tituloModal")
            .innerHTML =

            this.funcionarioEditando === null

                ? '<i class="fa-solid fa-user-plus"></i> Novo Funcionário'

                : '<i class="fa-solid fa-user-pen"></i> Editar Funcionário';

        if(limpar){

            this.limparFormulario();

        }

    },

    fecharModal(){

        document
            .getElementById("modalFuncionario")
            .classList
            .remove("ativo");

        this.funcionarioEditando = null;

    },

    limparFormulario(){

        document
            .getElementById("nomeFuncionario")
            .value = "";

        document
            .getElementById("cargoFuncionario")
            .value = "";

        document
            .getElementById("setorFuncionario")
            .value = "";

        document
            .getElementById("matriculaFuncionario")
            .value = "";

    },

    /* ======================================================
       FUNCIONÁRIOS
    ====================================================== */

    salvarFuncionario(){

        const nome =
            document
            .getElementById("nomeFuncionario")
            .value
            .trim();

        const cargo =
            document
            .getElementById("cargoFuncionario")
            .value
            .trim();

        const setor =
            document
            .getElementById("setorFuncionario")
            .value
            .trim();

        const matricula =
            document
            .getElementById("matriculaFuncionario")
            .value
            .trim();

        if(

            !nome ||

            !cargo ||

            !setor ||

            !matricula

        ){

            this.toast(

                "Preencha todos os campos.",

                "#D32F2F"

            );

            return;

        }

        const existe = this.funcionarios.find((f,index)=>{

            if(this.funcionarioEditando !== null){

                return (

                    index !== this.funcionarioEditando &&

                    f.matricula === matricula

                );

            }

            return f.matricula === matricula;

        });

        if(existe){

            this.toast(

                "Já existe um funcionário com esta matrícula.",

                "#D32F2F"

            );

            return;

        }

        const funcionario = {

            nome,

            cargo,

            setor,

            matricula

        };

        if(this.funcionarioEditando === null){

            this.funcionarios.push(funcionario);

            this.toast(

                "Funcionário cadastrado com sucesso!"

            );

        }else{

            this.funcionarios[

                this.funcionarioEditando

            ] = funcionario;

            this.toast(

                "Funcionário atualizado com sucesso!"

            );

        }

        this.salvar();

        this.renderizarFuncionarios();

        this.preencherSelect();

        this.atualizarDashboard();

        this.fecharModal();

    },

    editarFuncionario(indice){

        const funcionario =

            this.funcionarios[indice];

        this.funcionarioEditando = indice;

        document
            .getElementById("nomeFuncionario")
            .value = funcionario.nome;

        document
            .getElementById("cargoFuncionario")
            .value = funcionario.cargo;

        document
            .getElementById("setorFuncionario")
            .value = funcionario.setor;

        document
            .getElementById("matriculaFuncionario")
            .value = funcionario.matricula;

        this.abrirModal(false);

    },

    excluirFuncionario(indice){

        if(

            !confirm(

                "Deseja realmente excluir este funcionário?"

            )

        ){

            return;

        }

        this.funcionarios.splice(indice,1);

        this.salvar();

        this.renderizarFuncionarios();

        this.preencherSelect();

        this.atualizarDashboard();

        this.toast(

            "Funcionário removido."

        );

    },
    /* ======================================================
       REGISTRO DE PONTO
    ====================================================== */

    registrarPonto(){

        const matricula =
            document
            .getElementById("funcionario")
            .value;

        if(matricula === ""){

            this.toast(
                "Selecione um funcionário.",
                "#D32F2F"
            );

            return;

        }

        if(this.tipoSelecionado === null){

            this.toast(
                "Selecione o tipo de registro.",
                "#D32F2F"
            );

            return;

        }

        const funcionario =
            this.funcionarios.find(f=>{

                return f.matricula === matricula;

            });

        if(!funcionario){

            this.toast(
                "Funcionário não encontrado.",
                "#D32F2F"
            );

            return;

        }

        const ultimoRegistro =

            [...this.registros]

            .reverse()

            .find(r=>{

                return r.matricula === matricula;

            });

        if(ultimoRegistro){

            const ultimo = ultimoRegistro.tipo;

            const atual = this.tipoSelecionado;

            const fluxo = {

                "Entrada":"Intervalo",

                "Intervalo":"Retorno",

                "Retorno":"Saída",

                "Saída":"Entrada"

            };

            if(fluxo[ultimo] !== atual){

                this.toast(

                    `Após "${ultimo}" o próximo registro deve ser "${fluxo[ultimo]}".`,

                    "#D32F2F"

                );

                return;

            }

        }else{

            if(this.tipoSelecionado !== "Entrada"){

                this.toast(

                    "O primeiro registro deve ser uma Entrada.",

                    "#D32F2F"

                );

                return;

            }

        }

        const agora = new Date();

        const registro = {

            nome:funcionario.nome,

            matricula:funcionario.matricula,

            tipo:this.tipoSelecionado,

            data:

                agora.toLocaleDateString("pt-BR"),

            hora:

                agora.toLocaleTimeString("pt-BR")

        };

        this.registros.push(registro);

        this.salvar();

        this.renderizarHistorico();

        this.atualizarDashboard();

        document

            .querySelectorAll(".tipo")

            .forEach(botao=>{

                botao.classList.remove("ativo");

            });

        this.tipoSelecionado = null;

        this.toast(

            "Ponto registrado com sucesso!"

        );

    },

    /* ======================================================
       SELECT
    ====================================================== */

    preencherSelect(){

        const select =

            document.getElementById("funcionario");

        select.innerHTML =

            `<option value="">Selecione um funcionário</option>`;

        this.funcionarios

            .sort((a,b)=>{

                return a.nome.localeCompare(b.nome);

            })

            .forEach(funcionario=>{

                select.innerHTML += `

                    <option value="${funcionario.matricula}">

                        ${funcionario.nome}

                    </option>

                `;

            });

    },
    /* ======================================================
       DASHBOARD
    ====================================================== */

    atualizarDashboard(){

        document.getElementById("totalFuncionarios").textContent =
            this.funcionarios.length;

        const hoje =
            new Date().toLocaleDateString("pt-BR");

        const registrosHoje =
            this.registros.filter(registro=>{

                return registro.data === hoje;

            });

        document.getElementById("registrosHoje").textContent =
            registrosHoje.length;

        let presentes = 0;

        let intervalo = 0;

        let ausentes = 0;

        this.funcionarios.forEach(funcionario=>{

            const ultimoRegistro =

                [...this.registros]

                .reverse()

                .find(registro=>{

                    return registro.matricula === funcionario.matricula;

                });

            if(!ultimoRegistro){

                ausentes++;

                return;

            }

            switch(ultimoRegistro.tipo){

                case "Entrada":

                    presentes++;

                break;

                case "Retorno":

                    presentes++;

                break;

                case "Intervalo":

                    intervalo++;

                break;

                case "Saída":

                    ausentes++;

                break;

                default:

                    ausentes++;

            }

        });

        document.getElementById("presentes").textContent =
            presentes;

        document.getElementById("intervalo").textContent =
            intervalo;

        const cardAusentes =
            document.getElementById("ausentes");

        if(cardAusentes){

            cardAusentes.textContent =
                ausentes;

        }

    },

    /* ======================================================
       DATA E HORA
    ====================================================== */

    atualizarDataHora(){

        const agora = new Date();

        const data =

            agora.toLocaleDateString(

                "pt-BR",

                {

                    weekday:"long",

                    day:"2-digit",

                    month:"long",

                    year:"numeric"

                }

            );

        const hora =

            agora.toLocaleTimeString(

                "pt-BR"

            );

        document
            .getElementById("dataHora")
            .textContent =

            `${data} • ${hora}`;

    },
    /* ======================================================
       FUNCIONÁRIOS
    ====================================================== */

    renderizarFuncionarios(filtro = ""){

        const tabela =
            document.getElementById("listaFuncionarios");

        tabela.innerHTML = "";

        const funcionarios =

            this.funcionarios.filter(funcionario=>{

                return funcionario.nome

                    .toLowerCase()

                    .includes(

                        filtro.toLowerCase()

                    );

            });

        if(funcionarios.length === 0){

            tabela.innerHTML = `

                <tr>

                    <td colspan="5" class="text-center">

                        Nenhum funcionário encontrado.

                    </td>

                </tr>

            `;

            return;

        }

        funcionarios.forEach(funcionario=>{

            const indice =

                this.funcionarios.indexOf(funcionario);

            tabela.innerHTML += `

                <tr>

                    <td>

                        ${funcionario.nome}

                    </td>

                    <td>

                        ${funcionario.cargo}

                    </td>

                    <td>

                        ${funcionario.setor}

                    </td>

                    <td>

                        ${funcionario.matricula}

                    </td>

                    <td>

                        <button

                            class="btn-editar"

                            onclick="App.editarFuncionario(${indice})"

                            title="Editar"

                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button

                            class="btn-excluir"

                            onclick="App.excluirFuncionario(${indice})"

                            title="Excluir"

                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        });

    },

    /* ======================================================
       HISTÓRICO
    ====================================================== */

    renderizarHistorico(filtro = ""){

        const tabela =
            document.getElementById("historico");

        tabela.innerHTML = "";

        const historico =

            [...this.registros]

            .reverse()

            .filter(registro=>{

                return registro.nome

                    .toLowerCase()

                    .includes(

                        filtro.toLowerCase()

                    );

            });

        if(historico.length === 0){

            tabela.innerHTML = `

                <tr>

                    <td colspan="4" class="text-center">

                        Nenhum registro encontrado.

                    </td>

                </tr>

            `;

            return;

        }

        historico.forEach(registro=>{

            tabela.innerHTML += `

                <tr>

                    <td>

                        ${registro.nome}

                    </td>

                    <td>

                        ${registro.tipo}

                    </td>

                    <td>

                        ${registro.data}

                    </td>

                    <td>

                        ${registro.hora}

                    </td>

                </tr>

            `;

        });

    },
    /* ======================================================
       EXPORTAÇÃO
    ====================================================== */

    exportarCSV(){

        if(this.registros.length === 0){

            this.toast(

                "Não existem registros para exportar.",

                "#D32F2F"

            );

            return;

        }

        let csv =

            "Funcionário;Matrícula;Tipo;Data;Hora\n";

        this.registros.forEach(registro=>{

            csv +=

                `${registro.nome};`

                +`${registro.matricula};`

                +`${registro.tipo};`

                +`${registro.data};`

                +`${registro.hora}\n`;

        });

        const blob =

            new Blob(

                [csv],

                {

                    type:"text/csv;charset=utf-8;"

                }

            );

        const url =

            URL.createObjectURL(blob);

        const link =

            document.createElement("a");

        link.href = url;

        link.download =

            `registros-ponto-${new Date()

                .toLocaleDateString("pt-BR")

                .replace(/\//g,"-")}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        this.toast(

            "Arquivo CSV exportado com sucesso!"

        );

    },

    /* ======================================================
       HISTÓRICO
    ====================================================== */

    limparHistorico(){

        if(this.registros.length === 0){

            this.toast(

                "O histórico já está vazio.",

                "#D32F2F"

            );

            return;

        }

        if(

            !confirm(

                "Deseja realmente apagar todo o histórico?"

            )

        ){

            return;

        }

        this.registros = [];

        this.salvar();

        this.renderizarHistorico();

        this.atualizarDashboard();

        this.toast(

            "Histórico apagado com sucesso."

        );

    },

    pesquisarHistorico(){

        const campo =

            document.getElementById(

                "pesquisaHistorico"

            );

        if(!campo){

            return;

        }

        this.renderizarHistorico(

            campo.value

        );

    },

    pesquisarFuncionarios(){

        const campo =

            document.getElementById(

                "pesquisaFuncionario"

            );

        if(!campo){

            return;

        }

        this.renderizarFuncionarios(

            campo.value

        );

    },
    /* ======================================================
       EXPORTAÇÃO
    ====================================================== */

    exportarCSV(){

        if(this.registros.length === 0){

            this.toast(

                "Não existem registros para exportar.",

                "#D32F2F"

            );

            return;

        }

        let csv =

            "Funcionário;Matrícula;Tipo;Data;Hora\n";

        this.registros.forEach(registro=>{

            csv +=

                `${registro.nome};`

                +`${registro.matricula};`

                +`${registro.tipo};`

                +`${registro.data};`

                +`${registro.hora}\n`;

        });

        const blob =

            new Blob(

                [csv],

                {

                    type:"text/csv;charset=utf-8;"

                }

            );

        const url =

            URL.createObjectURL(blob);

        const link =

            document.createElement("a");

        link.href = url;

        link.download =

            `registros-ponto-${new Date()

                .toLocaleDateString("pt-BR")

                .replace(/\//g,"-")}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        this.toast(

            "Arquivo CSV exportado com sucesso!"

        );

    },

    /* ======================================================
       HISTÓRICO
    ====================================================== */

    limparHistorico(){

        if(this.registros.length === 0){

            this.toast(

                "O histórico já está vazio.",

                "#D32F2F"

            );

            return;

        }

        if(

            !confirm(

                "Deseja realmente apagar todo o histórico?"

            )

        ){

            return;

        }

        this.registros = [];

        this.salvar();

        this.renderizarHistorico();

        this.atualizarDashboard();

        this.toast(

            "Histórico apagado com sucesso."

        );

    },

    pesquisarHistorico(){

        const campo =

            document.getElementById(

                "pesquisaHistorico"

            );

        if(!campo){

            return;

        }

        this.renderizarHistorico(

            campo.value

        );

    },

    pesquisarFuncionarios(){

        const campo =

            document.getElementById(

                "pesquisaFuncionario"

            );

        if(!campo){

            return;

        }

        this.renderizarFuncionarios(

            campo.value

        );

    },
    /* ======================================================
       TOAST
    ====================================================== */

    toast(
        mensagem,
        cor = "#2E7D32"
    ){

        const toast =
            document.getElementById("toast");

        if(!toast){

            return;

        }

        clearTimeout(this.toastTimeout);

        toast.textContent = mensagem;

        toast.style.background = cor;

        toast.classList.add("show");

        this.toastTimeout = setTimeout(()=>{

            toast.classList.remove("show");

        },3000);

    },

    /* ======================================================
       LOADING
    ====================================================== */

    mostrarLoading(){

        const loading =
            document.getElementById("loading");

        if(!loading){

            return;

        }

        loading.classList.remove("oculto");

    },

    esconderLoading(){

        const loading =
            document.getElementById("loading");

        if(!loading){

            return;

        }

        loading.classList.add("oculto");

    },

    /* ======================================================
       TEMA
    ====================================================== */

    alternarTema(){

        this.temaEscuro =
            !this.temaEscuro;

        document.body.classList.toggle(

            "dark",

            this.temaEscuro

        );

        this.salvar();

        this.toast(

            this.temaEscuro

                ? "Tema escuro ativado."

                : "Tema claro ativado."

        );

    },

    /* ======================================================
       ESTATÍSTICAS
    ====================================================== */

    obterUltimoRegistro(matricula){

        const registro =

            [...this.registros]

            .reverse()

            .find(r=>{

                return r.matricula === matricula;

            });

        return registro || null;

    },

    funcionarioEstaPresente(matricula){

        const ultimo =

            this.obterUltimoRegistro(

                matricula

            );

        if(!ultimo){

            return false;

        }

        return (

            ultimo.tipo === "Entrada" ||

            ultimo.tipo === "Retorno"

        );

    },

    funcionarioEmIntervalo(matricula){

        const ultimo =

            this.obterUltimoRegistro(

                matricula

            );

        if(!ultimo){

            return false;

        }

        return ultimo.tipo === "Intervalo";

    },
    /* ======================================================
       TOAST
    ====================================================== */

    toast(
        mensagem,
        cor = "#2E7D32"
    ){

        const toast =
            document.getElementById("toast");

        if(!toast){

            return;

        }

        clearTimeout(this.toastTimeout);

        toast.textContent = mensagem;

        toast.style.background = cor;

        toast.classList.add("show");

        this.toastTimeout = setTimeout(()=>{

            toast.classList.remove("show");

        },3000);

    },

    /* ======================================================
       LOADING
    ====================================================== */

    mostrarLoading(){

        const loading =
            document.getElementById("loading");

        if(!loading){

            return;

        }

        loading.classList.remove("oculto");

    },

    esconderLoading(){

        const loading =
            document.getElementById("loading");

        if(!loading){

            return;

        }

        loading.classList.add("oculto");

    },

    /* ======================================================
       TEMA
    ====================================================== */

    alternarTema(){

        this.temaEscuro =
            !this.temaEscuro;

        document.body.classList.toggle(

            "dark",

            this.temaEscuro

        );

        this.salvar();

        this.toast(

            this.temaEscuro

                ? "Tema escuro ativado."

                : "Tema claro ativado."

        );

    },

    /* ======================================================
       ESTATÍSTICAS
    ====================================================== */

    obterUltimoRegistro(matricula){

        const registro =

            [...this.registros]

            .reverse()

            .find(r=>{

                return r.matricula === matricula;

            });

        return registro || null;

    },

    funcionarioEstaPresente(matricula){

        const ultimo =

            this.obterUltimoRegistro(

                matricula

            );

        if(!ultimo){

            return false;

        }

        return (

            ultimo.tipo === "Entrada" ||

            ultimo.tipo === "Retorno"

        );

    },

    funcionarioEmIntervalo(matricula){

        const ultimo =

            this.obterUltimoRegistro(

                matricula

            );

        if(!ultimo){

            return false;

        }

        return ultimo.tipo === "Intervalo";

    },
    /* ======================================================
       INICIALIZAÇÃO
    ====================================================== */

    atualizarTudo(){

        this.renderizarFuncionarios();

        this.preencherSelect();

        this.renderizarHistorico();

        this.atualizarDashboard();

    }

};

/* ==========================================================
   INICIALIZAÇÃO DA APLICAÇÃO
========================================================== */

window.addEventListener("load",()=>{

    App.iniciar();

    /* ==========================
       PESQUISA DE FUNCIONÁRIOS
    ========================== */

    const pesquisaFuncionarios =
        document.getElementById(
            "pesquisaFuncionario"
        );

    if(pesquisaFuncionarios){

        pesquisaFuncionarios.addEventListener(

            "input",

            ()=>{

                App.pesquisarFuncionarios();

            }

        );

    }

    /* ==========================
       PESQUISA DO HISTÓRICO
    ========================== */

    const pesquisaHistorico =
        document.getElementById(
            "pesquisaHistorico"
        );

    if(pesquisaHistorico){

        pesquisaHistorico.addEventListener(

            "input",

            ()=>{

                App.pesquisarHistorico();

            }

        );

    }

    /* ==========================
       FECHAR MODAL AO CLICAR FORA
    ========================== */

    const modal =
        document.getElementById(
            "modalFuncionario"
        );

    if(modal){

        modal.addEventListener(

            "click",

            (e)=>{

                if(e.target === modal){

                    App.fecharModal();

                }

            }

        );

    }

    console.log(

        "%cTopPoint v2.1 iniciado com sucesso!",

        "color:#1E3A5F;font-size:16px;font-weight:bold;"

    );

});