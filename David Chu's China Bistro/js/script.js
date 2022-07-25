$(function () { //Mesmo que inserir document.addEventListener("DOMContentLoaded"...

  //Mesma coisa que inserir document.querySelector("#navbarToggle").addEventListener("blur",...)

  //Parte que esconde as opções do navbar
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });

  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});

(function (global) {
  //Exibe a função por todas as janelas

  var dc = {};
  //Criando um objeto/namespace referente ao nome do restaurante (David Chu's)

  //Passando o arquivo da home do restaurante -> Parte principal
  var homeHtml = "snippets/home-snippet.html";
  //Arquivo JSON com a lista das categorias do restaurante, irá ser passado como URL para o requerimento do Ajax
  var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";

  //Passado o arquivo com o nome de todas as categorias, incluindo foto e texto
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  //Passando o arquivo principal do menu de categorias
  var categoryHtml = "snippets/category-snippet.html";
  //Arquvio JSON referente ao menu de categorias
  var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";

  //Arquivo com os trechos do itens de cada categoria
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  //Arquvio com foto dos itens
  var menuItemHtml = "snippets/menu-item.html";

  // ================== INSERÇÃO DOS ELEMENTOS NO HTML ======================
  //Insere os elementos pelo innerHTML através dos seletores!
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // ================= GIF DE LOADING =========================
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  //=================== INSERINDO AS PROPRIEDADES DOS ELEMENTOS =================
  // Retorna e substitui o '{{propName}}' pelo PropValue dado pela string no arquivo JSON
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";

    //'g' para global
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  }


  // ======================= AJUSTANDO A ATIVAÇÃO DOS BOTÕES DE MENU =====================
  // Remover a classe 'active' da chave de HOME do botão do menu
  var switchMenuToActive = function () {
    // Remove o active do Home do botão de menu
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    //Adiciona 'active' no botão do menu, CASO NÃO ESTEJA ATIVADO
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  //===================== INSERINDO O CONTEUDO PRINCIPAL DA PÁGINA =============

  // Irá ativar esse evento ao carregamento do HTML da página
  document.addEventListener("DOMContentLoaded", function (event) {

    // No primeiro carregamento, irá exibir o conteúdo principal...
    showLoading("#main-content");

    //Envia o p requerimento para a conexão no Ajax
    $ajaxUtils.sendGetRequest(homeHtml, function (responseText) {
      document.querySelector("#main-content").innerHTML = responseText;
    },
      false); //Falso para o arquivo JSON não ser convertido para objeto
  });

  //------------------------------------------------//
 
// ======================== ENVIA UM REQUERIMENTO DAS CATEGORIAS =================

  //Cria-se uma instância do objeto namespace
  dc.loadMenuCategories = function () {
    showLoading("#main-content");

    //É enviado a url do arquivo JSON de todas as categorias e a função de construção da exibição dessas categorias
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  //----------------------------------------------//

// ================ ENVIA REQUERIMENTO PARA OS ITENS DO MENU ===============

  //'categoryShort' é um short_name para a categoria (está no arquivo JSON), a função de carregamento irá receber esse shprt_name
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");

    //Enviado para a função de requerimento do Ajax
    $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML);
  };

    //-----------------------------------//

  // =================== CONSTRUÇÃO E EXIBIÇÃO DAS CATEGORIAS ====================

  // Aqui será a construção da exibição dos elementos do HTML conforme oS dados vindos do servidor
  function buildAndShowCategoriesHTML(categories) {

    // Carrega o trecho dos titulos das categorias da pagina
    $ajaxUtils.sendGetRequest(categoriesTitleHtml, function (categoriesTitleHtml) {
      // Recupera o trecho de categoria unica

      $ajaxUtils.sendGetRequest( categoryHtml, function (categoryHtml) {
        // Ativa a classe do CSS para o botão do menu
        switchMenuToActive();

        //Mais simples implementar usar uma variável do que inserir toda a vez a função da construção do HTML da página par
        var categoriesViewHtml = buildCategoriesViewHtml(
          categories,
          categoriesTitleHtml,
          categoryHtml);

        insertHtml("#main-content", categoriesViewHtml);
      },
        false);
    },
      false);
  }

//----------------------------------------------//

// ================ INSERINDO OS ELEMENTOS HTML NA PÁGINA ==============

  // Usando os dados de cada categoria e os trechos (snippets) do html
  // para construir a exibição do HTML inseridos na página
  function buildCategoriesViewHtml(
    categories,
    categoriesTitleHtml,
    categoryHtml){

    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop referente as categorias
    for (var i = 0; i < categories.length; i++) {

      // Inserindo o valor das categorias
      var html = categoryHtml;
      var name = "" + categories[i].name; //Propriedade do arquvio JSON
      var short_name = categories[i].short_name;  //" " " "

      //Chamada da função para inserir essas propriedades
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

//================ CONSTRUÇÃO DOS ITENS DAS CATEGORIAS ===================

  // Função da cosntrução de cada item da categoria da página baseada nos dados
  // do servidor
  function buildAndShowMenuItemsHTML(categoryMenuItems) {

    // Carrega o titulo do trecho dos itens do menu da página e os envia
    //Para o requerimento AJAX
    $ajaxUtils.sendGetRequest( menuItemsTitleHtml, 
      function (menuItemsTitleHtml) {
          // Recuperando os trechos dos itens do menu
        $ajaxUtils.sendGetRequest(menuItemHtml,function (menuItemHtml) {

          //Ativando o botão de menu
          switchMenuToActive();

          //Idem a parte de categoria mencionada acima
          var menuItemsViewHtml = buildMenuItemsViewHtml(
            categoryMenuItems,
            menuItemsTitleHtml,
            menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
      false); //Falso para o arquvio JSON não ser convertido para objeto
      },
      false); //Falso para o arquvio JSON não ser convertido para objeto
  }


  // Idem a parte de construção das categorias baseado nos dados do servidor
  function buildMenuItemsViewHtml(categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml) {

    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
        "name",
        categoryMenuItems.category.name);
    menuItemsTitleHtml =
      insertProperty(menuItemsTitleHtml,
        "special_instructions",
        categoryMenuItems.category.special_instructions);

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop referente ao menu de itens da categoria selecionada
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {

      // Inserindo os valores dos itens das categorias
      var html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);

      html = insertProperty(html, "catShortName", catShortName);

      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      
      html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);

      html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);

      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      //Adicionando o clearfix após o segundo item do menu
      if (i % 2 != 0) {
        html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

// =========================================//

// ====================== INSERINDO OS PREÇOS ====================== 
  // Adiciona o preço com "$" se o o mesmo existir
  function insertItemPrice(html, pricePropName, priceValue) {

    // Caso não especificado, retornar adicionando uma string vazia!
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");;
    }

    priceValue = "$" + priceValue.toFixed(2); //Fixa com duas casas decimais
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }
// ------------------------------ // 

// ================= INSERINDO PARENTESES PARA AS OPÇÕES DE PORÇÕES ================


  //Adiciona o nome da parte entre parenteses se existir
  function insertItemPortionName(html, portionPropName, portionValue) {

    // Caso não especificado, retornar adicionando uma string vazia!
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }
  //---------------------------//


  global.$dc = dc;  //Exibindo o namespace para todas as janelas em html

})(window); //Necessário adicionar o window para exibir por toda a função
