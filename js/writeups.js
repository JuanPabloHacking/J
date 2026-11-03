
/*
====================================================
  SISTEMA AUTOMÁTICO DE DOSSIÊS
  Juan Pablo · Portfolio
====================================================

  Identifica os PDFs da pasta writeups no GitHub
  e cria os respectivos cards na página principal.
*/

(() => {

    "use strict";

    // ==============================================
    // 1. CONFIGURAÇÃO REAL DO REPOSITÓRIO
    // ==============================================

    const CONFIG = {
        owner: "JuanPabloHacking",
        repository: "J",
        branch: "main",
        directory: "writeups"
    };


    // ==============================================
    // 2. IDENTIFICAR A GRADE DE WRITE-UPS
    // ==============================================

    const grid = document.getElementById("cases-grid");

    if (!grid) {
        console.error("[DOSSIÊS] Grade não encontrada.");
        return;
    }


    // ==============================================
    // 3. FORMATAR O NOME DO PDF
    // ==============================================

    function formatTitle(filename) {

        const name = filename
            .replace(/\.pdf$/i, "")
            .replace(/[-_]+/g, " ")
            .trim();

        const acronyms = {
            htb: "HTB",
            thm: "THM",
            ad: "AD",
            cve: "CVE",
            osint: "OSINT"
        };

        return name
            .split(/\s+/)
            .map(word => {

                const lower = word.toLowerCase();

                if (acronyms[lower]) {
                    return acronyms[lower];
                }

                return word.charAt(0).toLocaleUpperCase("pt-BR")
                    + word.slice(1);

            })
            .join(" ");
    }


    // ==============================================
    // 4. FORMATAR TAMANHO DO DOCUMENTO
    // ==============================================

    function formatSize(bytes) {

        if (!Number.isFinite(bytes) || bytes <= 0) {
            return "DOCUMENTO PDF";
        }

        const mb = bytes / (1024 * 1024);

        if (mb < 1) {
            return `${Math.max(1, Math.round(bytes / 1024))} KB`;
        }

        return `${mb.toFixed(1)} MB`;
    }


    // ==============================================
    // 5. CRIAR ELEMENTOS HTML COM TEXTO SEGURO
    // ==============================================

    function element(tag, className, content) {

        const node = document.createElement(tag);

        node.className = className;

        node.textContent = content;

        return node;
    }


    // ==============================================
    // 6. CONSTRUIR CARD AUTOMATICAMENTE
    // ==============================================

    function createCard(file) {

        const title = formatTitle(file.name);

        const card = document.createElement("a");

        card.className = "case-card case-card-pdf";

        card.href =
            `./visualizador-pdf.html?pdf=${encodeURIComponent(file.name)}`;

        card.setAttribute(
            "aria-label",
            `Visualizar dossiê: ${title}`
        );

        // Identificação

        const number = element(
            "div",
            "case-card-num",
            "DOSSIÊ DIGITAL · PDF"
        );

        // Nome do documento

        const heading = element(
            "div",
            "case-card-title",
            title
        );

        // Categoria

        const platform = element(
            "div",
            "case-card-platform",
            "DOCUMENTO · VISUALIZAÇÃO INTEGRADA"
        );

        // Descrição

        const description = element(
            "div",
            "case-card-desc",
            "Acesse o relatório completo no arquivo digital."
        );

        // Rodapé

        const footer = document.createElement("div");

        footer.className = "case-card-footer";

        const size = element(
            "span",
            "",
            formatSize(file.size)
        );

        const arrow = element(
            "span",
            "case-card-arrow",
            "→"
        );

        footer.append(size, arrow);

        // Montagem

        card.append(
            number,
            heading,
            platform,
            description,
            footer
        );

        return card;
    }


    // ==============================================
    // 7. CONSULTAR OS DOCUMENTOS NO GITHUB
    // ==============================================

    async function loadWriteups() {

        const endpoint = new URL(
            `https://api.github.com/repos/` +
            `${CONFIG.owner}/` +
            `${CONFIG.repository}/contents/` +
            `${CONFIG.directory}`
        );

        endpoint.searchParams.set("ref", CONFIG.branch);

        try {

            console.log("[DOSSIÊS] Consultando GitHub...");

            const response = await fetch(endpoint, {
                headers: {
                    Accept: "application/vnd.github+json"
                }
            });

            if (!response.ok) {

                if (response.status === 404) {
                    throw new Error(
                        "A pasta writeups não foi encontrada no GitHub."
                    );
                }

                if (response.status === 403 || response.status === 429) {
                    throw new Error(
                        "Limite de consultas da API do GitHub atingido."
                    );
                }

                throw new Error(
                    `Falha na API do GitHub: HTTP ${response.status}`
                );
            }

            const files = await response.json();

            if (!Array.isArray(files)) {
                throw new Error("Resposta inesperada do GitHub.");
            }

            // Filtrar somente PDFs.

            const pdfs = files.filter(file =>
                file.type === "file" &&
                /\.pdf$/i.test(file.name)
            );

            // Ordenar alfabeticamente.

            pdfs.sort((a, b) =>
                a.name.localeCompare(b.name, "pt-BR")
            );

            // Retirar o placeholder quando houver documentos.

            if (pdfs.length > 0) {

                grid.querySelector(".case-card-wip")?.remove();

            }

            // Criar os cards.

            pdfs.forEach(file => {

                const card = createCard(file);

                grid.appendChild(card);

            });

            console.log(
                `[DOSSIÊS] ${pdfs.length} PDF(s) encontrados.`
            );

        } catch (error) {

            console.error(
                "[DOSSIÊS] Erro ao carregar documentos:",
                error
            );

            const warning = element(
                "div",
                "case-card-wip",
                "Não foi possível carregar os dossiês digitais."
            );

            grid.appendChild(warning);

        }
    }


    // ==============================================
    // 8. INICIAR SISTEMA
    // ==============================================

    loadWriteups();

})();

