(function (global) {

// Adiciona um namespace para utilização
var ajaxUtils = {};


// Função para o requerimento de uma conexão HTTP
function getRequestObject() {
  if (global.XMLHttpRequest) {
    return (new XMLHttpRequest());  // Retorna a criação de uma nova instância
  } 
  else if (global.ActiveXObject) {
    // Parte opcional, para browsers do IE antigos
    return (new ActiveXObject("Microsoft.XMLHTTP"));
  } 
  else {
    global.alert("Ajax is not supported!");
    return(null); 
  }
}


//============ Faz um requerimento com o Ajax, usando o GET ======

// Cria uma propriedade do objeto criado do Namespace

//É passado: URL / Função de manipulação do cliente / Função para o teste do JSON
ajaxUtils.sendGetRequest = function(requestUrl, responseHandler, isJsonResponse) {

    var request = getRequestObject(); //Variável que recebe a instância criada na linha 10

    //É feito uam verificação do estado da conexão
    request.onreadystatechange = function() { handleResponse(request, 
responseHandler, isJsonResponse); 
      };
    request.open("GET", requestUrl, true);  //Aqui é enviado de fato o requerimento para a conexão;
    request.send(null); //Envia um null apenas para o POST
  };


//A função handleResponse verifica se há um erro na conexão e o tipo de documento Ajax que deve ser enviado para o usuário
function handleResponse(request, responseHandler, isJsonResponse) {
  if ((request.readyState == 4) &&  //Verifica se está no último estado, de pronto
     (request.status == 200)) { //E se conexão está ok

    // O padrão de isJsonResponse = true
    if (isJsonResponse == undefined) {
      isJsonResponse = true;
    }
    //Se for true, é convertido para objeto
    if (isJsonResponse) {
      responseHandler(JSON.parse(request.responseText));
    }
    else {  //Caso contráreio, é deixado como arquivo JSON
      responseHandler(request.responseText);
    }
  }
}

// Expõe o objeto do Ajax criado para uso global, por todo a janela
global.$ajaxUtils = ajaxUtils;


})(window); //Necessário o parâmetro para o funciomaneto global do Ajax

