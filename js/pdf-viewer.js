
/*
==================================================
    PDF VIEWER
    JUAN PABLO · PORTFOLIO
==================================================

    Responsabilidades:

    1. Identificar o PDF solicitado.
    2. Validar o nome do documento.
    3. Localizar o PDF na pasta writeups.
    4. Abrir o documento utilizando PDF.js.
    5. Configurar o botão de download.
*/

// ================================================
// 1. ELEMENTOS DA PÁGINA
// ================================================

const frame = document.getElementById("pdf-frame");

const titleElement = document.getElementById("pdf-title");

const errorElement = document.getElementById("pdf-error");


// ================================================
// 2. IDENTIFICAR O DOCUMENTO SOLICITADO
// ================================================

const params = new URLSearchParams(
    window.location.search
);

const filename = params.get("pdf");


// ================================================
// 3. FORMATAR O TÍTULO
// ================================================

function formatTitle(filename) {

    return filename
        .replace(/\.pdf$/i, "")
        .replace(/[-_]+/g, " ")
        .trim()
        .replace(/\b[a-z]/g, letter =>
            letter.toLocaleUpperCase("pt-BR")
        );
}


// ================================================
// 4. EXIBIR ERROS
// ================================================

function showError(message) {

    errorElement.hidden = false;

    errorElement.textContent = message;

    frame.hidden = true;

}


// ================================================
// 5. VALIDAR O NOME DO ARQUIVO
// ================================================

const validFilename =
    typeof filename === "string" &&
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.pdf$/i.test(filename);


// ================================================
// 6. CARREGAR O PDF
// ================================================

if (!validFilename) {

    showError(
        "Documento inválido ou não especificado."
    );

} else {

    // Título automático.

    titleElement.textContent = formatTitle(filename);


    // Caminho do PDF.

    const pdfURL = new URL(
        "./writeups/" + encodeURIComponent(filename),
        document.baseURI
    );


    // Caminho do PDF.js.
    // OBS: nossa biblioteca está na RAIZ do projeto.

    const viewerURL = new URL(
        "./pdfjs/web/viewer.html",
        document.baseURI
    );


    // Informar o documento ao PDF.js.

    viewerURL.searchParams.set(
        "file",
        pdfURL.href
    );


    // Abrir o documento.

    frame.src = viewerURL.href;


    // Configurar o download.

    downloadLink.href = pdfURL.href;

    downloadLink.download = filename;

}

